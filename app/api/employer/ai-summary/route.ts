import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { UserProfile } from "@/lib/firebase/users";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    const candidateDoc = await adminDb.collection("candidates").doc(candidateId).get();
    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const candidateData = candidateDoc.data() as CandidateProfile;
    
    let assessmentScores: Record<string, number> = {};
    try {
      const candidateUserDoc = await adminDb.collection("users").doc(candidateId).get();
      if (candidateUserDoc.exists) {
        const uData = candidateUserDoc.data() as UserProfile;
        if (uData.assessmentScores) {
          assessmentScores = uData.assessmentScores;
        }
      }
    } catch {
      // Non-fatal if assessmentScores cannot be fetched
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      // Deterministic professional fallback if API key is not configured in current environment
      const verifiedList = Object.keys(candidateData.verifiedSkills || {}).filter(
        (k) => candidateData.verifiedSkills?.[k]?.status === "verified"
      );
      const fallbackSummary = `${candidateData.name || "Candidate"} is a verified practitioner with confirmed proficiency in ${verifiedList.length > 0 ? verifiedList.join(", ") : "core engineering domains"}. Backed by ${candidateData.projects?.length || 0} technical evidence project(s), they demonstrate verified hands-on execution.`;
      return NextResponse.json({ summary: fallbackSummary }, { status: 200 });
    }

    const verifiedSkills = Object.keys(candidateData.verifiedSkills || {})
      .filter((k) => candidateData.verifiedSkills?.[k]?.status === "verified")
      .map((k) => `${k} (score: ${candidateData.verifiedSkills?.[k]?.score ?? "passed"})`)
      .join(", ");

    const projectSummaries = (candidateData.projects || [])
      .map((p: any) => `- ${p.title || "Project"}: ${p.description || "No description"} (${p.linkUrl || "No URL"})`)
      .join("\n");

    const prompt = `You are a senior technical recruiter and talent evaluator for MeritLane.
Analyze the following candidate's verified profile data and write a punchy, professional, 3-4 sentence recruiter executive summary. Focus on verified capabilities, concrete project proof, and ideal team fit.

Candidate Data:
- Name: ${candidateData.name || "Anonymous Candidate"}
- University: ${candidateData.college || "Unspecified"} (${candidateData.branch || "Engineering"}, Class of ${candidateData.gradYear || "N/A"})
- Verified Skills: ${verifiedSkills || "Under review"}
- Claimed Skills: ${(candidateData.skills || []).join(", ") || "None listed"}
- Verified Projects:
${projectSummaries || "No projects uploaded yet"}

Guidelines:
- Highlight verified skills vs claimed skills.
- Mention strong practical signals from their project evidence.
- Maintain an objective, high-signal tone suitable for engineering managers and VP of Engineering.
- Do not make up fake employers or fake credentials.`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": "https://merit-lane.vercel.app",
        "X-Title": "MeritLane Recruiter AI",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: "You are an expert technical recruiter providing concise, high-signal hiring intelligence." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error("OpenRouter API error:", errText);
      // Fallback cleanly
      const verifiedList = Object.keys(candidateData.verifiedSkills || {}).filter(
        (k) => candidateData.verifiedSkills?.[k]?.status === "verified"
      );
      const fallbackSummary = `${candidateData.name || "Candidate"} is a verified practitioner specializing in ${verifiedList.length > 0 ? verifiedList.join(", ") : "software development"}. They have proven technical execution through ${candidateData.projects?.length || 0} documented evidence projects.`;
      return NextResponse.json({ summary: fallbackSummary }, { status: 200 });
    }

    const aiData = await openRouterRes.json();
    const summary = aiData.choices?.[0]?.message?.content?.trim() || "No summary generated.";

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    console.error("AI Summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
