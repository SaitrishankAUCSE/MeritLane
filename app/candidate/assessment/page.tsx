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
      <div className="flex min-h-screen flex-col bg-surface text-foreground font-sans">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <div className="font-label text-outline uppercase tracking-widest text-xs">Meritlane Technical Evaluation</div>
        </header>
        <div className="flex flex-1 p-6 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground font-data text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing workspace...
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-lg border border-border bg-surface-low p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-serif text-2xl font-medium text-foreground">Assessment Unavailable</h2>
          </div>
          <p className="text-sm text-muted-foreground font-data leading-relaxed mb-8">{errorMsg}</p>
          <button 
            onClick={() => router.push("/candidate/dashboard")}
            className="font-label text-xs uppercase tracking-widest border border-border px-4 py-2 text-foreground hover:bg-surface transition-colors"
          >
            Return to Workspace
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
    <div className="flex h-screen flex-col bg-surface text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-2.5">
        <div className="flex items-center gap-4">
          <span className="font-label text-xs tracking-[0.2em] uppercase text-outline">Meritlane</span>
          <span className="text-border">/</span>
          <span className="font-label text-xs tracking-widest uppercase text-foreground">Technical Evaluation Workspace</span>
        </div>
        <div className={`font-data text-sm font-bold tracking-wider ${
          timeLeft < 300 ? 'text-danger' : 'text-foreground'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Instructions */}
        <div className="w-[40%] max-w-[600px] border-r border-border bg-surface-low flex flex-col z-10">
          <div className="p-6 border-b border-border">
            <h2 className="font-label text-outline uppercase tracking-widest text-xs">Problem Specification</h2>
          </div>
          <div className="flex-1 overflow-auto p-6 scrollbar-none">
            <pre className="whitespace-pre-wrap font-data text-[13px] leading-relaxed text-foreground">
              {variant === "A" ? VARIANT_A_INSTRUCTIONS : VARIANT_B_INSTRUCTIONS}
            </pre>
            
            <div className="mt-12 border-l-2 border-warning pl-4">
              <h3 className="font-label text-[10px] uppercase tracking-widest text-warning mb-2">Security &amp; Integrity Notice</h3>
              <p className="font-data text-xs leading-relaxed text-muted-foreground">
                You have exactly 1 attempt. Navigating away or refreshing does not pause the server timer. Expiration triggers an automatic score calculation and enforces a 14-day cooldown.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex flex-1 flex-col bg-surface">
          {/* Editor Area */}
          <div className="flex-1 overflow-hidden relative border-b border-border">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent font-data text-[14px] leading-relaxed text-foreground outline-none p-6 pb-20 selection:bg-foreground selection:text-surface"
              placeholder="Write your Python implementation here..."
            />
          </div>

          {/* Console Area */}
          <div className="h-[35%] min-h-[250px] flex flex-col bg-surface-low z-20">
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <span className="font-label text-xs uppercase tracking-widest text-outline">Console &amp; Test Suite</span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTest(false)}
                  disabled={evaluating || timeLeft <= 0}
                  className="font-label text-[10px] uppercase tracking-widest border border-border px-4 py-1.5 text-foreground hover:bg-surface disabled:opacity-50 transition-colors"
                >
                  {evaluating ? "Evaluating..." : "Run Tests"}
                </button>
                <button
                  onClick={() => handleTest(true)}
                  disabled={evaluating || timeLeft <= 0}
                  className="font-label text-[10px] uppercase tracking-widest bg-foreground text-surface px-4 py-1.5 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="font-data text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {output || "System initialized. Click 'Run Tests' to validate your solution against public test cases."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
