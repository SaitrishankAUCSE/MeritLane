export const COMMON_DEGREES = [
  "B.Tech - Bachelor of Technology",
  "B.E. - Bachelor of Engineering",
  "B.Sc - Bachelor of Science",
  "BCA - Bachelor of Computer Applications",
  "M.Tech - Master of Technology",
  "M.E. - Master of Engineering",
  "M.Sc - Master of Science",
  "MCA - Master of Computer Applications",
  "B.S. - Bachelor of Science (4-Year)",
  "Dual Degree (B.Tech + M.Tech)",
  "Ph.D. - Doctor of Philosophy",
  "Other Degree / Diploma"
];

/** Degree-specific branch / specialisation lists */
const DEGREE_BRANCH_MAP: Record<string, string[]> = {
  // B.Tech & B.E. — Engineering specialisations
  "B.Tech": [
    "Computer Science and Engineering",
    "Information Technology",
    "Artificial Intelligence and Machine Learning (AI & ML)",
    "Artificial Intelligence and Data Science (AI & DS)",
    "Data Science",
    "Cyber Security",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "Computer Science and Business Systems (CSBS)",
    "Information Science and Engineering (ISE)",
    "Aerospace Engineering",
    "Robotics and Automation",
    "Biotechnology",
    "Chemical Engineering",
    "Mechatronics Engineering",
    "Electronics and Instrumentation Engineering (EIE)",
    "Automobile Engineering",
    "Metallurgical and Materials Engineering",
    "Mathematics and Computing",
    "Software Engineering",
    "Cloud Computing & DevOps",
    "Other Branch",
  ],
  "B.E.": [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "Aerospace Engineering",
    "Chemical Engineering",
    "Mechatronics Engineering",
    "Biotechnology",
    "Industrial Engineering",
    "Other Branch",
  ],
  // M.Tech & M.E. — Post-graduate engineering specialisations
  "M.Tech": [
    "Computer Science and Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science and Engineering",
    "VLSI Design",
    "Embedded Systems",
    "Communication Engineering",
    "Power Systems",
    "Structural Engineering",
    "Thermal Engineering",
    "Robotics and Automation",
    "Cyber Security",
    "Software Engineering",
    "Cloud Computing",
    "Other Specialisation",
  ],
  "M.E.": [
    "Computer Science and Engineering",
    "Embedded Systems",
    "VLSI Design",
    "Communication Systems",
    "Power Electronics",
    "Structural Engineering",
    "Manufacturing Engineering",
    "Other Specialisation",
  ],
  // Dual Degree
  "Dual Degree": [
    "Computer Science and Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Aerospace Engineering",
    "Mathematics and Computing",
    "Physics",
    "Other Dual Degree Branch",
  ],
  // B.Sc & B.S. — Science courses
  "B.Sc": [
    "Computer Science",
    "Information Technology",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Electronics",
    "Biotechnology",
    "Microbiology",
    "Biochemistry",
    "Environmental Science",
    "Data Science",
    "Other Science Course",
  ],
  "B.S.": [
    "Computer Science",
    "Information Science",
    "Data Science",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Biology",
    "Economics",
    "Other Science Course",
  ],
  // M.Sc — Post-graduate science courses
  "M.Sc": [
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Artificial Intelligence",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Electronics",
    "Biotechnology",
    "Microbiology",
    "Biochemistry",
    "Environmental Science",
    "Cybersecurity",
    "Other Science Course",
  ],
  // BCA & MCA — Computer Applications
  "BCA": [
    "Computer Applications",
    "Software Development",
    "Web and Mobile Development",
    "Data Analytics",
    "Cloud and DevOps",
    "Cybersecurity",
    "Artificial Intelligence and Data Science",
    "Other Specialisation",
  ],
  "MCA": [
    "Computer Applications",
    "Artificial Intelligence",
    "Data Science",
    "Software Engineering",
    "Cloud Computing",
    "Cybersecurity",
    "Internet of Things (IoT)",
    "Blockchain Technology",
    "Other Specialisation",
  ],
  // Ph.D.
  "Ph.D.": [
    "Computer Science and Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Electronics and Communication",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Biotechnology",
    "Management and Technology",
    "Other Research Area",
  ],
};

/**
 * Returns the relevant branch / specialisation list for a given degree string.
 * Falls back to a comprehensive general list when the degree is unrecognised.
 */
export const getBranchesForDegree = (degree: string): string[] => {
  // Match by prefix (e.g., "B.Tech - Bachelor of Technology" → key "B.Tech")
  for (const key of Object.keys(DEGREE_BRANCH_MAP)) {
    if (degree.startsWith(key)) return DEGREE_BRANCH_MAP[key];
  }
  // Default full list
  return [
    "Computer Science and Engineering",
    "Information Technology",
    "Artificial Intelligence and Machine Learning (AI & ML)",
    "Data Science",
    "Cyber Security",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering",
    "Civil Engineering",
    "Aerospace Engineering",
    "Robotics and Automation",
    "Biotechnology",
    "Chemical Engineering",
    "Mathematics and Computing",
    "Software Engineering",
    "Other Branch / Specialisation",
  ];
};

/** Flat list kept for legacy usage across the codebase */
export const COMMON_BRANCHES = getBranchesForDegree("");

export const YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() + 4 - i).toString());

export const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "GraphQL", "Firebase",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "PyTorch", "TensorFlow", "Pandas",
  "Systems Design", "Distributed Systems", "Microservices", "System Architecture",
  "Cryptography", "Blockchain", "Solidity", "Web3"
];

export const fetchIndianColleges = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await fetch(`/api/colleges?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || data.colleges || [];
  } catch (e) {
    console.error("Failed to fetch colleges:", e);
    return [];
  }
};
