"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";

const VARIANT_A_INSTRUCTIONS = \`
Write a Python function named process_transactions(csv_string) that takes a multiline CSV string of financial transactions.

Columns: transaction_id, user_id, amount, status

Requirements:
1. Filter out any transaction where status is not "COMPLETED".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend.
\`;

const VARIANT_B_INSTRUCTIONS = \`
Write a Python function named calculate_aov(csv_string) that takes a multiline CSV string of orders.

Columns: order_id, user_id, amount, status

Requirements:
1. Filter out any order where status is not "SUCCESS".
2. Ignore any malformed rows (e.g., missing columns, invalid floats).
3. Sum the total valid amount per user_id.
4. Return a Python dictionary mapping user_id to their total spend (acting as AOV since it's total).
\`;

export default function AssessmentPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [code, setCode] = useState("def process_transactions(csv_string):\\n    pass\\n");
  
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || role !== "candidate") {
      router.push("/login");
      return;
    }

    // Attempt to start or resume assessment
    const startSession = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/start-assessment", {
          method: "POST",
          headers: {
            "Authorization": \`Bearer \${idToken}\`
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

        // Setup session
        const startedAt = data.startedAt;
        const v = data.variant || "A";
        setVariant(v);
        if (v === "B") {
          setCode("def calculate_aov(csv_string):\\n    pass\\n");
        }

        // Calculate time left
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

  // Timer loop
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
          "Authorization": \`Bearer \${idToken}\`
        },
        body: JSON.stringify({ code, isPublicTest: !isSubmit })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setOutput(\`Error: \${data.error}\`);
        setEvaluating(false);
        return;
      }

      if (!isSubmit) {
        // Public test output
        let msg = \`Public Tests Passed: \${data.passedTests} / 2\\n\\n\`;
        if (data.stdout) msg += \`--- STDOUT ---\\n\${data.stdout}\\n\`;
        if (data.stderr) msg += \`--- STDERR ---\\n\${data.stderr}\\n\`;
        setOutput(msg);
      } else {
        // Final submission output
        if (data.passed) {
          setOutput(\`✅ SUCCESS: \${data.message} (Score: \${data.score}/5)\\nRedirecting to dashboard...\`);
          setTimeout(() => router.push("/candidate/dashboard"), 3000);
        } else {
          setOutput(\`❌ FAILED: \${data.message}\\nYou are now in a 14-day cooldown.\`);
          setErrorMsg(\`Assessment Failed. You can retry in 14 days.\`);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Assessment Unavailable</h2>
          </div>
          <p className="mt-2 text-sm text-red-800">{errorMsg}</p>
          <button 
            onClick={() => router.push("/candidate/dashboard")}
            className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
    return \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 font-bold">M</div>
          <span className="font-medium tracking-tight">Meritlane Skill Verification</span>
        </div>
        <div className={\`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium \${timeLeft < 300 ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-300'}\`}>
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Instructions */}
        <div className="w-1/3 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="border-b border-zinc-800 p-4">
            <h2 className="font-semibold text-zinc-100">Task Overview</h2>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">
              {variant === "A" ? VARIANT_A_INSTRUCTIONS : VARIANT_B_INSTRUCTIONS}
            </pre>
            
            <div className="mt-8 rounded-lg border border-yellow-900/50 bg-yellow-900/20 p-4">
              <h3 className="text-sm font-medium text-yellow-500">Security Warning</h3>
              <p className="mt-1 text-xs text-yellow-600/80">
                You have 1 attempt. If you leave or refresh this page, the timer will continue running on the server. If time expires, it is counted as a failure and a 14-day cooldown will apply.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex w-2/3 flex-col bg-[#1e1e1e]">
          {/* Editor Area */}
          <div className="flex-1 overflow-auto p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-zinc-300 outline-none"
              placeholder="Write your Python code here..."
            />
          </div>

          {/* Console Area */}
          <div className="h-1/3 flex flex-col border-t border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-xs font-medium text-zinc-500">Console Output</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(false)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1 rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  Run Public Tests
                </button>
                <button
                  onClick={() => handleTest(true)}
                  disabled={evaluating || timeLeft <= 0}
                  className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Submit Assessment
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap">
                {output || "Run tests to see output here."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
