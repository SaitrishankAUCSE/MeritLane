import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";

// Variant A: Filter COMPLETED, sum valid amounts
const TEST_WRAPPER_A = `
import base64
import sys
import io

def run_tests():
    # The Next.js API route will replace this placeholder with the candidate's base64 code
    candidate_b64 = "{{CANDIDATE_B64}}"
    candidate_code = base64.b64decode(candidate_b64).decode('utf-8')

    # 1. Redirect stdout to prevent spoofing tokens
    original_stdout = sys.stdout
    candidate_stdout = io.StringIO()
    sys.stdout = candidate_stdout
    
    namespace = {}
    try:
        exec(candidate_code, namespace)
    except Exception as e:
        sys.stdout = original_stdout
        print(f"CRITICAL_RUNTIME_ERROR: Failed to execute code - {str(e)}")
        return
        
    # 2. Restore real stdout for the grading harness
    sys.stdout = original_stdout
    
    if 'process_transactions' not in namespace:
        print("ERROR: Function process_transactions not found")
        return
        
    process_transactions = namespace['process_transactions']
    
    try:
        # Test 1: Basic happy path
        csv1 = "tx1,u1,10.5,COMPLETED\\ntx2,u2,5.0,COMPLETED\\ntx3,u1,4.5,COMPLETED"
        r1 = process_transactions(csv1)
        if r1 == {"u1": 15.0, "u2": 5.0}:
            print("TOKEN_PASS_1")
            
        # Test 2: Mixed statuses
        csv2 = "t1,u1,10,COMPLETED\\nt2,u2,20,FAILED\\nt3,u1,5,PENDING"
        r2 = process_transactions(csv2)
        if r2 == {"u1": 10.0}:
            print("TOKEN_PASS_2")
            
        # Test 3: Empty string
        r3 = process_transactions("")
        if r3 == {}:
            print("TOKEN_PASS_3")
            
        # Test 4: Malformed rows
        csv4 = "t1,u1,10,COMPLETED\\nBADROW\\nt2,u2,5,COMPLETED\\nt3,u1,bad_amount,COMPLETED"
        try:
            r4 = process_transactions(csv4)
            if r4.get("u2") == 5.0 and r4.get("u1", 0) == 0:
                print("TOKEN_PASS_4")
        except:
            # If they didn't catch the float conversion error, they fail this test
            pass
            
        # Test 5: Negative amounts / floats
        csv5 = "t1,u1,-5.5,COMPLETED\\nt2,u1,10.0,COMPLETED"
        r5 = process_transactions(csv5)
        if r5 == {"u1": 4.5}:
            print("TOKEN_PASS_5")
            
    except Exception as e:
        print(f"CRITICAL_RUNTIME_ERROR: {str(e)}")

run_tests()
`;

// Variant B: Filter SUCCESS, calculate average order value
const TEST_WRAPPER_B = `
import base64
import sys
import io

def run_tests():
    candidate_b64 = "{{CANDIDATE_B64}}"
    candidate_code = base64.b64decode(candidate_b64).decode('utf-8')

    original_stdout = sys.stdout
    candidate_stdout = io.StringIO()
    sys.stdout = candidate_stdout
    
    namespace = {}
    try:
        exec(candidate_code, namespace)
    except Exception as e:
        sys.stdout = original_stdout
        print(f"CRITICAL_RUNTIME_ERROR: Failed to execute code - {str(e)}")
        return
        
    sys.stdout = original_stdout
    
    if 'calculate_aov' not in namespace:
        print("ERROR: Function calculate_aov not found")
        return
        
    calculate_aov = namespace['calculate_aov']
    
    try:
        # Test 1: Basic happy path
        csv1 = "o1,u1,10.0,SUCCESS\\no2,u2,20.0,SUCCESS\\no3,u1,30.0,SUCCESS"
        r1 = calculate_aov(csv1)
        if r1 == {"u1": 20.0, "u2": 20.0}:
            print("TOKEN_PASS_1")
            
        # Test 2: Mixed statuses
        csv2 = "o1,u1,10,SUCCESS\\no2,u2,20,REFUNDED\\no3,u1,5,FAILED"
        r2 = calculate_aov(csv2)
        if r2 == {"u1": 10.0}:
            print("TOKEN_PASS_2")
            
        # Test 3: Empty string
        r3 = calculate_aov("")
        if r3 == {}:
            print("TOKEN_PASS_3")
            
        # Test 4: Malformed rows
        csv4 = "o1,u1,10,SUCCESS\\nBADROW\\no2,u2,5,SUCCESS\\no3,u1,bad,SUCCESS"
        try:
            r4 = calculate_aov(csv4)
            if r4.get("u2") == 5.0 and "u1" not in r4:
                print("TOKEN_PASS_4")
        except:
            pass
            
        # Test 5: Multiple users, floating precision
        csv5 = "o1,u1,5.5,SUCCESS\\no2,u1,4.5,SUCCESS"
        r5 = calculate_aov(csv5)
        if r5 == {"u1": 5.0}:
            print("TOKEN_PASS_5")
            
    except Exception as e:
        print(f"CRITICAL_RUNTIME_ERROR: {str(e)}")

run_tests()
`;

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { skill, answers, code, isPublicTest } = body;
    
    if (!skill || !code) {
      return NextResponse.json({ error: "Skill and code are required" }, { status: 400 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const candidateRef = adminDb.collection("candidates").doc(uid);
    const candidateDoc = await candidateRef.get();
    const candidateData = candidateDoc.exists ? candidateDoc.data() : {};
    const userData = userDoc.data() || {};

    // Check if session is active and for the correct skill
    if (!userData.assessmentStartedAt || userData.assessmentSkill !== skill) {
      return NextResponse.json({ error: "Assessment not started or skill mismatch" }, { status: 400 });
    }

    const startedMs = userData.assessmentStartedAt.toMillis();
    const now = Date.now();
    const fortyFiveMinsMs = 45 * 60 * 1000;
    const gracePeriodMs = 2 * 60 * 1000; // 2 min grace

    if (now - startedMs > (fortyFiveMinsMs + gracePeriodMs)) {
      // Time expired
      await userRef.update({
        [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
        assessmentStartedAt: FieldValue.delete(),
        assessmentVariant: FieldValue.delete(),
        assessmentSkill: FieldValue.delete()
      });
      return NextResponse.json({ error: "Assessment time expired" }, { status: 400 });
    }

    // Evaluate MCQs with candidate's randomized question seed
    const candidateSeed = userData.assessmentSeed || uid;
    const content = getAssessmentContent(skill, candidateSeed);
    let mcqScore = 0;
    if (answers && Array.isArray(answers)) {
      answers.forEach((ans: number, idx: number) => {
        if (content.mcqs[idx] && content.mcqs[idx].answerIndex === ans) {
          mcqScore++;
        }
      });
    }

    const normalizedSkill = skill.toLowerCase();
    const isPython = normalizedSkill.includes("python") || normalizedSkill.includes("django");
    if (!isPython) {
      return NextResponse.json({ 
        error: "Controlled Error: Coding evaluation infrastructure for " + skill + " is not currently implemented. We are working on expanding compiler support." 
      }, { status: 501 });
    }

    const variant = userData.assessmentVariant || "A";
    const wrapper = variant === "A" ? TEST_WRAPPER_A : TEST_WRAPPER_B;
    
    // Convert code to base64 to prevent triple-quote injection attacks during python string replacement
    const codeBase64 = Buffer.from(code).toString("base64");
    
    // Inject candidate code securely into the wrapper
    const finalSource = wrapper.replace("{{CANDIDATE_B64}}", codeBase64);

    // Call Godbolt (Compiler Explorer) API for completely free, keyless Python execution
    const response = await fetch("https://godbolt.org/api/compiler/python311/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        source: finalSource,
        options: {
          userArguments: "",
          executeParameters: {
            args: [],
            stdin: ""
          },
          compilerOptions: {
            executorRequest: true
          }
        },
        allowStoreCodeDebug: false
      })
    });

    if (!response.ok) {
      console.error("Godbolt API error", await response.text());
      return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
    }

    const result = await response.json();
    const stdoutArr = result.stdout || [];
    const stderrArr = result.stderr || [];
    
    const stdout = stdoutArr.map((line: any) => line.text).join("\\n");
    const stderr = stderrArr.map((line: any) => line.text).join("\\n");
    const compile_output = result.buildResult?.stderr?.map((line: any) => line.text).join("\\n") || "";

    // Count passing tokens
    let passedTests = 0;
    for (let i = 1; i <= 5; i++) {
      if (stdout.includes(`TOKEN_PASS_${i}`)) {
        passedTests++;
      }
    }

    // If it's just a public test run, don't write to DB
    if (isPublicTest) {
      // Filter stdout to only show public tests (1 and 2) or errors
      const publicOutput = stdout
        .split("\\n")
        .filter((line: string) => !line.startsWith("TOKEN_PASS_") || line.includes("TOKEN_PASS_1") || line.includes("TOKEN_PASS_2"))
        .join("\\n");
        
      return NextResponse.json({
        success: true,
        isPublicTest: true,
        stdout: publicOutput,
        stderr: stderr || compile_output,
        passedTests: passedTests > 2 ? 2 : passedTests // Max 2 for public
      });
    }

    // Final Submission Handling
    const totalQuestions = content.mcqs.length + 5;
    const totalCorrect = mcqScore + passedTests;
    const score = Math.round((totalCorrect / totalQuestions) * 100);

    const passed = score >= 80;

    // Call OpenRouter for AI Code Review
    let aiFeedback = "";
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://meritlane.com",
            "X-Title": "MeritLane"
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              {
                role: "system",
                content: "You are a Senior Software Engineer reviewing a candidate's code submission. Keep your feedback concise (2-3 sentences max). Focus on style, robustness, and efficiency. Do NOT provide a grade or talk about passing/failing. Be constructive."
              },
              {
                role: "user",
                content: `Here is the candidate's Python code:\n\n${code}\n\nExecution stdout:\n${stdout}\nExecution stderr:\n${stderr || compile_output}`
              }
            ]
          })
        });
        
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiFeedback = aiData.choices?.[0]?.message?.content || "";
        } else {
          console.error("OpenRouter API error", await aiResponse.text());
        }
      } catch (err) {
        console.error("Failed to fetch AI feedback", err);
      }
    }

    if (passed) {
      await Promise.all([
        userRef.update({
          assessmentScores: {
            [`${skill}_finalScore`]: score,
            [`${skill}_${variant}`]: passedTests,
            [`${skill}_mcq`]: mcqScore
          },
          assessmentDate: FieldValue.serverTimestamp(),
          // Clear active session
          assessmentStartedAt: FieldValue.delete(),
          assessmentVariant: FieldValue.delete(),
          assessmentSkill: FieldValue.delete()
        }),
        candidateRef.update({
          verificationStatus: "pending",
          [`verifiedSkills.${skill}`]: {
            status: "pending",
            score: score,
            verifiedAt: Date.now(),
            aiFeedback: aiFeedback
          },
          updatedAt: Date.now()
        })
      ]);

      return NextResponse.json({
        passed: true,
        score: score,
        status: "pending",
        skill: skill,
        aiFeedback: aiFeedback
      });
    } else {
      // Failed - Enforce cooldown
      await userRef.update({
        [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
        [`failedAssessmentsFeedback.${skill}`]: aiFeedback,
        // Clear active session
        assessmentStartedAt: FieldValue.delete(),
        assessmentVariant: FieldValue.delete(),
        assessmentSkill: FieldValue.delete()
      });

      const retryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      return NextResponse.json({
        passed: false,
        score: score,
        status: "failed",
        retryAvailableAt: retryDate,
        aiFeedback: aiFeedback
      });
    }

  } catch (error: any) {
    console.error("Error in verify route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
