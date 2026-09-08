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
 * Classifies the skill into "programming" (needs coding tasks) or "knowledge" (MCQ only).
 * Also returns the target programming language(s) if applicable.
 */
export async function classifySkill(skill: string, apiKey: string): Promise<{ type: "programming" | "knowledge"; languages: string[] }> {
  const prompt = `You are a technical assessment architect. Analyze the technical skill: "${skill}".
Classify this skill into one of two categories:
1. "programming": This is a programming language or an application framework (e.g., Python, React, Next.js, Java, C++, Node.js). It requires algorithmic coding tasks to evaluate.
2. "knowledge": This is an infrastructure tool, cloud platform, database, devops practice, or security domain (e.g., AWS, Docker, PostgreSQL, Cybersecurity, Kubernetes). It does NOT require algorithmic coding tasks; deep theoretical and scenario-based knowledge is sufficient.

If it is "programming", you must also provide the canonical compiler language ID(s) it maps to. Valid compiler IDs are EXACTLY: ["javascript", "python", "java", "cpp", "typescript", "sql"]. (e.g., for Next.js, return ["javascript", "typescript"]).

Respond ONLY with valid JSON matching exactly:
{
  "type": "programming" | "knowledge",
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
    type: parsed.type === "programming" ? "programming" : "knowledge",
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
    prompt = `You are a strict, senior software engineer building a technical assessment for the skill: "${skill}".
Generate a strictly typed JSON response containing precisely 15 Multiple Choice Questions (MCQs) and 2 algorithmic Coding Questions (one easy, one medium-hard).

REQUIREMENTS FOR CODING TASKS:
- The code must be plain ${skill} algorithmic logic, absolutely NO UI rendering, NO web frameworks, NO external libraries.
- The candidate must use one of these languages: ${JSON.stringify(classification.languages)}. Include these exactly in the "supportedLanguages" array as {id, name}.
- You must provide exactly 5 public test cases and 45 hidden test cases for each task.
- "inputArgs" must be an array of arguments that will be passed into the function via the spread operator.
- "expected" must be the exact return value.

REQUIREMENTS FOR MCQs:
- 15 deep, non-trivial questions (no boilerplate trivia).

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
  } else {
    prompt = `You are a strict, senior DevOps/Cloud/Security engineer building a technical assessment for the skill: "${skill}".
This skill falls into the infrastructure/knowledge domain, so no coding tasks are required.
Generate a strictly typed JSON response containing precisely 30 advanced, scenario-based Multiple Choice Questions (MCQs) designed to test deep conceptual understanding rather than simple trivia.

REQUIREMENTS FOR MCQs:
- 30 deep, non-trivial questions. Use real-world troubleshooting scenarios where possible.
- Options must be an array of exactly 4 strings.
- answerIndex is the 0-based index of the correct option.
- difficulty must be one of: "easy", "medium", "hard".

Respond ONLY with valid JSON matching exactly:
{
  "mcqs": Array<{ question: string; options: string[]; answerIndex: number; explanation: string; difficulty: "easy" | "medium" | "hard"; topic: string; }>;
  "coding": []
}`;
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
