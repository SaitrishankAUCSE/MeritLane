import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface AtsScoreResult {
  score: number; // 0 to 100
  rating: "Needs Work" | "Good" | "Strong" | "Excellent";
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
}

/**
 * Deterministic fallback scoring rule-engine based on standard industry ATS heuristics
 * (action verbs, quantifiable metrics, skills density, structural sections).
 */
function calculateDeterministicAtsScore(resumeText: string, targetSkills: string[]): AtsScoreResult {
  const text = resumeText.toLowerCase();
  let score = 40; // baseline
  const strengths: string[] = [];
  const improvements: string[] = [];
  const keywordMatches: string[] = [];
  const missingKeywords: string[] = [];

  // 1. Length & Substance
  const wordCount = resumeText.trim().split(/\s+/).length;
  if (wordCount >= 150 && wordCount <= 1200) {
    score += 15;
    strengths.push("Good length and detail density for technical screening.");
  } else if (wordCount < 150) {
    improvements.push("Resume is too brief. Elaborate on your technical responsibilities and project outcomes.");
  } else {
    improvements.push("Resume exceeds 1,200 words. Condense to highlight key technical impacts.");
  }

  // 2. Action Verbs
  const actionVerbs = [
    "engineered", "architected", "developed", "deployed", "optimized",
    "implemented", "designed", "scaled", "automated", "refactored",
    "built", "reduced", "increased", "migrated", "maintained"
  ];
  const foundVerbs = actionVerbs.filter(verb => text.includes(verb));
  if (foundVerbs.length >= 4) {
    score += 15;
    strengths.push(`Strong action verbs utilized (${foundVerbs.slice(0, 4).join(", ")}).`);
  } else {
    improvements.push("Incorporate stronger action verbs (e.g. 'architected', 'optimized', 'deployed') to describe achievements.");
  }

  // 3. Quantifiable Impact & Metrics
  const metricRegex = /\b(\d+%\b|\$\d+|\b\d+x\b|\b\d+\s*(ms|seconds|minutes|users|requests|qps|tb|gb|mb)\b)/i;
  if (metricRegex.test(resumeText)) {
    score += 15;
    strengths.push("Includes quantifiable metrics and performance outcomes.");
  } else {
    improvements.push("Include measurable outcomes (e.g., 'reduced latency by 35%', 'handled 50k requests/sec').");
  }

  // 4. Target Skill Matches
  targetSkills.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      keywordMatches.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  if (targetSkills.length > 0) {
    const matchRatio = keywordMatches.length / targetSkills.length;
    score += Math.round(matchRatio * 15);
    if (matchRatio >= 0.6) {
      strengths.push(`High alignment with declared skills (${keywordMatches.length}/${targetSkills.length} matches).`);
    } else if (missingKeywords.length > 0) {
      improvements.push(`Mention key skills explicitly in your project descriptions: ${missingKeywords.slice(0, 3).join(", ")}.`);
    }
  }

  score = Math.min(100, Math.max(20, score));

  let rating: AtsScoreResult["rating"] = "Needs Work";
  if (score >= 85) rating = "Excellent";
  else if (score >= 70) rating = "Strong";
  else if (score >= 50) rating = "Good";

  const summary = `Your resume earned an ATS score of ${score}/100 (${rating}). It ${
    score >= 70 ? "demonstrates strong keyword matching and technical clarity" : "can be improved with more quantifiable outcomes and keyword alignment"
  }.`;

  return {
    score,
    rating,
    summary,
    strengths,
    improvements,
    keywordMatches,
    missingKeywords: missingKeywords.slice(0, 5),
  };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not configured" }, { status: 500 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await req.json();
    const { resumeText, skills = [] } = body;

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: "Please enter your resume text or bullet points (minimum 30 characters)." },
        { status: 400 }
      );
    }

    // Check OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://meritlane.com",
            "X-Title": "MeritLane ATS Review"
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              {
                role: "system",
                content: `You are an executive ATS (Applicant Tracking System) reviewer and hiring manager. Evaluate the candidate's resume against their claimed skills (${skills.join(", ") || "Software Engineering"}).
Return a valid JSON object ONLY, with the following schema:
{
  "score": number (0-100),
  "rating": "Needs Work" | "Good" | "Strong" | "Excellent",
  "summary": "1-2 sentence concise executive evaluation",
  "strengths": ["bullet 1", "bullet 2"],
  "improvements": ["bullet 1", "bullet 2"],
  "keywordMatches": ["matched skill 1", "matched skill 2"],
  "missingKeywords": ["missing skill 1"]
}
Do not wrap in markdown quotes if possible, return raw json.`
              },
              {
                role: "user",
                content: `Here is the candidate's resume content:\n\n${resumeText.slice(0, 4000)}`
              }
            ],
            temperature: 0.2
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          const rawReply = aiData.choices?.[0]?.message?.content || "";
          
          // Clean JSON in case model wrapped it in ```json
          const cleanJson = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed: AtsScoreResult = JSON.parse(cleanJson);
          
          if (parsed && typeof parsed.score === "number") {
            // Persist the ATS score into the candidate document
            await adminDb.collection("candidates").doc(uid).set({
              atsScore: parsed.score,
              atsRating: parsed.rating,
              atsSummary: parsed.summary,
              atsAnalyzedAt: Date.now()
            }, { merge: true });

            return NextResponse.json({ result: parsed }, { status: 200 });
          }
        }
      } catch (aiErr) {
        console.warn("OpenRouter ATS analysis failed, using deterministic evaluation:", aiErr);
      }
    }

    // Fallback to deterministic ATS engine
    const result = calculateDeterministicAtsScore(resumeText, skills);

    // Persist score
    await adminDb.collection("candidates").doc(uid).set({
      atsScore: result.score,
      atsRating: result.rating,
      atsSummary: result.summary,
      atsAnalyzedAt: Date.now()
    }, { merge: true });

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    console.error("ATS check route error:", error);
    return NextResponse.json({ error: "Failed to evaluate ATS score." }, { status: 500 });
  }
}
