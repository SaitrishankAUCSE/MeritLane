import { executeCode } from "../lib/compiler/index.ts";
import { QUESTION_BANKS } from "../lib/assessments/content.ts";

async function testAllCompilers() {
  console.log("==================================================");
  console.log("   MERITLANE ALL-LANGUAGE COMPILER AUDIT SUITE    ");
  console.log("==================================================\n");

  const results = [];

  for (const [skill, bank] of Object.entries(QUESTION_BANKS)) {
    if (!bank.codingPool || bank.codingPool.length === 0) continue;

    for (const challenge of bank.codingPool) {
      const lang = challenge.language || skill;
      const initialCode = challenge.initialCode;

      console.log(`Testing Skill: [${skill}] | Challenge: "${challenge.title}" | Lang: ${lang}...`);
      try {
        const startTime = Date.now();
        const res = await executeCode({
          skill,
          code: initialCode,
          language: lang,
          isPublicTest: true,
        });

        const duration = Date.now() - startTime;
        const status = res.compileSuccess ? "COMPILED" : "COMPILE_FAIL";
        results.push({
          skill,
          title: challenge.title,
          lang,
          compileSuccess: res.compileSuccess,
          success: res.success,
          passedTests: res.passedTests,
          totalTests: res.totalTests,
          duration,
          error: res.stderr || (res.compileSuccess ? "" : "Failed compilation"),
        });

        console.log(`  -> Result: ${status} | Passed: ${res.passedTests}/${res.totalTests} | Duration: ${duration}ms`);
        if (res.stderr && !res.compileSuccess) {
          console.log(`     Error: ${res.stderr.slice(0, 150)}...`);
        }
      } catch (err) {
        console.log(`  -> CRASH: ${err.message}`);
        results.push({
          skill,
          title: challenge.title,
          lang,
          compileSuccess: false,
          success: false,
          passedTests: 0,
          totalTests: 0,
          duration: 0,
          error: `EXCEPTION: ${err.message}`,
        });
      }
    }
  }

  // Also test LeetCode questions for Python, JS, TS
  const interviewQuestions = [
    {
      skill: "JavaScript",
      lang: "javascript",
      questionId: "leetcode_125",
      title: "Valid Palindrome",
      code: "var isPalindrome = function(s) { s = s.toLowerCase().replace(/[^a-z0-9]/g, ''); return s === s.split('').reverse().join(''); };"
    },
    {
      skill: "TypeScript",
      lang: "typescript",
      questionId: "leetcode_125",
      title: "Valid Palindrome",
      code: "function isPalindrome(s: string): boolean { s = s.toLowerCase().replace(/[^a-z0-9]/g, ''); return s === s.split('').reverse().join(''); }"
    },
    {
      skill: "Python",
      lang: "python",
      questionId: "leetcode_125",
      title: "Valid Palindrome",
      code: "def isPalindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]"
    }
  ];

  console.log("\nTesting Top Interview Challenges (LeetCode)...");
  for (const t of interviewQuestions) {
    console.log(`Testing Question: "${t.title}" | Lang: ${t.lang}...`);
    try {
      const res = await executeCode({
        skill: t.skill,
        code: t.code,
        language: t.lang,
        questionId: t.questionId,
        isPublicTest: true,
      });
      console.log(`  -> Result: ${res.compileSuccess ? "COMPILED" : "FAIL"} | Passed: ${res.passedTests}/${res.totalTests}`);
      results.push({
        skill: t.skill,
        title: `LeetCode: ${t.title}`,
        lang: t.lang,
        compileSuccess: res.compileSuccess,
        success: res.success,
        passedTests: res.passedTests,
        totalTests: res.totalTests,
        duration: res.durationMs || 0,
        error: res.stderr || "",
      });
    } catch (err) {
      console.log(`  -> CRASH: ${err.message}`);
    }
  }

  console.log("\n==================================================");
  console.log("                   SUMMARY                        ");
  console.log("==================================================");
  const total = results.length;
  const compiled = results.filter(r => r.compileSuccess).length;
  const failedCompile = results.filter(r => !r.compileSuccess);

  console.log(`Total challenges tested: ${total}`);
  console.log(`Successfully compiled/evaluated: ${compiled}/${total}`);
  if (failedCompile.length > 0) {
    console.log(`\nFailed challenges (${failedCompile.length}):`);
    for (const f of failedCompile) {
      console.log(`- [${f.skill}] ${f.title} (${f.lang}): ${f.error}`);
    }
  }
}

testAllCompilers().catch(console.error);
