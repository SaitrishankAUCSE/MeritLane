"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle2, Clock, AlertTriangle, TerminalSquare, FileCode2, ShieldAlert } from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";

const VARIANT_A_INSTRUCTIONS = `Write a Python function named process_transactions(csv_string) that takes a multiline CSV string of financial transactions.

Columns: transaction_id, user_id, amount, status

Requirements:
1. Filter out any transaction where status is not "COMPLETED".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend.`;

const VARIANT_B_INSTRUCTIONS = `Write a Python function named calculate_aov(csv_string) that takes a multiline CSV string of orders.

Columns: order_id, user_id, amount, status

Requirements:
1. Filter out any order where status is not "SUCCESS".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend (acting as AOV since it's total).`;

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
    if (loading || !user) return;

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
      <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100">
        <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#121215] px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-zinc-800 animate-shimmer" style={{ background: '#27272a' }}></div>
            <div className="h-4 w-48 rounded bg-zinc-800 animate-shimmer" style={{ background: '#27272a' }}></div>
          </div>
          <div className="h-6 w-16 rounded-md bg-zinc-800 animate-shimmer" style={{ background: '#27272a' }}></div>
        </header>
        <div className="flex flex-1 overflow-hidden animate-fade-up">
          <div className="w-[35%] border-r border-zinc-800/80 bg-[#121215] flex flex-col">
            <div className="border-b border-zinc-800/80 px-5 py-3.5 bg-foreground/30">
              <div className="h-4 w-40 rounded bg-zinc-800 animate-shimmer" style={{ background: '#27272a' }}></div>
            </div>
            <div className="p-6 space-y-6">
              <div className="h-32 w-full rounded-xl bg-zinc-800 animate-shimmer" style={{ background: '#27272a' }}></div>
              <div className="h-24 w-full rounded-xl bg-zinc-800/50 animate-shimmer" style={{ background: '#27272a' }}></div>
            </div>
          </div>
          <div className="w-[65%] bg-[#18181b] p-6 space-y-4">
             <div className="h-4 w-24 rounded bg-zinc-800 animate-shimmer mb-6" style={{ background: '#27272a' }}></div>
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="h-4 rounded bg-zinc-800 animate-shimmer opacity-50" style={{ width: `${Math.max(20, Math.random() * 80)}%`, background: '#27272a' }}></div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-md rounded-2xl border border-danger/40 bg-surface p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger border border-red-100 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Assessment Unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
          <button 
            onClick={() => router.push("/candidate/dashboard")}
            className="mt-6 w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
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
    <div className="flex h-screen flex-col bg-[#09090b] text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#121215] px-6 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-600 font-bold text-xs text-white shadow-sm">M</div>
          <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase">Meritlane Technical Audit</span>
        </div>
        <div className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold tracking-widest tabular-nums border transition-all ${
          timeLeft < 300 
            ? 'border-red-500/50 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse' 
            : 'border-zinc-800 bg-foreground/60 text-outline'
        }`}>
          <Clock className="h-3.5 w-3.5 opacity-70" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Instructions */}
        <div className="w-[35%] border-r border-zinc-800/80 bg-[#121215] flex flex-col z-10 shadow-lg">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-5 py-3.5 bg-foreground/30">
            <FileCode2 className="h-4 w-4 text-outline" />
            <h2 className="text-xs font-bold text-outline uppercase tracking-wider">Problem Specification</h2>
          </div>
          <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="rounded-xl border border-zinc-800 bg-foreground/40 p-5">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-outline">
                {variant === "A" ? VARIANT_A_INSTRUCTIONS : VARIANT_B_INSTRUCTIONS}
              </pre>
            </div>
            
            <div className="mt-6 rounded-xl border border-amber-900/40 bg-amber-950/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Security &amp; Integrity Notice</h3>
              </div>
              <p className="text-xs leading-relaxed text-amber-200/70">
                You have exactly 1 attempt. Navigating away or refreshing does not pause the server timer. Expiration triggers an automatic score calculation and enforces a 14-day cooldown.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex w-[65%] flex-col bg-[#18181b]">
          {/* Editor Area */}
          <div className="flex-1 overflow-auto relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent font-mono text-[13.5px] leading-relaxed text-zinc-200 outline-none p-6 pb-20 selection:bg-surface-low0/30"
              placeholder="Write your Python implementation here..."
            />
          </div>

          {/* Console Area */}
          <div className="h-[38%] flex flex-col border-t border-zinc-800 bg-[#121215] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-20">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-foreground/40">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-outline" />
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Console &amp; Test Suite</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(false)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 active:scale-95 disabled:opacity-50 transition-all border border-zinc-700 shadow-sm"
                >
                  {evaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Run Tests
                </button>
                <button
                  onClick={() => handleTest(true)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-surface-low0 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submit Assessment
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4.5 bg-[#09090b]">
              <pre className="font-mono text-xs leading-relaxed text-outline whitespace-pre-wrap">
                {output || "System initialized. Click 'Run Tests' to validate your solution against public test cases."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
