// SERVER-ONLY — question selection logic for non-repeat candidate experience.
// Never import from client components.

import type { CodingQuestion, MCQQuestion, SkillBank } from "./bank/types";

export interface SelectedAssignment {
  easy: CodingQuestion;
  medium: CodingQuestion;
  mcqs: MCQQuestion[];
  easyId: string;
  mediumId: string;
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
  const { items: [easy] } = pickFromPool(bank.easy, seen.coding, 1, `${skill}.easy`);
  const { items: [medium] } = pickFromPool(bank.mediumHard, seen.coding, 1, `${skill}.medium`);
  const { items: mcqs } = pickFromPool(bank.mcqs, seen.mcq, 8, `${skill}.mcqs`);

  return {
    easy,
    medium,
    mcqs,
    easyId: easy.id,
    mediumId: medium.id,
    mcqIds: mcqs.map(q => q.id),
  };
}

/**
 * Get the bank for a given skill slug, or null if skill has no bank yet.
 */
export async function getBankForSkill(skill: string): Promise<SkillBank | null> {
  const slug = skill.toLowerCase().trim();
  if (slug === "python" || slug.includes("python")) {
    const { getPythonBank } = await import("./bank/python");
    return getPythonBank();
  }
  // Future skills: javascript, sql, java, etc.
  return null;
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
  taskLabel: string;
} {
  return {
    id: q.id,
    difficulty: q.difficulty,
    title: q.title,
    instructions: q.instructions,
    initialCode: q.starterCode.python,
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
