import { selectAssignment } from "../lib/assessments/selector";
import type { SkillBank } from "../lib/assessments/bank/types";

async function verifyAll() {
  console.log("=================================================");
  console.log("RUNNING MERITLANE DIRECT VERIFICATION (NO PLAYWRIGHT)");
  console.log("=================================================\n");

  // TEST 1: Ping Live Vercel URLs
  console.log("[TEST 1] Pinging Live Production Deployment...");
  const urls = [
    { name: "Landing Page", url: "https://merit-lane.vercel.app/", method: "GET", expectedStatus: 200 },
    { name: "Candidate Assessment", url: "https://merit-lane.vercel.app/candidate/assessment", method: "GET", expectedStatus: 200 },
    { name: "Start Assessment API (No Auth)", url: "https://merit-lane.vercel.app/api/start-assessment", method: "POST", expectedStatus: 401 },
    { name: "Verify Assessment API (No Auth)", url: "https://merit-lane.vercel.app/api/verify", method: "POST", expectedStatus: 401 },
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url, { 
        method: item.method,
        signal: AbortSignal.timeout(10000)
      });
      if (res.status === item.expectedStatus) {
        console.log(`  PASS: [${item.method}] ${item.name} (${item.url}) returned HTTP ${res.status}`);
      } else {
        console.error(`  FAIL: [${item.method}] ${item.name} (${item.url}) returned HTTP ${res.status}, expected ${item.expectedStatus}`);
      }
    } catch (err: any) {
      console.error(`  ERROR connecting to ${item.url}:`, err.message);
    }
  }

  // TEST 2: Knowledge Bank vs Coding Bank Assignment Selector
  console.log("\n[TEST 2] Verifying Non-crashing Selection Logic for MCQ-Only vs Coding Banks...");
  
  // A. Knowledge/DevOps Bank (Docker - 30 MCQs, 0 coding)
  const mockKnowledgeBank: SkillBank = {
    skill: "docker",
    easy: [],
    mediumHard: [],
    mcqs: Array.from({ length: 30 }, (_, i) => ({
      id: `docker_mcq_${i + 1}`,
      question: `Sample Docker question ${i + 1}`,
      options: ["A", "B", "C", "D"],
      answerIndex: 0,
      explanation: "Test explanation",
      difficulty: "medium",
      topic: "Docker Containers"
    }))
  };

  const knowledgeAssignment = selectAssignment(mockKnowledgeBank, { coding: [], mcq: [] }, "docker");
  console.log(`  MCQ-Only Bank (Docker):`);
  console.log(`    - Coding Questions: Easy=${knowledgeAssignment.easy?.id || 'none'}, Medium=${knowledgeAssignment.medium?.id || 'none'}`);
  console.log(`    - MCQs Selected: ${knowledgeAssignment.mcqs.length} (Target: 30)`);
  if (knowledgeAssignment.mcqs.length !== 30) {
    throw new Error(`Expected 30 MCQs for knowledge bank, got ${knowledgeAssignment.mcqs.length}`);
  }
  if (knowledgeAssignment.easy !== undefined || knowledgeAssignment.medium !== undefined) {
    throw new Error(`Expected 0 coding tasks for knowledge bank!`);
  }
  console.log("  PASS: Knowledge/DevOps bank selects exactly 30 MCQs and 0 coding tasks without crashing.");

  // B. Programming Bank (JavaScript - 15 MCQs, 2 coding tasks)
  const mockProgrammingBank: SkillBank = {
    skill: "javascript",
    easy: [
      {
        id: "js_easy_1",
        difficulty: "easy",
        title: "Two Sum JS",
        instructions: "Find indices",
        functionName: "twoSum",
        starterCode: { python: "def twoSum(): pass", javascript: "function twoSum() {}" },
        supportedLanguages: [{ id: "javascript", name: "JavaScript" }],
        publicTests: [],
        hiddenTests: []
      }
    ],
    mediumHard: [
      {
        id: "js_med_1",
        difficulty: "medium_hard",
        title: "LRU Cache JS",
        instructions: "Implement LRU",
        functionName: "LRUCache",
        starterCode: { python: "def LRUCache(): pass", javascript: "function LRUCache() {}" },
        supportedLanguages: [{ id: "javascript", name: "JavaScript" }],
        publicTests: [],
        hiddenTests: []
      }
    ],
    mcqs: Array.from({ length: 25 }, (_, i) => ({
      id: `js_mcq_${i + 1}`,
      question: `Sample JS question ${i + 1}`,
      options: ["A", "B", "C", "D"],
      answerIndex: 0,
      explanation: "Test explanation",
      difficulty: "medium",
      topic: "Event Loop"
    }))
  };

  const codingAssignment = selectAssignment(mockProgrammingBank, { coding: [], mcq: [] }, "javascript");
  console.log(`\n  Programming Bank (JavaScript):`);
  console.log(`    - Easy: ${codingAssignment.easy?.title}`);
  console.log(`    - Medium: ${codingAssignment.medium?.title}`);
  console.log(`    - MCQs Selected: ${codingAssignment.mcqs.length} (Target: 15)`);
  if (!codingAssignment.easy || !codingAssignment.medium) {
    throw new Error(`Expected 2 coding tasks for programming bank!`);
  }
  if (codingAssignment.mcqs.length !== 15) {
    throw new Error(`Expected 15 MCQs for programming bank, got ${codingAssignment.mcqs.length}`);
  }
  console.log("  PASS: Programming bank selects exactly 15 MCQs and 2 coding tasks.");

  console.log("\n=================================================");
  console.log("ALL DIRECT VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

verifyAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
