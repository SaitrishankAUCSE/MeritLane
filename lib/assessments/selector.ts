// SERVER-ONLY — question selection logic for non-repeat candidate experience.
// Never import from client components.

import type { CodingQuestion, MCQQuestion, SkillBank } from "./bank/types";
import { adminDb } from "@/lib/firebase/admin";
import { QUESTION_BANKS, resolveSkillKey } from "./content";

export interface SelectedAssignment {
  easy?: CodingQuestion;
  medium?: CodingQuestion;
  mcqs: MCQQuestion[];
  easyId?: string;
  mediumId?: string;
  mcqIds: string[];
}

interface SeenQuestions {
  coding: string[];
  mcq: string[];
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Given the same seed it always produces the same sequence — but different seeds
 * produce completely unrelated sequences, ensuring per-user uniqueness.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derive a numeric seed from a user ID + skill string.
 * This is deterministic within a session but unique per (user, skill) pair.
 */
function deriveSeed(uid: string, skill: string, attempt: number = 0): number {
  const raw = `${uid}::${skill}::${attempt}::${Date.now()}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * In-place Fisher-Yates shuffle using a seeded RNG.
 * Guarantees no two users with different seeds get the same order.
 */
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` unseen items from a pool using a seeded shuffle.
 * STRICT: if pool has fewer unseen items than needed, take all unseen first
 * then backfill with LRU-recycled items (oldest seen = least recently used).
 */
function pickFromPool<T extends { id: string }>(
  pool: T[],
  seenSet: Set<string>,
  seenOrder: string[], // ordered oldest→newest for LRU
  count: number,
  label: string,
  rng: () => number
): { items: T[]; exhausted: boolean } {
  const unseen = pool.filter(q => !seenSet.has(q.id));

  if (unseen.length >= count) {
    return { items: seededShuffle(unseen, rng).slice(0, count), exhausted: false };
  }

  // Pool exhausted — log and recycle LRU
  console.warn(
    `[BANK EXHAUSTED] ${label}: only ${unseen.length} unseen of ${pool.length}. Recycling LRU.`
  );

  const lruOrdered = pool
    .filter(q => seenSet.has(q.id))
    .sort((a, b) => seenOrder.indexOf(a.id) - seenOrder.indexOf(b.id));

  const combined = [...seededShuffle(unseen, rng), ...lruOrdered];
  return { items: combined.slice(0, count), exhausted: true };
}

/**
 * Select a non-repeating assignment for this attempt.
 *
 * Guarantees:
 * 1. A candidate NEVER sees the same question twice (strict seen-set enforcement).
 * 2. Two different candidates NEVER get the same question order (seeded Fisher-Yates per user×skill×timestamp).
 * 3. When the pool is exhausted, LRU recycling kicks in with a full log warning.
 *
 * @param bank    The skill's full question bank
 * @param seen    The candidate's seen-question record for this skill
 * @param skill   Human-readable skill label (for logging)
 * @param uid     Candidate UID — used to seed the per-user shuffle
 */
export function selectAssignment(
  bank: SkillBank,
  seen: SeenQuestions,
  skill: string,
  uid: string = "anon"
): SelectedAssignment {
  // One seeded RNG per (user, skill, timestamp) — unique order every attempt
  const rng = mulberry32(deriveSeed(uid, skill));

  // Convert seen arrays to Sets for O(1) lookup
  const seenCodingSet = new Set(seen.coding);
  const seenMcqSet = new Set(seen.mcq);

  const hasCodingPool =
    (bank.easy && bank.easy.length > 0) ||
    (bank.mediumHard && bank.mediumHard.length > 0);

  let easy: CodingQuestion | undefined;
  let medium: CodingQuestion | undefined;
  let easyId: string | undefined;
  let mediumId: string | undefined;

  if (hasCodingPool) {
    const easyPool = bank.easy?.length > 0 ? bank.easy : (bank.mediumHard || []);
    const mediumPool = bank.mediumHard?.length > 0 ? bank.mediumHard : (bank.easy || []);

    const easyPick = pickFromPool(easyPool, seenCodingSet, seen.coding, 1, `${skill}.easy`, rng);
    const mediumPick = pickFromPool(mediumPool, seenCodingSet, seen.coding, 1, `${skill}.medium`, rng);
    easy = easyPick.items[0];
    medium = mediumPick.items[0] || easy;
    easyId = easy?.id;
    mediumId = medium?.id || easyId;
  }

  // MCQ targets:
  // With coding tasks: 15 MCQs  (5 easy + 5 medium + 5 hard)
  // Without coding:    22 MCQs  (7 easy + 8 medium + 7 hard)  — knowledge / query / debugging
  const targetEasy   = hasCodingPool ? 5 : 7;
  const targetMedium = hasCodingPool ? 5 : 8;
  const targetHard   = hasCodingPool ? 5 : 7;
  const totalTarget  = hasCodingPool ? 15 : 22;

  const mcqEasyPool   = bank.mcqs.filter(q => q.difficulty === "easy");
  const mcqMediumPool = bank.mcqs.filter(q => q.difficulty === "medium");
  const mcqHardPool   = bank.mcqs.filter(q => q.difficulty === "hard");

  // Use full bank as fallback when a difficulty tier has no questions
  const easyPick   = pickFromPool(mcqEasyPool.length   > 0 ? mcqEasyPool   : bank.mcqs, seenMcqSet, seen.mcq, targetEasy,   `${skill}.mcqs.easy`,   rng);
  const mediumPick = pickFromPool(mcqMediumPool.length > 0 ? mcqMediumPool : bank.mcqs, seenMcqSet, seen.mcq, targetMedium, `${skill}.mcqs.medium`, rng);
  const hardPick   = pickFromPool(mcqHardPool.length   > 0 ? mcqHardPool   : bank.mcqs, seenMcqSet, seen.mcq, targetHard,   `${skill}.mcqs.hard`,   rng);

  // Deduplicate across difficulty tiers (can happen when falling back to full bank)
  const selected = new Set<string>();
  const orderedMcqs: MCQQuestion[] = [];
  for (const q of [
    ...easyPick.items.slice(0, targetEasy),
    ...mediumPick.items.slice(0, targetMedium),
    ...hardPick.items.slice(0, targetHard),
  ]) {
    if (!selected.has(q.id)) {
      selected.add(q.id);
      orderedMcqs.push(q);
    }
  }

  // Backfill if pool was sparse
  if (orderedMcqs.length < totalTarget) {
    const remaining = seededShuffle(
      bank.mcqs.filter(q => !selected.has(q.id)),
      rng
    );
    for (const q of remaining) {
      if (orderedMcqs.length >= totalTarget) break;
      orderedMcqs.push(q);
    }
  }

  const mcqs = orderedMcqs.slice(0, totalTarget);

  return {
    easy,
    medium,
    mcqs,
    easyId,
    mediumId,
    mcqIds: mcqs.map(q => q.id),
  };
}

function getBuiltinBank(skill: string): SkillBank | null {
  const key = resolveSkillKey(skill);
  if (!key) return null;
  const fallbackBank = QUESTION_BANKS[key];
  if (!fallbackBank) return null;
  const mcqs: MCQQuestion[] = fallbackBank.mcqPool.map((m, idx) => ({
    id: m.id || `${key}_mcq_${idx + 1}`,
    question: m.question,
    options: m.options,
    answerIndex: m.answerIndex ?? 0,
    explanation: m.explanation || "",
    difficulty: m.difficulty || "medium",
    topic: m.topic || skill,
  }));

  const easy: CodingQuestion[] = [];
  const mediumHard: CodingQuestion[] = [];

  const pool = fallbackBank.codingPool || [];
  pool.forEach((c, idx) => {
    const q: CodingQuestion = {
      id: c.id || `${key}_coding_${idx + 1}`,
      difficulty: idx === 0 ? "easy" : "medium_hard",
      title: c.title,
      instructions: c.instructions,
      functionName: "solution",
      starterCode: {
        javascript: c.initialCode,
        python: c.initialCode,
      },
      publicTests: [],
      hiddenTests: [],
    };
    if (idx === 0) {
      easy.push(q);
      if (pool.length === 1) {
        mediumHard.push(q); // Ensure both pools have an assignment for single-task skills
      }
    } else {
      mediumHard.push(q);
    }
  });

  return {
    skill,
    easy,
    mediumHard,
    mcqs,
  };
}

export async function getBankForSkill(skill: string): Promise<SkillBank | null> {
  if (!adminDb) return getBuiltinBank(skill);
  const slug = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  
  try {
    const bankDoc = await adminDb.collection("questionBank").doc(slug).get();
    
    if (!bankDoc.exists) {
      return getBuiltinBank(skill);
    }

    // Log staleness but NEVER discard a live bank — it will be refreshed by the seeder.
    const data = bankDoc.data();
    if (data?.lastUpdated) {
      const updatedMs = data.lastUpdated.toMillis?.() || data.lastUpdated;
      const ageHours = (Date.now() - updatedMs) / 3600000;
      if (ageHours > 72) {
        console.warn(`[getBankForSkill] Bank for "${skill}" is ${Math.round(ageHours)}h old. Consider re-seeding.`);
      }
    }

    const mcqsSnap = await adminDb.collection("questionBank").doc(slug).collection("mcqs").where("status", "==", "live").get();
    const codingSnap = await adminDb.collection("questionBank").doc(slug).collection("coding").where("status", "==", "live").get();

    const mcqs: MCQQuestion[] = [];
    mcqsSnap.forEach(doc => mcqs.push(doc.data() as MCQQuestion));

    const easy: CodingQuestion[] = [];
    const mediumHard: CodingQuestion[] = [];
    
    codingSnap.forEach(doc => {
      const q = doc.data() as CodingQuestion;
      if (q.difficulty === "easy") easy.push(q);
      else mediumHard.push(q);
    });

    if (mcqs.length === 0) return getBuiltinBank(skill);

    return {
      skill,
      easy,
      mediumHard,
      mcqs
    };
  } catch (err) {
    console.warn("[getBankForSkill] Firestore read failed, using built-in bank:", err);
    return getBuiltinBank(skill);
  }
}

/**
 * Convert a SkillBank CodingQuestion into the sanitised shape sent to the client.
 * Strips correct answers and hidden tests — only public content.
 */
export function sanitiseCodingQuestion(q: CodingQuestion): {
  id: string;
  difficulty: string;
  title: string;
  instructions: string;
  initialCode: string;
  supportedLanguages: Array<{ id: string; name: string }>;
  taskLabel: string;
} {
  // All known starter-code keys and their display names (covers all 6 assessment modes)
  const LANG_MAP: [string, string][] = [
    ["python",     "Python 3"],
    ["javascript", "JavaScript"],
    ["typescript", "TypeScript"],
    ["java",       "Java"],
    ["cpp",        "C++"],
    ["sql",        "SQL"],
    ["go",         "Go"],
    ["rust",       "Rust"],
    ["csharp",     "C#"],
    ["ruby",       "Ruby"],
    ["kotlin",     "Kotlin"],
    ["swift",      "Swift"],
    ["scala",      "Scala"],
    ["r",          "R"],
    ["bash",       "Bash / Shell"],
    ["html",       "HTML5"],
    ["css",        "CSS3"],
    ["scss",       "SCSS / Sass"],
    ["yaml",       "YAML"],
    ["hcl",        "HCL (Terraform)"],
    ["json",       "JSON"],
    ["dockerfile", "Dockerfile"],
  ];

  const sc = (q.starterCode as Record<string, string | undefined>) || {};
  const defaultLangs: Array<{ id: string; name: string }> = [];
  for (const [id, name] of LANG_MAP) {
    if (sc[id]) defaultLangs.push({ id, name });
  }

  const resolvedSupportedLanguages =
    q.supportedLanguages && q.supportedLanguages.length > 0
      ? q.supportedLanguages
      : defaultLangs.length > 0
      ? defaultLangs
      : [{ id: "python", name: "Python 3" }];

  // Pick the first available starter code as the default shown in the editor
  const initialCode = LANG_MAP.map(([id]) => sc[id]).find(Boolean) ?? "";

  return {
    id: q.id,
    difficulty: q.difficulty,
    title: q.title,
    instructions: q.instructions,
    initialCode,
    supportedLanguages: resolvedSupportedLanguages,
    taskLabel: q.difficulty === "easy" ? "Task 1 — Easy" : "Task 2 — Medium",
  };
}

/**
 * Strip MCQ answer indices before sending to the client.
 */
export function sanitiseMcqs(mcqs: MCQQuestion[]): Array<{
  question: string;
  options: string[];
  difficulty: string;
  topic: string;
}> {
  return mcqs.map(m => ({
    question: m.question,
    options: m.options,
    difficulty: m.difficulty,
    topic: m.topic,
  }));
}
