import fs from 'node:fs';
import path from 'node:path';
import type { CodingChallenge, SupportedLanguage } from './content';
import { adminDb } from '@/lib/firebase/admin';

export interface TopInterviewQuestion {
  id: string;
  externalId: string;
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  instructions: string;
  initialCode: string;
  starterCode: {
    python?: string;
    javascript?: string;
    typescript?: string;
    java?: string;
    cpp?: string;
    csharp?: string;
    c?: string;
    golang?: string;
    rust?: string;
  };
  supportedLanguages: SupportedLanguage[];
  totalSubmissions: number;
}

let cachedQuestions: TopInterviewQuestion[] | null = null;

/**
 * Load all 500 interview questions from memory cache, local JSON dataset, or Firestore.
 */
export async function getAllInterviewQuestions(): Promise<TopInterviewQuestion[]> {
  if (cachedQuestions && cachedQuestions.length >= 400) {
    return cachedQuestions;
  }

  // 1. Try reading from Firestore if initialized
  if (adminDb) {
    try {
      const snap = await adminDb.collection('interviewQuestionBank').limit(500).get();
      if (!snap.empty && snap.size >= 100) {
        const firestoreQuestions: TopInterviewQuestion[] = [];
        snap.forEach(doc => firestoreQuestions.push(doc.data() as TopInterviewQuestion));
        cachedQuestions = firestoreQuestions;
        return cachedQuestions;
      }
    } catch {
      // Fall through to JSON on Firestore miss
    }
  }

  // 2. Load from local database JSON file
  try {
    const jsonPath = path.join(process.cwd(), 'lib', 'assessments', 'bank', 'top-interview-500.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      cachedQuestions = JSON.parse(raw) as TopInterviewQuestion[];
      return cachedQuestions;
    }
  } catch (err) {
    console.warn('[getAllInterviewQuestions] Failed to read top-interview-500.json:', err);
  }

  return [];
}

/**
 * Seeded pseudo-random generator
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deriveSeedNum(seed: string | number): number {
  if (typeof seed === 'number') return seed >>> 0;
  let hash = 5381;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function shuffleWithRng<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getStarterCodeForSkill(q: TopInterviewQuestion, skill: string): { initialCode: string; language: string } {
  const norm = skill.toLowerCase().trim();
  let lang = norm;
  let code = "";

  if (norm === "python" || norm === "py") {
    lang = "python";
    code = q.starterCode?.python || "";
  } else if (norm === "javascript" || norm === "js") {
    lang = "javascript";
    code = q.starterCode?.javascript || "";
  } else if (norm === "typescript" || norm === "ts") {
    lang = "typescript";
    code = q.starterCode?.typescript || q.starterCode?.javascript || "";
  } else if (norm === "sql" || norm === "mysql" || norm === "postgresql") {
    lang = "sql";
    code = (q.starterCode as any)?.sql || q.initialCode || "";
  } else if (norm === "java") {
    lang = "java";
    code = q.starterCode?.java || "";
  } else if (norm === "c++" || norm === "cpp") {
    lang = "cpp";
    code = q.starterCode?.cpp || "";
  } else if (norm === "c") {
    lang = "c";
    code = q.starterCode?.c || "";
  } else if (norm === "c#" || norm === "csharp") {
    lang = "csharp";
    code = q.starterCode?.csharp || "";
  } else if (norm === "golang" || norm === "go") {
    lang = "golang";
    code = q.starterCode?.golang || "";
  } else if (norm === "rust") {
    lang = "rust";
    code = q.starterCode?.rust || "";
  }

  if (!code) {
    code = q.starterCode?.python || q.starterCode?.javascript || q.initialCode;
  }

  return { initialCode: code, language: lang };
}

export interface SelectedInterviewCodingAssignment {
  format: 'dual_easy_medium' | 'single_hard';
  track: 'standard' | 'advanced';
  tasks: CodingChallenge[];
  easyId: string;
  mediumId?: string;
}

/**
 * Pick interview coding questions according to candidate track (Option 2):
 * - "standard" track: 1 Easy + 1 Medium question from the top interview bank
 * - "advanced" track: 1 Hard level question from the top interview bank
 *
 * Randomly chosen per candidate from the 500 questions pool, excluding questions the candidate has already seen.
 */
export async function selectRandomInterviewQuestions(
  uid: string,
  skill: string,
  seenCodingIds: string[] = [],
  sessionSeed?: string | number,
  track: 'standard' | 'advanced' = 'standard'
): Promise<SelectedInterviewCodingAssignment | null> {
  const all = await getAllInterviewQuestions();
  if (!all || all.length === 0) return null;

  const normalizedSkill = skill.toLowerCase().trim();
  const isSql = normalizedSkill === "sql" || normalizedSkill === "mysql" || normalizedSkill === "postgresql";

  // Filter out Database/SQL-only questions for algorithmic programming languages
  const poolSource = all.filter(q => {
    if (isSql) {
      return q.category === "Database" || (q.starterCode && (q.starterCode as any).sql);
    }
    return q.category !== "Database";
  });

  const availableAll = poolSource.length > 0 ? poolSource : all;

  const seedNum = sessionSeed ? deriveSeedNum(sessionSeed) : deriveSeedNum(`${uid}::${skill}::${Date.now()}`);
  const rng = mulberry32(seedNum);

  const seenSet = new Set(seenCodingIds);

  const easyPool = availableAll.filter(q => q.difficulty === 'easy');
  const mediumPool = availableAll.filter(q => q.difficulty === 'medium');
  const hardPool = availableAll.filter(q => q.difficulty === 'hard');

  const isDualTask = track === 'standard';

  const toChallenge = (q: TopInterviewQuestion, label: string): CodingChallenge => {
    const { initialCode, language } = getStarterCodeForSkill(q, skill);
    return {
      id: q.id,
      title: q.title,
      instructions: q.instructions,
      initialCode,
      language,
      supportedLanguages: q.supportedLanguages,
      difficulty: q.difficulty,
    };
  };

  if (isDualTask) {
    // 1. Pick Easy (prefer unseen)
    const easyUnseen = easyPool.filter(q => !seenSet.has(q.id));
    const shuffledEasy = shuffleWithRng(easyUnseen.length > 0 ? easyUnseen : easyPool, rng);
    const chosenEasy = shuffledEasy[0] || easyPool[0];

    // 2. Pick Medium (prefer unseen, strictly distinct from easy)
    const mediumUnseen = mediumPool.filter(q => !seenSet.has(q.id) && q.id !== chosenEasy.id);
    const shuffledMedium = shuffleWithRng(mediumUnseen.length > 0 ? mediumUnseen : mediumPool, rng);
    const chosenMedium = shuffledMedium.find(q => q.id !== chosenEasy.id) || mediumPool.find(q => q.id !== chosenEasy.id) || mediumPool[0];

    const task1 = toChallenge(chosenEasy, 'Task 1 (Easy)');
    const task2 = toChallenge(chosenMedium, 'Task 2 (Medium)');

    return {
      format: 'dual_easy_medium',
      track: 'standard',
      tasks: [task1, task2],
      easyId: chosenEasy.id,
      mediumId: chosenMedium.id
    };
  } else {
    // Pick 1 Hard level question (prefer unseen)
    const hardUnseen = hardPool.filter(q => !seenSet.has(q.id));
    const shuffledHard = shuffleWithRng(hardUnseen.length > 0 ? hardUnseen : hardPool, rng);
    const chosenHard = shuffledHard[0] || hardPool[0];

    const hardTask = toChallenge(chosenHard, 'Challenge (Hard)');

    return {
      format: 'single_hard',
      track: 'advanced',
      tasks: [hardTask],
      easyId: chosenHard.id,
      mediumId: undefined
    };
  }
}

export async function getInterviewQuestionById(id: string, skill: string = "python"): Promise<CodingChallenge | null> {
  const all = await getAllInterviewQuestions();
  const q = all.find(item => item.id === id);
  if (!q) return null;
  const { initialCode, language } = getStarterCodeForSkill(q, skill);
  return {
    id: q.id,
    title: q.title,
    instructions: q.instructions,
    initialCode,
    language,
    supportedLanguages: q.supportedLanguages,
    difficulty: q.difficulty,
  };
}
