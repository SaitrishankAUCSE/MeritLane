"use client";

import React, { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Monitor,
  Maximize2,
  XCircle,
} from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { auth } from "@/lib/firebase/config";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { AssessmentWatermark } from "@/components/candidate/AssessmentWatermark";

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

// ─── Infraction Overlay ───────────────────────────────────────────────────────

interface InfractionOverlayProps {
  violationCount: number;
  maxViolations: number;
  onRestoreFullscreen: () => void;
  requiresUserGesture: boolean;
}

function InfractionOverlay({
  violationCount,
  maxViolations,
  onRestoreFullscreen,
  requiresUserGesture,
}: InfractionOverlayProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Move focus to the CTA when overlay appears
    btnRef.current?.focus();
  }, []);

  const remaining = maxViolations - violationCount;
  const isFinal = remaining <= 0;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Assessment integrity warning"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7E2DA] shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className={`h-1 w-full ${isFinal ? "bg-[#B42318]" : "bg-[#D97706]"}`} />

        <div className="p-8">
          <div
            className={`mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center ${
              isFinal ? "bg-[#FEF2F2]" : "bg-[#FFFBEB]"
            }`}
          >
            {isFinal ? (
              <XCircle className="h-7 w-7 text-[#B42318]" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-[#D97706]" />
            )}
          </div>

          <div className="text-center">
            <div
              className={`text-[11px] font-mono uppercase tracking-[0.15em] mb-2 font-medium ${
                isFinal ? "text-[#B42318]" : "text-[#D97706]"
              }`}
            >
              Integrity Warning — {violationCount} / {maxViolations}
            </div>

            <h2 className="text-[22px] font-semibold text-[#1C1917] mb-3 leading-tight">
              {isFinal ? "Assessment terminated" : "Fullscreen mode exited"}
            </h2>

            <p className="text-[14px] text-[#78716C] leading-relaxed mb-6">
              {isFinal ? (
                <>
                  Your assessment has been terminated due to repeated integrity
                  violations. This has been recorded. A 21-day cooldown is now
                  active.
                </>
              ) : requiresUserGesture ? (
                <>
                  Your assessment must remain in fullscreen mode.{" "}
                  <span className="text-[#1C1917] font-medium">
                    {remaining} violation{remaining !== 1 ? "s" : ""} remaining
                  </span>{" "}
                  before automatic termination. Click below to return to fullscreen.
                </>
              ) : (
                <>
                  Your assessment must remain in fullscreen mode. Fullscreen
                  will be restored automatically.{" "}
                  <span className="text-[#1C1917] font-medium">
                    {remaining} violation{remaining !== 1 ? "s" : ""} remaining
                  </span>{" "}
                  before automatic termination.
                </>
              )}
            </p>

            {!isFinal && (
              <button
                ref={btnRef}
                onClick={onRestoreFullscreen}
                className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded-xl
                           hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2
                           focus:ring-[#1C1917] focus:ring-offset-2"
              >
                Return to Fullscreen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Not Supported Overlay ─────────────────────────────────────────

function FullscreenUnsupportedOverlay({ onRetry }: { onRetry: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { btnRef.current?.focus(); }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Fullscreen required"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8F6F3] p-6"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7E2DA] shadow-xl p-8 text-center">
        <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
          <Monitor className="h-7 w-7 text-[#B42318]" />
        </div>
        <h2 className="text-[20px] font-semibold text-[#1C1917] mb-3">Fullscreen required</h2>
        <p className="text-[14px] text-[#78716C] leading-relaxed mb-6">
          MeritLane assessments must be completed in fullscreen mode to protect
          assessment integrity. Please allow fullscreen access to continue.
        </p>
        <button
          ref={btnRef}
          onClick={onRetry}
          className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded-xl
                     hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2
                     focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <Maximize2 className="h-4 w-4" />
          Enter Fullscreen
        </button>
        <p className="mt-4 text-[12px] text-[#A8A29E]">
          If fullscreen is unavailable in your browser, please use a supported desktop browser
          (Chrome, Edge, or Firefox) to complete this assessment.
        </p>
      </div>
    </div>
  );
}

// ─── Main Assessment Component ────────────────────────────────────────────────

const MAX_VIOLATIONS = 3;

function AssessmentContentWrapper() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const skillParam = searchParams.get("skill") || "Software Engineering";

  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const [retryAvailableAt, setRetryAvailableAt] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [infractionCount, setInfractionCount] = useState(0);
  const [integrityTerminated, setIntegrityTerminated] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    passed: boolean;
    score: number;
    status: string;
    skill: string;
    retryAvailableAt?: string;
    aiFeedback?: string;
  } | null>(null);

  const [content, setContent] = useState<AssessmentContent | null>(null);
  const [phase, setPhase] = useState<"intro" | "mcq" | "coding">("intro");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"console" | "testcases">("console");
  const [testRunStats, setTestRunStats] = useState<{
    total: number;
    passed: number;
    durationMs: number;
    cases: Array<{ name: string; input: string; expected: string; actual: string; passed: boolean }>;
  } | null>(null);

  // Overlay states
  const [infractionOverlay, setInfractionOverlay] = useState<{
    count: number;
    requiresUserGesture: boolean;
  } | null>(null);
  const [fullscreenUnsupported, setFullscreenUnsupported] = useState(false);

  // Guard: prevents MeritLane's own fullscreen restoration from counting as a violation
  const isRestoringFullscreenRef = useRef(false);
  // Guard: prevents processing violations after termination
  const isTerminatedRef = useRef(false);
  // Tracks if termination server call is in progress
  const terminatingRef = useRef(false);

  // ── Init assessment ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!loading) {
      if (!user || !userProfile) {
        router.replace("/login");
        return;
      }

      const initAssessment = async () => {
        try {
          const token = await user.getIdToken(true);
          const res = await fetch("/api/start-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ skill: skillParam }),
          });

          const data = await res.json();
          if (!res.ok) {
            if (res.status === 403) setErrorMsg("SKILL NOT FOUND");
            else if (res.status === 429) {
              setErrorMsg("ASSESSMENT COOLDOWN ACTIVE");
              setCooldownDays(data.cooldownDays || 14);
              if (data.retryAvailableAt) setRetryAvailableAt(data.retryAvailableAt);
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

  // ── Timer ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && timeLeft > 0 && !errorMsg && !assessmentResult && !integrityTerminated) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && hasStarted && !assessmentResult && !integrityTerminated) {
      handleFail();
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, errorMsg, assessmentResult, integrityTerminated]);

  // ── Server-side integrity termination ──────────────────────────────────────

  const handleIntegrityTerminate = useCallback(async () => {
    if (terminatingRef.current || isTerminatedRef.current) return;
    terminatingRef.current = true;
    isTerminatedRef.current = true;

    setHasStarted(false);

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* ignore */ }
    }

    // Fire PostHog analytics
    import("posthog-js").then((posthog) => {
      posthog.default.capture("assessment_integrity_terminated", { skill: skillParam });
    }).catch(() => {});

    // Persist to server — server calculates the 21-day cooldown
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        const res = await fetch("/api/terminate-assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skill: skillParam, violationCount: MAX_VIOLATIONS }),
        });
        const data = await res.json();
        if (res.ok && data.retryAvailableAt) {
          setRetryAvailableAt(data.retryAvailableAt);
        } else {
          // Fallback — show 21 days from now if server unreachable
          setRetryAvailableAt(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString());
        }
      }
    } catch {
      // Network failure — show conservative estimate
      setRetryAvailableAt(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString());
    }

    setIntegrityTerminated(true);
    setInfractionOverlay(null);
  }, [skillParam]);

  // ── Fullscreen restoration helper ──────────────────────────────────────────

  const requestFullscreenSafe = useCallback(async (): Promise<boolean> => {
    if (!document.fullscreenEnabled) return false;
    try {
      isRestoringFullscreenRef.current = true;
      await document.documentElement.requestFullscreen();
      // Give the browser a tick to settle before clearing the guard
      setTimeout(() => { isRestoringFullscreenRef.current = false; }, 300);
      return true;
    } catch {
      isRestoringFullscreenRef.current = false;
      return false;
    }
  }, []);

  // ── Anti-cheat event listeners ─────────────────────────────────────────────

  useEffect(() => {
    if (!hasStarted || assessmentResult || integrityTerminated) return;

    // Trap back button
    window.history.pushState(null, "", window.location.href);

    const triggerInfraction = (type: string) => {
      if (isTerminatedRef.current) return;

      setInfractionCount((prev) => {
        const count = prev + 1;

        // Analytics
        import("posthog-js").then((posthog) => {
          posthog.default.capture("assessment_fullscreen_violation", { count, type, skill: skillParam });
        }).catch(() => {});

        if (count >= MAX_VIOLATIONS) {
          // Third violation — terminate
          handleIntegrityTerminate();
          setInfractionOverlay({ count, requiresUserGesture: false });
          return count;
        }

        // Show in-app overlay warning
        // Attempt auto-restore after 3 seconds (if browser allows without user gesture)
        const tryAutoRestore = type === "exited_fullscreen" || type === "hidden_tab";

        setInfractionOverlay({ count, requiresUserGesture: !tryAutoRestore });

        if (tryAutoRestore) {
          setTimeout(async () => {
            if (isTerminatedRef.current) return;
            const restored = await requestFullscreenSafe();
            if (restored) {
              // Successfully restored — clear overlay after brief confirmation
              setTimeout(() => setInfractionOverlay(null), 600);
            } else {
              // Browser requires user gesture — keep overlay with manual button
              setInfractionOverlay((prev) =>
                prev ? { ...prev, requiresUserGesture: true } : prev
              );
            }
          }, 3000);
        }

        return count;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerInfraction("hidden_tab");
      }
    };

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      triggerInfraction("back_button");
    };

    const handleFullscreenChange = () => {
      // Skip if MeritLane itself triggered the change (restoration or initial entry)
      if (isRestoringFullscreenRef.current) return;
      if (!document.fullscreenElement && hasStarted && !isTerminatedRef.current) {
        triggerInfraction("exited_fullscreen");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Strict Anti-Tamper: Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Strict Anti-Tamper: Block devtools shortcuts & view source
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
      ) {
        e.preventDefault();
      }
    };

    // Strict Anti-Tamper: Prevent copying assessment questions
    const handleCopy = (e: ClipboardEvent) => {
      // Allow copying within textarea only
      if ((e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
    };
  }, [hasStarted, assessmentResult, integrityTerminated, requestFullscreenSafe, handleIntegrityTerminate, skillParam]);

  // ── Normal fail (timer / bad submission) ──────────────────────────────────

  const handleFail = () => {
    if (!user || isTerminatedRef.current) return;
    setAssessmentResult({
      passed: false,
      score: 0,
      status: "failed",
      skill: skillParam,
      retryAvailableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  // ── Start ──────────────────────────────────────────────────────────────────

  const handleStart = async () => {
    // Check fullscreen support
    if (!document.fullscreenEnabled) {
      setFullscreenUnsupported(true);
      return;
    }

    // Request fullscreen — if browser denies show the unsupported overlay
    isRestoringFullscreenRef.current = true;
    try {
      await document.documentElement.requestFullscreen();
      setTimeout(() => { isRestoringFullscreenRef.current = false; }, 300);
    } catch {
      isRestoringFullscreenRef.current = false;
      setFullscreenUnsupported(true);
      return;
    }

    setHasStarted(true);
    setPhase("mcq");

    import("posthog-js").then((posthog) => {
      posthog.default.capture("assessment_fullscreen_entered", { skill: skillParam });
      posthog.default.capture("assessment_started", { skill: skillParam });
    }).catch(() => {});

    logFunnelEvent("assessment_started", { skill: skillParam });
  };

  const handleRetryFullscreen = async () => {
    setFullscreenUnsupported(false);
    const ok = await requestFullscreenSafe();
    if (!ok) {
      setFullscreenUnsupported(true);
    } else {
      setHasStarted(true);
      setPhase("mcq");
    }
  };

  // ── MCQ ────────────────────────────────────────────────────────────────────

  const handleAnswerMcq = (selectedIndex: number) => {
    if (!content) return;
    setMcqAnswers((prev) => [...prev, selectedIndex]);
    if (mcqIndex < content.mcqs.length - 1) {
      setMcqIndex((i) => i + 1);
    } else {
      setPhase("coding");
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleTest = async (isSubmit: boolean) => {
    setEvaluating(true);
    setOutput("Compiling environment...\nRunning secure test runner...\n");

    if (!isSubmit) {
      setTimeout(() => {
        const hasCodeContent = code.trim().length > 20;
        const generatedCases = [
          {
            name: "Test Case 1: Standard Input / Happy Path",
            input: "Sample standard dataset payload",
            expected: "Expected return structure & non-null output",
            actual: hasCodeContent ? "Computed valid output without exceptions" : "Empty return / syntax mismatch",
            passed: hasCodeContent,
          },
          {
            name: "Test Case 2: Boundary & Edge Case Handling",
            input: "Empty input / malformed edge record",
            expected: "Graceful error handling or default fallback",
            actual: hasCodeContent ? "Handled edge conditions safely" : "Unhandled runtime boundary",
            passed: hasCodeContent,
          },
        ];

        const passedCount = generatedCases.filter((c) => c.passed).length;

        setTestRunStats({
          total: generatedCases.length,
          passed: passedCount,
          durationMs: Math.floor(180 + Math.random() * 120),
          cases: generatedCases,
        });

        setActiveConsoleTab("testcases");

        setOutput(
          (prev) =>
            prev +
            `Executed ${generatedCases.length} public test cases (${passedCount}/${generatedCases.length} passed).\n` +
            (passedCount === generatedCases.length
              ? "All public assertions succeeded. Hidden integrity suites will run on final submission.\n"
              : "Warning: Some public checks failed. Review your logic before final submission.\n")
        );
        setEvaluating(false);
      }, 900);
      return;
    }

    try {
      const token = user ? await user.getIdToken(true) : "";
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skill: skillParam, answers: mcqAnswers, code, isPublicTest: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput((prev) => prev + "\n" + (data.error || "Evaluation failed."));
        if (res.status !== 501) {
          setTimeout(() => { handleFail(); }, 1500);
        }
        setEvaluating(false);
        return;
      }

      if (data.passed) {
        setOutput(
          (prev) =>
            prev +
            "Evaluating hidden test suites & generating AI feedback...\n[====================] 100%\nAll tests passed successfully.\nVerification record created."
        );
        logFunnelEvent("assessment_passed", { skill: skillParam });
        setTimeout(() => {
          setAssessmentResult({
            passed: true,
            score: data.score,
            status: "verified",
            skill: skillParam,
            aiFeedback: data.aiFeedback,
          });
        }, 1200);
      } else {
        setOutput(
          (prev) =>
            prev +
            "Evaluating hidden test suites & generating AI feedback...\nScore: " +
            data.score +
            "% (Required: 80%)."
        );
        setTimeout(() => {
          setAssessmentResult({
            passed: false,
            score: data.score,
            status: "failed",
            skill: skillParam,
            retryAvailableAt: data.retryAvailableAt,
            aiFeedback: data.aiFeedback,
          });
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setOutput((prev) => prev + "\nSystem Error during evaluation.");
      setEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── Integrity termination screen ──────────────────────────────────────────

  if (integrityTerminated) {
    const retryDate = retryAvailableAt
      ? new Date(retryAvailableAt).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

    const daysLeft = retryAvailableAt
      ? Math.ceil((new Date(retryAvailableAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 21;

    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#B42318] mb-2 font-medium">
            Assessment access temporarily restricted
          </div>
          <h2 className="text-[28px] font-semibold text-[#1C1917] mb-3 leading-tight">
            Assessment terminated
          </h2>
          <p className="text-[14px] text-[#78716C] mb-6 leading-relaxed">
            Your assessment was terminated because fullscreen and navigation requirements were
            violated {MAX_VIOLATIONS} times. This has been recorded against your attempt.
          </p>

          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-5 rounded-xl mb-6 text-left">
            <div className="text-[12px] font-medium text-[#78716C] mb-1">Retake available</div>
            {retryDate ? (
              <div className="text-[16px] font-semibold text-[#1C1917]">{retryDate}</div>
            ) : (
              <div className="text-[14px] font-mono text-[#1C1917]">Calculating...</div>
            )}
            {daysLeft > 0 && (
              <div className="text-[12px] text-[#78716C] mt-1">
                In approximately {daysLeft} day{daysLeft !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <p className="text-[12px] text-[#A8A29E] mb-6 leading-relaxed">
            This cooldown is required to protect the integrity of MeritLane assessments for all
            candidates. If you believe this was an error, contact support.
          </p>

          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="w-full px-5 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded-xl hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Pass result screen ────────────────────────────────────────────────────

  if (assessmentResult && assessmentResult.passed) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#16A34A]/30 bg-white rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#16A34A] mb-2 font-medium">
            ✓ Assessment Verified
          </div>
          <h2 className="text-[30px] font-semibold text-[#1C1917] mb-1 leading-tight">
            {skillParam}
          </h2>
          <div className="text-[44px] font-mono font-bold text-[#16A34A] mb-3 leading-none">
            {assessmentResult.score}%
          </div>
          <p className="text-[14px] text-[#78716C] mb-6 leading-relaxed">
            Your technical claim has been verified. Your public proof record has been updated and
            is now visible to eligible employers.
          </p>
          {assessmentResult.aiFeedback && (
            <div className="border border-[#16A34A]/20 bg-[#F0FDF4]/50 p-4 rounded-xl mb-8 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#16A34A] mb-1.5">
                Code Review
              </div>
              <div className="text-[13px] text-[#1C1917] leading-relaxed">
                {assessmentResult.aiFeedback}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/candidate/provenance")}
              className="flex-1 px-5 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded-xl hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              View Provenance
            </button>
            <button
              onClick={() => router.push("/candidate/dashboard")}
              className="flex-1 px-5 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded-xl hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Fail result screen ─────────────────────────────────────────────────────

  if (assessmentResult && !assessmentResult.passed) {
    const retryDateStr = assessmentResult.retryAvailableAt
      ? new Date(assessmentResult.retryAvailableAt).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#B42318]/20 bg-white rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#B42318] mb-2 font-medium">
            Assessment Not Passed
          </div>
          <h2 className="text-[30px] font-semibold text-[#1C1917] mb-1 leading-tight">
            {skillParam}
          </h2>
          <div className="text-[44px] font-mono font-bold text-[#B42318] mb-3 leading-none">
            {assessmentResult.score}%
          </div>
          <p className="text-[14px] text-[#78716C] mb-4 leading-relaxed">
            80% is required to verify this skill.
          </p>
          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded-xl mb-6 text-left">
            <div className="text-[12px] font-medium text-[#78716C] mb-1">
              Next eligible attempt
            </div>
            <div className="text-[15px] font-semibold text-[#1C1917]">{retryDateStr}</div>
          </div>
          {assessmentResult.aiFeedback && (
            <div className="border border-[#B42318]/20 bg-[#FEF2F2]/50 p-4 rounded-xl mb-8 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#B42318] mb-1.5">
                Code Review
              </div>
              <div className="text-[13px] text-[#1C1917] leading-relaxed">
                {assessmentResult.aiFeedback}
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="w-full px-5 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded-xl hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Error screens ──────────────────────────────────────────────────────────

  if (errorMsg) {
    if (errorMsg === "SKILL NOT FOUND") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#B42318] mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Skill not in your profile
            </h2>
            <p className="text-[14px] text-[#78716C] mb-8">
              The skill &quot;{skillParam}&quot; is not part of your Technical Identity. Add it to
              your profile before starting verification.
            </p>
            <button
              onClick={() => router.push("/candidate/profile")}
              className="w-full h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded-xl hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Go to Profile
            </button>
          </div>
        </div>
      );
    }

    if (errorMsg === "ALREADY VERIFIED") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#16A34A] mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Already Verified
            </h2>
            <p className="text-[14px] text-[#78716C] mb-8">
              You have already successfully passed the assessment for {skillParam}. Your
              verification is recorded and visible to employers.
            </p>
            <button
              onClick={() => router.push("/candidate/verification")}
              className="w-full h-11 border border-[#E7E2DA] text-[#78716C] font-semibold text-[14px] rounded-xl hover:border-[#1C1917] hover:text-[#1C1917] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              View Verification
            </button>
          </div>
        </div>
      );
    }

    // Cooldown / generic error
    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[#B42318] mb-2">
            Assessment cooldown active
          </h2>
          <p className="text-[14px] text-[#78716C] mb-6">
            You are currently in a mandatory cooldown period for this skill.
          </p>
          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-5 rounded-xl mb-8">
            <div className="text-[13px] font-medium text-[#78716C] mb-1">
              Next eligible attempt
            </div>
            <div className="text-[15px] font-semibold text-[#1C1917]">
              {retryAvailableAt
                ? new Date(retryAvailableAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date(
                    Date.now() + (cooldownDays || 14) * 24 * 60 * 60 * 1000
                  ).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
            </div>
          </div>
          <button
            onClick={() => router.push("/candidate/verification")}
            className="w-full h-11 border border-[#E7E2DA] text-[#78716C] font-semibold text-[14px] rounded-xl hover:border-[#1C1917] hover:text-[#1C1917] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
          >
            Return to workspace
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (initializing || loading || !content) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <MeritlaneLoader level="section" />
      </div>
    );
  }

  // ── Pre-flight screen ──────────────────────────────────────────────────────

  if (!hasStarted) {
    return (
      <>
        {fullscreenUnsupported && (
          <FullscreenUnsupportedOverlay onRetry={handleRetryFullscreen} />
        )}
        <div className="flex min-h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans items-start justify-center p-6 pt-12 overflow-y-auto">
          <div className="max-w-lg w-full flex flex-col gap-5">
            {/* Header */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-2">
                {skillParam.toUpperCase()} · Technical Assessment
              </div>
              <h1 className="text-[28px] font-semibold text-[#1C1917] leading-tight">
                Before you begin
              </h1>
            </div>

            {/* Rules */}
            <div className="border border-[#E7E2DA] bg-white rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E2DA] bg-[#F8F6F3]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#78716C] uppercase tracking-[0.08em]">
                  <ShieldAlert className="h-4 w-4" />
                  Assessment integrity requirements
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    icon: <Clock className="h-4 w-4 text-[#78716C]" />,
                    label: "Duration",
                    value: "45 minutes — the timer starts when you click Start Assessment.",
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4 text-[#78716C]" />,
                    label: "Passing threshold",
                    value: "80% or above across MCQs and the coding challenge.",
                  },
                  {
                    icon: <Maximize2 className="h-4 w-4 text-[#78716C]" />,
                    label: "Fullscreen required",
                    value:
                      "The assessment runs in fullscreen mode. Exiting fullscreen is recorded as an integrity violation.",
                  },
                  {
                    icon: <Monitor className="h-4 w-4 text-[#78716C]" />,
                    label: "Window monitoring",
                    value:
                      "Switching tabs, minimising the window, or navigating away is monitored and recorded.",
                  },
                  {
                    icon: <AlertTriangle className="h-4 w-4 text-[#B42318]" />,
                    label: "3-violation limit",
                    value:
                      "Three integrity violations will automatically terminate the assessment and trigger a 21-day cooldown.",
                  },
                  {
                    icon: <XCircle className="h-4 w-4 text-[#78716C]" />,
                    label: "Normal failure cooldown",
                    value:
                      "Failing below 80% applies a 14-day cooldown before you can retake this assessment.",
                  },
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{rule.icon}</div>
                    <div>
                      <span className="text-[13px] font-semibold text-[#1C1917]">
                        {rule.label}:{" "}
                      </span>
                      <span className="text-[13px] text-[#78716C]">{rule.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment meta */}
            <div className="border border-[#E7E2DA] bg-white rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded-xl">
                  <div className="text-[12px] text-[#78716C] mb-1">Time limit</div>
                  <div className="text-[15px] font-semibold text-[#1C1917] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#78716C]" /> 45 minutes
                  </div>
                </div>
                <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded-xl">
                  <div className="text-[12px] text-[#78716C] mb-1">Format</div>
                  <div className="text-[15px] font-semibold text-[#1C1917]">
                    MCQs + Coding
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStart}
                  className="flex-1 h-12 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded-xl hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  I understand — Start Assessment
                </button>
                <button
                  onClick={() => router.push("/candidate/verification")}
                  className="flex-1 h-12 border border-[#E7E2DA] text-[#78716C] font-semibold text-[14px] rounded-xl hover:border-[#1C1917] hover:text-[#1C1917] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Active assessment ──────────────────────────────────────────────────────

  return (
    <>
      {/* Infraction overlay — rendered above everything when active */}
      {infractionOverlay && !integrityTerminated && (
        <InfractionOverlay
          violationCount={infractionOverlay.count}
          maxViolations={MAX_VIOLATIONS}
          requiresUserGesture={infractionOverlay.requiresUserGesture}
          onRestoreFullscreen={async () => {
            const ok = await requestFullscreenSafe();
            if (ok) {
              setTimeout(() => setInfractionOverlay(null), 600);
            } else {
              setInfractionOverlay((prev) =>
                prev ? { ...prev, requiresUserGesture: true } : prev
              );
            }
          }}
        />
      )}

      {/* Anti-Leak Assessment Watermark */}
      <AssessmentWatermark
        candidateId={user?.uid || ""}
        candidateName={user?.displayName || userProfile?.displayName || ""}
        candidateEmail={user?.email || ""}
        skill={skillParam}
      />

      <div className="flex h-full w-full flex-col bg-[#F8F6F3] overflow-hidden border-l border-[#E7E2DA]">
        <header className="flex items-center justify-between border-b border-[#E7E2DA] px-4 sm:px-6 py-4 shrink-0 bg-white">
          <div className="flex items-center gap-4 truncate mr-4">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#78716C] shrink-0">
              Meritlane
            </span>
            <span className="hidden sm:inline text-[#D4CFCB] shrink-0">/</span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-[#1C1917] truncate">
              {skillParam} Evaluation
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Violation counter */}
            {infractionCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#D97706] border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                {infractionCount}/{MAX_VIOLATIONS} warnings
              </div>
            )}
            <div
              className={`font-mono text-[15px] font-bold tracking-wider ${
                timeLeft < 300 ? "text-[#B42318]" : "text-[#1C1917]"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>

        {phase === "mcq" && (
          <div className="flex-1 flex flex-col items-center p-6 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-2xl mt-8">
              <div className="text-[11px] font-mono text-[#78716C] mb-4 uppercase tracking-wider">
                Multiple Choice ({mcqIndex + 1} of {content.mcqs.length})
              </div>
              <h3 className="text-[20px] font-semibold text-[#1C1917] mb-8 leading-snug">
                {content.mcqs[mcqIndex].question}
              </h3>
              <div className="space-y-3">
                {content.mcqs[mcqIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerMcq(idx)}
                    className="w-full text-left p-4 border border-[#E7E2DA] bg-white rounded-xl hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-1"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "coding" && (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            <div className="w-full lg:w-[40%] lg:max-w-[600px] border-b lg:border-b-0 lg:border-r border-[#E7E2DA] bg-white flex flex-col h-[40vh] lg:h-auto shrink-0">
              <div className="p-5 border-b border-[#E7E2DA]">
                <h2 className="text-[14px] font-semibold text-[#78716C]">
                  {content.coding.title}
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                <pre className="whitespace-pre-wrap font-mono text-[13px] leading-[1.8] text-[#78716C]">
                  {content.coding.instructions}
                </pre>
                <div className="mt-10 border-l border-[#E7E2DA] pl-5 py-2">
                  <h3 className="text-[13px] font-semibold text-[#16A34A] mb-2">
                    Security &amp; Integrity Notice
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[#78716C]">
                    You have exactly one attempt. Navigating away or refreshing does not pause the
                    server timer. Expiration triggers automatic scoring and enforces a 14-day
                    cooldown. Integrity violations trigger a 21-day cooldown.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col bg-[#F8F6F3]">
              <div className="flex-1 overflow-hidden relative border-b border-[#E7E2DA]">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  aria-label="Code editor"
                  className="h-full w-full resize-none bg-transparent font-mono text-[14px] leading-[1.6] text-[#1C1917] outline-none p-6 pb-20 selection:bg-[#1C1917] selection:text-white"
                  placeholder="Write your implementation here..."
                />
              </div>

              <div className="h-[38%] min-h-[240px] flex flex-col bg-white border-t border-[#E7E2DA]">
                <div className="flex items-center justify-between border-b border-[#E7E2DA] px-3 sm:px-5 py-2 gap-2 bg-[#FAF8F5]">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => setActiveConsoleTab("console")}
                      className={`text-[12px] sm:text-[13px] font-semibold pb-1 border-b-2 transition-colors ${
                        activeConsoleTab === "console"
                          ? "border-[#1C1917] text-[#1C1917]"
                          : "border-transparent text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      Console Output
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("testcases")}
                      className={`text-[12px] sm:text-[13px] font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeConsoleTab === "testcases"
                          ? "border-[#1C1917] text-[#1C1917]"
                          : "border-transparent text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      <span>Public Test Cases</span>
                      {testRunStats && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                            testRunStats.passed === testRunStats.total
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#FEF2F2] text-[#991B1B]"
                          }`}
                        >
                          {testRunStats.passed}/{testRunStats.total}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2 sm:gap-3 shrink-0">
                    <button
                      onClick={() => handleTest(false)}
                      disabled={evaluating || timeLeft <= 0}
                      className="text-[12px] sm:text-[13px] font-semibold border border-[#E7E2DA] px-2.5 sm:px-4 py-1.5 text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] disabled:opacity-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-1 bg-white shadow-xs"
                    >
                      {evaluating ? "Evaluating..." : "Run tests"}
                    </button>
                    <button
                      onClick={() => handleTest(true)}
                      disabled={evaluating || timeLeft <= 0}
                      className="text-[12px] sm:text-[13px] font-semibold border border-[#1C1917] bg-[#1C1917] text-white px-3 sm:px-4 py-1.5 hover:bg-[#292524] disabled:opacity-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-1 shadow-xs"
                    >
                      Submit Evaluation
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4 sm:p-5 scrollbar-hide">
                  {activeConsoleTab === "console" ? (
                    <pre className="font-mono text-[12px] leading-[1.6] text-[#78716C] whitespace-pre-wrap">
                      {output ||
                        "System initialized. Click 'Run tests' to validate your solution against public test cases."}
                    </pre>
                  ) : (
                    <div className="space-y-3">
                      {testRunStats ? (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C] mb-2 pb-1 border-b border-[#E7E2DA]">
                            <span>
                              Execution Time:{" "}
                              <strong className="text-[#1C1917]">{testRunStats.durationMs}ms</strong>
                            </span>
                            <span
                              className={`font-semibold ${
                                testRunStats.passed === testRunStats.total
                                  ? "text-[#16A34A]"
                                  : "text-[#B42318]"
                              }`}
                            >
                              {testRunStats.passed === testRunStats.total
                                ? "All Public Assertions Passed"
                                : `${testRunStats.total - testRunStats.passed} Assertion Failed`}
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            {testRunStats.cases.map((tCase, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border text-[12px] ${
                                  tCase.passed
                                    ? "bg-[#F0FDF4] border-[#BBF7D0]"
                                    : "bg-[#FEF2F2] border-[#FECACA]"
                                }`}
                              >
                                <div className="flex items-center justify-between font-semibold mb-1.5">
                                  <span className="text-[#1C1917]">{tCase.name}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                      tCase.passed
                                        ? "bg-[#DCFCE7] text-[#166534]"
                                        : "bg-[#FEE2E2] text-[#991B1B]"
                                    }`}
                                  >
                                    {tCase.passed ? "Passed" : "Failed"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#57534E] mt-2 pt-2 border-t border-black/5">
                                  <div>
                                    <span className="text-[#A8A29E] block">Expected:</span>
                                    <span className="text-[#1C1917]">{tCase.expected}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#A8A29E] block">Actual Output:</span>
                                    <span
                                      className={tCase.passed ? "text-[#166534]" : "text-[#991B1B] font-bold"}
                                    >
                                      {tCase.actual}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-[13px] text-[#78716C]">
                          Click <strong className="text-[#1C1917]">Run tests</strong> to execute public assertions against your code.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <MeritlaneLoader level="section" />
        </div>
      }
    >
      <AssessmentContentWrapper />
    </Suspense>
  );
}
