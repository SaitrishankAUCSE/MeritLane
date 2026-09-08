import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

// Schema definitions for type safety when parsing AI response
interface RawMCQ {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface RawTestCase {
  name: string;
  inputArgs: any[];
  expected: any;
}

interface RawCodingQuestion {
  difficulty: "easy" | "medium_hard";
  title: string;
  instructions: string;
  functionName: string;
  starterCode: string;
  proposedReferenceCode: string;
  proposedWrongCode: string;
  publicTests: RawTestCase[];
  hiddenTests: RawTestCase[];
}

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userRecord = await adminAuth.getUser(decodedToken.uid);
  const isAdmin = userRecord.email?.toLowerCase() === ADMIN_EMAIL || decodedToken.admin === true;
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { skill } = await req.json();
  if (!skill || typeof skill !== "string") {
    return NextResponse.json({ error: "Skill is required" }, { status: 400 });
  }

  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_PROVIDER_API_KEY environment variable is missing on the server. Cannot connect to Gemini API." }, { status: 500 });
  }

  const skillKey = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const batchRef = adminDb.collection("questionDrafts").doc(skillKey);

  // 1. Call Gemini to generate drafts
  const prompt = `You are a strict, senior software engineer building a technical assessment for the skill: "${skill}".
Generate a strictly typed JSON response containing precisely 25 Multiple Choice Questions (MCQs) and 2 algorithmic Coding Questions (one easy, one medium-hard).

REQUIREMENTS FOR CODING TASKS:
- The code must be plain ${skill} algorithmic logic, absolutely NO UI rendering, NO web frameworks, NO external libraries.
- It must be executed securely by a backend JS/TS or Python standard evaluator.
- You must provide exactly 5 public test cases and 45 hidden test cases for each task.
- "inputArgs" must be an array of arguments that will be passed into the function via the spread operator: fn(...inputArgs)
- "expected" must be the exact return value.

REQUIREMENTS FOR MCQs:
- 25 deep, non-trivial questions (no boilerplate trivia).
- Options must be an array of exactly 4 strings.
- answerIndex is the 0-based index of the correct option.
- difficulty must be one of: "easy", "medium", "hard".

Respond ONLY with valid JSON matching exactly this TypeScript interface:
{
  "mcqs": Array<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    topic: string;
  }>;
  "coding": Array<{
    difficulty: "easy" | "medium_hard";
    title: string;
    instructions: string; // Markdown formatted
    functionName: string;
    starterCode: string;
    proposedReferenceCode: string;
    proposedWrongCode: string;
    publicTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
    hiddenTests: Array<{ name: string; inputArgs: any[]; expected: any }>;
  }>;
}`;

  let aiResponseText = "";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      return NextResponse.json({ error: `AI Provider Error: ${res.status} ${errTxt}` }, { status: 502 });
    }

    const data = await res.json();
    aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!aiResponseText) throw new Error("Empty response from AI");
  } catch (err: any) {
    return NextResponse.json({ error: `AI Communication Failure: ${err.message}` }, { status: 502 });
  }

  // 2. Parse and validate the response
  let parsedData;
  try {
    parsedData = JSON.parse(aiResponseText);
  } catch (err) {
    return NextResponse.json({ error: "AI returned malformed JSON that could not be parsed." }, { status: 502 });
  }

  if (!parsedData.mcqs || !Array.isArray(parsedData.mcqs) || !parsedData.coding || !Array.isArray(parsedData.coding)) {
    return NextResponse.json({ error: "AI returned JSON but the structure was missing the 'mcqs' or 'coding' arrays." }, { status: 502 });
  }

  const mcqs: RawMCQ[] = parsedData.mcqs;
  const coding: RawCodingQuestion[] = parsedData.coding;

  const batch = adminDb.batch();

  // Store each MCQ in subcollection
  for (let i = 0; i < mcqs.length; i++) {
    const mcq = mcqs[i];
    const id = `draft_mcq_${i + 1}_${Date.now()}`;
    const ref = batchRef.collection("mcqs").doc(id);
    batch.set(ref, {
      ...mcq,
      id,
      skill: skillKey,
      status: "pending",
      generatedAt: Date.now(),
    });
  }

  // Store coding tasks
  for (let i = 0; i < coding.length; i++) {
    const task = coding[i];
    const id = `draft_coding_${task.difficulty}_${i}_${Date.now()}`;
    const ref = batchRef.collection("coding").doc(id);
    batch.set(ref, {
      id,
      skill: skillKey,
      difficulty: task.difficulty,
      title: task.title,
      instructions: task.instructions,
      functionName: task.functionName,
      starterCode: {
        javascript: task.starterCode,
        python: task.starterCode,
      },
      publicTests: task.publicTests || [],
      hiddenTests: task.hiddenTests || [],
      proposedReferenceCode: task.proposedReferenceCode || "",
      proposedWrongCode: task.proposedWrongCode || "",
      status: "pending",
      generatedAt: Date.now(),
    });
  }

  // Update batch metadata
  batch.set(batchRef, {
    skill: skillKey,
    displayName: skill,
    generatedAt: FieldValue.serverTimestamp(),
    generatedBy: decodedToken.email,
    mcqCount: mcqs.length,
    codingCount: coding.length,
    status: "pending_review",
    approvedMcqs: 0,
    approvedCoding: 0,
  }, { merge: true });

  await batch.commit();

  return NextResponse.json({
    success: true,
    skill: skillKey,
    mcqCount: mcqs.length,
    codingCount: coding.length,
    message: `Generated ${mcqs.length} MCQ drafts and ${coding.length} coding task drafts for '${skill}'. Review and approve before publishing.`,
  });
}
