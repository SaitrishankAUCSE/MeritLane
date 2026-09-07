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
  Code,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Flag,
  RotateCcw,
  Sparkles,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { auth } from "@/lib/firebase/config";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { AssessmentWatermark } from "@/components/candidate/AssessmentWatermark";

import { COMMON_SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/assessments/content";

export interface MCQ {
  question: string;
  options: string[];
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
}

export interface CodingChallenge {
  title: string;
  instructions: string;
  initialCode: string;
  language?: string;
  supportedLanguages?: SupportedLanguage[];
}

export interface AssessmentContent {
  mcqs: MCQ[];
  coding?: CodingChallenge;
  hasCoding: boolean;
  timeLimitMinutes: number;
}

// ─── Infraction Overlay ───────────────────────────────────────────────────────

interface InfractionOverlayProps {
  violationCount: number;
  maxViolations: number;
  reason?: string;
  onRestoreFullscreen: () => void;
  requiresUserGesture: boolean;
}

function InfractionOverlay({
  violationCount,
  maxViolations,
  reason,
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
    >
      <div className="w-full max-w-md bg-white rounded border border-[#E7E2DA] shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className={`h-1.5 w-full ${isFinal ? "bg-[#B42318]" : "bg-[#D97706]"}`} />

        <div className="p-8">
          <div
            className={`mx-auto mb-5 h-14 w-14 rounded flex items-center justify-center ${
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
              className={`text-[11px] font-mono uppercase tracking-[0.15em] mb-2 font-semibold ${
                isFinal ? "text-[#B42318]" : "text-[#D97706]"
              }`}
            >
              Integrity Warning — Warning {violationCount} of {maxViolations}
            </div>

            <h2 className="text-[20px] font-semibold text-[#1C1917] mb-2 leading-tight">
              {isFinal ? "Assessment Terminated" : reason || "Proctoring Violation Detected"}
            </h2>

            <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-3.5 mb-5 text-[12px] font-mono text-[#78716C] text-left">
              <span className="font-semibold text-[#1C1917]">Integrity Policy:</span> Switching tabs, minimising the window, or navigating away is strictly monitored and recorded.
            </div>

            <p className="text-[13px] text-[#78716C] leading-relaxed mb-6">
              {isFinal ? (
                <>
                  Your assessment has been automatically terminated due to reaching {maxViolations} integrity violations. A mandatory <strong className="text-[#B42318]">21-day cooldown</strong> has been applied to your record.
                </>
              ) : requiresUserGesture ? (
                <>
                  Your assessment must remain in active fullscreen focus.{" "}
                  <strong className="text-[#1C1917]">
                    {remaining} warning{remaining !== 1 ? "s" : ""} remaining
                  </strong>{" "}
                  before immediate termination and 21-day cooldown. Click below to return.
                </>
              ) : (
                <>
                  Your assessment must remain in active fullscreen focus.{" "}
                  <strong className="text-[#1C1917]">
                    {remaining} warning{remaining !== 1 ? "s" : ""} remaining
                  </strong>{" "}
                  before automatic termination. Fullscreen is restoring.
                </>
              )}
            </p>

            {!isFinal && (
              <button
                ref={btnRef}
                onClick={onRestoreFullscreen}
                className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded
                           hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2
                           focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Return to Assessment
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
      <div className="w-full max-w-md bg-white rounded border border-[#E7E2DA] shadow-xl p-8 text-center">
        <div className="mx-auto mb-5 h-14 w-14 rounded bg-[#FEF2F2] flex items-center justify-center">
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
          className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded
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
  const [mcqAnswers, setMcqAnswers] = useState<(number | undefined)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [output, setOutput] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"console" | "testcases" | "custom">("console");
  const [customInput, setCustomInput] = useState<string>("");
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [testRunStats, setTestRunStats] = useState<{
    total: number;
    passed: number;
    durationMs: number;
    cases: Array<{ name: string; input: string; expected: string; actual: string; passed: boolean }>;
  } | null>(null);

  // Overlay states
  const [infractionOverlay, setInfractionOverlay] = useState<{
    count: number;
    reason: string;
    requiresUserGesture: boolean;
  } | null>(null);
  const [fullscreenUnsupported, setFullscreenUnsupported] = useState(false);

  // Guard: prevents MeritLane's own fullscreen restoration from counting as a violation
  const isRestoringFullscreenRef = useRef(false);
  // Guard: prevents processing violations after termination
  const isTerminatedRef = useRef(false);
  // Tracks if termination server call is in progress
  const terminatingRef = useRef(false);
  // Ref for synchronized line numbers scrolling
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // ── Init assessment ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Wait until firebase auth has completely settled
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    const initAssessment = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/start-assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skill: skillParam,
            resetCooldown: searchParams.get("resetCooldown") === "true",
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

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
        const storageKey = user ? `ml_draft_${skillParam.toLowerCase().replace(/\s+/g, "_")}_${user.uid}` : null;
        let restoredDraft: any = null;
        if (storageKey) {
          try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw) restoredDraft = JSON.parse(raw);
          } catch {
            /* ignore invalid json */
          }
        }

        if (data.content.mcqs) {
          if (restoredDraft?.mcqAnswers && Array.isArray(restoredDraft.mcqAnswers) && restoredDraft.mcqAnswers.length === data.content.mcqs.length) {
            setMcqAnswers(restoredDraft.mcqAnswers);
          } else {
            setMcqAnswers(new Array(data.content.mcqs.length).fill(undefined));
          }

          if (restoredDraft?.flaggedQuestions && Array.isArray(restoredDraft.flaggedQuestions) && restoredDraft.flaggedQuestions.length === data.content.mcqs.length) {
            setFlaggedQuestions(restoredDraft.flaggedQuestions);
          } else {
            setFlaggedQuestions(new Array(data.content.mcqs.length).fill(false));
          }
        }

        if (data.content.coding) {
          if (restoredDraft?.code && typeof restoredDraft.code === "string") {
            setCode(restoredDraft.code);
          } else {
            setCode(data.content.coding.initialCode);
          }

          if (restoredDraft?.selectedLanguage && typeof restoredDraft.selectedLanguage === "string") {
            setSelectedLanguage(restoredDraft.selectedLanguage);
          } else if (data.content.coding.language) {
            setSelectedLanguage(data.content.coding.language);
          }

          if (restoredDraft?.customInput && typeof restoredDraft.customInput === "string") {
            setCustomInput(restoredDraft.customInput);
          }
        }

        if (data.startedAt) {
          const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
          setTimeLeft(Math.max(0, 3600 - elapsed));
        }
        setInitializing(false);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setErrorMsg("SYSTEM ERROR");
          setInitializing(false);
        }
      }
    };

    initAssessment();

    return () => {
      isMounted = false;
    };
  }, [user, loading, router, skillParam]);

  // Auto-save draft progress to sessionStorage
  useEffect(() => {
    if (!hasStarted || !user || assessmentResult || integrityTerminated) return;
    const storageKey = `ml_draft_${skillParam.toLowerCase().replace(/\s+/g, "_")}_${user.uid}`;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          mcqAnswers,
          flaggedQuestions,
          code,
          selectedLanguage,
          customInput,
          updatedAt: Date.now(),
        })
      );
    } catch {
      /* storage quota exceeded or unavailable */
    }
  }, [hasStarted, user, skillParam, mcqAnswers, flaggedQuestions, code, selectedLanguage, customInput, assessmentResult, integrityTerminated]);

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

  // ── Draft cleanup ──────────────────────────────────────────────────────────
  const clearDraft = useCallback(() => {
    if (!user) return;
    try {
      const storageKey = `ml_draft_${skillParam.toLowerCase().replace(/\s+/g, "_")}_${user.uid}`;
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [user, skillParam]);

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

    clearDraft();
    setIntegrityTerminated(true);
    setInfractionOverlay(null);
  }, [skillParam, clearDraft]);

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

    const triggerInfraction = (type: string, reasonLabel: string) => {
      if (isTerminatedRef.current) return;

      setInfractionCount((prev) => {
        const count = prev + 1;

        // Persist infraction to server in real time
        if (auth.currentUser) {
          auth.currentUser.getIdToken().then((token: string) => {
            fetch("/api/candidate/record-infraction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                skill: skillParam,
                type,
                count,
                timestamp: Date.now()
              })
            }).catch(() => {});
          }).catch(() => {});
        }

        // Analytics
        import("posthog-js").then((posthog) => {
          posthog.default.capture("assessment_fullscreen_violation", { count, type, reason: reasonLabel, skill: skillParam });
        }).catch(() => {});

        if (count >= MAX_VIOLATIONS) {
          // Third violation — terminate immediately
          handleIntegrityTerminate();
          setInfractionOverlay({ count, reason: reasonLabel, requiresUserGesture: false });
          return count;
        }

        // Show in-app overlay warning
        const tryAutoRestore = type === "exited_fullscreen" || type === "hidden_tab";

        setInfractionOverlay({ count, reason: reasonLabel, requiresUserGesture: !tryAutoRestore });

        if (tryAutoRestore) {
          setTimeout(async () => {
            if (isTerminatedRef.current) return;
            const restored = await requestFullscreenSafe();
            if (restored) {
              setTimeout(() => setInfractionOverlay(null), 600);
            } else {
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
        triggerInfraction("hidden_tab", "Tab Switched or Window Minimized");
      }
    };

    const handleWindowBlur = () => {
      if (!isRestoringFullscreenRef.current && hasStarted && !isTerminatedRef.current) {
        triggerInfraction("window_blur", "Switched Away / Focus Lost from Examination");
      }
    };

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      triggerInfraction("back_button", "Browser Navigation Attempted");
    };

    const handleFullscreenChange = () => {
      // Skip if MeritLane itself triggered the change (restoration or initial entry)
      if (isRestoringFullscreenRef.current) return;
      if (!document.fullscreenElement && hasStarted && !isTerminatedRef.current) {
        triggerInfraction("exited_fullscreen", "Fullscreen Mode Exited");
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
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
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
    clearDraft();
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

  // ── Language & MCQ Selectors ──────────────────────────────────────────────

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (!content?.coding) return;
    const langs = content.coding.supportedLanguages || COMMON_SUPPORTED_LANGUAGES;
    const found = langs.find((l) => l.id === newLang);
    if (found && found.template) {
      setCode(found.template);
    }
  };

  const handleSelectMcq = (optIndex: number) => {
    setMcqAnswers((prev) => {
      const copy = [...prev];
      copy[mcqIndex] = optIndex;
      return copy;
    });
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedQuestions((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleResetCode = () => {
    if (!content?.coding) return;
    const langs = content.coding.supportedLanguages || COMMON_SUPPORTED_LANGUAGES;
    const found = langs.find((l) => l.id === selectedLanguage);
    if (found && found.template) {
      setCode(found.template);
    } else {
      setCode(content.coding.initialCode);
    }
    setShowResetConfirm(false);
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = textareaRef.current.value.substring(0, pos);
    const lines = textBefore.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleFormatCode = () => {
    setCode((prev) =>
      prev
        .split("\n")
        .map((line) => line.replace(/\t/g, "    ").trimEnd())
        .join("\n")
    );
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  };

  const handleClearOutput = () => {
    setOutput("");
  };

  // ── IDE Ergonomics: Keydown Handler for Code Editor ───────────────────────

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setTimeout(updateCursorPosition, 0);
    // Ctrl+Enter or Cmd+Enter -> Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!evaluating && timeLeft > 0) {
        handleTest(false);
      }
      return;
    }

    // Ctrl+S or Cmd+S -> Save Draft & show toast
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2000);
      return;
    }

    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = target.value;

    // Tab key -> 4 spaces indentation without blurring
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // Unindent current line(s)
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = value.indexOf("\n", end);
        const effectiveEnd = lineEnd === -1 ? value.length : lineEnd;
        const currentSlice = value.substring(lineStart, effectiveEnd);
        const unindented = currentSlice
          .split("\n")
          .map((l) => (l.startsWith("    ") ? l.slice(4) : l.startsWith("\t") ? l.slice(1) : l))
          .join("\n");
        const diff = currentSlice.length - unindented.length;
        const nextVal = value.substring(0, lineStart) + unindented + value.substring(effectiveEnd);
        setCode(nextVal);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = Math.max(lineStart, start - (currentSlice.startsWith("    ") ? 4 : 0));
            textareaRef.current.selectionEnd = Math.max(lineStart, end - diff);
          }
        }, 0);
      } else {
        // Insert 4 spaces
        const nextVal = value.substring(0, start) + "    " + value.substring(end);
        setCode(nextVal);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          }
        }, 0);
      }
      return;
    }

    // Bracket & quote auto-pairing: (), [], {}, "", '', ``
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    if (pairs[e.key]) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const selectedText = value.substring(start, end);
      const nextVal = value.substring(0, start) + e.key + selectedText + closeChar + value.substring(end);
      setCode(nextVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = end + 1;
        }
      }, 0);
      return;
    }

    // Closing char skip: if cursor is right before closing char, advance cursor
    const closers = [")", "]", "}", '"', "'", "`"];
    if (closers.includes(e.key) && start === end && value[start] === e.key) {
      e.preventDefault();
      textareaRef.current?.setSelectionRange(start + 1, start + 1);
      return;
    }

    // Backspace: if deleting between open and close pair, delete both
    if (e.key === "Backspace" && start === end && start > 0) {
      const prevChar = value[start - 1];
      const nextChar = value[start];
      if (pairs[prevChar] === nextChar) {
        e.preventDefault();
        const nextVal = value.substring(0, start - 1) + value.substring(start + 1);
        setCode(nextVal);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start - 1;
          }
        }, 0);
        return;
      }
    }
  };

  // ── Code Execution & Submit ────────────────────────────────────────────────

  const handleTest = async (isSubmit: boolean) => {
    if (isSubmit) {
      setShowSubmitModal(true);
      return;
    }

    setEvaluating(true);
    setOutput("Compiling code...\nInitializing execution sandbox...\n");

    try {
      const token = user ? await user.getIdToken(true) : "";
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: skillParam,
          code,
          language: selectedLanguage,
          isPublicTest: true,
          customInput: (activeConsoleTab === "custom" && customInput.trim()) ? customInput.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput((prev) => prev + "\n[Execution Error] " + (data.error || "Failed to compile/execute code."));
        setActiveConsoleTab("console");
        setEvaluating(false);
        return;
      }

      if (data.cases && data.cases.length > 0) {
        setTestRunStats({
          total: data.totalTests || data.cases.length,
          passed: data.passedTests ?? data.cases.filter((c: any) => c.passed).length,
          durationMs: data.durationMs || 90,
          cases: data.cases,
        });
      }

      let consoleMsg = "";
      if (data.compileSuccess === false) {
        consoleMsg = `[Compilation / Syntax Error]\n${data.stderr || "Syntax or compilation error detected."}\n`;
        setActiveConsoleTab("console");
      } else {
        if (data.stdout && data.stdout.trim().length > 0) {
          consoleMsg += `[Program Output]\n${data.stdout}\n\n`;
        }
        if (data.stderr && data.stderr.trim().length > 0) {
          consoleMsg += `[Runtime Stderr]\n${data.stderr}\n\n`;
        }
        const passedCount = data.passedTests ?? (data.cases ? data.cases.filter((c: any) => c.passed).length : 0);
        const totalCount = data.cases ? data.cases.length : 2;
        consoleMsg += `Executed ${totalCount} public test cases (${passedCount}/${totalCount} passed).\n` +
          (passedCount === totalCount
            ? "All public assertions succeeded. Hidden integrity suites will run on final submission.\n"
            : "Warning: Some public checks failed. Review your logic before final submission.\n");
        if (activeConsoleTab !== "custom") {
          setActiveConsoleTab("testcases");
        }
      }

      setOutput(consoleMsg);
    } catch (err: any) {
      setOutput((prev) => prev + "\nNetwork or execution exception: " + (err?.message || "Unknown error"));
      setActiveConsoleTab("console");
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setEvaluating(true);
    setOutput("Submitting assessment...\nEvaluating hidden test suites...\nGenerating verification analysis...\n");

    try {
      const token = user ? await user.getIdToken(true) : "";
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: skillParam,
          answers: mcqAnswers,
          code,
          language: selectedLanguage,
          isPublicTest: false,
        }),
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
        clearDraft();
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
        clearDraft();
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

  // Reliable navigation out of assessment flow: cleanly exits fullscreen, removes event traps, and redirects
  const handleReturn = (targetPath: string = "/candidate/verification") => {
    try {
      if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
      clearDraft();
      window.location.href = targetPath;
    }
  };

  // Automatically exit fullscreen when assessment concludes with result or termination
  useEffect(() => {
    if (assessmentResult || integrityTerminated) {
      if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (typeof window !== "undefined") {
        window.onbeforeunload = null;
      }
    }
  }, [assessmentResult, integrityTerminated]);

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
        <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
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

          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-5 rounded mb-6 text-left">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleReturn("/candidate/verification")}
              className="flex-1 px-5 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verification Records</span>
            </button>
            <button
              onClick={() => handleReturn("/candidate/dashboard")}
              className="flex-1 px-5 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pass result screen ────────────────────────────────────────────────────

  if (assessmentResult && assessmentResult.passed) {
    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#16A34A]/30 bg-white rounded p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
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
            <div className="border border-[#16A34A]/20 bg-[#F0FDF4]/50 p-4 rounded mb-8 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#16A34A] mb-1.5">
                Code Review
              </div>
              <div className="text-[13px] text-[#1C1917] leading-relaxed">
                {assessmentResult.aiFeedback}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleReturn("/candidate/verification")}
              className="w-full px-5 h-11 border border-[#064E3B] bg-[#064E3B] text-white font-semibold text-[14px] rounded hover:bg-[#043327] transition-colors focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Return to Verification Results</span>
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleReturn("/candidate/dashboard")}
                className="flex-1 px-5 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleReturn("/candidate/provenance")}
                className="flex-1 px-5 h-11 border border-[#E7E2DA] text-[#78716C] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:text-[#1C1917] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
              >
                Provenance
              </button>
            </div>
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
        <div className="max-w-md w-full border border-[#B42318]/20 bg-white rounded p-8 sm:p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
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
          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded mb-6 text-left">
            <div className="text-[12px] font-medium text-[#78716C] mb-1">
              Next eligible attempt
            </div>
            <div className="text-[15px] font-semibold text-[#1C1917]">{retryDateStr}</div>
          </div>
          {assessmentResult.aiFeedback && (
            <div className="border border-[#B42318]/20 bg-[#FEF2F2]/50 p-4 rounded mb-8 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#B42318] mb-1.5">
                Code Review
              </div>
              <div className="text-[13px] text-[#1C1917] leading-relaxed">
                {assessmentResult.aiFeedback}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleReturn("/candidate/verification")}
              className="flex-1 px-5 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verification Results</span>
            </button>
            <button
              onClick={() => handleReturn("/candidate/dashboard")}
              className="flex-1 px-5 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error screens ──────────────────────────────────────────────────────────

  if (errorMsg) {
    if (errorMsg === "SKILL NOT FOUND") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#B42318] mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Skill not in your profile
            </h2>
            <p className="text-[14px] text-[#78716C] mb-8">
              The skill &quot;{skillParam}&quot; is not part of your Technical Identity. Add it to
              your profile before starting verification.
            </p>
            <button
              onClick={() => handleReturn("/candidate/profile")}
              className="w-full h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
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
          <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#16A34A] mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Already Verified
            </h2>
            <p className="text-[14px] text-[#78716C] mb-8">
              You have already successfully passed the assessment for {skillParam}. Your
              verification is recorded and visible to employers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleReturn("/candidate/verification")}
                className="flex-1 h-11 border border-[#064E3B] bg-[#064E3B] text-white font-semibold text-[14px] rounded hover:bg-[#043327] transition-colors focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verification Results</span>
              </button>
              <button
                onClick={() => handleReturn("/candidate/dashboard")}
                className="flex-1 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Cooldown / generic error
    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#E7E2DA] bg-white rounded p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold text-[#B42318] mb-2">
            Assessment cooldown active
          </h2>
          <p className="text-[14px] text-[#78716C] mb-6">
            You are currently in a mandatory cooldown period for this skill.
          </p>
          <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-5 rounded mb-8">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleReturn("/candidate/verification")}
              className="flex-1 h-11 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verification Records</span>
            </button>
            <button
              onClick={() => handleReturn("/candidate/dashboard")}
              className="flex-1 h-11 border border-[#E7E2DA] text-[#1C1917] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Dashboard
            </button>
          </div>
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
            <div className="border border-[#E7E2DA] bg-white rounded overflow-hidden">
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
                    value: "60 minutes — the countdown starts immediately when you begin.",
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4 text-[#78716C]" />,
                    label: "Evaluation model",
                    value: content.hasCoding
                      ? "Strict 40% MCQs (15 questions) + 60% Practical Coding Challenge."
                      : "100% Comprehensive Technical Evaluation.",
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4 text-[#78716C]" />,
                    label: "Passing threshold",
                    value: "80% minimum score required to earn the verified skill credential.",
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
                    label: "Retake policy",
                    value:
                      "Failing below 80% applies a 14-day cooldown before you can reattempt this assessment.",
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
            <div className="border border-[#E7E2DA] bg-white rounded p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded">
                  <div className="text-[12px] text-[#78716C] mb-1">Time limit</div>
                  <div className="text-[15px] font-semibold text-[#1C1917] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#78716C]" /> 60 minutes
                  </div>
                </div>
                <div className="border border-[#E7E2DA] bg-[#F8F6F3] p-4 rounded">
                  <div className="text-[12px] text-[#78716C] mb-1">Format</div>
                  <div className="text-[15px] font-semibold text-[#1C1917]">
                    {content.hasCoding ? "15 MCQs + Coding" : `${content.mcqs.length} MCQs`}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStart}
                  className="flex-1 h-12 border border-[#1C1917] bg-[#1C1917] text-white font-semibold text-[14px] rounded hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  I understand — Start Assessment
                </button>
                <button
                  onClick={() => router.push("/candidate/verification")}
                  className="flex-1 h-12 border border-[#E7E2DA] text-[#78716C] font-semibold text-[14px] rounded hover:border-[#1C1917] hover:text-[#1C1917] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
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
          reason={infractionOverlay.reason}
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
        <header className="flex items-center justify-between border-b border-[#E7E2DA] px-4 sm:px-6 py-3 shrink-0 bg-white/95 backdrop-blur-xs">
          <div className="flex items-center gap-3 truncate mr-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-[#1C1917] shrink-0">
              MERITLANE
            </span>
            <span className="text-[#D4CFCB] shrink-0">/</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 px-2.5 py-0.5 rounded shrink-0">
              <ShieldAlert className="h-3 w-3 text-[#064E3B]" />
              {skillParam} Verification
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2 py-0.5 rounded">
              <Maximize2 className="h-2.5 w-2.5 text-[#064E3B]" /> Proctored Session
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress counter */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded">
              <span>MCQs:</span>
              <strong className="text-[#1C1917]">{mcqAnswers.filter((a) => a !== undefined).length}/{content.mcqs.length}</strong>
            </div>

            {/* Violation counter */}
            {infractionCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D97706] border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 rounded animate-in fade-in">
                <AlertTriangle className="h-3 w-3" />
                {infractionCount}/{MAX_VIOLATIONS} warnings
              </div>
            )}

            {/* High-visibility Timer Badge */}
            <div
              className={`flex items-center gap-1.5 font-mono text-[13px] font-bold tracking-wider px-3 py-1 rounded border transition-colors ${
                timeLeft < 300
                  ? "bg-[#FEF2F2] border-[#FECACA] text-[#B42318] animate-pulse"
                  : timeLeft < 900
                  ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                  : "bg-[#FAF8F5] border-[#E7E2DA] text-[#1C1917]"
              }`}
              title="Assessment time remaining"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        {phase === "mcq" && (
          <div className="flex-1 flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-3xl space-y-6">
              {/* Question Navigator Ribbon */}
              <div className="bg-white border border-[#E7E2DA] rounded p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono uppercase tracking-wider text-[#78716C]">
                  <span className="font-semibold text-[#1C1917]">
                    Multiple Choice Questions
                  </span>
                  <div className="flex items-center gap-3">
                    {flaggedQuestions.filter(Boolean).length > 0 && (
                      <span className="text-[#D97706] font-semibold flex items-center gap-1">
                        <Flag className="h-3 w-3 fill-[#D97706]" /> {flaggedQuestions.filter(Boolean).length} flagged
                      </span>
                    )}
                    <span>
                      Answered: <strong className="text-[#1C1917]">{mcqAnswers.filter((a) => a !== undefined).length}</strong> / {content.mcqs.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.mcqs.map((_, i) => {
                    const isAnswered = mcqAnswers[i] !== undefined;
                    const isCurrent = mcqIndex === i;
                    const isFlagged = flaggedQuestions[i];
                    return (
                      <button
                        key={i}
                        onClick={() => setMcqIndex(i)}
                        className={`relative w-8 h-8 rounded text-[12px] font-mono font-semibold transition-all flex items-center justify-center ${
                          isCurrent
                            ? "bg-[#1C1917] text-white ring-2 ring-[#1C1917] ring-offset-1"
                            : isAnswered
                            ? "bg-[#064E3B] text-white"
                            : "bg-[#FAF8F5] text-[#78716C] border border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
                        } ${isFlagged ? "ring-2 ring-[#D97706]" : ""}`}
                        title={`Question ${i + 1}${isAnswered ? " (Answered)" : " (Unanswered)"}${isFlagged ? " [Flagged for Review]" : ""}`}
                      >
                        {i + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D97706] rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white border border-[#E7E2DA] rounded p-6 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#E7E2DA]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917]">
                      Question {mcqIndex + 1} of {content.mcqs.length}
                    </span>
                    {content.mcqs[mcqIndex]?.difficulty && (
                      <span
                        className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          content.mcqs[mcqIndex].difficulty === "hard"
                            ? "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                            : content.mcqs[mcqIndex].difficulty === "medium"
                            ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                            : "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
                        }`}
                      >
                        {content.mcqs[mcqIndex].difficulty}
                      </span>
                    )}
                    {content.mcqs[mcqIndex]?.topic && (
                      <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA]">
                        {content.mcqs[mcqIndex].topic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFlagQuestion(mcqIndex)}
                    className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded transition-colors border ${
                      flaggedQuestions[mcqIndex]
                        ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] font-semibold"
                        : "bg-white text-[#78716C] border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
                    }`}
                  >
                    <Flag className={`h-3 w-3 ${flaggedQuestions[mcqIndex] ? "fill-[#D97706] text-[#D97706]" : ""}`} />
                    {flaggedQuestions[mcqIndex] ? "Flagged for Review" : "Flag for Review"}
                  </button>
                </div>

                <h3 className="text-[17px] sm:text-[19px] font-medium text-[#1C1917] mb-6 leading-relaxed whitespace-pre-wrap font-sans">
                  {content.mcqs[mcqIndex]?.question}
                </h3>

                <div className="space-y-3">
                  {content.mcqs[mcqIndex]?.options.map((opt, idx) => {
                    const isSelected = mcqAnswers[mcqIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectMcq(idx)}
                        className={`w-full text-left p-4 rounded border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? "border-[#1C1917] bg-[#FAF8F5] ring-1 ring-[#1C1917] shadow-xs"
                            : "border-[#E7E2DA] bg-white hover:border-[#1C1917]/50 hover:bg-[#FAFAF9]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                            isSelected
                              ? "bg-[#1C1917] text-white"
                              : "border border-[#D4CFCB] text-[#78716C] bg-white"
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-[14px] leading-relaxed font-sans ${isSelected ? "text-[#1C1917] font-medium" : "text-[#44403C]"}`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setMcqIndex((prev) => Math.max(0, prev - 1))}
                    disabled={mcqIndex === 0}
                    className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold border border-[#E7E2DA] bg-white text-[#1C1917] rounded hover:border-[#1C1917] disabled:opacity-40 disabled:hover:border-[#E7E2DA] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    onClick={() => setMcqIndex((prev) => Math.min(content.mcqs.length - 1, prev + 1))}
                    disabled={mcqIndex === content.mcqs.length - 1}
                    className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold border border-[#E7E2DA] bg-white text-[#1C1917] rounded hover:border-[#1C1917] disabled:opacity-40 disabled:hover:border-[#E7E2DA] transition-colors flex items-center justify-center gap-1.5"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  {content.hasCoding ? (
                    <button
                      onClick={() => setPhase("coding")}
                      className="w-full sm:w-auto px-5 py-2 text-[13px] font-semibold bg-[#064E3B] text-white rounded hover:bg-[#043327] transition-colors flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span>Proceed to Coding Challenge</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full sm:w-auto px-5 py-2 text-[13px] font-semibold bg-[#064E3B] text-white rounded hover:bg-[#043327] transition-colors flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span>Review &amp; Submit</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "coding" && content.coding && (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-3 gap-3 bg-[#F4F1EA] min-h-0">
            {/* Left Pane: Problem Description & Guidelines */}
            <div className="w-full lg:w-[42%] lg:max-w-[560px] bg-white border border-[#E7E2DA] rounded flex flex-col h-[38vh] lg:h-full shrink-0 overflow-hidden shadow-xs min-h-0">
              {/* Problem Tab Header */}
              <div className="flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5] px-4 py-2.5 shrink-0">
                <div className="flex items-center gap-2 truncate mr-2">
                  <button
                    onClick={() => setPhase("mcq")}
                    className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#78716C] bg-white hover:text-[#1C1917] hover:border-[#1C1917] border border-[#E7E2DA] px-2 py-0.5 rounded transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" /> MCQs ({mcqAnswers.filter((a) => a !== undefined).length}/{content.mcqs.length})
                  </button>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded shrink-0">
                    Challenge
                  </span>
                  <span className="text-[13px] font-sans font-semibold text-[#1C1917] truncate">
                    {content.coding.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#78716C] bg-white border border-[#E7E2DA] px-2 py-0.5 rounded shrink-0">
                  {selectedLanguage.toUpperCase()}
                </span>
              </div>

              {/* Problem Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-h-0">
                <div>
                  <h3 className="text-[12px] font-mono font-medium text-[#78716C] uppercase tracking-wider mb-2">
                    Description &amp; Specifications
                  </h3>
                  <div className="text-[14px] leading-relaxed text-[#1C1917] whitespace-pre-wrap font-sans space-y-3 bg-[#FAF8F5] p-4 rounded border border-[#E7E2DA]">
                    {content.coding.instructions}
                  </div>
                </div>

                <div className="border border-[#E7E2DA] rounded p-4 bg-white">
                  <h4 className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#064E3B] mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Examination Rule
                  </h4>
                  <p className="text-[12px] leading-relaxed text-[#78716C]">
                    Complete the solution implementation. You can select your preferred programming language and compile against public test cases before submitting for authoritative evaluation.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Pane: Code Editor + Test Console */}
            <div className="flex flex-1 flex-col gap-3 min-h-0 overflow-hidden">
              {/* Top Section: Code Editor Pane */}
              <div className="flex-1 min-h-0 bg-white border border-[#E7E2DA] rounded flex flex-col overflow-hidden shadow-xs">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5] px-4 py-2 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Code className="h-4 w-4 text-[#064E3B]" />
                    <span className="text-[12px] font-mono font-medium text-[#1C1917]">
                      Solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'sql' ? 'sql' : 'js'}
                    </span>
                    {draftSavedToast && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#064E3B] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#BBF7D0] animate-in fade-in duration-150">
                        <Check className="h-3 w-3" /> Draft saved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFormatCode}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#78716C] hover:text-[#1C1917] hover:border-[#1C1917] bg-white border border-[#E7E2DA] px-2.5 py-1 rounded transition-colors"
                      title="Format indentation (4 spaces) and clean trailing whitespace"
                    >
                      <Sparkles className="h-3 w-3 text-[#D97706]" /> Format
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#78716C] hover:text-[#B42318] hover:border-[#FECACA] bg-white border border-[#E7E2DA] px-2.5 py-1 rounded transition-colors"
                      title="Reset code to default starting template"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                    <span className="text-[11px] font-mono text-[#78716C] uppercase">Language:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="text-[12px] font-mono font-medium border border-[#E7E2DA] rounded px-2.5 py-1 bg-white text-[#1C1917] outline-none hover:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]"
                    >
                      {(content.coding?.supportedLanguages || COMMON_SUPPORTED_LANGUAGES).map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Editor Area with Synchronous Line Numbers Scroll */}
                <div className="flex-1 min-h-0 relative flex overflow-hidden bg-[#FAFAF9]">
                  {/* Line Numbers Column */}
                  <div
                    ref={lineNumbersRef}
                    className="w-12 py-4 select-none text-right pr-3 font-mono text-[12px] text-[#A8A29E] bg-[#F5F5F4] border-r border-[#E7E2DA] leading-[1.6] overflow-hidden shrink-0 pointer-events-none"
                  >
                    {(code || "").split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Code Input */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      updateCursorPosition();
                    }}
                    onKeyUp={updateCursorPosition}
                    onClick={updateCursorPosition}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={(e) => {
                      if (lineNumbersRef.current) {
                        lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    spellCheck={false}
                    aria-label="Code editor"
                    className="flex-1 min-h-0 h-full resize-none overflow-y-auto overflow-x-auto bg-transparent font-mono text-[13px] leading-[1.6] text-[#1C1917] outline-none p-4 selection:bg-[#064E3B] selection:text-white"
                    placeholder="// Write your solution implementation here... (Tab to indent 4 spaces, Ctrl+Enter to run, Ctrl+S to save draft)"
                  />
                </div>

                {/* Shortcuts & Editor Hints Bar */}
                <div className="px-4 py-1.5 bg-[#FAF8F5] border-t border-[#E7E2DA] text-[11px] font-mono text-[#78716C] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A8A29E]">Shortcuts:</span>
                    <span className="bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[10px] text-[#1C1917] font-semibold">Tab</span>
                    <span>Indent ·</span>
                    <span className="bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[10px] text-[#1C1917] font-semibold">Ctrl+Enter</span>
                    <span>Run ·</span>
                    <span className="bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[10px] text-[#1C1917] font-semibold">Ctrl+S</span>
                    <span>Save</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#78716C]">
                    <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                    <span className="hidden sm:inline text-[#D6D3D1]">|</span>
                    <span className="hidden sm:inline">{code?.length || 0} chars</span>
                    <span className="hidden sm:inline text-[#D6D3D1]">|</span>
                    <span className="text-[#064E3B] font-semibold">{selectedLanguage.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Testcase Console & Action Buttons */}
              <div className="h-[220px] lg:h-[245px] bg-white border border-[#E7E2DA] rounded flex flex-col overflow-hidden shadow-xs shrink-0">
                {/* Console Tab Header */}
                <div className="flex items-center justify-between border-b border-[#E7E2DA] bg-[#FAF8F5] px-4 py-2 shrink-0">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveConsoleTab("console")}
                      className={`text-[12px] font-sans font-semibold pb-1 border-b-2 transition-colors ${
                        activeConsoleTab === "console"
                          ? "border-[#064E3B] text-[#064E3B]"
                          : "border-transparent text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      Console Output
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("testcases")}
                      className={`text-[12px] font-sans font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeConsoleTab === "testcases"
                          ? "border-[#064E3B] text-[#064E3B]"
                          : "border-transparent text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      <span>Test Cases</span>
                      {testRunStats && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            testRunStats.passed === testRunStats.total
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#FEF2F2] text-[#991B1B]"
                          }`}
                        >
                          {testRunStats.passed}/{testRunStats.total}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("custom")}
                      className={`text-[12px] font-sans font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeConsoleTab === "custom"
                          ? "border-[#064E3B] text-[#064E3B]"
                          : "border-transparent text-[#78716C] hover:text-[#1C1917]"
                      }`}
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Custom Input</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeConsoleTab === "console" && output && (
                      <button
                        onClick={handleClearOutput}
                        className="text-[11px] font-mono text-[#78716C] hover:text-[#1C1917] border border-[#E7E2DA] px-2 py-1 bg-white rounded transition-colors"
                        title="Clear console output"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => handleTest(false)}
                      disabled={evaluating || timeLeft <= 0}
                      className="text-[12px] font-sans font-semibold border border-[#E7E2DA] px-3 py-1.5 text-[#1C1917] hover:bg-[#FAF8F5] disabled:opacity-50 rounded transition-colors bg-white shadow-2xs"
                    >
                      {evaluating ? "Running..." : activeConsoleTab === "custom" ? "Run Custom" : "Run Code"}
                    </button>
                    <button
                      onClick={() => handleTest(true)}
                      disabled={evaluating || timeLeft <= 0}
                      className="text-[12px] font-sans font-semibold bg-[#064E3B] text-white px-4 py-1.5 hover:bg-[#043327] disabled:opacity-50 rounded transition-colors shadow-2xs"
                    >
                      Submit
                    </button>
                  </div>
                </div>

                {/* Console Log, Test Output, or Custom Test Runner */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed text-[#1C1917] scrollbar-hide bg-[#FAFAF9]">
                  {activeConsoleTab === "custom" ? (
                    <div className="flex flex-col h-full space-y-2 font-sans">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                        <span>Interactive Input Parameters / Arguments:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#A8A29E]">Presets:</span>
                          <button
                            onClick={() => setCustomInput("T1,USD,100.50,COMPLETED\nT2,USD,50.25,PENDING\nT3,EUR,75.00,COMPLETED")}
                            className="text-[10px] bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[#1C1917] hover:border-[#1C1917]"
                          >
                            Sample 1
                          </button>
                          <button
                            onClick={() => setCustomInput("TX1,CAD,200.00,COMPLETED\nTX2,CAD,150.00,COMPLETED")}
                            className="text-[10px] bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[#1C1917] hover:border-[#1C1917]"
                          >
                            Sample 2
                          </button>
                          <button
                            onClick={() => setCustomInput("")}
                            className="text-[10px] bg-white border border-[#E7E2DA] px-1.5 py-0.5 rounded text-[#78716C] hover:text-[#B42318]"
                          >
                            Empty
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Provide test arguments or stdin (e.g. CSV lines or parameter arguments) to test your implementation."
                        className="w-full flex-1 p-3 font-mono text-[12px] bg-white border border-[#E7E2DA] rounded outline-none focus:border-[#1C1917] resize-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1">
                        <span>Click <strong>Run Custom</strong> or press <strong>Ctrl+Enter</strong> to execute with this input.</span>
                      </div>
                    </div>
                  ) : activeConsoleTab === "console" ? (
                    <pre className={`whitespace-pre-wrap font-mono ${output.includes("[Compilation / Syntax Error]") || output.includes("[Execution Error]") ? "text-[#B42318]" : "text-[#57534E]"}`}>
                      {output || "Ready. Click 'Run Code' to execute against sample test cases."}
                    </pre>
                  ) : (
                    <div className="space-y-3 font-sans">
                      {testRunStats ? (
                        <>
                          <div className="space-y-2 pb-2 border-b border-[#E7E2DA]">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                              <span>Execution Time: <strong className="text-[#1C1917]">{testRunStats.durationMs}ms</strong></span>
                              <span className={testRunStats.passed === testRunStats.total ? "text-[#064E3B] font-semibold" : "text-[#B42318] font-semibold"}>
                                {testRunStats.passed === testRunStats.total ? "All Test Cases Passed" : `${testRunStats.total - testRunStats.passed} of ${testRunStats.total} Failed`}
                              </span>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="w-full bg-[#E7E2DA] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  testRunStats.passed === testRunStats.total ? "bg-[#064E3B]" : "bg-[#B42318]"
                                }`}
                                style={{ width: `${(testRunStats.passed / Math.max(1, testRunStats.total)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            {testRunStats.cases.map((tCase, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded border text-[12px] ${
                                  tCase.passed
                                    ? "bg-[#F0FDF4] border-[#BBF7D0]"
                                    : "bg-[#FEF2F2] border-[#FECACA]"
                                }`}
                              >
                                <div className="flex items-center justify-between font-semibold mb-1">
                                  <span className="text-[#1C1917]">{tCase.name}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                                    tCase.passed ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                                  }`}>
                                    {tCase.passed ? "Passed" : "Failed"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#57534E] mt-1 pt-1 border-t border-black/5">
                                  <div>Expected: <span className="text-[#1C1917]">{tCase.expected}</span></div>
                                  <div>Actual: <span className={tCase.passed ? "text-[#166534]" : "text-[#991B1B] font-bold"}>{tCase.actual}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5 text-[13px] text-[#78716C]">
                          Click <strong className="text-[#1C1917]">Run Code</strong> to execute test assertions.
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white rounded border border-[#E7E2DA] shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E7E2DA]">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#FEF2F2] text-[#B42318] border border-[#FECACA]">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1C1917]">Reset Code to Template</h3>
                <p className="text-[12px] text-[#78716C]">Restore starting solution code</p>
              </div>
            </div>
            <p className="text-[13px] text-[#78716C] leading-relaxed mb-6">
              Are you sure you want to reset your code to the starter template? All uncommitted edits in this editor will be replaced.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-10 border border-[#E7E2DA] text-[#78716C] font-semibold text-[13px] rounded hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCode}
                className="flex-1 h-10 bg-[#B42318] text-white font-semibold text-[13px] rounded hover:bg-[#991B1B] transition-colors"
              >
                Reset Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white rounded border border-[#E7E2DA] shadow-xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E7E2DA]">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA]">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1C1917]">Confirm Final Submission</h3>
                <p className="text-[12px] text-[#78716C]">MeritLane Technical Assessment</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="border border-[#E7E2DA] bg-[#FAF8F5] p-3 rounded flex items-center justify-between text-[13px]">
                <span className="text-[#78716C]">Multiple Choice:</span>
                <span className="font-semibold text-[#1C1917]">
                  {mcqAnswers.filter((a) => a !== undefined).length} of {content.mcqs.length} answered
                </span>
              </div>

              {flaggedQuestions.filter(Boolean).length > 0 && (
                <div className="border border-[#FDE68A] bg-[#FFFBEB] p-3 rounded flex items-start gap-2 text-[12px] text-[#92400E]">
                  <Flag className="h-4 w-4 shrink-0 mt-0.5 fill-[#D97706] text-[#D97706]" />
                  <span>
                    You have <strong>{flaggedQuestions.filter(Boolean).length}</strong> question(s) flagged for review.
                  </span>
                </div>
              )}

              {mcqAnswers.filter((a) => a !== undefined).length < content.mcqs.length && (
                <div className="border border-[#FDE68A] bg-[#FFFBEB] p-3 rounded flex items-start gap-2 text-[12px] text-[#92400E]">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    You have {content.mcqs.length - mcqAnswers.filter((a) => a !== undefined).length} unanswered questions. Unanswered questions receive 0 points.
                  </span>
                </div>
              )}

              {content.hasCoding && (
                <div className="border border-[#E7E2DA] bg-[#FAF8F5] p-3 rounded flex items-center justify-between text-[13px]">
                  <span className="text-[#78716C]">Coding ({selectedLanguage.toUpperCase()}):</span>
                  <span className="font-semibold text-[#1C1917]">
                    {testRunStats ? `${testRunStats.passed}/${testRunStats.total} public tests passed` : "Solution ready"}
                  </span>
                </div>
              )}

              <div className="border border-[#E7E2DA] bg-[#FAF8F5] p-3 rounded flex items-center justify-between text-[13px]">
                <span className="text-[#78716C]">Time Remaining:</span>
                <span className="font-mono font-semibold text-[#1C1917]">{formatTime(timeLeft)}</span>
              </div>

              <p className="text-[12px] text-[#78716C] leading-relaxed pt-1">
                Once submitted, your answers and code will be authoritatively graded against hidden test suites. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={evaluating}
                className="flex-1 h-10 border border-[#E7E2DA] text-[#78716C] font-semibold text-[13px] rounded hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
              >
                Return to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={evaluating}
                className="flex-1 h-10 bg-[#064E3B] text-white font-semibold text-[13px] rounded hover:bg-[#043327] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {evaluating ? "Evaluating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
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
