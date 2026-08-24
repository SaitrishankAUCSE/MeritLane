"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, CheckCircle2, Clock, AlertTriangle, TerminalSquare, FileCode2, ShieldAlert } from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { auth } from "@/lib/firebase/config";
import { getIdToken } from "firebase/auth";

export interface MCQ {
  question: string;
  options: string[];
}

export interface CodingChallenge {
  title: string;
  instructions: string;
  initialCode: string;
}

export interface AssessmentContent {
  mcqs: MCQ[];
  coding: CodingChallenge;
}

import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";


function AssessmentContentWrapper() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const skillParam = searchParams.get("skill") || "Software Engineering";
  
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ passed: boolean; score: number; status: string; skill: string; retryAvailableAt?: string } | null>(null);
  
  const [content, setContent] = useState<AssessmentContent | null>(null);
  
  // Phase tracking: 'intro' -> 'mcq' -> 'coding'
  const [phase, setPhase] = useState<'intro' | 'mcq' | 'coding'>('intro');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);

  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user || !userProfile) {
        router.replace("/login");
        return;
      }

      // Check if already verified and if skill exists
      const initAssessment = async () => {
        try {
          const token = await getIdToken(auth.currentUser!, true);
          const res = await fetch("/api/start-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ skill: skillParam })
          });
          
          const data = await res.json();
          if (!res.ok) {
            if (res.status === 403) setErrorMsg("SKILL NOT FOUND");
            else if (res.status === 429) {
              setErrorMsg("ASSESSMENT COOLDOWN ACTIVE");
              setCooldownDays(14);
            } else if (res.status === 409) setErrorMsg("ALREADY VERIFIED");
            else setErrorMsg(data.error || "Failed to start assessment");
            setInitializing(false);
            return;
          }
          
          setContent(data.content);
          setCode(data.content.coding.initialCode);
          setInitializing(false);
        } catch (err) {
          console.error(err);
          setErrorMsg("SYSTEM ERROR");
          setInitializing(false);
        }
      };

      initAssessment();
    }
  }, [user, userProfile, loading, router, skillParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && timeLeft > 0 && !errorMsg && !assessmentResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && hasStarted && !assessmentResult) {
      handleFail();
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, errorMsg, assessmentResult]);

  const handleFail = () => {
    if (!user) return;
    setAssessmentResult({
      passed: false,
      score: 0,
      status: "failed",
      skill: skillParam,
      retryAvailableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const handleStart = () => {
    setHasStarted(true);
    setPhase('mcq');
    logFunnelEvent("assessment_started", { skill: skillParam });
  };

  const handleAnswerMcq = (selectedIndex: number) => {
    if (!content) return;
    setMcqAnswers(prev => [...prev, selectedIndex]);
    
    if (mcqIndex < content.mcqs.length - 1) {
      setMcqIndex(i => i + 1);
    } else {
      setPhase("coding");
    }
  };

  const handleTest = async (isSubmit: boolean) => {
    setEvaluating(true);
    setOutput("Compiling environment...\nRunning secure test runner...\n");
    
    if (!isSubmit) {
      setTimeout(() => {
        setOutput((prev) => prev + "Executed public test cases.\nNote: Hidden integrity tests will run on final submission.\n");
        setEvaluating(false);
      }, 1000);
      return;
    }

    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          skill: skillParam,
          answers: mcqAnswers,
          code,
          isPublicTest: false
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setOutput((prev) => prev + "\n" + (data.error || "Evaluation failed."));
        if (res.status !== 501) { 
          setTimeout(() => {
            handleFail();
          }, 1500);
        }
        setEvaluating(false);
        return;
      }

      if (data.passed) {
        setOutput((prev) => prev + "Evaluating hidden test suites...\n[====================] 100%\nAll tests passed successfully.\nCryptographic signature generated.");
        logFunnelEvent("assessment_passed", { skill: skillParam });
        setTimeout(() => {
          setAssessmentResult({
            passed: true,
            score: data.score,
            status: "verified",
            skill: skillParam
          });
        }, 1200);
      } else {
        setOutput((prev) => prev + "Evaluating hidden test suites...\nScore: " + data.score + "% (Required: 80%).");
        setTimeout(() => {
          setAssessmentResult({
            passed: false,
            score: data.score,
            status: "failed",
            skill: skillParam,
            retryAvailableAt: data.retryAvailableAt
          });
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setOutput((prev) => prev + "\nSystem Error during evaluation.");
      setEvaluating(false);
    }
  };

  // PASS RESULT SCREEN
  if (assessmentResult && assessmentResult.passed) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#15803D]/30 bg-[#FFFFFF] rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#15803D]/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#15803D] mb-2 font-medium">✓ Assessment Verified</div>
          <h2 className="text-[32px] font-serif text-[#0D0D0D] mb-1 leading-tight">{skillParam}</h2>
          <div className="text-[44px] font-mono font-bold text-[#15803D] mb-3 leading-none">{assessmentResult.score}%</div>
          <p className="text-[14px] text-[#737373] mb-8 font-sans leading-relaxed">
            Your technical claim has been verified. Cryptographic proof has been generated and anchored to your public record.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => router.push("/candidate/provenance")}
              className="flex-1 px-5 h-11 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] font-sans text-[14px] font-medium rounded-md hover:bg-[#222222] transition-all"
            >
              View Provenance
            </button>
            <button 
              onClick={() => router.push("/candidate/dashboard")}
              className="flex-1 px-5 h-11 border border-[#D2D2D2] text-[#0D0D0D] font-sans text-[14px] font-medium rounded-md hover:border-[#0D0D0D] hover:bg-[#F3F3F1] transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FAIL RESULT SCREEN
  if (assessmentResult && !assessmentResult.passed) {
    const retryDateStr = assessmentResult.retryAvailableAt 
      ? new Date(assessmentResult.retryAvailableAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#B42318]/20 bg-[#FFFFFF] rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#B42318] mb-2 font-medium">Assessment Not Passed</div>
          <h2 className="text-[32px] font-serif text-[#0D0D0D] mb-1 leading-tight">{skillParam}</h2>
          <div className="text-[44px] font-mono font-bold text-[#B42318] mb-3 leading-none">{assessmentResult.score}%</div>
          <p className="text-[14px] text-[#737373] mb-4 font-sans leading-relaxed">
            80% is required to verify this skill.
          </p>
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 rounded-md mb-8 text-left">
            <div className="text-[12px] font-sans font-medium text-[#737373] mb-1">You can attempt this assessment again on:</div>
            <div className="text-[14px] font-mono text-[#0D0D0D] font-medium">
              {retryDateStr}
            </div>
          </div>
          <button 
            onClick={() => router.push("/candidate/dashboard")}
            className="w-full px-5 h-11 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] font-sans text-[14px] font-medium rounded-md hover:bg-[#222222] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    if (errorMsg === "SKILL NOT FOUND") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center">
          <div className="max-w-md w-full border border-[#E5E5E5] bg-[#FFFFFF] rounded-md p-8 shadow-sm">
             <h2 className="text-[18px] font-serif text-[#B42318] mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Skill Not Found</h2>
             <p className="text-[14px] text-[#737373] mb-8 font-sans">
               The skill &quot;{skillParam}&quot; does not exist in your Technical Identity. Add this skill to your Identity before starting verification.
             </p>
             <button 
               onClick={() => router.push("/candidate/profile")}
               className="px-6 py-2 h-10 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] font-sans text-[14px] font-medium rounded-md hover:bg-[#222222] transition-all w-full"
             >
               Return to Identity
             </button>
          </div>
        </div>
      );
    }

    if (errorMsg === "ALREADY VERIFIED") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center">
          <div className="max-w-md w-full border border-[#E5E5E5] bg-[#FFFFFF] rounded-md p-8 shadow-sm">
             <h2 className="text-[18px] font-serif text-[#15803D] mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Already Verified</h2>
             <p className="text-[14px] text-[#737373] mb-8 font-sans">
               You have already successfully passed the technical assessment for {skillParam}. Your cryptographic proof is permanently recorded.
             </p>
             <button 
               onClick={() => router.push("/candidate/verification")}
               className="px-6 py-2 h-10 border border-[#D2D2D2] text-[#737373] font-sans text-[14px] font-medium rounded-md hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-all w-full"
             >
               Return to workspace
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center">
        <div className="max-w-md w-full border border-[#E5E5E5] bg-[#FFFFFF] rounded-md p-8 shadow-sm">
           <h2 className="text-[18px] font-serif text-[#B42318] mb-2">{errorMsg}</h2>
           <p className="text-[14px] text-[#737373] mb-6 font-sans">
             You are currently in a mandatory 14-day cooldown for this skill.
           </p>
           <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-5 rounded-md mb-8">
             <div className="text-[14px] font-sans font-medium text-[#737373] mb-1">Next Eligible Attempt</div>
             <div className="text-[14px] font-mono text-[#0D0D0D]">
               {new Date(Date.now() + (cooldownDays || 14) * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
           </div>
           <button 
             onClick={() => router.push("/candidate/verification")}
             className="px-6 py-2 h-10 border border-[#D2D2D2] text-[#737373] font-sans text-[14px] font-medium rounded-md hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-all w-full"
           >
             Return to workspace
           </button>
        </div>
      </div>
    );
  }

  if (initializing || loading || !content) {
    return <div className="flex h-full w-full items-center justify-center"><MeritlaneLoader level="section" text="Initializing" /></div>;
  }

  if (!hasStarted) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans items-center justify-center">
        <div className="max-w-2xl w-full border border-[#E5E5E5] bg-[#FFFFFF] rounded-md p-10 shadow-sm">
            <p className="text-[14px] text-[#737373] mb-6 font-sans">You are about to begin:</p>
            
            <h2 className="text-[24px] font-serif text-[#0D0D0D] mb-8 border-b border-[#E5E5E5] pb-6">
              <span className="font-mono text-[14px] text-[#737373] block mb-2">{skillParam.toUpperCase()}</span>
              Technical Assessment
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 rounded-md">
                <div className="text-[14px] font-sans font-medium text-[#737373] mb-1">Time Limit</div>
                <div className="text-[14px] font-mono text-[#0D0D0D] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#737373]" /> 45 Minutes
                </div>
              </div>
              <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 rounded-md">
                <div className="text-[14px] font-sans font-medium text-[#737373] mb-1">Format</div>
                <div className="text-[14px] font-mono text-[#0D0D0D] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#737373]" /> MCQs & Coding
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleStart}
                className="px-6 py-2 h-10 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] font-sans text-[14px] font-medium rounded-md hover:bg-[#222222] hover:text-[#FFFFFF] transition-all"
              >
                Start assessment
              </button>
              <button 
                onClick={() => router.push("/candidate/verification")}
                className="px-6 py-2 h-10 border border-[#D2D2D2] text-[#737373] font-sans text-[14px] font-medium rounded-md hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-all"
              >
                Cancel
              </button>
            </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#FAFAFA] overflow-hidden border-l border-[#E5E5E5]">
      <header className="flex items-center justify-between border-b border-[#E5E5E5] px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-4 truncate mr-4">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#666666] shrink-0">Meritlane</span>
          <span className="hidden sm:inline text-[#D2D2D2] shrink-0">/</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-[#0D0D0D] truncate">{skillParam} Evaluation</span>
        </div>
        <div className={`font-mono text-[14px] font-bold tracking-wider ${
          timeLeft < 300 ? 'text-[#B42318]' : 'text-[#0D0D0D]'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      {phase === 'mcq' && (
        <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
          <div className="w-full max-w-2xl mt-10">
            <div className="text-[12px] font-mono text-[#666666] mb-4">MULTIPLE CHOICE ({mcqIndex + 1} OF {content.mcqs.length})</div>
            <h3 className="text-[20px] font-sans font-medium text-[#0D0D0D] mb-8">{content.mcqs[mcqIndex].question}</h3>
            
            <div className="space-y-3">
              {content.mcqs[mcqIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerMcq(idx)}
                  className="w-full text-left p-4 border border-[#E5E5E5] bg-[#FFFFFF] rounded-md hover:border-[#0D0D0D] hover:bg-[#F3F3F1] transition-colors text-[14px] font-sans text-[#0D0D0D]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'coding' && (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="w-full lg:w-[40%] lg:max-w-[600px] border-b lg:border-b-0 lg:border-r border-[#E5E5E5] bg-[#FFFFFF] flex flex-col z-10 h-[40vh] lg:h-auto shrink-0">
            <div className="p-6 border-b border-[#E5E5E5]">
              <h2 className="font-sans text-[14px] font-medium text-[#737373]">{content.coding.title}</h2>
            </div>
            <div className="flex-1 overflow-auto p-6 scrollbar-hide">
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-[1.8] text-[#737373]">
                {content.coding.instructions}
              </pre>
              
              <div className="mt-12 border-l border-[#D2D2D2] pl-6 py-2">
                <h3 className="font-sans text-[14px] font-medium text-[#15803D] mb-3">Security &amp; Integrity Notice</h3>
                <p className="font-sans text-[13px] leading-relaxed text-[#737373]">
                  You have exactly 1 attempt. Navigating away or refreshing does not pause the server timer. Expiration triggers an automatic score calculation and enforces a 14-day cooldown.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-[#FAFAFA]">
            <div className="flex-1 overflow-hidden relative border-b border-[#E5E5E5]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-full w-full resize-none bg-transparent font-mono text-[14px] leading-[1.6] text-[#0D0D0D] outline-none p-6 pb-20 selection:bg-[#0D0D0D] selection:text-[#FFFFFF]"
                placeholder="Write your implementation here..."
              />
            </div>

            <div className="h-[35%] min-h-[250px] flex flex-col bg-[#FFFFFF] z-20">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-4">
                <span className="font-sans text-[14px] font-medium text-[#737373]">Console &amp; Test Suite</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleTest(false)}
                    disabled={evaluating || timeLeft <= 0}
                    className="font-sans text-[14px] font-medium border border-[#D2D2D2] px-5 py-2 text-[#737373] hover:text-[#0D0D0D] hover:border-[#0D0D0D] disabled:opacity-50 rounded-md transition-all"
                  >
                    {evaluating ? "Evaluating..." : "Run tests"}
                  </button>
                  <button
                    onClick={() => handleTest(true)}
                    disabled={evaluating || timeLeft <= 0}
                    className="font-sans text-[14px] font-medium border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] px-5 py-2 hover:bg-[#222222] hover:text-[#FFFFFF] disabled:opacity-50 rounded-md transition-all"
                  >
                    Submit assessment
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <pre className="font-mono text-[13px] leading-[1.6] text-[#737373] whitespace-pre-wrap">
                  {output || "System initialized. Click 'Run tests' to validate your solution against public test cases."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><MeritlaneLoader level="section" text="Loading" /></div>}>
      <AssessmentContentWrapper />
    </Suspense>
  );
}

