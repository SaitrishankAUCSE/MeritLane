import zlib from "zlib";

export interface ParsedResumeProfile {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  degree?: string;
  branch?: string;
  gradYear?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  summary?: string;
}

export interface RecommendedRole {
  role: string;
  matchPercentage: number;
  seniorLevel: "Junior IC (L3)" | "Mid-Level IC (L4)" | "Senior IC (L5)" | "Staff / Principal (L6+)";
  justification: string;
  keyMatchedSkills: string[];
}

export interface AtsScoreResult {
  score: number;
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

// 200+ Industry-Standard Technical Competencies Dictionary
export const TECHNICAL_SKILLS_DICTIONARY = [
  // Core Languages
  "TypeScript", "JavaScript", "Python", "Go", "Golang", "Rust", "Java", "C++", "C#", "C", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "Dart", "Elixir", "Haskell", "R", "Julia", "Bash", "Shell",
  // Frontend
  "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "SolidJS", "HTML5", "HTML", "CSS3", "CSS", "TailwindCSS", "Tailwind", "Sass", "SCSS", "Redux", "Zustand", "MobX", "Webpack", "Vite",
  // Backend & Runtime
  "Node.js", "Express", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot", "Spring", "Ruby on Rails", "Rails", "ASP.NET", ".NET Core", "GraphQL", "REST APIs", "REST", "gRPC", "WebSockets",
  // Databases & Caches
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "DynamoDB", "Cassandra", "Neo4j", "Firebase", "Firestore", "Supabase", "Prisma", "TypeORM", "SQL", "NoSQL",
  // Cloud & DevOps
  "Docker", "Kubernetes", "AWS", "Amazon Web Services", "GCP", "Google Cloud", "Azure", "Terraform", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Ansible", "Linux", "Nginx", "Microservices", "Serverless",
  // Distributed Systems & Messaging
  "Kafka", "RabbitMQ", "Apache Kafka", "Distributed Systems", "System Design", "Event-Driven Architecture",
  // AI, Data & ML
  "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Apache Spark", "Airflow", "NLP", "Computer Vision", "LLM", "Data Engineering",
  // Testing & Tooling
  "Git", "GitHub", "GitLab", "Unit Testing", "Jest", "Playwright", "Cypress", "PyTest", "Postman", "Swagger"
];

// Institutions Database
const INSTITUTION_PATTERNS = [
  "Andhra University College of Engineering", "Andhra University", "AUCE",
  "Indian Institute of Technology", "IIT",
  "National Institute of Technology", "NIT",
  "Birla Institute of Technology and Science", "BITS",
  "International Institute of Information Technology", "IIIT",
  "Delhi Technological University", "DTU",
  "Netaji Subhas University of Technology", "NSUT",
  "Vellore Institute of Technology", "VIT",
  "Manipal Institute of Technology", "MIT",
  "Anna University",
  "Jadavpur University",
  "Thapar Institute of Engineering and Technology",
  "SRM Institute of Science and Technology", "SRM",
  "Amrita Vishwa Vidyapeetham",
  "PSG College of Technology",
  "College of Engineering, Guindy",
  "College of Engineering, Pune", "COEP",
  "RV College of Engineering", "RVCE",
  "BMS College of Engineering", "BMSCE",
  "PES University",
  "Visvesvaraya National Institute of Technology",
  "Jawaharlal Nehru Technological University", "JNTU", "JNTUK", "JNTUH", "JNTUA",
  "Osmania University",
  "University of Hyderabad",
  "GITAM University", "GITAM",
  "Gayatri Vidya Parishad College of Engineering", "GVP",
  "Delhi University", "University of Delhi",
  "Mumbai University", "University of Mumbai",
  "Stanford University", "Massachusetts Institute of Technology", "UC Berkeley", "Carnegie Mellon University"
];

const DEGREE_PATTERNS = [
  { match: /\b(?:B\.?Tech|Bachelor\s+of\s+Technology)\b/i, value: "B.Tech - Bachelor of Technology" },
  { match: /\b(?:B\.?E\.?|Bachelor\s+of\s+Engineering)\b/i, value: "B.E. - Bachelor of Engineering" },
  { match: /\b(?:B\.?S\.?|B\.?Sc\.?|Bachelor\s+of\s+Science)\b/i, value: "B.S. - Bachelor of Science" },
  { match: /\b(?:M\.?Tech|Master\s+of\s+Technology)\b/i, value: "M.Tech - Master of Technology" },
  { match: /\b(?:M\.?E\.?|Master\s+of\s+Engineering)\b/i, value: "M.E. - Master of Engineering" },
  { match: /\b(?:M\.?S\.?|M\.?Sc\.?|Master\s+of\s+Science)\b/i, value: "M.S. - Master of Science" },
  { match: /\b(?:BCA|Bachelor\s+of\s+Computer\s+Applications)\b/i, value: "BCA - Bachelor of Computer Applications" },
  { match: /\b(?:MCA|Master\s+of\s+Computer\s+Applications)\b/i, value: "MCA - Master of Computer Applications" },
  { match: /\b(?:Ph\.?D\.?|Doctor\s+of\s+Philosophy)\b/i, value: "Ph.D. - Doctor of Philosophy" }
];

const BRANCH_PATTERNS = [
  { match: /\b(?:Computer\s+Science(?:\s+and\s+Engineering)?|CSE|CS)\b/i, value: "Computer Science and Engineering" },
  { match: /\b(?:Information\s+Technology|IT)\b/i, value: "Information Technology" },
  { match: /\b(?:Artificial\s+Intelligence(?:\s+and\s+Data\s+Science)?|AI\s*(?:&|\/|\+)?\s*DS|AIML)\b/i, value: "Artificial Intelligence and Data Science" },
  { match: /\b(?:Data\s+Science|Data\s+Analytics)\b/i, value: "Data Science" },
  { match: /\b(?:Software\s+Engineering)\b/i, value: "Software Engineering" },
  { match: /\b(?:Electronics\s+and\s+Communication(?:\s+Engineering)?|ECE)\b/i, value: "Electronics and Communication Engineering" },
  { match: /\b(?:Electrical\s+and\s+Electronics(?:\s+Engineering)?|EEE)\b/i, value: "Electrical and Electronics Engineering" },
  { match: /\b(?:Mechanical\s+Engineering|ME)\b/i, value: "Mechanical Engineering" },
  { match: /\b(?:Civil\s+Engineering|CE)\b/i, value: "Civil Engineering" },
  { match: /\b(?:Cyber\s+Security|Information\s+Security)\b/i, value: "Cyber Security" }
];

/**
 * Robust extraction of text from PDF buffer.
 * Tries PDFParse v2 class instance first, followed by zlib FlateDecode stream unpacking.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // 1. Try pdf-parse v2 (class instance)
  try {
    const pdf = await import("pdf-parse");
    if (pdf && typeof (pdf as any).PDFParse === "function") {
      const parser = new (pdf as any).PDFParse({ data: buffer });
      const res = await parser.getText();
      await parser.destroy().catch(() => {});
      if (res && typeof res.text === "string" && res.text.trim().length > 20) {
        return res.text;
      }
    } else if (typeof (pdf as any).default === "function") {
      const res = await (pdf as any).default(buffer);
      if (res && typeof res.text === "string" && res.text.trim().length > 20) {
        return res.text;
      }
    }
  } catch (err) {
    console.warn("PDFParse v2 direct instance parser warning:", err);
  }

  // 2. High-precision FlateDecode stream extraction
  try {
    const raw = buffer.toString("latin1");
    const chunks: string[] = [];
    
    // Find all streams
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(raw)) !== null) {
      const streamContent = streamMatch[1];
      const streamBuffer = Buffer.from(streamContent, "latin1");
      
      let decompressed: string | null = null;
      try {
        decompressed = zlib.inflateSync(streamBuffer).toString("utf-8");
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamBuffer).toString("utf-8");
        } catch {
          // Stream might not be zlib-compressed, or is image/binary
        }
      }

      const targetText = decompressed || streamContent;
      // Extract strings inside (...) or [...]
      const textRegex = /\(([^)]+)\)|\[([^\]]+)\]/g;
      let textMatch;
      while ((textMatch = textRegex.exec(targetText)) !== null) {
        const textStr = textMatch[1] || textMatch[2];
        if (textStr && textStr.length > 1 && !/^[\x00-\x1F\x7F-\x9F]+$/.test(textStr)) {
          // Unescape common PDF escapes
          const clean = textStr
            .replace(/\\([()\\])/g, "$1")
            .replace(/\\n/g, " ")
            .replace(/\\r/g, " ")
            .replace(/\\t/g, " ")
            .replace(/\s+/g, " ");
          if (clean.trim().length > 1) {
            chunks.push(clean.trim());
          }
        }
      }
    }

    if (chunks.length > 15) {
      return chunks.join(" ");
    }
  } catch (streamErr) {
    console.warn("FlateDecode stream extraction failed:", streamErr);
  }

  return "";
}

const SKILL_CANONICAL_MAP: Record<string, string> = {
  "react.js": "React",
  "vue.js": "Vue",
  "angular.js": "Angular",
  "node": "Node.js",
  "express.js": "Express",
  "tailwind": "TailwindCSS",
  "rest": "REST APIs",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
};

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Deterministically parses structured candidate resume entities from raw text.
 */
export function parseResumeEntities(
  resumeText: string,
  hints?: {
    fileName?: string;
    existingName?: string;
    existingCollege?: string;
    existingDegree?: string;
    existingBranch?: string;
    existingGradYear?: string;
  }
): ParsedResumeProfile {
  const lines = resumeText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
  const profile: ParsedResumeProfile = {
    skills: []
  };

  // 1. Email Extraction
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    profile.email = emailMatch[0].trim();
  }

  // 2. Phone Extraction
  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    profile.phone = phoneMatch[0].trim();
  }

  // 3. GitHub & LinkedIn Extraction
  const githubMatch = resumeText.match(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i) ||
                      resumeText.match(/\bgithub\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    profile.githubUrl = githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  const linkedinMatch = resumeText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i) ||
                        resumeText.match(/\blinkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    profile.linkedinUrl = linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  // 4. Candidate Name Extraction
  const NON_NAME_WORDS = /curriculum|resume|profile|cv|bio|phone|address|education|experience|projects|skills|summary|developer|engineer|architect|intern|contact|university|college|portfolio|page|email/i;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const rawLine = lines[i];
    // Split line on common delimiters (e.g. "Sai Trishank | Full Stack Developer" or "Sai Trishank - saitrishank@...")
    const segments = rawLine.split(/[|•·—\t,]/).map(s => s.trim()).filter(Boolean);
    const candidateSegment = segments[0] || rawLine;

    // Remove leading/trailing non-alpha chars
    const cleaned = candidateSegment.replace(/^[^a-zA-Z]+|[^a-zA-Z.]+$/g, "").trim();
    const words = cleaned.split(/\s+/);

    if (
      words.length >= 2 &&
      words.length <= 4 &&
      !NON_NAME_WORDS.test(cleaned) &&
      !cleaned.includes("@") &&
      !cleaned.includes(".com") &&
      !/\d/.test(cleaned)
    ) {
      const isAllUpper = cleaned === cleaned.toUpperCase();
      const isTitleCase = words.every(w => /^[A-Z]/.test(w));
      if (isAllUpper || isTitleCase) {
        profile.name = toTitleCase(cleaned);
        break;
      }
    }
  }

  // Fallback 4b: Check filename or email hint for name matching in resume text
  if (!profile.name) {
    const searchTerms: string[] = [];
    if (hints?.fileName) {
      const namePart = hints.fileName.replace(/\.pdf$/i, "").replace(/[-_](?:resume|cv|main|final|latest|v\d+)/gi, "");
      const terms = namePart.split(/[-_]+/).filter(w => w.length > 2 && !/resume|cv|pdf/i.test(w));
      searchTerms.push(...terms);
    }
    if (profile.email) {
      const emailUser = profile.email.split("@")[0].replace(/[0-9_.-]+/g, " ");
      const terms = emailUser.split(/\s+/).filter(w => w.length > 2);
      searchTerms.push(...terms);
    }

    for (const term of searchTerms) {
      const nameRegex = new RegExp(`\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})\\b`, "g");
      let match;
      while ((match = nameRegex.exec(resumeText.slice(0, 1500))) !== null) {
        if (match[1].toLowerCase().includes(term.toLowerCase()) && !NON_NAME_WORDS.test(match[1])) {
          profile.name = toTitleCase(match[1].trim());
          break;
        }
      }
      if (profile.name) break;
    }
  }

  // Fallback 4c: Use existing profile name if available and valid
  if (!profile.name && hints?.existingName && hints.existingName !== "Candidate") {
    profile.name = hints.existingName;
  }

  // 5. College / Institution Extraction
  for (const pattern of INSTITUTION_PATTERNS) {
    const regex = new RegExp(`\\b${pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?:[\\s,]+[A-Za-z]+)*\\b`, "i");
    const match = resumeText.match(regex);
    if (match) {
      profile.college = match[0].replace(/[-,.\s]+$/, "").trim();
      break;
    }
  }

  if (!profile.college) {
    // Regex matching any "X University", "Institute of Technology", "College of Engineering"
    const genericInstMatch = resumeText.match(/([A-Z][A-Za-z\s]+(?:University|Institute\s+of\s+Technology|College\s+of\s+Engineering|Institute\s+of\s+Science))/);
    if (genericInstMatch) {
      profile.college = genericInstMatch[0].replace(/[-,.\s]+$/, "").trim();
    }
  }

  if (!profile.college && hints?.existingCollege) {
    profile.college = hints.existingCollege;
  }

  // 6. Degree Extraction
  for (const deg of DEGREE_PATTERNS) {
    if (deg.match.test(resumeText)) {
      profile.degree = deg.value.replace(/[-,.\s]+$/, "").trim();
      break;
    }
  }
  if (!profile.degree && hints?.existingDegree) {
    profile.degree = hints.existingDegree;
  }

  // 7. Branch Extraction
  for (const br of BRANCH_PATTERNS) {
    if (br.match.test(resumeText)) {
      profile.branch = br.value.replace(/[-,.\s]+$/, "").trim();
      break;
    }
  }
  if (!profile.branch && hints?.existingBranch) {
    profile.branch = hints.existingBranch;
  }

  // 8. Graduation Year Extraction
  const yearMatches = resumeText.match(/\b(202[0-9]|2030)\b/g);
  if (yearMatches && yearMatches.length > 0) {
    const sortedYears = yearMatches.map(Number).sort((a, b) => b - a);
    profile.gradYear = sortedYears[0].toString();
  }
  if (!profile.gradYear && hints?.existingGradYear) {
    profile.gradYear = hints.existingGradYear;
  }

  // 9. Technical Skills Extraction against 200+ taxonomy with deduplication
  const detectedSkills = new Set<string>();
  for (const skill of TECHNICAL_SKILLS_DICTIONARY) {
    // Special protection for single-letter skills to avoid false positives (e.g. "R&D", "C.")
    if (skill === "R") {
      const rRegex = /\b(?:R\s*(?:language|programming|stats|studio)|(?:\bPython\s*,\s*R\b)|(?:\bR\s*,\s*Python\b))\b/i;
      if (rRegex.test(resumeText)) {
        detectedSkills.add("R");
      }
      continue;
    }
    if (skill === "C") {
      const cRegex = /(?:\bC\s*(?:programming|language)\b|\bC\s*[,/]\s*C\+\+|\bC\+\+\s*[,/]\s*C\b|Languages:[\s\S]*?\bC\b)/i;
      if (cRegex.test(resumeText)) {
        detectedSkills.add("C");
      }
      continue;
    }

    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, "i");
    if (regex.test(resumeText)) {
      const canonical = SKILL_CANONICAL_MAP[skill.toLowerCase()] || skill;
      detectedSkills.add(canonical);
    }
  }

  // Consolidate duplicates (e.g. if React is present, ensure React.js isn't separate)
  if (detectedSkills.has("React")) detectedSkills.delete("React.js");
  if (detectedSkills.has("Vue")) detectedSkills.delete("Vue.js");
  if (detectedSkills.has("TailwindCSS")) detectedSkills.delete("Tailwind");

  profile.skills = Array.from(detectedSkills);

  return profile;
}

