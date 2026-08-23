
const fs = require("fs");

let content = fs.readFileSync("app/api/verify/route.ts", "utf8");

content = content.replace(
  "const { code, isPublicTest } = await req.json();\n    if (!code) {\n      return NextResponse.json({ error: \"No code provided\" }, { status: 400 });\n    }",
  `const { skill, answers, code, isPublicTest } = await req.json();\n    if (!skill || !code) {\n      return NextResponse.json({ error: "Skill and code are required" }, { status: 400 });\n    }`
);

// Remove: 
// if (!userData.assessmentStartedAt) { ...
// and add the skill check
content = content.replace(
  `if (!userData.assessmentStartedAt) {
      return NextResponse.json({ error: "Assessment not started" }, { status: 400 });
    }`,
  `if (!userData.assessmentStartedAt || userData.assessmentSkill !== skill) {
      return NextResponse.json({ error: "Assessment session invalid or mismatched skill" }, { status: 400 });
    }`
);

// Ensure the expired logic clears assessmentSkill
content = content.replace(
  `assessmentVariant: FieldValue.delete()\n      });`,
  `assessmentVariant: FieldValue.delete(),\n        assessmentSkill: FieldValue.delete()\n      });`
);

// Replace variant logic to check if python/django, and add MCQs
const oldVariant = `const variant = userData.assessmentVariant || "A";`;
const newVariant = `const content = require("@/lib/assessments/content").getAssessmentContent(skill);\n    let mcqScore = 0;\n    if (answers && Array.isArray(answers)) {\n      answers.forEach((ans: number, idx: number) => {\n        if (content.mcqs[idx] && content.mcqs[idx].answerIndex === ans) {\n          mcqScore++;\n        }\n      });\n    }\n\n    const normalizedSkill = skill.toLowerCase();\n    const isPython = normalizedSkill.includes("python") || normalizedSkill.includes("django");\n    \n    if (!isPython) {\n      return NextResponse.json({ \n        error: "Controlled Error: Coding evaluation infrastructure for " + skill + " is not currently implemented. We are working on expanding compiler support." \n      }, { status: 501 });\n    }\n\n    const variant = userData.assessmentVariant || "A";`;
content = content.replace(oldVariant, newVariant);

// Replace final submission handling
const oldFinal = `const threshold = 4;\n    const passed = passedTests >= threshold;\n\n    if (passed) {\n      await Promise.all([\n        userRef.update({\n          assessmentScores: {\n            [\`python_\${variant}\`]: passedTests\n          },\n          assessmentDate: FieldValue.serverTimestamp(),\n          // Clear active session\n          assessmentStartedAt: FieldValue.delete(),\n          assessmentVariant: FieldValue.delete()\n        }),\n        candidateRef.set({\n          verificationStatus: "verified",\n          verifiedAt: FieldValue.serverTimestamp(),\n          updatedAt: Date.now()\n        }, { merge: true })\n      ]);\n\n      return NextResponse.json({\n        success: true,\n        passed: true,\n        score: passedTests,\n        message: "Congratulations! Your profile is now verified."\n      });\n    } else {\n      // Failed - Enforce cooldown\n      await userRef.update({\n        lastFailedAssessmentAt: FieldValue.serverTimestamp(),\n        // Clear active session\n        assessmentStartedAt: FieldValue.delete(),\n        assessmentVariant: FieldValue.delete()\n      });\n\n      return NextResponse.json({\n        success: true,\n        passed: false,\n        score: passedTests,\n        message: \`Assessment failed. You passed \${passedTests} out of 5 tests. You can retry in 14 days.\`\n      });\n    }`;

const newFinal = `const mcqPassed = mcqScore === content.mcqs.length;\n    const codePassed = passedTests >= 4;\n    const passed = mcqPassed && codePassed;\n\n    if (passed) {\n      await Promise.all([\n        userRef.update({\n          assessmentScores: {\n            [\`\${skill}_\${variant}\`]: passedTests,\n            [\`\${skill}_mcq\`]: mcqScore\n          },\n          assessmentDate: FieldValue.serverTimestamp(),\n          assessmentStartedAt: FieldValue.delete(),\n          assessmentVariant: FieldValue.delete(),\n          assessmentSkill: FieldValue.delete()\n        }),\n        candidateRef.update({\n          verificationStatus: "verified",\n          verifiedAt: FieldValue.serverTimestamp(),\n          verifiedSkill: skill,\n          updatedAt: Date.now()\n        })\n      ]);\n\n      return NextResponse.json({\n        success: true,\n        passed: true,\n        mcqScore,\n        codeScore: passedTests,\n        message: "Congratulations! Your profile is now verified."\n      });\n    } else {\n      await userRef.update({\n        lastFailedAssessmentAt: FieldValue.serverTimestamp(),\n        assessmentStartedAt: FieldValue.delete(),\n        assessmentVariant: FieldValue.delete(),\n        assessmentSkill: FieldValue.delete()\n      });\n\n      return NextResponse.json({\n        success: true,\n        passed: false,\n        mcqScore,\n        codeScore: passedTests,\n        message: \`Assessment failed. You passed \${mcqScore}/\${content.mcqs.length} MCQs and \${passedTests}/5 tests. You can retry in 14 days.\`\n      });\n    }`;

content = content.replace(oldFinal, newFinal);

fs.writeFileSync("app/api/verify/route.ts", content, "utf8");

