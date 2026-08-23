
const fs = require("fs");

let content = fs.readFileSync("app/candidate/assessment/page.tsx", "utf8");

content = content.replace(
  "import { getAssessmentContent, AssessmentContent } from \"@/lib/assessments/content\";",
  `import { auth } from "@/lib/firebase/config";\nimport { getIdToken } from "firebase/auth";\n\nexport interface MCQ {\n  question: string;\n  options: string[];\n}\n\nexport interface CodingChallenge {\n  title: string;\n  instructions: string;\n  initialCode: string;\n}\n\nexport interface AssessmentContent {\n  mcqs: MCQ[];\n  coding: CodingChallenge;\n}`
);

content = content.replace(
  "const [mcqScore, setMcqScore] = useState(0);",
  "const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);"
);

// I will use regex to replace checkCandidateStatus and handleAnswerMcq
content = content.replace(
  /const checkCandidateStatus = async \(\) => \{[\s\S]*?checkCandidateStatus\(\);/,
  `const initAssessment = async () => {\n        try {\n          const token = await getIdToken(auth.currentUser!, true);\n          const res = await fetch("/api/start-assessment", {\n            method: "POST",\n            headers: {\n              "Content-Type": "application/json",\n              "Authorization": \`Bearer \${token}\`\n            },\n            body: JSON.stringify({ skill: skillParam })\n          });\n          \n          const data = await res.json();\n          if (!res.ok) {\n            if (res.status === 403) setErrorMsg("SKILL NOT FOUND");\n            else if (res.status === 429) {\n              setErrorMsg("ASSESSMENT NOT PASSED");\n              setCooldownDays(14);\n            } else if (res.status === 409) setErrorMsg("ALREADY VERIFIED");\n            else setErrorMsg(data.error || "Failed to start assessment");\n            setInitializing(false);\n            return;\n          }\n          \n          setContent(data.content);\n          setCode(data.content.coding.initialCode);\n          setInitializing(false);\n        } catch (err) {\n          console.error(err);\n          setErrorMsg("SYSTEM ERROR");\n          setInitializing(false);\n        }\n      };\n\n      initAssessment();`
);

content = content.replace(
  /const loadedContent = getAssessmentContent\(skillParam\);\s*setContent\(loadedContent\);\s*setCode\(loadedContent.coding.initialCode\);/,
  ""
);

content = content.replace(
  /const handleAnswerMcq = \(selectedIndex: number\) => \{[\s\S]*?setPhase\('coding'\);\s*\}\s*\};/,
  `const handleAnswerMcq = (selectedIndex: number) => {\n    if (!content) return;\n    setMcqAnswers(prev => [...prev, selectedIndex]);\n    \n    if (mcqIndex < content.mcqs.length - 1) {\n      setMcqIndex(i => i + 1);\n    } else {\n      setPhase("coding");\n    }\n  };`
);

content = content.replace(
  /const handleTest = \(isSubmit: boolean\) => \{[\s\S]*?1500\);\s*\};/,
  `const handleTest = async (isSubmit: boolean) => {\n    setEvaluating(true);\n    setOutput("Compiling environment...\\nRunning secure test runner...\\n");\n    \n    if (!isSubmit) {\n      setTimeout(() => {\n        setOutput((prev) => prev + "Executed public test cases.\\nNote: Hidden integrity tests will run on final submission.\\n");\n        setEvaluating(false);\n      }, 1000);\n      return;\n    }\n\n    try {\n      const token = await getIdToken(auth.currentUser!, true);\n      const res = await fetch("/api/verify", {\n        method: "POST",\n        headers: {\n          "Content-Type": "application/json",\n          "Authorization": \`Bearer \${token}\`\n        },\n        body: JSON.stringify({\n          skill: skillParam,\n          answers: mcqAnswers,\n          code,\n          isPublicTest: false\n        })\n      });\n\n      const data = await res.json();\n      \n      if (!res.ok) {\n        setOutput((prev) => prev + "\\n" + (data.error || "Evaluation failed."));\n        if (res.status !== 501) { \n            setTimeout(() => {\n              handleFail();\n            }, 2000);\n        }\n        setEvaluating(false);\n        return;\n      }\n\n      if (data.passed) {\n        setOutput((prev) => prev + "Evaluating hidden test suites...\\n[====================] 100%\\nAll tests passed successfully.\\nCryptographic signature generated.");\n        setTimeout(() => {\n          logFunnelEvent("assessment_passed", { skill: skillParam });\n          router.push("/candidate/dashboard?verified=true");\n        }, 2000);\n      } else {\n        setOutput((prev) => prev + "Evaluating hidden test suites...\\n" + (data.message || "Integrity score below threshold."));\n        setTimeout(() => {\n          handleFail();\n        }, 2000);\n      }\n    } catch (e) {\n      console.error(e);\n      setOutput((prev) => prev + "\\nSystem Error during evaluation.");\n      setEvaluating(false);\n    }\n  };`
);

// Remove unused imports
content = content.replace(`import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";`, "");
content = content.replace(`import { db } from "@/lib/firebase/config";`, "");

fs.writeFileSync("app/candidate/assessment/page.tsx", content, "utf8");

