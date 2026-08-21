"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle2, Clock, AlertTriangle, TerminalSquare, FileCode2, ShieldAlert } from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";

const getInstructions = (variant: "A" | "B", domain: string) => {
  if (variant === "A") {
    return `As a candidate claiming expertise in ${domain.toUpperCase()}, your task is to solve the following data integrity problem.

Write a Python function named process_transactions(csv_string) that takes a multiline CSV string of financial transactions.

Columns: transaction_id, user_id, amount, status

Requirements:
1. Filter out any transaction where status is not "COMPLETED".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend.`;
  } else {
    return `As a candidate claiming expertise in ${domain.toUpperCase()}, your task is to solve the following metrics problem.

Write a Python function named calculate_aov(csv_string) that takes a multiline CSV string of orders.

Columns: order_id, user_id, amount, status

Requirements:
1. Filter out any order where status is not "SUCCESS".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend.`;
  }
};

export default function AssessmentPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [domain, setDomain] = useState<string>("Software Engineering");
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [code, setCode] = useState("def process_transactions(csv_string):\n    pass\n");
  
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (loading || !user) return;

    setInitializing(true);
    
    if (userProfile?.verificationStatus === "verified") {
      setErrorMsg("ALREADY VERIFIED");
      setInitializing(false);
      return;
    } else if (userProfile?.verificationStatus === "failed") {
      setErrorMsg("ASSESSMENT NOT PASSED");
      setInitializing(false);
      return;
    }

    const startSession = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/start-assessment", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });

        const data = await res.json();

        if (res.status === 400 && data.error === "Already verified") {
          setErrorMsg("ALREADY VERIFIED");
          setInitializing(false);
          return;
        }

        if (res.status === 403 && data.cooldownDays) {
          setCooldownDays(data.cooldownDays);
          setErrorMsg("ASSESSMENT NOT PASSED");
          setInitializing(false);
          return;
        }

        if (!res.ok) {
          setErrorMsg(data.error || "Failed to start assessment");
          setInitializing(false);
          return;
        }

        const startedAt = data.startedAt;
        const v = data.variant || "A";
        const d = data.domain || "Software Engineering";
        setVariant(v);
        setDomain(d);
        logFunnelEvent("assessment_started", { variant: v });
        if (v === "B") {
          setCode("def calculate_aov(csv_string):\n    pass\n");
        }

        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = (45 * 60) - elapsed;
        
        if (remaining <= 0) {
          setErrorMsg("Assessment time expired.");
        } else {
          setTimeLeft(remaining);
        }
        
        setInitializing(false);

      } catch (e: any) {
        setErrorMsg("Network error connecting to verification server.");
        setInitializing(false);
      }
    };

    startSession();
  }, [user, loading, userProfile]);

  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, errorMsg]);

  const handleTest = async (isSubmit: boolean) => {
    if (!user) return;
    setEvaluating(true);
    setOutput("Running tests on secure grading server...");

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ code, isPublicTest: !isSubmit })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setOutput(`Error: ${data.error}`);
        setEvaluating(false);
        return;
      }

      if (!isSubmit) {
        logFunnelEvent("assessment_public_test_run", { variant });
        let msg = `Public Tests Passed: ${data.passedTests} / 2\n\n`;
        if (data.stdout) msg += `--- STDOUT ---\n${data.stdout}\n`;
        if (data.stderr) msg += `--- STDERR ---\n${data.stderr}\n`;
        setOutput(msg);
      } else {
        if (data.passed) {
          logFunnelEvent("assessment_submitted_pass", { score: data.score, variant });
          setHasStarted(false);
          setErrorMsg("VERIFICATION COMPLETE");
        } else {
          logFunnelEvent("assessment_submitted_fail", { score: data.score || 0, variant });
          setHasStarted(false);
          setErrorMsg("ASSESSMENT NOT PASSED");
        }
      }
    } catch (e) {
      setOutput("Network error connecting to verification server.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || initializing) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0b0c0e]">
        <div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!hasStarted || errorMsg) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0b0c0e] p-6 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-2xl border border-[#272a2f] bg-[#111316] rounded-none overflow-hidden shadow-2xl">
          
          <div className="border-b border-[#272a2f] px-8 py-6 flex items-center justify-between">
            <h1 className="font-serif text-[20px] text-white tracking-tight">Technical Verification</h1>
            {errorMsg === "ALREADY VERIFIED" || errorMsg === "VERIFICATION COMPLETE" ? (
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 bg-[#a8a2ff]/10 text-[#a8a2ff] border border-[#a8a2ff]/20 rounded-none">Verified</span>
            ) : errorMsg === "ASSESSMENT NOT PASSED" ? (
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-none">Failed</span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 bg-[#272a2f] text-white rounded-none">Not Started</span>
            )}
          </div>

          <div className="p-8 space-y-8">
            {errorMsg === "ALREADY VERIFIED" || errorMsg === "VERIFICATION COMPLETE" ? (
              <div>
                <h2 className="text-[18px] font-serif text-white mb-2">{errorMsg}</h2>
                <p className="text-[14px] text-[#8e928f] mb-8 font-sans">
                  You already have a verified result for this assessment. Your technical claim is backed by rigorous mathematical verification.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => router.push("/candidate/provenance")}
                    className="px-6 py-3 border border-white bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-black hover:text-white transition-all"
                  >
                    View Provenance
                  </button>
                  <button 
                    onClick={() => router.push("/candidate/dashboard")}
                    className="px-6 py-3 border border-[#444846] text-[#8e928f] font-mono text-[10px] uppercase tracking-[0.2em] rounded-none hover:border-white hover:text-white transition-all"
                  >
                    Return to Workspace
                  </button>
                </div>
              </div>
            ) : errorMsg === "ASSESSMENT NOT PASSED" ? (
              <div>
                <h2 className="text-[18px] font-serif text-[#ffb4ab] mb-2">{errorMsg}</h2>
                <p className="text-[14px] text-[#8e928f] mb-6 font-sans">
                  Your submitted solution did not pass the integrity tests. To preserve the rigor of the Meritlane record, you have been placed in a mandatory cooldown.
                </p>
                <div className="border border-[#272a2f] bg-[#0b0c0e] p-5 rounded-none mb-8">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8e928f] mb-1">Next Eligible Attempt</div>
                  <div className="text-[14px] font-mono text-white">
                    {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => router.push("/candidate/dashboard")}
                  className="px-6 py-3 border border-[#444846] text-[#8e928f] font-mono text-[10px] uppercase tracking-[0.2em] rounded-none hover:border-white hover:text-white transition-all"
                >
                  Return to Workspace
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[14px] text-[#8e928f] mb-6 font-sans">You are about to begin:</p>
                
                <h2 className="text-[24px] font-serif text-white mb-8 border-b border-[#272a2f] pb-6">
                  <span className="font-mono text-[14px] text-[#8e928f] block mb-2">{domain}</span>
                  Technical Assessment
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="border border-[#272a2f] bg-[#0b0c0e] p-4 rounded-none">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8e928f] mb-1">Time Limit</div>
                    <div className="text-[14px] font-mono text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#8e928f]" /> 45 Minutes
                    </div>
                  </div>
                  <div className="border border-[#272a2f] bg-[#0b0c0e] p-4 rounded-none">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8e928f] mb-1">Allowance</div>
                    <div className="text-[14px] font-mono text-white flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-[#8e928f]" /> 1 Attempt
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setHasStarted(true)}
                    className="px-6 py-3 border border-white bg-white text-black font-mono text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-black hover:text-white transition-all"
                  >
                    Start Assessment
                  </button>
                  <button 
                    onClick={() => router.push("/candidate/dashboard")}
                    className="px-6 py-3 border border-[#444846] text-[#8e928f] font-mono text-[10px] uppercase tracking-[0.2em] rounded-none hover:border-white hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
    <div className="flex h-full w-full flex-col bg-[#0b0c0e] overflow-hidden border-l border-[#272a2f]">
      <header className="flex items-center justify-between border-b border-[#272a2f] px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8e928f]">Meritlane</span>
          <span className="text-[#444846]">/</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-white">Technical Evaluation Workspace</span>
        </div>
        <div className={`font-mono text-[14px] font-bold tracking-wider ${
          timeLeft < 300 ? 'text-[#ffb4ab]' : 'text-white'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[40%] max-w-[600px] border-r border-[#272a2f] bg-[#111316] flex flex-col z-10">
          <div className="p-6 border-b border-[#272a2f]">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8e928f]">Problem Specification</h2>
          </div>
          <div className="flex-1 overflow-auto p-6 scrollbar-hide">
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-[1.8] text-[#c4c7c5]">
              {getInstructions(variant, domain)}
            </pre>
            
            <div className="mt-12 border-l border-[#444846] pl-6 py-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a2ff] mb-3">Security &amp; Integrity Notice</h3>
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
              placeholder="Write your Python implementation here..."
            />
          </div>

          <div className="h-[35%] min-h-[250px] flex flex-col bg-[#111316] z-20">
            <div className="flex items-center justify-between border-b border-[#272a2f] px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8e928f]">Console &amp; Test Suite</span>
              <div className="flex gap-4">
                <button
                  onClick={() => handleTest(false)}
                  disabled={evaluating || timeLeft <= 0}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] border border-[#444846] px-5 py-2 text-[#8e928f] hover:text-white hover:border-white disabled:opacity-50 rounded-none transition-all"
                >
                  {evaluating ? "Evaluating..." : "Run Tests"}
                </button>
                <button
                  onClick={() => handleTest(true)}
                  disabled={evaluating || timeLeft <= 0}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] border border-white bg-white text-black px-5 py-2 hover:bg-black hover:text-white disabled:opacity-50 rounded-none transition-all"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 scrollbar-hide">
              <pre className="font-mono text-[13px] leading-[1.6] text-[#8e928f] whitespace-pre-wrap">
                {output || "System initialized. Click 'Run Tests' to validate your solution against public test cases."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
