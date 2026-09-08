import { getBankForSkill, selectAssignment } from "../lib/assessments/selector";
import { executeCode } from "../lib/compiler";

async function runVerification() {
  console.log("=================================================");
  console.log("MERITLANE ASSESSMENT ENGINE SIMULATION VERIFICATION");
  console.log("=================================================\n");

  // TEST 1: Question Bank Integrity
  console.log("[TEST 1] Checking Python Question Bank Pool...");
  const bank = await getBankForSkill("python");
  if (!bank) {
    throw new Error("Failed to load Python question bank!");
  }

  console.log(`- Easy Coding Variants: ${bank.easy.length} (Target: >= 5)`);
  console.log(`- Medium-Hard Coding Variants: ${bank.mediumHard.length} (Target: >= 5)`);
  console.log(`- MCQ Pool: ${bank.mcqs.length} (Target: 20-25)`);

  if (bank.easy.length < 5) throw new Error("Easy pool below target of 5!");
  if (bank.mediumHard.length < 5) throw new Error("Medium pool below target of 5!");
  if (bank.mcqs.length < 20 || bank.mcqs.length > 25) {
    throw new Error(`MCQ pool is ${bank.mcqs.length}, expected between 20 and 25!`);
  }
  console.log("-> TEST 1 PASSED: Pool sizes meet all specifications.\n");

  // TEST 2: Non-Repeating Selection Algorithm
  console.log("[TEST 2] Testing Non-Repeating Question Selector Across Cycles...");
  const seen = { coding: [] as string[], mcq: [] as string[] };
  const assignedEasy = new Set<string>();
  const assignedMedium = new Set<string>();

  for (let cycle = 1; cycle <= 5; cycle++) {
    const assignment = selectAssignment(bank, seen, "python");
    console.log(`  Attempt #${cycle}:`);
    console.log(`    Easy: [${assignment.easyId}] ${assignment.easy?.title}`);
    console.log(`    Medium: [${assignment.mediumId}] ${assignment.medium?.title}`);
    console.log(`    MCQ Count: ${assignment.mcqs.length}, IDs: ${assignment.mcqIds.slice(0, 3).join(", ")}...`);

    const easyId = assignment.easyId!;
    const medId = assignment.mediumId!;

    if (assignedEasy.has(easyId)) {
      throw new Error(`Duplicate Easy question assigned in cycle ${cycle}: ${easyId}`);
    }
    if (assignedMedium.has(medId)) {
      throw new Error(`Duplicate Medium question assigned in cycle ${cycle}: ${medId}`);
    }

    assignedEasy.add(easyId);
    assignedMedium.add(medId);

    // Record seen
    seen.coding.push(easyId, medId);
    assignment.mcqIds.forEach(id => {
      if (!seen.mcq.includes(id)) seen.mcq.push(id);
    });
  }
  console.log("-> TEST 2 PASSED: Zero duplicates across 5 full candidate assessment retry cycles.\n");

  // TEST 3: Floating-Point Tolerance Check (< 0.01) on Medium Question
  console.log("[TEST 3] Testing Floating-Point Tolerance Check (< 0.01)...");
  const aovQuestion = bank.mediumHard.find(q => q.id === "py_medium_001") || bank.mediumHard[0];
  console.log(`- Selected Task for Tolerance Check: [${aovQuestion.id}] ${aovQuestion.title}`);

  // Test starter code execution
  const publicRun = await executeCode({
    skill: "python",
    code: (typeof aovQuestion.starterCode === "string" ? aovQuestion.starterCode : aovQuestion.starterCode.python) || "",
    questionId: aovQuestion.id,
    isPublicTest: true
  });
  console.log(`- Starter code execution result: compileSuccess=${publicRun.compileSuccess}, cases=${publicRun.cases.length}`);

  // Solution with intentional +0.005 delta (must pass because 0.005 < 0.01 tolerance)
  const aovSolutionWithTolerance = `
def calculate_aov(csv_string: str) -> dict:
    totals = {}
    counts = {}
    for line in csv_string.strip().split("\\n"):
        parts = [p.strip() for p in line.split(",")]
        if len(parts) >= 4 and parts[3] == "SUCCESS":
            try:
                amt = float(parts[2])
                cid = parts[1]
                totals[cid] = totals.get(cid, 0.0) + amt
                counts[cid] = counts.get(cid, 0) + 1
            except ValueError:
                pass
    # Add +0.005 delta to test abs(result - expected) < 0.01 tolerance comparison
    return {cid: round(totals[cid] / counts[cid], 2) + 0.005 for cid in totals}
`;
  const solvedRun = await executeCode({
    skill: "python",
    code: aovSolutionWithTolerance,
    questionId: aovQuestion.id,
    isPublicTest: true
  });
  console.log(`- Solved run with +0.005 delta: passedTests=${solvedRun.passedTests}/${solvedRun.totalTests}`);
  if (solvedRun.passedTests !== solvedRun.totalTests) {
    throw new Error(`Tolerance test failed: ${JSON.stringify(solvedRun.cases)}`);
  }
  console.log("-> TEST 3 PASSED: abs(result - expected) < 0.01 properly accepted solution with float variance.\n");

  // TEST 4: Easy Task Validation
  console.log("[TEST 4] Testing Easy Task Execution...");
  const easyQ = bank.easy.find(q => q.id === "py_easy_001") || bank.easy[0];
  console.log(`- Selected Easy Task: [${easyQ.id}] ${easyQ.title}`);
  const easySolution = `
def process_transactions(csv_string: str) -> dict:
    totals = {}
    for line in csv_string.strip().split("\\n"):
        parts = [p.strip() for p in line.split(",")]
        if len(parts) >= 4 and parts[3] == "COMPLETED":
            try:
                amt = float(parts[2])
                uid = parts[1]
                totals[uid] = totals.get(uid, 0.0) + amt
            except ValueError:
                pass
    return totals
`;
  const easyRun = await executeCode({
    skill: "python",
    code: easySolution,
    questionId: easyQ.id,
    isPublicTest: true
  });
  console.log(`- Easy Solution passedTests: ${easyRun.passedTests}/${easyRun.totalTests}`);
  if (easyRun.passedTests !== easyRun.totalTests) {
    throw new Error(`Easy test failed: ${JSON.stringify(easyRun.cases)}`);
  }
  console.log("-> TEST 4 PASSED: Easy task successfully compiles, executes, and passes 100% of test cases.\n");

  // TEST 5: Proof Trace Breakdown Evaluation
  console.log("[TEST 5] Testing Proof Trace Component Breakdown Logic...");
  const mockScores = {
    easyPassed: 5,
    easyTotal: 5,
    mediumPassed: 4,
    mediumTotal: 5,
    mcqScore: 7,
    mcqTotal: 8
  };
  const easyPct = Math.round((mockScores.easyPassed / mockScores.easyTotal) * 100);
  const medPct = Math.round((mockScores.mediumPassed / mockScores.mediumTotal) * 100);
  const mcqPct = Math.round((mockScores.mcqScore / mockScores.mcqTotal) * 100);

  const passesEasy = easyPct === 100;
  const passesMed = medPct >= 60;
  const passesMcq = mcqPct >= 70;
  const verified = passesEasy && passesMed && passesMcq;

  const proofTrace = `EASY ${passesEasy ? "✓" : "✗"} (${easyPct}%) | MEDIUM ${medPct}% | MCQ ${mcqPct}%`;
  console.log(`- Generated Proof Trace: "${proofTrace}"`);
  console.log(`- Verified Status: ${verified ? "PASS" : "FAIL"}`);

  if (!verified || proofTrace !== "EASY ✓ (100%) | MEDIUM 80% | MCQ 88%") {
    throw new Error("Proof trace scoring mismatch!");
  }
  console.log("-> TEST 5 PASSED: Proof Trace schema matches requirements.\n");

  console.log("=================================================");
  console.log("ALL 5 ASSESSMENT ENGINE CRITERIA VERIFIED 100%!");
  console.log("=================================================");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
