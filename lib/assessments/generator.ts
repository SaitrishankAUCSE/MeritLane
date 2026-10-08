import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Helper for cleaning up Markdown JSON blocks
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * 6 assessment modes, chosen by the AI classifier:
 *
 *  "programming"   – algorithmic coding tasks (Python, C++, Java, Go, Rust…)
 *  "query"         – live query writing tasks (SQL, NoSQL, GraphQL, SPARQL…)
 *  "config"        – declarative config writing tasks (Docker, K8s, Terraform, CI YAML…)
 *  "debugging"     – code/snippet error-finding tasks (Git, Linux, Bash, Testing tools…)
 *  "markup"        – HTML/CSS/template writing with structural validation tasks
 *  "knowledge"     – MCQ-only with rich scenario / architecture questions (Cloud, PM, Security…)
 */
export type SkillCategory =
  | "programming"
  | "query"
  | "config"
  | "debugging"
  | "markup"
  | "knowledge";

export interface SkillClassification {
  type: SkillCategory;
  /** Compiler/engine language IDs. Empty for non-executable types. */
  languages: string[];
  /** Human-readable rationale (logged only). */
  rationale?: string;
}

/**
 * Classifies ANY technical skill into the best-fit assessment mode.
 */
export async function classifySkill(
  skill: string,
  apiKey: string
): Promise<SkillClassification> {
  const prompt = `You are a senior technical assessment architect.

Analyze the technical skill: "${skill}"

Classify it into EXACTLY ONE of these 6 assessment modes:

1. "programming"
   A general-purpose programming language OR a strongly code-centric framework.
   Examples: Python, JavaScript, TypeScript, Java, C++, C#, C, Go, Rust, Swift, Kotlin, Scala, Ruby, PHP, Elixir, R (as a language), MATLAB, Dart, Lua, Perl, Haskell.
   Also: React, Next.js, Vue, Angular, Node.js, FastAPI, Django, Flask, Spring Boot, Express, NestJS, Laravel.
   → Generate 2 algorithmic coding tasks + 25 MCQs.

2. "query"
   A database or query language / platform where the primary skill is writing queries.
   Examples: SQL, MySQL, PostgreSQL, SQLite, Oracle SQL, T-SQL, NoSQL, MongoDB, Cassandra, DynamoDB, Redis (queries), Elasticsearch, GraphQL, SPARQL, Datalog, BigQuery SQL, Snowflake SQL, Pandas (query API), LINQ, ORM query APIs.
   → Generate 2 live query-writing tasks + 25 MCQs. The query tasks must test writing real queries, NOT algorithmic code.

3. "config"
   A declarative infrastructure-as-code, build, or deployment tool where the primary artefact is a configuration file.
   Examples: Docker, Kubernetes, Terraform, Ansible, Helm, Packer, Pulumi, CloudFormation, GitHub Actions YAML, GitLab CI YAML, CircleCI, Jenkins Groovy, Makefile, Webpack Config, Babel Config, ESLint/Prettier Config, nginx.conf.
   → Generate 2 config-writing tasks (Dockerfile / YAML / HCL / JSON) + 25 MCQs.

4. "debugging"
   A tool, runtime, or workflow whose core skill is reading output, diagnosing errors, and correcting broken code or configuration.
   Examples: Git, Linux/Bash/Shell, Postman, Chrome DevTools, GDB, Valgrind, Strace, Wireshark, Sentry, Datadog, Prometheus, Grafana, Unit Testing (Jest, PyTest, JUnit), Debugging & Profiling, Code Review, Regular Expressions.
   → Generate 25 MCQs where at least 10 are "Find the Error / Spot the Bug" questions with realistic broken snippets/outputs. Also generate 2 snippet-correction tasks where the candidate identifies and fixes bugs.

5. "markup"
   A markup, style, template, or document language where the candidate writes or corrects structured text.
   Examples: HTML, HTML5, CSS, CSS3, SCSS/Sass, Less, Markdown, LaTeX, XML, XPath, XQuery, XSLT, Jinja2, Handlebars, Liquid templates, SVG.
   → Generate 2 markup/style writing tasks + 25 MCQs with "Find the Error in the markup" questions.

6. "knowledge"
   A conceptual domain, cloud platform, management methodology, security discipline, or broad field where no editor/compiler exists — only deep conceptual understanding.
   Examples: AWS, GCP, Azure, Cybersecurity, Network Security, OWASP, Agile, Scrum, Product Management, System Design, Data Structures & Algorithms (theory), Computer Networks, Operating Systems, Software Architecture, SOLID Principles, Design Patterns, Machine Learning (theory), Data Science, Statistics, DevOps (philosophy), SRE, AI Ethics.
   → Generate 30 advanced scenario-based MCQs only.

RULES:
- If a skill could fit multiple categories, pick the ONE that most accurately reflects what employers want to evaluate.
- SQL = "query" (NOT "programming" or "knowledge").
- Git = "debugging" (NOT "config" or "knowledge").
- HTML/CSS = "markup" (NOT "knowledge").
- Docker/Kubernetes = "config" (NOT "knowledge").
- Python/React = "programming" (NOT "knowledge").
- AWS/GCP/Azure = "knowledge" (NOT "config").

If type is "programming", "query", or "config", provide the canonical language IDs from:
  programming: ["javascript", "python", "java", "cpp", "typescript", "sql", "go", "rust", "csharp", "ruby", "kotlin", "swift", "scala", "r"]
  query: ["sql", "javascript", "python"]  (the language for the sandbox; prefer "sql" for SQL-like, "python" for Pandas/ORM)
  config: ["dockerfile", "yaml", "hcl", "json"]
  debugging: []
  markup: ["html", "css"]
  knowledge: []

Respond ONLY with valid JSON:
{
  "type": "programming" | "query" | "config" | "debugging" | "markup" | "knowledge",
  "languages": string[],
  "rationale": string
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) throw new Error("Failed to classify skill via AI");
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(cleanJsonString(text));

  const VALID_TYPES: SkillCategory[] = [
    "programming",
    "query",
    "config",
    "debugging",
    "markup",
    "knowledge",
  ];
  const type: SkillCategory = VALID_TYPES.includes(parsed.type)
    ? (parsed.type as SkillCategory)
    : "knowledge";

  console.log(`[classifySkill] "${skill}" → ${type} | ${parsed.rationale}`);

  return {
    type,
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    rationale: parsed.rationale,
  };
}

// ─── Prompt builders per assessment mode ─────────────────────────────────────

function buildProgrammingPrompt(skill: string, languages: string[]): string {
  return `You are an elite senior software engineer architecting a rigorous technical assessment for: "${skill}".

Generate a strictly typed JSON response with EXACTLY:
- 25 Multiple Choice Questions (MCQs)
- 2 algorithmic Coding Questions (one "easy", one "medium_hard")

═══ CODING TASK REQUIREMENTS ═══
- Pure algorithmic logic. NO UI rendering, NO frameworks, NO external libraries.
- The candidate writes in one of: ${JSON.stringify(languages)}.
- Each task must have exactly 5 public test cases and 45 hidden test cases.
- Test cases must cover: happy path, edge cases, empty inputs, large inputs, boundary conditions, precision issues.
- "inputArgs": array of arguments passed via spread operator into the function.
- "expected": exact return value the function must produce.
- "starterCode": provide skeleton code for EVERY language in the "languages" list.

═══ MCQ REQUIREMENTS ═══
- 25 questions total: 1–8 = "easy", 9–17 = "medium", 18–25 = "hard".
- Focus on: internal language mechanics, memory model, concurrency, compiler optimizations, edge cases, advanced paradigms.
- Distractors must be highly plausible misconceptions, not obviously wrong.
- No trivial syntax trivia ("what keyword creates a function").

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { javascript?: string; python?: string; java?: string; cpp?: string; typescript?: string; sql?: string; go?: string; rust?: string; csharp?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;
}

function buildQueryPrompt(skill: string, languages: string[]): string {
  return `You are an elite database engineer and query architect building a rigorous technical assessment for: "${skill}".

Generate a strictly typed JSON response with EXACTLY:
- 25 Multiple Choice Questions (MCQs)
- 2 query-writing tasks (one "easy", one "medium_hard")

═══ QUERY TASK REQUIREMENTS ═══
- The candidate must write REAL QUERIES (SQL, NoSQL commands, aggregation pipelines, etc.) — NOT general algorithm code.
- Tasks must test: JOINs, subqueries, aggregations, window functions, indexing, CTEs, transactions, query optimization, or equivalent for the query language.
- Each task must have exactly 5 public test cases and 45 hidden test cases.
- "inputArgs": [] (empty; the query runs against a predefined schema).
- "expected": the expected result set as a JSON array of objects (for SQL) or expected output document (for NoSQL).
- "starterCode": provide a query skeleton in the relevant language(s): ${JSON.stringify(languages)}.
- Include schema/collection definitions in "instructions" (table/collection names, columns, sample data).

═══ MCQ REQUIREMENTS ═══
- 25 questions total: 1–8 = "easy", 9–17 = "medium", 18–25 = "hard".
- Focus on: query execution plans, index selection, cardinality, locking/isolation, normalization, denormalization, query anti-patterns, performance tuning.
- At least 8 must be "Find the Error in this query" or "Which query is more efficient?" questions with concrete SQL/NoSQL snippets.
- Distractors must be plausible wrong queries, not obviously broken syntax.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { sql?: string; javascript?: string; python?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;
}

function buildConfigPrompt(skill: string, languages: string[]): string {
  return `You are a strict, elite DevOps and infrastructure architect building a rigorous technical assessment for: "${skill}".

Generate a strictly typed JSON response with EXACTLY:
- 25 Multiple Choice Questions (MCQs)
- 2 configuration writing tasks (one "easy", one "medium_hard")

═══ CONFIG TASK REQUIREMENTS ═══
- The candidate writes raw configuration files (Dockerfile, Kubernetes YAML, Terraform HCL, CI pipeline YAML, etc.).
- Format depends on skill: ${JSON.stringify(languages)}.
- Tasks must test REAL-WORLD production scenarios: multi-stage builds, resource limits, secrets management, health checks, rollout strategies, networking, IAM.
- Each task has 5 public tests and 45 hidden tests.
- "inputArgs": [] (empty arrays; a static validator checks structural invariants).
- "expected": a string describing the exact structural requirement the validator will check (e.g. "Sets memory limit to 512Mi", "Exposes port 8080", "Uses multi-stage build").
- "starterCode": provide a skeleton config in the relevant format.

═══ MCQ REQUIREMENTS ═══
- 25 questions total: 1–8 = "easy", 9–17 = "medium", 18–25 = "hard".
- Focus on: security hardening, production best practices, resource management, networking, edge cases, common misconfigurations.
- At least 8 must be "Find the misconfiguration / security flaw in this snippet" questions with realistic config extracts.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { dockerfile?: string; yaml?: string; hcl?: string; json?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
  }>;
}`;
}

function buildDebuggingPrompt(skill: string): string {
  return `You are a strict, elite software reliability engineer building a rigorous debugging and diagnostic assessment for: "${skill}".

This skill is evaluated through error-finding and diagnosis, NOT algorithmic coding.

Generate a strictly typed JSON response with EXACTLY:
- 25 Multiple Choice Questions (MCQs)
- 2 snippet-correction tasks (one "easy", one "medium_hard") where a broken snippet is shown and the candidate must identify and fix the bug

═══ SNIPPET-CORRECTION TASK REQUIREMENTS ═══
- Each task must contain a REAL, WORKING-BUT-BROKEN snippet (Git commands with wrong flags, a crashing bash script, a broken test file, a malformed regex, etc.) relevant to "${skill}".
- The task's "instructions" must explain: the INTENDED goal, the BROKEN snippet in a code block, and ask the candidate to write the corrected version.
- "starterCode": the broken snippet itself (the candidate overwrites it with the fixed version).
- "supportedLanguages": use the language most natural for the skill (e.g. for Git → use "bash"; for Jest → use "javascript"; for Regex → use "javascript").
- 5 public tests and 45 hidden tests verifying the fix is correct:
  - "expected": a string or value that the fixed code must produce (e.g. expected git log output, expected regex match result, expected test pass/fail).
  - "inputArgs": [] or an array of inputs if applicable.

═══ MCQ REQUIREMENTS ═══
- 25 questions total: 1–8 = "easy", 9–17 = "medium", 18–25 = "hard".
- AT LEAST 10 must be "Find the Bug / Spot the Error" questions with a broken code snippet or command output shown in the question.
- Remaining questions test: workflow best practices, tool internals, failure modes, recovery strategies.
- All questions must present concrete scenarios, NOT abstract theoretical definitions.
- Distractors must be plausible incorrect commands or diagnoses.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { bash?: string; javascript?: string; python?: string; yaml?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;
}

function buildMarkupPrompt(skill: string): string {
  return `You are an elite front-end architect and web standards expert building a rigorous assessment for: "${skill}".

Generate a strictly typed JSON response with EXACTLY:
- 25 Multiple Choice Questions (MCQs)
- 2 markup/style writing tasks (one "easy", one "medium_hard")

═══ MARKUP/STYLE TASK REQUIREMENTS ═══
- The candidate writes HTML structure, CSS rules, SCSS, SVG, or template syntax — depending on "${skill}".
- Tasks must test REAL production concerns: accessibility, responsive layouts, CSS specificity, semantic correctness, browser compatibility, performance.
- "starterCode": a skeleton HTML/CSS/SCSS snippet with clearly marked areas for the candidate to complete.
- "supportedLanguages": [{ id: "html", name: "HTML5" }] or [{ id: "css", name: "CSS3" }] as appropriate.
- 5 public tests and 45 hidden tests checking structural invariants:
  - "expected": string describing what the validator checks (e.g. "Has exactly one <h1> element", "Uses flex layout with gap", "Has aria-label on button").
  - "inputArgs": [].

═══ MCQ REQUIREMENTS ═══
- 25 questions total: 1–8 = "easy", 9–17 = "medium", 18–25 = "hard".
- AT LEAST 8 must be "Find the markup/style error in this snippet" questions with concrete HTML/CSS shown in the question.
- Focus on: semantic correctness, accessibility violations, specificity battles, browser quirks, performance anti-patterns, CSS cascade and stacking contexts.
- Distractors must be plausible incorrect code, not obviously broken syntax.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { html?: string; css?: string; scss?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
  }>;
}`;
}

function buildKnowledgePrompt(skill: string): string {
  return `You are a strict, elite Technical Assessment Architect building a rigorous knowledge assessment for: "${skill}".

This is a conceptual, architectural, or cloud domain. No compiler or sandbox exists.
Generate a strictly typed JSON response with EXACTLY 30 advanced, scenario-based Multiple Choice Questions.

═══ MCQ REQUIREMENTS ═══
- 30 questions total: 1–8 = "easy", 9–20 = "medium", 21–30 = "hard".
- The mix MUST include these 3 sub-types, roughly equally distributed:
  1. "Scenario / Architecture": Candidate must reason through a real-world production trade-off or design decision.
  2. "Find the Flaw": Candidate reads a real architecture diagram description, configuration excerpt, or policy statement and identifies the critical flaw.
  3. "Conceptual Deep-Dive": Tests internal mechanics, failure modes, and non-obvious behaviors that separate seniors from juniors.
- NO boilerplate trivia ("What does AWS stand for?").
- Options must be an array of exactly 4 strings. All distractors must be plausible industry misconceptions.
- answerIndex is the 0-based index of the correct option.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": []
}`;
}

/**
 * Generates the full assessment payload and writes it to Firestore questionBank.
 */
export async function generateAndPublishSkillBank(skill: string): Promise<void> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) throw new Error("AI_PROVIDER_API_KEY is missing on the server.");

  const skillKey = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const classification = await classifySkill(skill, apiKey);

  // ── Pick the right prompt ───────────────────────────────────────────────
  let prompt = "";
  switch (classification.type) {
    case "programming":
      prompt = buildProgrammingPrompt(skill, classification.languages);
      break;
    case "query":
      prompt = buildQueryPrompt(skill, classification.languages);
      break;
    case "config":
      prompt = buildConfigPrompt(skill, classification.languages);
      break;
    case "debugging":
      prompt = buildDebuggingPrompt(skill);
      break;
    case "markup":
      prompt = buildMarkupPrompt(skill);
      break;
    default:
      prompt = buildKnowledgePrompt(skill);
  }

  // ── Generate via Gemini 2.5 Pro ─────────────────────────────────────────
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI Provider Error: ${res.status} - ${txt}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Empty response from AI");

  const parsed = JSON.parse(cleanJsonString(text));

  if (!adminDb) throw new Error("Firebase Admin DB not initialized");
  const batch = adminDb.batch();
  const bankRef = adminDb.collection("questionBank").doc(skillKey);

  let mcqCount = 0;
  let codingCount = 0;

  if (parsed.mcqs && Array.isArray(parsed.mcqs)) {
    for (let i = 0; i < parsed.mcqs.length; i++) {
      const id = `live_mcq_${i + 1}_${Date.now()}`;
      const ref = bankRef.collection("mcqs").doc(id);
      batch.set(ref, { ...parsed.mcqs[i], id, status: "live" });
      mcqCount++;
    }
  }

  if (parsed.coding && Array.isArray(parsed.coding)) {
    for (let i = 0; i < parsed.coding.length; i++) {
      const id = `live_coding_${parsed.coding[i].difficulty}_${i}_${Date.now()}`;
      const ref = bankRef.collection("coding").doc(id);
      batch.set(ref, { ...parsed.coding[i], id, status: "live" });
      codingCount++;
    }
  }

  batch.set(
    bankRef,
    {
      skill: skillKey,
      displayName: skill,
      assessmentMode: classification.type,
      mcqCount,
      codingCount,
      lastUpdated: FieldValue.serverTimestamp(),
      autoGenerated: true,
    },
    { merge: true }
  );

  await batch.commit();
}
