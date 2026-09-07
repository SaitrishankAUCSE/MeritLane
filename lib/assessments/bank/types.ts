// SERVER-ONLY — correct answers and hidden tests live here.
// Never import this file in client components or pages.

export interface TestCase {
  name: string;
  /** Arguments spread to the candidate's function: func(*inputArgs) */
  inputArgs: unknown[];
  expected: unknown;
}

export interface CodingQuestion {
  id: string;
  difficulty: "easy" | "medium_hard";
  title: string;
  /** Full problem statement shown to the candidate */
  instructions: string;
  /** Python function name the runner will locate in the candidate's code */
  functionName: string;
  starterCode: {
    python: string;
    javascript?: string;
  };
  /** Exactly 5 public test cases — shown after "Run Code" */
  publicTests: TestCase[];
  /** 45 hidden test cases — NEVER sent to the client */
  hiddenTests: TestCase[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  /** Correct option index — NEVER sent to the client */
  answerIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export interface SkillBank {
  skill: string;
  /** Pool of easy coding questions — select 1 per attempt */
  easy: CodingQuestion[];
  /** Pool of medium-hard coding questions — select 1 per attempt */
  mediumHard: CodingQuestion[];
  /** Pool of MCQ questions — select 8 per attempt */
  mcqs: MCQQuestion[];
}
