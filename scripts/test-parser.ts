import { parseResumeEntities } from "../lib/resume/parser";

const sampleResume = `
Rahul Sharma
Bengaluru, India | rahul.sharma@example.com | +91 9876543210
GitHub: https://github.com/rahulsharma | LinkedIn: https://linkedin.com/in/rahulsharma

EDUCATION
Indian Institute of Technology, Madras
Bachelor of Technology in Computer Science and Engineering (2022 - 2026)
GPA: 8.9/10

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, Go, C++
Frontend: React, Next.js, TailwindCSS, Redux
Backend & Databases: Node.js, Express, FastAPI, PostgreSQL, Redis, MongoDB
Cloud & DevOps: Docker, Kubernetes, AWS, GitHub Actions, Linux

PROJECTS
High-Throughput Distributed Cache (Go, Redis, Docker)
- Architected a distributed in-memory cache handling 50,000 requests/sec with p99 latency under 2ms.
- Implemented consistent hashing and Raft consensus replication across 5 worker nodes.

Microservices E-Commerce API (Python, FastAPI, PostgreSQL)
- Engineered scalable RESTful API with automated CI/CD pipeline reducing deployment time by 40%.
`;

const parsed = parseResumeEntities(sampleResume);
console.log("Parsed Resume Output:");
console.log(JSON.stringify(parsed, null, 2));

if (parsed.name === "Rahul Sharma" && parsed.college?.includes("Indian Institute of Technology") && parsed.gradYear === "2026") {
  console.log("\nALL EXTRACTIONS VERIFIED ACCURATELY!");
} else {
  console.error("Mismatch in extraction!", parsed);
  process.exit(1);
}
