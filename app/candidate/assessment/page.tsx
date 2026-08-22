"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Play, CheckCircle2, Clock, AlertTriangle, TerminalSquare, FileCode2, ShieldAlert } from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { getAssessmentContent, AssessmentContent } from "@/lib/assessments/content";

function AssessmentContentWrapper() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const skillParam = searchParams.get("skill") || "Software Engineering";
  
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [content, setContent] = useState<AssessmentContent | null>(null);
  
  // Phase tracking: 'intro' -> 'mcq' -> 'coding'
  const [phase, setPhase] = useState<'intro' | 'mcq' | 'coding'>('intro');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqScore, setMcqScore] = useState(0);

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
      
      const loadedContent = getAssessmentContent(skillParam);
      setContent(loadedContent);
      setCode(loadedContent.coding.initialCode);

      // Simple mock cooldown check
      const lastAttemptStr = localStorage.getItem(\meritlane_cooldown_\\);
      if (lastAttemptStr) {
        const lastAttempt = parseInt(lastAttemptStr, 10);
        const daysPassed = (Date.now() - lastAttempt) / (1000 * 60 * 60 * 24);
        if (daysPassed < 14) {
          setErrorMsg("ASSESSMENT NOT PASSED");
          setCooldownDays(14 - Math.floor(daysPassed));
          setInitializing(false);
          return;
        }
      }
      setInitializing(false);
    }
  }, [user, userProfile, loading, router, skillParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && timeLeft > 0 && !errorMsg) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && hasStarted) {
      handleFail();
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, errorMsg]);

  const handleFail = () => {
    if (!user) return;
    localStorage.setItem(\meritlane_cooldown_\\, Date.now().toString());
    setErrorMsg("ASSESSMENT NOT PASSED");
  };

  const handleStart = () => {
    setHasStarted(true);
    setPhase('mcq');
    logFunnelEvent("assessment_started", { skill: skillParam });
  };

  const handleAnswerMcq = (selectedIndex: number) => {
    if (!content) return;
    const currentQ = content.mcqs[mcqIndex];
    if (selectedIndex === currentQ.answerIndex) {
      setMcqScore(s => s + 1);
    }
    
    if (mcqIndex < content.mcqs.length - 1) {
      setMcqIndex(i => i + 1);
    } else {
      // Done with MCQs, move to coding
      setPhase('coding');
    }
  };

  const handleTest = (isSubmit: boolean) => {
    setEvaluating(true);
    setOutput("Compiling environment...\nRunning secure test runner...\n");
    
    setTimeout(() => {
      if (!isSubmit) {
        setOutput((prev) => prev + "Executed 3 public test cases.\nAll standard checks passed.\nNote: Hidden integrity tests will run on final submission.");
        setEvaluating(false);
      } else {
        // Mock fail condition for demo purposes (unless they actually wrote code)
        if (code.length < 50 || code.includes("pass") || code.includes("return new ArrayList")) {
          setOutput((prev) => prev + "Evaluating hidden test suites...\nFAILED: Test Case #4 Null boundary check failed.\nIntegrity score below threshold.");
          setTimeout(() => {
            handleFail();
          }, 2000);
        } else {
          // Success Path!
          setOutput((prev) => prev + "Evaluating hidden test suites...\n[====================] 100%\nAll tests passed successfully.\nCryptographic signature generated.");
          setTimeout(() => {
            logFunnelEvent("assessment_passed", { skill: skillParam });
            router.push("/candidate/dashboard?verified=true");
          }, 2000);
        }
        setEvaluating(false);
      }
    }, 1500);
  };

  if (initializing || loading || !content) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#0b0c0e]"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  if (errorMsg) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans items-center justify-center">
        <div className="max-w-md w-full border border-[#272a2f] bg-[#111316] rounded-md p-8 shadow-2xl">
           <h2 className="text-[18px] font-serif text-[#ffb4ab] mb-2">{errorMsg}</h2>
           <p className="text-[14px] text-[#8e928f] mb-6 font-sans">
             Your submitted solution did not pass the integrity tests. To preserve the rigor of the Meritlane record, you have been placed in a mandatory cooldown.
           </p>
           <div className="border border-[#272a2f] bg-[#0b0c0e] p-5 rounded-md mb-8">
             <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-1">Next Eligible Attempt</div>
             <div className="text-[14px] font-mono text-white">
               {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
             </div>
           </div>
           <button 
             onClick={() => router.push("/candidate/dashboard")}
             className="px-6 py-2 h-10 border border-[#444846] text-[#8e928f] font-sans text-[14px] font-medium rounded-md hover:border-white hover:text-white transition-all w-full"
           >
             Return to workspace
           </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans items-center justify-center">
        <div className="max-w-2xl w-full border border-[#272a2f] bg-[#111316] rounded-md p-10 shadow-2xl">
            <p className="text-[14px] text-[#8e928f] mb-6 font-sans">You are about to begin:</p>
            
            <h2 className="text-[24px] font-serif text-white mb-8 border-b border-[#272a2f] pb-6">
              <span className="font-mono text-[14px] text-[#8e928f] block mb-2">{skillParam.toUpperCase()}</span>
              Technical Assessment
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border border-[#272a2f] bg-[#0b0c0e] p-4 rounded-md">
                <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-1">Time Limit</div>
                <div className="text-[14px] font-mono text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#8e928f]" /> 45 Minutes
                </div>
              </div>
              <div className="border border-[#272a2f] bg-[#0b0c0e] p-4 rounded-md">
                <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-1">Format</div>
                <div className="text-[14px] font-mono text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#8e928f]" /> MCQs & Coding
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleStart}
                className="px-6 py-2 h-10 border border-white bg-white text-black font-sans text-[14px] font-medium rounded-md hover:bg-black hover:text-white transition-all"
              >
                Start assessment
              </button>
              <button 
                onClick={() => router.push("/candidate/dashboard")}
                className="px-6 py-2 h-10 border border-[#444846] text-[#8e928f] font-sans text-[14px] font-medium rounded-md hover:border-white hover:text-white transition-all"
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
    return \\:\\\;
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0c0e] overflow-hidden border-l border-[#272a2f]">
      <header className="flex items-center justify-between border-b border-[#272a2f] px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-4 truncate mr-4">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8e928f] shrink-0">Meritlane</span>
          <span className="hidden sm:inline text-[#444846] shrink-0">/</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-white truncate">{skillParam} Evaluation</span>
        </div>
        <div className={\ont-mono text-[14px] font-bold tracking-wider \\}>
          {formatTime(timeLeft)}
        </div>
      </header>

      {phase === 'mcq' && (
        <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
          <div className="w-full max-w-2xl mt-10">
            <div className="text-[12px] font-mono text-[#8e928f] mb-4">MULTIPLE CHOICE ({mcqIndex + 1} OF {content.mcqs.length})</div>
            <h3 className="text-[20px] font-serif text-white mb-8">{content.mcqs[mcqIndex].question}</h3>
            
            <div className="space-y-3">
              {content.mcqs[mcqIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerMcq(idx)}
                  className="w-full text-left p-4 border border-[#272a2f] bg-[#111316] rounded-md hover:border-white hover:bg-[#1a1c20] transition-colors text-[14px] font-sans text-[#e3e2e5]"
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
          <div className="w-full lg:w-[40%] lg:max-w-[600px] border-b lg:border-b-0 lg:border-r border-[#272a2f] bg-[#111316] flex flex-col z-10 h-[40vh] lg:h-auto shrink-0">
            <div className="p-6 border-b border-[#272a2f]">
              <h2 className="font-sans text-[14px] font-medium text-[#8e928f]">{content.coding.title}</h2>
            </div>
            <div className="flex-1 overflow-auto p-6 scrollbar-hide">
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-[1.8] text-[#c4c7c5]">
                {content.coding.instructions}
              </pre>
              
              <div className="mt-12 border-l border-[#444846] pl-6 py-2">
                <h3 className="font-sans text-[14px] font-medium text-[#a8a2ff] mb-3">Security &amp; Integrity Notice</h3>
                <p className="font-sans text-[13px] leading-relaxed text-[#8e928f]">
                  You have exactly 1 attempt. Navigating away or refreshing does not pause the server timer. Expiration triggers an automatic score calculation and enforces a 14-day cooldown.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-[#0b0c0e]">
            <div className="flex-1 overflow-hidden relative border-b border-[#272a2f]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-full w-full resize-none bg-transparent font-mono text-[14px] leading-[1.6] text-[#e3e2e5] outline-none p-6 pb-20 selection:bg-white selection:text-black"
                placeholder="Write your implementation here..."
              />
            </div>

            <div className="h-[35%] min-h-[250px] flex flex-col bg-[#111316] z-20">
              <div className="flex items-center justify-between border-b border-[#272a2f] px-6 py-4">
                <span className="font-sans text-[14px] font-medium text-[#8e928f]">Console &amp; Test Suite</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleTest(false)}
                    disabled={evaluating || timeLeft <= 0}
                    className="font-sans text-[14px] font-medium border border-[#444846] px-5 py-2 text-[#8e928f] hover:text-white hover:border-white disabled:opacity-50 rounded-md transition-all"
                  >
                    {evaluating ? "Evaluating..." : "Run tests"}
                  </button>
                  <button
                    onClick={() => handleTest(true)}
                    disabled={evaluating || timeLeft <= 0}
                    className="font-sans text-[14px] font-medium border border-white bg-white text-black px-5 py-2 hover:bg-black hover:text-white disabled:opacity-50 rounded-md transition-all"
                  >
                    Submit assessment
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <pre className="font-mono text-[13px] leading-[1.6] text-[#8e928f] whitespace-pre-wrap">
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
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#0b0c0e]"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>}>
      <AssessmentContentWrapper />
    </Suspense>
  );
}
