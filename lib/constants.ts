export const COMMON_BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning",
  "Cyber Security",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Robotics and Automation",
  "Computer Science and Business Systems",
  "Information Science and Engineering",
  "Mechatronics Engineering",
  "Electronics and Instrumentation",
  "Automobile Engineering",
  "Metallurgical Engineering"
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
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const names = Array.from(new Set(data.map((item: any) => item.name))) as string[];
    return names.slice(0, 50);
  } catch (e) {
    return [];
  }
};
