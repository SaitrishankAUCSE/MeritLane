"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle2, Clock, AlertTriangle, TerminalSquare, FileCode2 } from "lucide-react";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { logFunnelEvent } from "@/lib/analytics/logEvent";

const VARIANT_A_INSTRUCTIONS = `
Write a Python function named process_transactions(csv_string) that takes a multiline CSV string of financial transactions.

Columns: transaction_id, user_id, amount, status

Requirements:
1. Filter out any transaction where status is not "COMPLETED".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend.
`;

const VARIANT_B_INSTRUCTIONS = `
Write a Python function named calculate_aov(csv_string) that takes a multiline CSV string of orders.

Columns: order_id, user_id, amount, status

Requirements:
1. Filter out any order where status is not "SUCCESS".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend (acting as AOV since it's total).
`;

export default function AssessmentPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [code, setCode] = useState("def process_transactions(csv_string):\n    pass\n");
  
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || role !== "candidate") {
      router.push("/login");
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
          router.push("/candidate/dashboard");
          return;
        }

        if (res.status === 403 && data.cooldownDays) {
          setCooldownDays(data.cooldownDays);
          setErrorMsg(data.error);
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
        setVariant(v);
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
  }, [user, role, loading, router]);

  useEffect(() => {
    if (initializing || timeLeft <= 0 || errorMsg) return;
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
  }, [initializing, timeLeft, errorMsg]);

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
          setOutput(`✅ SUCCESS: ${data.message} (Score: ${data.score}/5)\nRedirecting to dashboard...`);
          setTimeout(() => router.push("/candidate/dashboard"), 3000);
        } else {
          logFunnelEvent("assessment_submitted_fail", { score: data.score || 0, variant });
          setOutput(`❌ FAILED: ${data.message}\nYou are now in a 14-day cooldown.`);
          setErrorMsg(`Assessment Failed. You can retry in 14 days.`);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-red-900">Assessment Unavailable</h2>
          <p className="mt-2 text-sm text-red-800 leading-relaxed">{errorMsg}</p>
          <button 
            onClick={() => router.push("/candidate/dashboard")}
            className="mt-6 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Return to Dashboard
          </button>
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
    <div className="flex h-screen flex-col bg-[#0d0d0d] text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800/50 bg-[#111] px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 font-bold text-xs text-white shadow-sm">M</div>
          <span className="text-sm font-semibold tracking-wide text-zinc-100 uppercase tracking-wider">Meritlane Technical Audit</span>
        </div>
        <div className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-bold tracking-widest tabular-nums border ${timeLeft < 300 ? 'border-red-900/50 bg-red-950/30 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.1)]' : 'border-zinc-800 bg-zinc-900/50 text-zinc-300'}`}>
          <Clock className="h-4 w-4 opacity-70" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Instructions */}
        <div className="w-[35%] border-r border-zinc-800/50 bg-[#111] flex flex-col z-10 shadow-lg">
          <div className="flex items-center gap-2 border-b border-zinc-800/50 px-5 py-3.5 bg-zinc-900/20">
            <FileCode2 className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Task Overview</h2>
          </div>
          <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-300 bg-zinc-900/30 p-5 rounded-lg border border-zinc-800">
              {variant === "A" ? VARIANT_A_INSTRUCTIONS : VARIANT_B_INSTRUCTIONS}
            </pre>
            
            <div className="mt-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">Security Warning</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-200/70">
                You have exactly 1 attempt. If you navigate away or refresh this page, the timer continues running server-side. Expiration is recorded as a failure and enforces a strict 14-day cooldown period.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex w-[65%] flex-col bg-[#161616]">
          {/* Editor Area */}
          <div className="flex-1 overflow-auto relative">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent font-mono text-[14px] leading-loose text-zinc-300 outline-none p-6 pb-20 selection:bg-indigo-500/30"
              placeholder="Write your Python code here..."
            />
          </div>

          {/* Console Area */}
          <div className="h-[35%] flex flex-col border-t border-zinc-800/80 bg-[#111] shadow-[0_-4px_15px_rgba(0,0,0,0.2)] z-20">
            <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2.5 bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Execution Output</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(false)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors border border-zinc-700 shadow-sm"
                >
                  {evaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Run Tests
                </button>
                <button
                  onClick={() => handleTest(true)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submit Solution
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 bg-[#0a0a0a]">
              <pre className="font-mono text-[13px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
                {output || "System ready. Awaiting execution..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
