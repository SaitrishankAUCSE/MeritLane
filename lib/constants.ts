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

export const COMMON_BRANCHES = [
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
  "Other Branch"
];

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
