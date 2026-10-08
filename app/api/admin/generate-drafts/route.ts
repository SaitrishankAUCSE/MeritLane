import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { classifySkill } from "@/lib/assessments/generator";

const ADMIN_EMAILS = ["saitrishankb9@gmail.com", "saitrishankb1311@gmail.com"];
const SEED_SECRET = "meritlane-secret-seeder-key";

// ─── Prompt builders (same 6 modes as generator.ts) ────────────────────────

function buildPrompt(
  skill: string,
  type: string,
  languages: string[],
  batchIndex: number
): string {
  // Vary the batch instruction to get genuinely different questions each call
  const variety = `This is generation BATCH #${batchIndex + 1}. You MUST generate completely different questions from any previous batch — different topics, different scenarios, different difficulty distributions. Do NOT repeat any question structure or pattern from earlier batches.`;

  switch (type) {
    case "programming":
      return `${variety}
You are an elite senior software engineer. Generate a strictly typed JSON assessment batch for: "${skill}".
Produce EXACTLY 25 MCQs and 2 algorithmic coding tasks (one "easy", one "medium_hard").

MCQ REQUIREMENTS:
- 25 questions: 1–8 easy, 9–17 medium, 18–25 hard.
- No boilerplate trivia. Focus on: memory model, concurrency, advanced language features, algorithmic complexity, anti-patterns.
- 4 options each. Distractors = plausible misconceptions. answerIndex = 0-based index.

CODING TASK REQUIREMENTS:
- Pure algorithmic logic. NO UI, NO frameworks, NO external libraries.
- Languages: ${JSON.stringify(languages)} — provide starterCode for ALL of them.
- Exactly 5 public tests + 45 hidden tests each. Cover: happy path, edge cases, empty inputs, large inputs, precision.
- "inputArgs": spread-operator arguments. "expected": exact return value.
- "supportedLanguages": [{ id, name }] for each language provided.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy"|"medium_hard"; title: string; instructions: string; functionName: string;
    starterCode: { python?: string; javascript?: string; typescript?: string; java?: string; cpp?: string; go?: string; rust?: string; csharp?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;

    case "query":
      return `${variety}
You are an elite database architect. Generate a strictly typed JSON assessment batch for: "${skill}".
Produce EXACTLY 25 MCQs and 2 query-writing tasks (one "easy", one "medium_hard").

MCQ REQUIREMENTS:
- 25 questions: 1–8 easy, 9–17 medium, 18–25 hard.
- At least 8 = "Find the Error in this query" with concrete buggy SQL/query shown.
- Focus on: execution plans, index strategy, isolation levels, window functions, CTEs, anti-patterns.

QUERY TASK REQUIREMENTS:
- Candidate writes real queries (SQL, aggregation pipelines, etc.) — NOT algorithm code.
- Include schema/collection definitions in "instructions" (table names, columns, sample data).
- inputArgs: [] (queries run against predefined schema). expected: JSON result set or document.
- 5 public tests + 45 hidden tests each.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy"|"medium_hard"; title: string; instructions: string; functionName: string;
    starterCode: { sql?: string; javascript?: string; python?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;

    case "config":
      return `${variety}
You are an elite DevOps architect. Generate a strictly typed JSON assessment batch for: "${skill}".
Produce EXACTLY 25 MCQs and 2 config-writing tasks (one "easy", one "medium_hard").

MCQ REQUIREMENTS:
- 25 questions: 1–8 easy, 9–17 medium, 18–25 hard.
- At least 8 = "Find the misconfiguration/security flaw" with realistic config extracts.
- Focus on: security hardening, resource limits, networking, best practices, common misconfigs.

CONFIG TASK REQUIREMENTS:
- Candidate writes raw config files: ${JSON.stringify(languages)}.
- inputArgs: []. expected: string describing the structural invariant the validator checks.
- 5 public tests + 45 hidden tests each.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy"|"medium_hard"; title: string; instructions: string; functionName: string;
    starterCode: { dockerfile?: string; yaml?: string; hcl?: string; json?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
  }>;
}`;

    case "debugging":
      return `${variety}
You are a senior SRE / debugging expert. Generate a strictly typed JSON assessment batch for: "${skill}".
Produce EXACTLY 25 MCQs and 2 snippet-correction tasks (one "easy", one "medium_hard").

MCQ REQUIREMENTS:
- 25 questions: 1–8 easy, 9–17 medium, 18–25 hard.
- AT LEAST 10 = "Find the Bug / Spot the Error" with broken code snippet or command output shown.
- Focus on: workflow best practices, tool internals, failure modes, recovery strategies.
- All questions must present concrete scenarios, not abstract definitions.

SNIPPET-CORRECTION TASK REQUIREMENTS:
- Show a REAL broken snippet relevant to "${skill}" in "instructions" (with intent + broken code block).
- starterCode = the broken snippet (candidate overwrites with the fix).
- Preferred language: bash for shell tools, javascript for JS tooling, python for Python tools.
- inputArgs: [] or relevant inputs. expected: correct output/result after the fix.
- 5 public tests + 45 hidden tests each.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy"|"medium_hard"; title: string; instructions: string; functionName: string;
    starterCode: { bash?: string; javascript?: string; python?: string; yaml?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;

    case "markup":
      return `${variety}
You are an elite front-end architect. Generate a strictly typed JSON assessment batch for: "${skill}".
Produce EXACTLY 25 MCQs and 2 markup/style writing tasks (one "easy", one "medium_hard").

MCQ REQUIREMENTS:
- 25 questions: 1–8 easy, 9–17 medium, 18–25 hard.
- AT LEAST 8 = "Find the markup/style error" with concrete HTML/CSS shown in the question.
- Focus on: accessibility, specificity, semantic correctness, browser quirks, cascade, stacking contexts.

MARKUP TASK REQUIREMENTS:
- Candidate writes HTML structure, CSS rules, SCSS — based on "${skill}".
- starterCode = skeleton with clearly marked areas to complete.
- inputArgs: []. expected: string describing structural invariant (e.g. "Has aria-label on button").
- 5 public tests + 45 hidden tests each.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": Array<{
    difficulty: "easy"|"medium_hard"; title: string; instructions: string; functionName: string;
    starterCode: { html?: string; css?: string; scss?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
  }>;
}`;

    default: // knowledge
      return `${variety}
You are an elite Technical Assessment Architect. Generate a strictly typed JSON knowledge assessment batch for: "${skill}".
Produce EXACTLY 30 scenario-based MCQs. No coding tasks.

MCQ REQUIREMENTS:
- 30 questions: 1–8 easy, 9–20 medium, 21–30 hard.
- Mix must include all 3 sub-types equally:
  1. Scenario/Architecture: candidate reasons through a real-world trade-off.
  2. Find the Flaw: candidate reads an architecture description or config excerpt and identifies the critical flaw.
  3. Conceptual Deep-Dive: tests internal mechanics, failure modes, non-obvious behaviors.
- NO boilerplate trivia. 4 options each. All distractors = plausible misconceptions.

Respond ONLY with valid JSON:
{
  "mcqs": Array<{ question: string; options: string[4]; answerIndex: number; explanation: string; difficulty: "easy"|"medium"|"hard"; topic: string }>;
  "coding": []
}`;
  }
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Auth: accept seed key OR Firebase admin token
  const secretKey = req.headers.get("x-seed-key");
  const authHeader = req.headers.get("Authorization");

  if (secretKey !== SEED_SECRET) {
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
      const userRecord = await adminAuth.getUser(decoded.uid);
      if (!ADMIN_EMAILS.includes(userRecord.email?.toLowerCase() || "") && decoded.admin !== true) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  let body: { skill?: string; batchIndex?: number; forceClassify?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { skill, batchIndex = 0 } = body;
  if (!skill || typeof skill !== "string") {
    return NextResponse.json({ error: "skill is required" }, { status: 400 });
  }

  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_PROVIDER_API_KEY missing" }, { status: 500 });
  }

  const skillKey = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // ── Classify the skill (use cached mode if already classified) ─────────────
  let type = "knowledge";
  let languages: string[] = [];

  try {
    const bankMeta = await adminDb.collection("questionBank").doc(skillKey).get();
    const cached = bankMeta.data();
    if (cached?.assessmentMode && !body.forceClassify) {
      type = cached.assessmentMode;
      languages = cached.assessmentLanguages || [];
    } else {
      const cls = await classifySkill(skill, apiKey);
      type = cls.type;
      languages = cls.languages;
    }
  } catch {
    const cls = await classifySkill(skill, apiKey);
    type = cls.type;
    languages = cls.languages;
  }

  // ── Build prompt and call Gemini 2.5 Pro ───────────────────────────────────
  const prompt = buildPrompt(skill, type, languages, batchIndex);

  let aiText = "";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) {
      const errTxt = await res.text();
      return NextResponse.json({ error: `AI Error: ${res.status} – ${errTxt}` }, { status: 502 });
    }
    const data = await res.json();
    aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!aiText) throw new Error("Empty AI response");
  } catch (err: unknown) {
    return NextResponse.json({ error: `AI Communication Failure: ${(err as Error).message}` }, { status: 502 });
  }

  // ── Parse AI response ──────────────────────────────────────────────────────
  let parsed: { mcqs?: unknown[]; coding?: unknown[] };
  try {
    let cleaned = aiText.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    parsed = JSON.parse(cleaned.trim());
  } catch {
    return NextResponse.json({ error: "AI returned malformed JSON" }, { status: 502 });
  }

  if (!parsed.mcqs || !Array.isArray(parsed.mcqs)) {
    return NextResponse.json({ error: "AI response missing 'mcqs' array" }, { status: 502 });
  }

  // ── Write to Firestore questionBank (live, directly) ───────────────────────
  const batch = adminDb.batch();
  const bankRef = adminDb.collection("questionBank").doc(skillKey);
  const ts = Date.now();

  let mcqCount = 0;
  let codingCount = 0;

  for (let i = 0; i < parsed.mcqs.length; i++) {
    const mcq = parsed.mcqs[i] as Record<string, unknown>;
    const id = `gen_mcq_b${batchIndex}_${i + 1}_${ts}`;
    batch.set(bankRef.collection("mcqs").doc(id), { ...mcq, id, status: "live", batchIndex, generatedAt: ts });
    mcqCount++;
  }

  if (parsed.coding && Array.isArray(parsed.coding)) {
    for (let i = 0; i < parsed.coding.length; i++) {
      const task = parsed.coding[i] as Record<string, unknown>;
      const id = `gen_coding_b${batchIndex}_${(task.difficulty as string) || "task"}_${i}_${ts}`;
      batch.set(bankRef.collection("coding").doc(id), { ...task, id, status: "live", batchIndex, generatedAt: ts });
      codingCount++;
    }
  }

  // Update bank metadata (upsert)
  batch.set(
    bankRef,
    {
      skill: skillKey,
      displayName: skill,
      assessmentMode: type,
      assessmentLanguages: languages,
      lastUpdated: FieldValue.serverTimestamp(),
      autoGenerated: true,
      totalMcqsGenerated: FieldValue.increment(mcqCount),
      totalCodingGenerated: FieldValue.increment(codingCount),
      batchesGenerated: FieldValue.increment(1),
    },
    { merge: true }
  );

  await batch.commit();

  return NextResponse.json({
    success: true,
    skill: skillKey,
    assessmentMode: type,
    batchIndex,
    mcqCount,
    codingCount,
    message: `Batch #${batchIndex + 1}: added ${mcqCount} MCQs and ${codingCount} coding tasks for '${skill}' (mode: ${type}).`,
  });
}
