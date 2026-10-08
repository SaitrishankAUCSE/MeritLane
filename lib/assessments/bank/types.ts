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
  /** Python / language function name the runner will locate in the candidate's code */
  functionName: string;
  /**
   * Starter code keyed by language ID.
   * Covers all 6 assessment modes: programming, query, config, debugging, markup, knowledge.
   */
  starterCode: {
    // Programming languages
    python?: string;
    javascript?: string;
    typescript?: string;
    java?: string;
    cpp?: string;
    go?: string;
    rust?: string;
    csharp?: string;
    ruby?: string;
    kotlin?: string;
    swift?: string;
    scala?: string;
    r?: string;
    // Query / data languages
    sql?: string;
    // Config / IaC formats
    dockerfile?: string;
    yaml?: string;
    hcl?: string;
    json?: string;
    // Debugging / scripting
    bash?: string;
    // Markup / style
    html?: string;
    css?: string;
    scss?: string;
  };
  supportedLanguages?: Array<{ id: string; name: string }>;
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
  /** Assessment mode used when this bank was generated */
  assessmentMode?: "programming" | "query" | "config" | "debugging" | "markup" | "knowledge";
  /** Pool of easy coding/task questions — select 1 per attempt */
  easy: CodingQuestion[];
  /** Pool of medium-hard coding/task questions — select 1 per attempt */
  mediumHard: CodingQuestion[];
  /** Pool of MCQ questions */
  mcqs: MCQQuestion[];
}
