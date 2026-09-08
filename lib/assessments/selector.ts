// SERVER-ONLY — question selection logic for non-repeat candidate experience.
// Never import from client components.

import type { CodingQuestion, MCQQuestion, SkillBank } from "./bank/types";
import { adminDb } from "@/lib/firebase/admin";

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

function pickFromPool<T extends { id: string }>(
  pool: T[],
  seenIds: string[],
  count: number,
  label: string
): { items: T[]; exhausted: boolean } {
  const unseen = pool.filter(q => !seenIds.includes(q.id));

  if (unseen.length >= count) {
    // Shuffle unseen pool deterministically per session
    const shuffled = [...unseen].sort(() => Math.random() - 0.5);
    return { items: shuffled.slice(0, count), exhausted: false };
  }

  // Pool exhausted — log it so we know the bank needs expanding
  console.warn(
    `[BANK EXHAUSTED] ${label}: candidate has seen all ${pool.length} question(s). Recycling LRU (least recently seen).`
  );

  // LRU fallback: seenIds is ordered oldest→newest (append-only).
  // Earliest index = least recently seen = highest priority for recycling.
  const lruOrdered = pool
    .filter(q => seenIds.includes(q.id))
    .sort((a, b) => seenIds.indexOf(a.id) - seenIds.indexOf(b.id));

  return { items: lruOrdered.slice(0, count), exhausted: true };
}

/**
 * Select a non-repeating assignment for this attempt.
 * @param bank    The skill's full question bank
 * @param seen    The candidate's seen-question record for this skill
 * @param skill   Human-readable skill label (for logging)
 */
export function selectAssignment(
  bank: SkillBank,
  seen: SeenQuestions,
  skill: string
): SelectedAssignment {
  const isCodingCapable = (bank.easy && bank.easy.length > 0) && (bank.mediumHard && bank.mediumHard.length > 0);

  let easy: CodingQuestion | undefined;
  let medium: CodingQuestion | undefined;
  let easyId: string | undefined;
  let mediumId: string | undefined;

  if (isCodingCapable) {
    const easyPick = pickFromPool(bank.easy, seen.coding, 1, `${skill}.easy`);
    const mediumPick = pickFromPool(bank.mediumHard, seen.coding, 1, `${skill}.medium`);
    easy = easyPick.items[0];
    medium = mediumPick.items[0];
    easyId = easy?.id;
    mediumId = medium?.id;
  }

  const targetMcqCount = isCodingCapable ? 15 : 30;
  const { items: mcqs } = pickFromPool(bank.mcqs, seen.mcq, Math.min(targetMcqCount, bank.mcqs.length), `${skill}.mcqs`);

  return {
    easy,
    medium,
    mcqs,
    easyId,
    mediumId,
    mcqIds: mcqs.map(q => q.id),
  };
}

export async function getBankForSkill(skill: string): Promise<SkillBank | null> {
  if (!adminDb) return null;
  const slug = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const bankDoc = await adminDb.collection("questionBank").doc(slug).get();
  
  if (!bankDoc.exists) {
    return null;
  }

  // Check if bank is stale (older than 24 hours) to force JIT regeneration
  const data = bankDoc.data();
  if (data?.lastUpdated) {
    const updatedMs = data.lastUpdated.toMillis?.() || data.lastUpdated;
    if (Date.now() - updatedMs > 24 * 60 * 60 * 1000) {
      return null; // Return null to trigger JIT refresh
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

  // If a skill is MCQ-only, it's valid as long as it has enough MCQs. 
  // If it's a coding skill, it needs coding questions.
  // The generator ensures empty coding array if it's MCQ only.
  if (mcqs.length === 0) return null;

  return {
    skill,
    easy,
    mediumHard,
    mcqs
  };
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
  const defaultLangs: Array<{ id: string; name: string }> = [];
  if (q.starterCode?.python) defaultLangs.push({ id: "python", name: "Python 3" });
  if (q.starterCode?.javascript) defaultLangs.push({ id: "javascript", name: "JavaScript" });
  if (q.starterCode?.typescript) defaultLangs.push({ id: "typescript", name: "TypeScript" });
  if (q.starterCode?.java) defaultLangs.push({ id: "java", name: "Java" });
  if (q.starterCode?.cpp) defaultLangs.push({ id: "cpp", name: "C++" });
  if (q.starterCode?.sql) defaultLangs.push({ id: "sql", name: "SQL" });

  const resolvedSupportedLanguages =
    q.supportedLanguages && q.supportedLanguages.length > 0
      ? q.supportedLanguages
      : defaultLangs.length > 0
      ? defaultLangs
      : [{ id: "python", name: "Python 3" }];

  return {
    id: q.id,
    difficulty: q.difficulty,
    title: q.title,
    instructions: q.instructions,
    initialCode: q.starterCode.python || q.starterCode.javascript || q.starterCode.java || q.starterCode.cpp || q.starterCode.typescript || q.starterCode.sql || "",
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
