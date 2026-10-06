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
 * Classifies the skill into "programming" (needs coding tasks), "config" (needs structural tasks), or "knowledge" (MCQ only).
 * Also returns the target programming language(s) if applicable.
 */
export async function classifySkill(skill: string, apiKey: string): Promise<{ type: "programming" | "knowledge" | "config"; languages: string[] }> {
  const prompt = `You are a technical assessment architect. Analyze the technical skill: "${skill}".
Classify this skill into one of three categories:
1. "programming": This is a programming language or an application framework (e.g., Python, React, Next.js, Java, C++, Node.js). It requires algorithmic coding tasks to evaluate.
2. "config": This is an infrastructure-as-code tool or declarative configuration (e.g., Docker, Kubernetes, Terraform, CI/CD YAML). It requires candidates to write configuration files (like Dockerfiles or YAML) which will be structurally validated.
3. "knowledge": This is a theoretical, operational, or cloud platform domain (e.g., AWS, Cybersecurity, Agile) where candidates do NOT write any code or configuration; deep theoretical and scenario-based knowledge is sufficient.

If it is "programming" or "config", you must also provide the canonical compiler language ID(s) it maps to. 
Valid compiler IDs for programming are EXACTLY: ["javascript", "python", "java", "cpp", "typescript", "sql"].
Valid compiler IDs for config are EXACTLY: ["dockerfile", "yaml", "hcl"].

Respond ONLY with valid JSON matching exactly:
{
  "type": "programming" | "knowledge" | "config",
  "languages": string[] // empty if type is knowledge
}
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    })
  });

  if (!res.ok) throw new Error("Failed to classify skill via AI");
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = JSON.parse(cleanJsonString(text));
  return {
    type: (parsed.type === "programming" || parsed.type === "config") ? parsed.type : "knowledge",
    languages: Array.isArray(parsed.languages) ? parsed.languages : []
  };
}

/**
 * Generates the assessment payload (MCQs and optional Coding Tasks) and writes directly to the live Firestore questionBank.
 */
export async function generateAndPublishSkillBank(skill: string): Promise<void> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) throw new Error("AI_PROVIDER_API_KEY is missing on the server.");

  const skillKey = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const classification = await classifySkill(skill, apiKey);

  let prompt = "";
  if (classification.type === "programming") {
    prompt = `You are an elite, strict senior software engineer architecting a rigorous technical assessment for the skill: "${skill}".
Generate a strictly typed JSON response containing precisely 25 Multiple Choice Questions (MCQs) and 2 algorithmic Coding Questions (one easy, one medium-hard).

REQUIREMENTS FOR CODING TASKS:
- The code must be plain ${skill} algorithmic logic, absolutely NO UI rendering, NO web frameworks, NO external libraries.
- The candidate must use one of these languages: ${JSON.stringify(classification.languages)}. Include these exactly in the "supportedLanguages" array as {id, name}.
- You must provide exactly 5 public test cases and 45 hidden test cases for each task. Test cases must cover edge cases, large inputs, and boundary conditions to ensure O(N) or O(N log N) optimality where appropriate.
- "inputArgs" must be an array of arguments that will be passed into the function via the spread operator.
- "expected" must be the exact return value.

REQUIREMENTS FOR MCQs:
- Exactly 25 questions: questions 1-8 must be "easy", questions 9-17 must be "medium", and questions 18-25 must be "hard".
- Deep, non-trivial questions (no boilerplate trivia). Focus on internal language mechanics, memory management, concurrency, and advanced paradigms.
- Distractor options must be highly plausible common misconceptions.

Respond ONLY with valid JSON matching exactly:
{
  "mcqs": Array<{ question: string; options: string[]; answerIndex: number; explanation: string; difficulty: "easy" | "medium" | "hard"; topic: string; }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string;
    starterCode: { javascript?: string; python?: string; java?: string; cpp?: string; typescript?: string; sql?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;
  } else if (classification.type === "config") {
    prompt = `You are a strict, elite DevOps architect building a rigorous technical assessment for the infrastructure-as-code skill: "${skill}".
Generate a strictly typed JSON response containing precisely 25 Multiple Choice Questions (MCQs) and 2 structural configuration tasks (one easy, one medium-hard).

REQUIREMENTS FOR CONFIG TASKS:
- The candidate will write raw configuration text (e.g. Dockerfile, Kubernetes YAML, Terraform HCL).
- You must provide exactly 5 public tests and 45 hidden tests. For config tasks, "inputArgs" should be empty arrays []. "expected" should be a string describing the structural invariant (e.g. "Exposes port 80", "Uses ubuntu:latest as base"). 
- Our Tier 2.5 static validator will parse the candidate's config and evaluate if they met the structural requirements.

REQUIREMENTS FOR MCQs:
- Exactly 25 questions: questions 1-8 must be "easy", questions 9-17 must be "medium", and questions 18-25 must be "hard".
- Deep, non-trivial questions focusing on infrastructure edge cases, security, compliance, and large-scale architectural scenarios.

Respond ONLY with valid JSON matching exactly:
{
  "mcqs": Array<{ question: string; options: string[]; answerIndex: number; explanation: string; difficulty: "easy" | "medium" | "hard"; topic: string; }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string;
    functionName: string; 
    starterCode: { dockerfile?: string; yaml?: string; hcl?: string; };
    supportedLanguages: Array<{ id: string; name: string }>;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: string }>;
  }>;
}`;
  } else {
    prompt = `You are a strict, elite Cloud/Security architect building a rigorous technical assessment for the skill: "${skill}".
This skill falls into the infrastructure/knowledge domain, so no coding tasks are required.
Generate a strictly typed JSON response containing precisely 25 advanced, scenario-based Multiple Choice Questions (MCQs) designed to test deep conceptual understanding, architectural trade-offs, and critical thinking rather than simple trivia.

REQUIREMENTS FOR MCQs:
- Exactly 25 questions: questions 1-8 must be "easy", questions 9-17 must be "medium", and questions 18-25 must be "hard".
- Options must be an array of exactly 4 strings. All distractors must be plausible industry anti-patterns.
- answerIndex is the 0-based index of the correct option.
- difficulty must be one of: "easy", "medium", "hard".

Respond ONLY with valid JSON matching exactly:
{
  "mcqs": Array<{ question: string; options: string[]; answerIndex: number; explanation: string; difficulty: "easy" | "medium" | "hard"; topic: string; }>;
  "coding": []
}`;
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
    })
  });

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

  batch.set(bankRef, {
    skill: skillKey,
    displayName: skill,
    mcqCount,
    codingCount,
    lastUpdated: FieldValue.serverTimestamp(),
    autoGenerated: true,
  }, { merge: true });

  await batch.commit();
}
