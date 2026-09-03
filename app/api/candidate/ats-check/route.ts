import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface RecommendedRole {
  role: string;
  matchPercentage: number;
  seniorLevel: "Junior IC (L3)" | "Mid-Level IC (L4)" | "Senior IC (L5)" | "Staff / Principal (L6+)";
  justification: string;
  keyMatchedSkills: string[];
}

export interface AtsScoreResult {
  score: number; // 0 to 100
  rating: "Needs Work" | "Good" | "Strong" | "Excellent";
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  recommendedRoles: RecommendedRole[];
  detectedSkills: string[];
  dimensionScores: {
    impactQuantification: number;
    actionAgency: number;
    technicalStackDepth: number;
    atsLayoutFidelity: number;
  };
  experienceYearsEstimate?: number;
}

const TECH_DICTIONARY = [
  "TypeScript", "JavaScript", "Python", "Go", "Golang", "Rust", "Java", "C++", "C#", "C",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Django", "FastAPI", "Flask",
  "Spring Boot", "Ruby on Rails", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "GraphQL", "REST APIs", "gRPC", "Kafka", "RabbitMQ", "Docker", "Kubernetes", "AWS", "GCP",
  "Azure", "Terraform", "CI/CD", "Linux", "Git", "TailwindCSS", "HTML", "CSS", "Microservices",
  "Distributed Systems", "SQL", "NoSQL", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning",
  "Pandas", "NumPy", "Apache Spark", "Airflow", "System Design", "Unit Testing", "Jest", "Playwright"
];

const ROLE_DEFINITIONS = [
  {
    role: "Full Stack Engineer",
    coreSkills: ["React", "TypeScript", "JavaScript", "Next.js", "Node.js", "Express", "PostgreSQL", "REST APIs"],
    seniorSkills: ["System Design", "Microservices", "CI/CD", "Docker", "AWS"],
    baseDesc: "Strong synergy across modern frontend components and scalable backend API services."
  },
  {
    role: "Backend Systems Engineer",
    coreSkills: ["Go", "Python", "Java", "C++", "PostgreSQL", "Redis", "REST APIs", "SQL", "Django", "FastAPI"],
    seniorSkills: ["Distributed Systems", "gRPC", "Kafka", "Microservices", "Docker", "Kubernetes"],
    baseDesc: "Proven ability to architect high-throughput data layers, transactional APIs, and robust server infrastructure."
  },
  {
    role: "Cloud & DevOps Infrastructure Engineer",
    coreSkills: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD", "Linux", "Git"],
    seniorSkills: ["Distributed Systems", "Microservices", "Kafka", "System Design"],
    baseDesc: "Deep alignment with modern infrastructure-as-code, container orchestration, and continuous deployment pipelines."
  },
  {
    role: "Frontend Architecture Specialist",
    coreSkills: ["React", "Next.js", "TypeScript", "JavaScript", "TailwindCSS", "HTML", "CSS", "REST APIs", "Jest"],
    seniorSkills: ["System Design", "Playwright", "GraphQL"],
    baseDesc: "Exceptional UI precision, client-side state architecture, and accessible component design."
  },
  {
    role: "Data & ML Platform Engineer",
    coreSkills: ["Python", "SQL", "PostgreSQL", "Pandas", "NumPy", "PyTorch", "TensorFlow", "Machine Learning", "FastAPI"],
    seniorSkills: ["Apache Spark", "Airflow", "Distributed Systems", "Docker"],
    baseDesc: "High capability in data transformation pipelines, model serving endpoints, and scientific computation."
  }
];

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = await import("pdf-parse");
    if (pdf && typeof (pdf as any).PDFParse === "function") {
      const parser = new (pdf as any).PDFParse({ data: buffer });
      const res = await parser.getText();
      if (res && res.text && res.text.trim().length > 0) {
        return res.text;
      }
    } else if (typeof (pdf as any).default === "function") {
      const data = await (pdf as any).default(buffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn("pdf-parse extraction warning, attempting stream fallback:", err);
  }

  try {
    const raw = buffer.toString("binary");
    const textChunks: string[] = [];
    const textObjRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = textObjRegex.exec(raw)) !== null) {
      const inside = match[0];
      const strRegex = /\((.*?)\)|\[(.*?)\]/g;
      let strMatch;
      while ((strMatch = strRegex.exec(inside)) !== null) {
        const chunk = strMatch[1] || strMatch[2];
        if (chunk && chunk.length > 1) {
          textChunks.push(chunk.replace(/\\(\d{3}|.)/g, " "));
        }
      }
    }
    if (textChunks.length > 0) {
      return textChunks.join(" ");
    }
  } catch {
    // ignore
  }

  return "";
}

function evaluateResumeDeterministically(resumeText: string, targetSkills: string[]): AtsScoreResult {
  const textLower = resumeText.toLowerCase();
  let score = 45;

  const strengths: string[] = [];
  const improvements: string[] = [];
  const detectedSkills: string[] = [];

  TECH_DICTIONARY.forEach((skill) => {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const rx = new RegExp(`\\b${escaped}\\b`, "i");
    if (rx.test(resumeText)) {
      detectedSkills.push(skill);
    }
  });

  const actionVerbs = [
    "engineered", "architected", "developed", "deployed", "optimized",
    "implemented", "designed", "scaled", "automated", "refactored",
    "built", "reduced", "accelerated", "migrated", "orchestrated", "spearheaded"
  ];
  const foundVerbs = actionVerbs.filter((v) => textLower.includes(v));
  if (foundVerbs.length >= 5) {
    score += 15;
    strengths.push(`High density of impact action verbs (${foundVerbs.slice(0, 4).join(", ")}).`);
  } else if (foundVerbs.length >= 2) {
    score += 8;
    improvements.push("Incorporate stronger verbs (e.g., 'orchestrated', 'refactored', 'scaled') to emphasize engineering agency.");
  } else {
    improvements.push("Add action verbs to describe accomplishments rather than passive duties.");
  }

  const metricRegex = /\b(\d+%\b|\$\d+[kKmM]?\b|\b\d+x\b|\b\d+\s*(ms|seconds|minutes|users|requests|qps|tb|gb|mb|rps)\b)/i;
  if (metricRegex.test(resumeText)) {
    score += 15;
    strengths.push("Substantiates project impact with measurable outcomes and quantitative metrics.");
  } else {
    improvements.push("Quantify technical achievements with metrics (e.g., 'reduced API p99 latency by 32%', 'handled 20,000 requests/sec').");
  }

  if (detectedSkills.length >= 8) {
    score += 15;
    strengths.push(`Comprehensive technical vocabulary across ${detectedSkills.length} industry-standard competencies.`);
  } else if (detectedSkills.length >= 4) {
    score += 8;
  } else {
    improvements.push("Explicitly list specific technologies, databases, and frameworks used in your project descriptions.");
  }

  const keywordMatches: string[] = [];
  const missingKeywords: string[] = [];
  targetSkills.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      keywordMatches.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  if (targetSkills.length > 0) {
    const matchRatio = keywordMatches.length / targetSkills.length;
    score += Math.round(matchRatio * 10);
  }

  const wordCount = resumeText.trim().split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 1200) {
    score += 5;
  }

  score = Math.min(98, Math.max(35, score));

  let rating: AtsScoreResult["rating"] = "Needs Work";
  if (score >= 85) rating = "Excellent";
  else if (score >= 70) rating = "Strong";
  else if (score >= 55) rating = "Good";

  const recommendedRoles: RecommendedRole[] = ROLE_DEFINITIONS.map((def) => {
    let matchedCore = 0;
    let matchedSenior = 0;
    const matchedList: string[] = [];

    def.coreSkills.forEach((s) => {
      if (detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase()) || textLower.includes(s.toLowerCase())) {
        matchedCore++;
        matchedList.push(s);
      }
    });

    def.seniorSkills.forEach((s) => {
      if (detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase()) || textLower.includes(s.toLowerCase())) {
        matchedSenior++;
        if (!matchedList.includes(s)) matchedList.push(s);
      }
    });

    const coreRatio = matchedCore / def.coreSkills.length;
    const seniorRatio = matchedSenior / def.seniorSkills.length;
    const rawPct = Math.round(coreRatio * 75 + seniorRatio * 25);
    const matchPercentage = Math.min(98, Math.max(40, rawPct));

    let seniorLevel: RecommendedRole["seniorLevel"] = "Junior IC (L3)";
    if (matchedSenior >= 3 || (foundVerbs.length >= 6 && wordCount > 400)) {
      seniorLevel = "Senior IC (L5)";
    } else if (matchedCore >= 4 || matchedSenior >= 1) {
      seniorLevel = "Mid-Level IC (L4)";
    }

    return {
      role: def.role,
      matchPercentage,
      seniorLevel,
      justification: `${def.baseDesc} Matched ${matchedList.slice(0, 4).join(", ")}.`,
      keyMatchedSkills: matchedList.slice(0, 5)
    };
  })
  .sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 4);

  const summary = `Resume achieved an enterprise ATS benchmark score of ${score}/100 (${rating}). Conforms to ${
    score >= 75 ? "Tier-1 multinational technical screening criteria with verified engineering agency" : "foundational industry screening standards with actionable optimization opportunities"
  }. Prime candidate for ${recommendedRoles[0]?.role || "Software Engineering"}.`;

  const impactQuantification = metricRegex.test(resumeText) ? 88 : 54;
  const actionAgency = foundVerbs.length >= 5 ? 92 : foundVerbs.length >= 2 ? 76 : 48;
  const technicalStackDepth = detectedSkills.length >= 8 ? 95 : detectedSkills.length >= 4 ? 80 : 58;
  const atsLayoutFidelity = (wordCount >= 200 && wordCount <= 1000) ? 92 : 68;

  return {
    score,
    rating,
    summary,
    strengths,
    improvements,
    keywordMatches,
    missingKeywords: missingKeywords.slice(0, 5),
    recommendedRoles,
    detectedSkills: detectedSkills.slice(0, 15),
    dimensionScores: {
      impactQuantification,
      actionAgency,
      technicalStackDepth,
      atsLayoutFidelity,
    }
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
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    let resumeText = "";
    let skills: string[] = [];

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const skillsField = formData.get("skills");
      if (typeof skillsField === "string") {
        try {
          skills = JSON.parse(skillsField);
        } catch {
          skills = skillsField.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      if (!file) {
        return NextResponse.json({ error: "No resume PDF file uploaded." }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".pdf") && file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF resume files (.pdf) are supported." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      resumeText = await extractTextFromPdf(buffer);

      if (!resumeText || resumeText.trim().length < 30) {
        return NextResponse.json({
          error: "Could not extract readable text from this PDF. Please ensure it contains selectable text, not an image-only scan."
        }, { status: 400 });
      }
    } else {
      const body = await req.json();
      resumeText = body.resumeText || "";
      skills = body.skills || [];
    }

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: "Resume content is too brief to analyze (minimum 30 characters)." },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      try {
        const prompt = `You are an Executive Technical Screening Officer and Head of Talent Systems at a Fortune 500 multinational technology enterprise.
Evaluate the candidate's resume text against rigorous enterprise Applicant Tracking System (ATS) screening benchmarks.

Declared Skills: ${skills.join(", ") || "General Software Engineering"}

Return ONLY a valid JSON object matching this exact schema:
{
  "score": number (integer 0-100),
  "rating": "Needs Work" | "Good" | "Strong" | "Excellent",
  "summary": "2-sentence executive institutional screening verdict",
  "strengths": ["bullet 1", "bullet 2", "bullet 3"],
  "improvements": ["actionable feedback 1", "actionable feedback 2"],
  "keywordMatches": ["matched skill 1", "matched skill 2"],
  "missingKeywords": ["recommended skill 1", "recommended skill 2"],
  "detectedSkills": ["extracted tech 1", "extracted tech 2"],
  "dimensionScores": {
    "impactQuantification": number (integer 40-100),
    "actionAgency": number (integer 40-100),
    "technicalStackDepth": number (integer 40-100),
    "atsLayoutFidelity": number (integer 40-100)
  },
  "recommendedRoles": [
    {
      "role": "Exact Role Title (e.g. Senior Backend Systems Engineer)",
      "matchPercentage": number (integer 50-98),
      "seniorLevel": "Junior IC (L3)" | "Mid-Level IC (L4)" | "Senior IC (L5)" | "Staff / Principal (L6+)",
      "justification": "1-sentence justification highlighting verified project execution and competencies",
      "keyMatchedSkills": ["skill 1", "skill 2"]
    }
  ]
}

Ensure recommendedRoles has 3-4 top matches sorted by matchPercentage descending. Output raw JSON only.`;

        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterApiKey}`,
            "HTTP-Referer": "https://merit-lane.vercel.app",
            "X-Title": "MeritLane Enterprise ATS Reviewer"
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              { role: "system", content: "You are an executive talent systems evaluator. Return strict JSON." },
              { role: "user", content: `${prompt}\n\nResume Content:\n${resumeText.slice(0, 5000)}` }
            ],
            temperature: 0.2,
            max_tokens: 1200
          })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const raw = aiData.choices?.[0]?.message?.content || "";
          const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(clean);

          if (parsed && typeof parsed.score === "number") {
            await adminDb.collection("candidates").doc(uid).set({
              atsScore: parsed.score,
              atsRating: parsed.rating,
              atsSummary: parsed.summary,
              atsRoles: parsed.recommendedRoles || [],
              atsAnalyzedAt: Date.now()
            }, { merge: true });

            return NextResponse.json({ result: parsed, extractedText: resumeText.slice(0, 500) }, { status: 200 });
          }
        }
      } catch (aiErr) {
        console.warn("Enterprise ATS evaluation service fallback:", aiErr);
      }
    }

    const result = evaluateResumeDeterministically(resumeText, skills);

    await adminDb.collection("candidates").doc(uid).set({
      atsScore: result.score,
      atsRating: result.rating,
      atsSummary: result.summary,
      atsRoles: result.recommendedRoles || [],
      atsAnalyzedAt: Date.now()
    }, { merge: true });

    return NextResponse.json({ result, extractedText: resumeText.slice(0, 500) }, { status: 200 });
  } catch (error: any) {
    console.error("ATS check route error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse resume and evaluate ATS." }, { status: 500 });
  }
}

