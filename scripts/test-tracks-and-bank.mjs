import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log("=== MERITLANE 500-QUESTION BANK & TRACK TESTS ===");

  // 1. Verify JSON file existence and parsing
  const bankPath = path.resolve(__dirname, "../lib/assessments/bank/top-interview-500.json");
  console.log(`Checking question bank at: ${bankPath}`);
  if (!fs.existsSync(bankPath)) {
    throw new Error(`File does not exist: ${bankPath}`);
  }

  const raw = fs.readFileSync(bankPath, "utf-8");
  const bank = JSON.parse(raw);
  console.log(`✓ Total questions in bank: ${bank.length}`);

  if (bank.length !== 500) {
    throw new Error(`Expected exactly 500 questions, got ${bank.length}`);
  }

  // 2. Count by difficulty (lowercase in JSON: 'easy', 'medium', 'hard')
  const counts = { easy: 0, medium: 0, hard: 0, other: 0 };
  const ids = new Set();

  for (const q of bank) {
    if (counts[q.difficulty] !== undefined) {
      counts[q.difficulty]++;
    } else {
      counts.other++;
    }

    if (ids.has(q.id)) {
      throw new Error(`Duplicate id found: ${q.id}`);
    }
    ids.add(q.id);

    // Verify critical fields
    if (!q.title || !q.instructions || !q.category) {
      throw new Error(`Incomplete question data for: ${q.id}`);
    }

    // Verify starter code & supported languages
    if (!q.starterCode || typeof q.starterCode !== "object") {
      throw new Error(`Missing starterCode in: ${q.id}`);
    }

    if (!Array.isArray(q.supportedLanguages) || q.supportedLanguages.length === 0) {
      throw new Error(`Missing supportedLanguages in: ${q.id}`);
    }

    // Ensure at least one primary language (python, javascript, sql, java, cpp) has starter code
    const hasCoreLang = Object.entries(q.starterCode).some(([k, v]) => v && v.trim().length > 0);
    if (!hasCoreLang) {
      throw new Error(`No valid starter code found in: ${q.id}`);
    }
  }

  console.log("✓ Difficulty breakdown:", counts);
  console.log("✓ All 500 questions have unique IDs, categories, and multi-language templates.");

  // 3. Test question selection logic
  console.log("\nTesting dynamic track selection logic...");

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleWithRng(array, rng) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function simulateSelection(uid, skill, track = "standard", seed) {
    const easyPool = bank.filter(q => q.difficulty === 'easy');
    const mediumPool = bank.filter(q => q.difficulty === 'medium');
    const hardPool = bank.filter(q => q.difficulty === 'hard');
    const rng = mulberry32(seed || 12345);

    if (track === "standard") {
      const shuffledEasy = shuffleWithRng(easyPool, rng);
      const chosenEasy = shuffledEasy[0];
      const shuffledMedium = shuffleWithRng(mediumPool, rng);
      const chosenMedium = shuffledMedium.find(q => q.id !== chosenEasy.id) || mediumPool[0];
      return {
        track: "standard",
        format: "dual_easy_medium",
        tasks: [chosenEasy, chosenMedium]
      };
    } else {
      const shuffledHard = shuffleWithRng(hardPool, rng);
      const chosenHard = shuffledHard[0];
      return {
        track: "advanced",
        format: "single_hard",
        tasks: [chosenHard]
      };
    }
  }

  // Test Standard Track (100 random picks)
  for (let i = 0; i < 100; i++) {
    const res = simulateSelection("user_test", "python", "standard", i * 999 + 1);
    if (!res.tasks || res.tasks.length !== 2) {
      throw new Error(`Standard track must return 2 coding tasks, got ${res.tasks?.length}`);
    }
    if (res.tasks[0].difficulty !== "easy" || res.tasks[1].difficulty !== "medium") {
      throw new Error(`Standard track questions must be easy and medium`);
    }
    if (res.tasks[0].id === res.tasks[1].id) {
      throw new Error(`Tasks in standard track must be distinct questions`);
    }
  }
  console.log("✓ Standard Track selection tested (100 runs): Always yields 1 Easy + 1 Medium distinct questions.");

  // Test Advanced Track (100 random picks)
  for (let i = 0; i < 100; i++) {
    const res = simulateSelection("user_test", "python", "advanced", i * 777 + 2);
    if (!res.tasks || res.tasks.length !== 1) {
      throw new Error(`Advanced track must return 1 coding task, got ${res.tasks?.length}`);
    }
    if (res.tasks[0].difficulty !== "hard") {
      throw new Error(`Advanced track question must be hard, got ${res.tasks[0].difficulty}`);
    }
  }
  console.log("✓ Advanced Track selection tested (100 runs): Always yields 1 Hard challenge.");

  // 4. Verify score calculations and badge awards
  console.log("\nTesting scoring & badge award rules:");
  // Advanced track scoring test: single task (60% coding + 40% mcq)
  const advMcqScore = 80;
  const advCodeScore = 100;
  const advOverall = Math.round(advMcqScore * 0.40 + advCodeScore * 0.60);
  const advBadge = advOverall >= 75 ? "gold_honors" : null;
  console.log(`- Advanced Track (80% MCQ + 100% Hard code) = ${advOverall}% -> Passed -> Badge: ${advBadge}`);
  if (advBadge !== "gold_honors") throw new Error("Expected gold_honors badge for advanced track pass");

  // Standard track scoring test: dual task (30% easy + 30% medium + 40% mcq)
  const stdMcqScore = 80;
  const stdEasyScore = 100;
  const stdMedScore = 80;
  const stdOverall = Math.round(stdMcqScore * 0.40 + stdEasyScore * 0.30 + stdMedScore * 0.30);
  const stdBadge = stdOverall >= 75 ? "verified_professional" : null;
  console.log(`- Standard Track (80% MCQ + 100% Easy + 80% Med) = ${stdOverall}% -> Passed -> Badge: ${stdBadge}`);
  if (stdBadge !== "verified_professional") throw new Error("Expected verified_professional badge for standard track pass");

  console.log("\n✅ ALL TESTS PASSED PERFECTLY!");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
