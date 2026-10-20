"use client";

import React, { useEffect, useState, useRef, Suspense, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Monitor,
  Maximize2,
  Minimize2,
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
  Copy,
  Sun,
  Moon,
  Cpu,
  Layers,
  FileCode,
  ExternalLink,
  X,
  Lock,
  Loader2,
  Trophy,
  Award,
  Star,
} from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { auth } from "@/lib/firebase/config";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { AssessmentWatermark } from "@/components/candidate/AssessmentWatermark";

import { COMMON_SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/assessments/content";
import CooldownTimer from "@/components/candidate/cooldown-timer";

import { loader } from "@monaco-editor/react";

if (typeof window !== "undefined") {
  loader.config({
    paths: {
      vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
    },
  });
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 min-h-[300px] w-full h-full flex flex-col items-center justify-center bg-[#0D1117] text-[#8B949E] font-mono text-[13px] gap-3">
      <MeritlaneLoader level="section" text="Initializing Code Compiler…" />
    </div>
  ),
});

export interface MCQ {
  id?: string;
  question: string;
  options: string[];
  answerIndex?: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
}

export interface CodingChallenge {
  id?: string;
  title: string;
  instructions: string;
  initialCode: string;
  language?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  supportedLanguages?: SupportedLanguage[];
}

export interface AssessmentContent {
  mcqs: MCQ[];
  coding?: CodingChallenge;
  codingTasks?: CodingChallenge[];
  hasCoding: boolean;
  timeLimitMinutes: number;
  assessmentType?: "coding_capable" | "mcq_only";
  track?: "standard" | "advanced";
}

// ─── LeetCode-style Problem Description Formatter ────────────────────────────

function parseLeetCodeExamples(raw: string) {
  if (!raw) return [];
  const text = raw.replace(/\r/g, "");
  const exRegex = /(?:\*\*)?Example(?:\s*:\s*Example)?\s*\d*:?\*?\*?[\s\S]*?(?:Input:?\*{0,2}\s*([\s\S]*?))\s*(?:Output:?\*{0,2}\s*([\s\S]*?))(?=(?:(?:\*\*)?Example|Explanation:?\*{0,2}|Constraints:|$|```))/gi;
  const list: Array<{ input: string; output: string }> = [];
  let m;
  while ((m = exRegex.exec(text)) !== null) {
    const inStr = m[1].replace(/```/g, "").replace(/[\*~]/g, "").trim();
    const outStr = m[2].replace(/```/g, "").replace(/[\*~]/g, "").trim();
    if (inStr && outStr) {
      list.push({ input: inStr, output: outStr });
    }
  }
  return list;
}

function parseLeetCodeInstructions(raw: string) {
  if (!raw) return { description: "", examples: [], constraints: [] };
  const text = raw.replace(/\r/g, "").trim();

  // Extract constraints
  let constraints: string[] = [];
  const constrMatch = text.match(/(?:Constraints:?\*{0,2}|Constraints:)([\s\S]*)$/i);
  let mainAndExamples = text;
  if (constrMatch) {
    mainAndExamples = text.slice(0, constrMatch.index).trim();
    const constrBlock = constrMatch[1];
    constraints = constrBlock
      .split("\n")
      .map((line) => line.replace(/^[-*•\t\s]+/, "").replace(/`+/g, "").replace(/\*+/g, "").replace(/~/g, "").trim())
      .filter((line) => line.length > 0 && !line.startsWith("Follow-up") && line !== "19" && line !== "- 19");
  }

  // Find where examples start
  const exStart = mainAndExamples.search(/(?:\*\*)?Example(?:\s*:\s*Example)?\s*1:?/i);
  const description = exStart > 0 
    ? mainAndExamples.slice(0, exStart).replace(/```/g, "").replace(/\*\*/g, "").replace(/~/g, "").trim() 
    : mainAndExamples.split(/(?:\*\*)?Example/i)[0].replace(/\*\*/g, "").replace(/~/g, "").trim();

  const examples: Array<{ num: string; input: string; output: string; explanation?: string }> = [];
  const blocks = mainAndExamples.split(/(?=(?:\*\*)?Example(?:\s*:\s*Example)?\s*\d+:?)/i);
  for (const block of blocks) {
    const numMatch = block.match(/Example(?:\s*:\s*Example)?\s*(\d+)/i);
    if (!numMatch) continue;
    const exNum = numMatch[1];

    const inMatch = block.match(/Input:?\*{0,2}\s*([\s\S]*?)(?=Output:?\*{0,2}|$)/i);
    const outMatch = block.match(/Output:?\*{0,2}\s*([\s\S]*?)(?=Explanation:?\*{0,2}|$)/i);
    const expMatch = block.match(/Explanation:?\*{0,2}\s*([\s\S]*?)$/i);

    const inputVal = inMatch ? inMatch[1].replace(/```/g, "").replace(/[\*~]/g, "").trim() : "";
    const outputVal = outMatch ? outMatch[1].replace(/```/g, "").replace(/[\*~]/g, "").trim() : "";
    const explanationVal = expMatch ? expMatch[1].replace(/```/g, "").replace(/[\*~]/g, "").trim() : undefined;

    if (inputVal || outputVal) {
      examples.push({
        num: exNum,
        input: inputVal,
        output: outputVal,
        explanation: explanationVal,
      });
    }
  }

  return { description, examples, constraints };
}

function LeetCodeProblemDescription({ instructions }: { instructions: string }) {
  const parsed = useMemo(() => parseLeetCodeInstructions(instructions), [instructions]);

  if (parsed.examples.length === 0) {
    return (
      <div className="text-[13.5px] leading-relaxed text-foreground whitespace-pre-wrap font-sans space-y-3">
        {instructions}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[13.5px] leading-relaxed text-foreground font-sans">
      {/* Problem statement description */}
      <div className="space-y-3">
        {parsed.description.split("\n\n").map((p, pIdx) => {
          const clean = p.trim();
          if (!clean) return null;
          const parts = clean.split(/(`[^`]+`)/g);
          return (
            <p key={pIdx} className="text-foreground/90 leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                  return (
                    <code
                      key={i}
                      className="bg-surface border border-border text-emerald-900 font-mono text-[12px] px-1.5 py-0.5 rounded mx-0.5"
                    >
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>

      {/* Styled Example Cards */}
      {parsed.examples.map((ex, exIdx) => (
        <div key={exIdx} className="space-y-1.5">
          <div className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <span>Example {ex.num}:</span>
          </div>
          <div className="bg-surface/80 border border-border rounded-lg p-3 space-y-1.5 text-[12.5px] font-mono shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-semibold text-muted-foreground select-none shrink-0 font-sans">Input:</span>
              <span className="text-foreground break-all">{ex.input}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-semibold text-muted-foreground select-none shrink-0 font-sans">Output:</span>
              <span className="text-foreground font-semibold break-all">{ex.output}</span>
            </div>
            {ex.explanation && (
              <div className="flex flex-col sm:flex-row sm:gap-2 pt-1 border-t border-border">
                <span className="font-semibold text-muted-foreground select-none shrink-0 font-sans">Explanation:</span>
                <span className="text-foreground/80 font-sans text-[12px]">{ex.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Constraints */}
      {parsed.constraints.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-[13px] font-semibold text-foreground">Constraints:</div>
          <ul className="space-y-1.5 list-disc list-inside text-[12px] text-muted-foreground font-mono">
            {parsed.constraints.map((c, cIdx) => (
              <li key={cIdx} className="leading-normal">
                <code className="bg-surface border border-border px-1.5 py-0.5 rounded text-foreground text-[11.5px]">
                  {c}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
      <div className="w-full max-w-md bg-white rounded border border-border shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className={`h-1.5 w-full ${isFinal ? "bg-danger" : "bg-amber-600"}`} />

        <div className="p-8">
          <div
            className={`mx-auto mb-5 h-14 w-14 rounded flex items-center justify-center ${
              isFinal ? "bg-danger/10" : "bg-[#FFFBEB]"
            }`}
          >
            {isFinal ? (
              <XCircle className="h-7 w-7 text-danger" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            )}
          </div>

          <div className="text-center">
            <div
              className={`text-[11px] font-medium uppercase tracking-[0.15em] mb-2 font-semibold ${
                isFinal ? "text-danger" : "text-amber-600"
              }`}
            >
              Integrity Warning — Warning {violationCount} of {maxViolations}
            </div>

            <h2 className="text-[20px] font-semibold text-foreground mb-2 leading-tight">
              {isFinal ? "Assessment Terminated" : reason || "Proctoring Violation Detected"}
            </h2>

            <div className="bg-surface border border-border rounded p-3.5 mb-5 text-[12px] font-mono text-muted-foreground text-left">
              <span className="font-semibold text-foreground">Integrity Policy:</span> Switching tabs, minimising the window, or navigating away is strictly monitored and recorded.
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              {isFinal ? (
                <>
                  Your assessment has been automatically terminated due to reaching {maxViolations} integrity violations. A mandatory <strong className="text-danger">21-day cooldown</strong> has been applied to your record.
                </>
              ) : requiresUserGesture ? (
                <>
                  Your assessment must remain in active fullscreen focus.{" "}
                  <strong className="text-foreground">
                    {remaining} warning{remaining !== 1 ? "s" : ""} remaining
                  </strong>{" "}
                  before immediate termination and 21-day cooldown. Click below to return.
                </>
              ) : (
                <>
                  Your assessment must remain in active fullscreen focus.{" "}
                  <strong className="text-foreground">
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
                className="w-full h-11 bg-foreground text-white text-[14px] font-semibold rounded
                           hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2
                           focus:ring-foreground focus:ring-offset-2 flex items-center justify-center gap-2"
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
      <div className="w-full max-w-md bg-white rounded border border-border shadow-xl p-8 text-center">
        <div className="mx-auto mb-5 h-14 w-14 rounded bg-danger/10 flex items-center justify-center">
          <Monitor className="h-7 w-7 text-danger" />
        </div>
        <h2 className="text-[20px] font-semibold text-foreground mb-3">Fullscreen required</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
          MeritLane assessments must be completed in fullscreen mode to protect
          assessment integrity. Please allow fullscreen access to continue.
        </p>
        <button
          ref={btnRef}
          onClick={onRetry}
          className="w-full h-11 bg-foreground text-white text-[14px] font-semibold rounded
                     hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2
                     focus:ring-foreground focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <Maximize2 className="h-4 w-4" />
          Enter Fullscreen
        </button>
        <p className="mt-4 text-[12px] text-muted-foreground/70">
          If fullscreen is unavailable in your browser, please use a supported desktop browser
          (Chrome, Edge, or Firefox) to complete this assessment.
        </p>
      </div>
    </div>
  );
}

// ─── Main Assessment Component ────────────────────────────────────────────────

const MAX_VIOLATIONS = 2; // 1st violation = warning, 2nd violation = termination

const SKILL_LOCKED_LANGUAGES: Record<string, { id: string; name: string; monacoLang: string; ext: string }> = {
  go: { id: "go", name: "Go 1.22", monacoLang: "go", ext: "go" },
  golang: { id: "go", name: "Go 1.22", monacoLang: "go", ext: "go" },
  javascript: { id: "javascript", name: "JavaScript (Node/ES6)", monacoLang: "javascript", ext: "js" },
  js: { id: "javascript", name: "JavaScript (Node/ES6)", monacoLang: "javascript", ext: "js" },
  typescript: { id: "typescript", name: "TypeScript", monacoLang: "typescript", ext: "ts" },
  ts: { id: "typescript", name: "TypeScript", monacoLang: "typescript", ext: "ts" },
  python: { id: "python", name: "Python 3", monacoLang: "python", ext: "py" },
  py: { id: "python", name: "Python 3", monacoLang: "python", ext: "py" },
  sql: { id: "sql", name: "SQL", monacoLang: "sql", ext: "sql" },
  java: { id: "java", name: "Java 21", monacoLang: "java", ext: "java" },
  "c++": { id: "cpp", name: "C++ (GCC 14)", monacoLang: "cpp", ext: "cpp" },
  cpp: { id: "cpp", name: "C++ (GCC 14)", monacoLang: "cpp", ext: "cpp" },
  "c#": { id: "csharp", name: "C# (.NET 8)", monacoLang: "csharp", ext: "cs" },
  csharp: { id: "csharp", name: "C# (.NET 8)", monacoLang: "csharp", ext: "cs" },
  rust: { id: "rust", name: "Rust", monacoLang: "rust", ext: "rs" },
  c: { id: "c", name: "C (GCC 14)", monacoLang: "c", ext: "c" },
};

function getSkillLockedLanguage(skill: string): { id: string; name: string; monacoLang: string; ext: string } | null {
  const s = (skill || "").toLowerCase().trim();
  if (SKILL_LOCKED_LANGUAGES[s]) return SKILL_LOCKED_LANGUAGES[s];

  if (s === "go" || s === "golang" || /\b(go|golang)\b/i.test(s)) return SKILL_LOCKED_LANGUAGES["go"];
  if (s === "c#" || s === "csharp" || s.includes(".net")) return SKILL_LOCKED_LANGUAGES["csharp"];
  if (s === "c++" || s === "cpp") return SKILL_LOCKED_LANGUAGES["cpp"];
  if (s === "c") return SKILL_LOCKED_LANGUAGES["c"];
  if (s.includes("typescript") || s === "ts") return SKILL_LOCKED_LANGUAGES["typescript"];
  if (s.includes("javascript") || s === "js" || s.includes("react") || s.includes("node") || s.includes("vue") || s.includes("angular") || s.includes("next")) return SKILL_LOCKED_LANGUAGES["javascript"];
  if (s.includes("python") || s.includes("django") || s.includes("flask") || s.includes("fastapi")) return SKILL_LOCKED_LANGUAGES["python"];
  if (s.includes("java") && !s.includes("javascript")) return SKILL_LOCKED_LANGUAGES["java"];
  if (s.includes("rust")) return SKILL_LOCKED_LANGUAGES["rust"];
  if (/sql|mysql|postgres|sqlite|database/i.test(s)) return SKILL_LOCKED_LANGUAGES["sql"];

  return null;
}

function AssessmentContentWrapper() {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const skillParam = searchParams.get("skill") || "Software Engineering";
  
  const formatSkillName = (s: string) => {
    if (!s) return "";
    const aliases: Record<string, string> = {
      "c": "C",
      "c++": "C++",
      "cpp": "C++",
      "c#": "C#",
      "csharp": "C#",
      "js": "JavaScript",
      "javascript": "JavaScript",
      "ts": "TypeScript",
      "typescript": "TypeScript",
      "py": "Python",
      "python": "Python",
      "java": "Java",
      "golang": "Go",
      "go": "Go",
      "r": "R",
      "sql": "SQL",
      "react": "React",
      "react.js": "React",
      "reactjs": "React",
    };
    const lower = s.toLowerCase();
    if (aliases[lower]) return aliases[lower];
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const displaySkill = formatSkillName(skillParam);

  const lockedLang = getSkillLockedLanguage(skillParam);
  const isSqlSkill = /sql|mysql|postgres|sqlite|database/i.test(skillParam);
  const isLanguageLocked = Boolean(lockedLang || isSqlSkill);

  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const [retryAvailableAt, setRetryAvailableAt] = useState<string | null>(null);
  const [resettingLockout, setResettingLockout] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [infractionCount, setInfractionCount] = useState(0);
  const [integrityTerminated, setIntegrityTerminated] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const showExitWarningRef = useRef(false);
  useEffect(() => {
    showExitWarningRef.current = showExitWarning;
  }, [showExitWarning]);
  const [selectedTrack, setSelectedTrack] = useState<"standard" | "advanced">("standard");
  const [switchingTrack, setSwitchingTrack] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    passed: boolean;
    score: number;
    status: string;
    skill: string;
    retryAvailableAt?: string;
    aiFeedback?: string;
    track?: "standard" | "advanced";
    badge?: "verified_professional" | "gold_honors";
    assessmentScores?: {
      easy: number;
      easyPassed: boolean;
      easyPassedTests?: number;
      easyTotalTests?: number;
      medium: number;
      mediumPassed: boolean;
      mediumPassedTests?: number;
      mediumTotalTests?: number;
      mcq: number;
      mcqPassed: boolean;
      overall?: number;
      track?: string;
      badge?: string;
    };
    mcqs?: Array<{
      question: string;
      options: string[];
      answerIndex?: number;
      userAnswer?: number;
      explanation?: string;
      topic?: string;
      difficulty?: string;
      isCorrect?: boolean;
    }>;
    submittedCode?: {
      easy?: string;
      medium?: string;
      single?: string;
    };
    codingChallenges?: Array<{
      title: string;
      instructions: string;
      language?: string;
      initialCode?: string;
    }>;
    submittedLanguage?: string;
    submittedAt?: string;
    infractionCount?: number;
  } | null>(null);

  const [showFullReportModal, setShowFullReportModal] = useState<boolean>(false);
  const [reportActiveTab, setReportActiveTab] = useState<"mcq" | "code" | "review">("mcq");

  const [content, setContent] = useState<AssessmentContent | null>(null);
  const [phase, setPhase] = useState<"intro" | "mcq" | "coding">("intro");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<(number | undefined)[]>([]);
  // Bank-aware dual-task: codeEasy = Task 1 (easy), codeMedium = Task 2 (medium-hard)
  const [activeCodingTaskIdx, setActiveCodingTaskIdx] = useState<0 | 1>(0);
  const [codeEasy, setCodeEasy] = useState("");
  const [codeMedium, setCodeMedium] = useState("");
  // Default to 90 min (5400s) for coding-capable; will be corrected from server data
  const [timeLeft, setTimeLeft] = useState<number>(90 * 60);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    lockedLang ? lockedLang.id : (isSqlSkill ? "sql" : "python")
  );
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  // Task-isolated compiler outputs and test run statistics
  const [outputByTask, setOutputByTask] = useState<{ [taskIdx: number]: string }>({});
  const [testRunStatsByTask, setTestRunStatsByTask] = useState<{
    [taskIdx: number]: {
      total: number;
      passed: number;
      durationMs: number;
      cases: Array<{ name: string; input: string; expected: string; actual: string; passed: boolean; status?: string; runtimeMs?: number }>;
    } | null;
  }>({});
  const [selectedCaseIdxByTask, setSelectedCaseIdxByTask] = useState<{ [taskIdx: number]: number }>({});
  const [activeConsoleTabByTask, setActiveConsoleTabByTask] = useState<{ [taskIdx: number]: "console" | "testcases" | "custom" }>({});
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);

  // Active task accessors to guarantee 100% isolation between Task 1 and Task 2
  const output = outputByTask[activeCodingTaskIdx] || "";
  const setOutput = useCallback((val: string | ((prev: string) => string)) => {
    setOutputByTask((prev) => {
      const current = prev[activeCodingTaskIdx] || "";
      const next = typeof val === "function" ? val(current) : val;
      return { ...prev, [activeCodingTaskIdx]: next };
    });
  }, [activeCodingTaskIdx]);

  const testRunStats = testRunStatsByTask[activeCodingTaskIdx] || null;
  const setTestRunStats = useCallback((val: any) => {
    setTestRunStatsByTask((prev) => ({ ...prev, [activeCodingTaskIdx]: val }));
  }, [activeCodingTaskIdx]);

  const selectedCaseIdx = selectedCaseIdxByTask[activeCodingTaskIdx] ?? 0;
  const setSelectedCaseIdx = useCallback((idx: number) => {
    setSelectedCaseIdxByTask((prev) => ({ ...prev, [activeCodingTaskIdx]: idx }));
  }, [activeCodingTaskIdx]);

  const activeConsoleTab = activeConsoleTabByTask[activeCodingTaskIdx] || "testcases";
  const setActiveConsoleTab = useCallback((tab: "console" | "testcases" | "custom") => {
    setActiveConsoleTabByTask((prev) => ({ ...prev, [activeCodingTaskIdx]: tab }));
  }, [activeCodingTaskIdx]);

  const [customInput, setCustomInput] = useState<string>("");
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);
  const [useFallbackEditor, setUseFallbackEditor] = useState<boolean>(false);
  const [editorLoadTimeout, setEditorLoadTimeout] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("dark");
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const [copiedCodeToast, setCopiedCodeToast] = useState<boolean>(false);
  const [copiedInputIdx, setCopiedInputIdx] = useState<number | null>(null);
  const [submittingModal, setSubmittingModal] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<number>(0);

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

  // ── Browser Integrity Listeners ───────────────────────────────────────────

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Auto-recovery timer for editor initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!editorRef.current && phase === "coding") {
        setEditorLoadTimeout(true);
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── Init assessment ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Wait until firebase auth has completely settled
    if (loading) return;

    if (!user) {
      router.replace("/");
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
            track: selectedTrack,
            resetCooldown: searchParams.get("resetCooldown") === "true",
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 403 && data.isProctoringLockout) {
            setErrorMsg("PROCTORING LOCKOUT");
            if (data.retryAvailableAt) setRetryAvailableAt(data.retryAvailableAt);
          } else if (res.status === 403) setErrorMsg("SKILL NOT FOUND");
          else if (res.status === 429) {
            setErrorMsg("ASSESSMENT COOLDOWN ACTIVE");
            setCooldownDays(data.cooldownDays || 30);
            if (data.retryAvailableAt) setRetryAvailableAt(data.retryAvailableAt);
          } else if (res.status === 409) setErrorMsg("ALREADY VERIFIED");
          else setErrorMsg(data.error || "Failed to start assessment");
          setInitializing(false);
          return;
        }

        if (!data.content || !Array.isArray(data.content.mcqs) || data.content.mcqs.length === 0) {
          setErrorMsg("Assessment content is being prepared. Please click Retry.");
          setInitializing(false);
          return;
        }

        setContent(data.content);
        // Sync track from server response (especially for resumed sessions)
        if (data.track) setSelectedTrack(data.track);
        else if (data.content?.track) setSelectedTrack(data.content.track);
        const storageKey = user ? `ml_draft_${skillParam.toLowerCase().replace(/\s+/g, "_")}_${user.uid}` : null;
        let restoredDraft: any = null;
        if (storageKey) {
          // If starting a fresh assessment attempt, clear previous session drafts
          if (data.message === "Assessment started") {
            try { sessionStorage.removeItem(storageKey); } catch {}
          } else {
            try {
              const raw = sessionStorage.getItem(storageKey);
              if (raw) restoredDraft = JSON.parse(raw);
            } catch {
              /* ignore invalid json */
            }
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
          const isDebounce = /debounce/i.test(data.content.coding.title || "") || /debounce/i.test(data.content.coding.instructions || "");
          const isStaleDraft = isDebounce && restoredDraft?.code && /processTransactions|process_transactions/i.test(restoredDraft.code);

          if (restoredDraft?.code && typeof restoredDraft.code === "string" && !isStaleDraft) {
            setCode(restoredDraft.code);
          } else {
            setCode(data.content.coding.initialCode);
          }

          if (lockedLang) {
            setSelectedLanguage(lockedLang.id);
          } else if (isSqlSkill) {
            setSelectedLanguage("sql");
          } else if (restoredDraft?.selectedLanguage && typeof restoredDraft.selectedLanguage === "string") {
            setSelectedLanguage(restoredDraft.selectedLanguage);
          } else if (data.content.coding.language) {
            setSelectedLanguage(data.content.coding.language);
          }

          if (restoredDraft?.customInput && typeof restoredDraft.customInput === "string") {
            setCustomInput(restoredDraft.customInput);
          }
        }

        // ── Bank-aware dual-task: codingTasks[0]=easy, codingTasks[1]=medium ──
        if (data.content.codingTasks && Array.isArray(data.content.codingTasks)) {
          // Invariant: Deduplicate coding tasks so identical tasks never produce duplicate tabs
          const seenIds = new Set<string>();
          const seenTitles = new Set<string>();
          const uniqueTasks: CodingChallenge[] = [];
          for (const task of data.content.codingTasks) {
            if (!task) continue;
            const idKey = (task.id || "").trim();
            const titleKey = (task.title || "").trim().toLowerCase();
            if (idKey && seenIds.has(idKey)) continue;
            if (titleKey && seenTitles.has(titleKey)) continue;
            if (idKey) seenIds.add(idKey);
            if (titleKey) seenTitles.add(titleKey);
            uniqueTasks.push(task);
          }
          data.content.codingTasks = uniqueTasks;

          const easyTask = data.content.codingTasks[0];
          const mediumTask = data.content.codingTasks[1];
          setCodeEasy(restoredDraft?.codeEasy || easyTask?.initialCode || "");
          setCodeMedium(restoredDraft?.codeMedium || mediumTask?.initialCode || "");
          // Also set legacy `code` to easy task for initial editor display
          setCode(restoredDraft?.codeEasy || easyTask?.initialCode || "");
          
          if (lockedLang) {
            setSelectedLanguage(lockedLang.id);
          } else if (isSqlSkill) {
            setSelectedLanguage("sql");
          } else if (skillParam.toLowerCase().includes("python")) {
            setSelectedLanguage("python");
          } else if (restoredDraft?.selectedLanguage) {
            setSelectedLanguage(restoredDraft.selectedLanguage);
          } else if (easyTask?.supportedLanguages && easyTask.supportedLanguages.length > 0) {
            setSelectedLanguage(easyTask.supportedLanguages[0].id);
          } else {
            setSelectedLanguage("javascript");
          }
        }

        if (restoredDraft?.customInput && typeof restoredDraft.customInput === "string") {
          setCustomInput(restoredDraft.customInput);
        }

        if (data.startedAt) {
          const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
          // Use timeLimitMinutes from server (90 for coding, 35 for MCQ-only)
          const totalSecs = (data.content.timeLimitMinutes || 90) * 60;
          setTimeLeft(Math.max(0, totalSecs - elapsed));
        } else {
          const totalSecs = (data.content.timeLimitMinutes || 90) * 60;
          setTimeLeft(totalSecs);
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

  // Handle explicit track switching from pre-flight intro screen
  const handleTrackSelect = async (track: "standard" | "advanced") => {
    if (track === selectedTrack || switchingTrack) return;
    setSelectedTrack(track);
    setSwitchingTrack(true);
    try {
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/start-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: skillParam,
          track,
          switchTrack: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.content) {
        setContent(data.content);
        const resolvedTrack = data.track || data.content.track || track;
        setSelectedTrack(resolvedTrack);

        if (data.content.codingTasks && data.content.codingTasks.length > 0) {
          const easy = data.content.codingTasks[0];
          const med = data.content.codingTasks[1];
          setCodeEasy(easy?.initialCode || "");
          setCodeMedium(med?.initialCode || "");
          setCode(easy?.initialCode || "");
        } else if (data.content.coding) {
          setCode(data.content.coding.initialCode || "");
        }
      } else if (!res.ok) {
        console.error("Failed to switch track:", data.error);
      }
    } catch (err) {
      console.error("Track switch error:", err);
    } finally {
      setSwitchingTrack(false);
    }
  };

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

    // Call backend to persist proctoring termination, zero score, and lockout
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        await fetch("/api/candidate/record-infraction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ forceTerminate: true })
        });
      } catch (err) {
        console.error("Failed to notify backend of assessment termination:", err);
      }
    }

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* ignore */ }
    }

    // Fire PostHog analytics
    import("posthog-js").then((posthog) => {
      posthog.default.capture("assessment_integrity_terminated", { skill: skillParam });
    }).catch(() => {});

    // Fallback display if server unreachable (90 days)
    setRetryAvailableAt(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

    if (typeof window !== "undefined" && auth.currentUser) {
      localStorage.setItem(`meritlane_cooldown_${auth.currentUser.uid}_${skillParam}`, Date.now().toString());
      localStorage.setItem(`meritlane_last_score_${auth.currentUser.uid}_${skillParam}`, "0");
    }

    setAssessmentResult({
      passed: false,
      score: 0,
      status: "terminated",
      skill: skillParam,
      retryAvailableAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      aiFeedback: "The assessment was terminated due to an integrity violation (unauthorized navigation, tab switching, or screenshot).\n\nIf this was a mistake or system glitch, you can submit a query to support@meritlane.com to resolve this and attempt again.\n\nIf you were attempting to use unauthorized tools, please be aware this violates our academic integrity policy. Do not do that! You will be able to re-attempt this skill assessment in 30 days.",
      assessmentScores: {
        easy: 0,
        easyPassed: false,
        medium: 0,
        mediumPassed: false,
        mcq: 0,
        mcqPassed: false,
        overall: 0,
      },
      mcqs: (content?.mcqs || []).map((m, idx) => ({
        ...m,
        userAnswer: mcqAnswers[idx],
        isCorrect: m.answerIndex !== undefined && mcqAnswers[idx] === m.answerIndex,
      })),
      submittedCode: {
        easy: codeEasy || code,
        medium: codeMedium || code,
        single: code,
      },
      codingChallenges: content?.codingTasks || (content?.coding ? [content.coding] : []),
      submittedLanguage: selectedLanguage,
      submittedAt: new Date().toISOString(),
      infractionCount: infractionCount + 1,
    });

    clearDraft();
    setIntegrityTerminated(true);
    setInfractionOverlay(null);
    setShowExitWarning(false);
  }, [skillParam, clearDraft, content, mcqAnswers, codeEasy, codeMedium, code, selectedLanguage, infractionCount]);

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

      // Persist infraction to server in real time
      if (auth.currentUser) {
        auth.currentUser.getIdToken().then((token: string) => {
          fetch("/api/candidate/record-infraction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }).then(res => res.json()).then(data => {
            if (data.action === "terminate") {
              handleIntegrityTerminate();
            } else {
              setInfractionCount((prev) => {
                const count = prev + 1;
                // Show in-app overlay warning
                const tryAutoRestore = type === "exited_fullscreen" || type === "hidden_tab";
                setInfractionOverlay({ count, reason: reasonLabel, requiresUserGesture: !tryAutoRestore });

                if (tryAutoRestore) {
                  setTimeout(async () => {
                    if (isTerminatedRef.current) return;
                    const restored = await requestFullscreenSafe();
                    if (!restored) {
                      setInfractionOverlay({ count, reason: reasonLabel, requiresUserGesture: true });
                    }
                  }, 50);
                }
                return count;
              });
            }
          }).catch(() => {});
        }).catch(() => {});
      }

      // Analytics
      import("posthog-js").then((posthog) => {
        posthog.default.capture("assessment_fullscreen_violation", { type, reason: reasonLabel, skill: skillParam });
      }).catch(() => {});
    };

    const handlePopState = (e: PopStateEvent) => {
      // Re-push history entry so the browser stays firmly on this assessment page
      window.history.pushState(null, "", window.location.href);
      setShowExitWarning(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerInfraction("hidden_tab", "You switched tabs or minimized the browser window.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isRestoringFullscreenRef.current) {
        triggerInfraction("exited_fullscreen", "You exited fullscreen mode.");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTerminatedRef.current || assessmentResult) return;
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your assessment will be terminated.";
      return e.returnValue;
    };

    // Strict Anti-Tamper: Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Strict Anti-Tamper: Block devtools shortcuts & view source & screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac screenshots
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        triggerInfraction("screenshot", "You attempted to capture a screenshot.");
        e.preventDefault();
      }
      // Windows Snipping Tool (Win + Shift + S)
      if (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
        triggerInfraction("screenshot", "You attempted to capture a screenshot.");
        e.preventDefault();
      }

      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        triggerInfraction("screenshot", "You attempted to capture a screenshot.");
      }
    };

    // Strict Anti-Tamper: Prevent copying assessment questions
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("copy", handleCopy);
    };
  }, [hasStarted, assessmentResult, integrityTerminated, requestFullscreenSafe, handleIntegrityTerminate, skillParam]);

  // ── Normal fail (timer / bad submission) ──────────────────────────────────

  const handleFail = () => {
    if (!user || isTerminatedRef.current) return;
    clearDraft();
    if (typeof window !== "undefined" && user?.uid) {
      localStorage.setItem(`meritlane_cooldown_${user.uid}_${skillParam}`, Date.now().toString());
      localStorage.setItem(`meritlane_last_score_${user.uid}_${skillParam}`, "0");
    }
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
    isRestoringFullscreenRef.current = true;
    let fullscreenOk = false;
    try {
      const docEl: any = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      fullscreenOk = Boolean(document.fullscreenElement);
      setIsFullscreen(fullscreenOk);
    } catch (e) {
      console.warn("Fullscreen request on start:", e);
    } finally {
      setTimeout(() => { isRestoringFullscreenRef.current = false; }, 300);
    }

    if (!fullscreenOk && !document.fullscreenElement) {
      // If browser blocked or rejected fullscreen activation, prompt user to enter fullscreen cleanly
      setFullscreenUnsupported(true);
      return;
    }

    // Establish history traps to intercept browser back navigation immediately
    window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href);

    setHasStarted(true);
    setPhase(content && (!content.mcqs || content.mcqs.length === 0) && content.hasCoding ? "coding" : "mcq");

    import("posthog-js").then((posthog) => {
      posthog.default.capture("assessment_fullscreen_entered", { skill: skillParam });
      posthog.default.capture("assessment_started", { skill: skillParam });
    }).catch(() => {});

    logFunnelEvent("assessment_started", { skill: skillParam });
  };

  const handleRetryFullscreen = async () => {
    setFullscreenUnsupported(false);
    const ok = await requestFullscreenSafe();
    if (!ok && !document.fullscreenElement) {
      setFullscreenUnsupported(true);
    } else {
      window.history.pushState(null, "", window.location.href);
      window.history.pushState(null, "", window.location.href);
      setHasStarted(true);
      setPhase(content && (!content.mcqs || content.mcqs.length === 0) && content.hasCoding ? "coding" : "mcq");
    }
  };

  // ── Language & MCQ Selectors ──────────────────────────────────────────────

  const handleLanguageChange = (newLang: string) => {
    if (isLanguageLocked) return; // Language locked for skill-specific assessments
    setSelectedLanguage(newLang);
    const activeTask = content?.codingTasks?.[activeCodingTaskIdx] || content?.coding;
    if (!activeTask) return;
    const langs = activeTask.supportedLanguages || COMMON_SUPPORTED_LANGUAGES;
    const found = langs.find((l) => l.id === newLang);
    if (found && found.template) {
      setCode(found.template);
      if (activeCodingTaskIdx === 0) setCodeEasy(found.template);
      else setCodeMedium(found.template);
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
  const codeUpdateTimeout = useRef<any>(null);

  const handleCodeChange = (newVal: string) => {
    if (codeUpdateTimeout.current) clearTimeout(codeUpdateTimeout.current);
    codeUpdateTimeout.current = setTimeout(() => {
      setCode(newVal);
      if (activeCodingTaskIdx === 0) {
        setCodeEasy(newVal);
      } else {
        setCodeMedium(newVal);
      }
    }, 400); // 400ms debounce
  };

  const handleSwitchCodingTask = (targetIdx: 0 | 1) => {
    if (targetIdx === activeCodingTaskIdx) return;
    if (activeCodingTaskIdx === 0) {
      setCodeEasy(code);
    } else {
      setCodeMedium(code);
    }
    let targetCode = targetIdx === 0 ? codeEasy : codeMedium;
    if (!targetCode) {
      const task = content?.codingTasks?.[targetIdx];
      const foundLang = task?.supportedLanguages?.find((l) => l.id === selectedLanguage);
      targetCode = foundLang?.template || task?.initialCode || "";
    }
    setCode(targetCode);
    if (editorRef.current) {
      try { editorRef.current.setValue(targetCode); } catch {}
    }
    setActiveCodingTaskIdx(targetIdx);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      } else {
        const ok = await requestFullscreenSafe();
        setIsFullscreen(ok);
      }
    } catch (e) {
      console.warn("Fullscreen toggle failed:", e);
    }
  };

  const handleResetCode = () => {
    if (!content?.coding && (!content?.codingTasks || content.codingTasks.length === 0)) return;
    const initialCode = content?.codingTasks?.[activeCodingTaskIdx]?.initialCode || content?.coding?.initialCode || "";
    handleCodeChange(initialCode);
    if (editorRef.current) {
      try { editorRef.current.setValue(initialCode); } catch {}
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
    setCode((prev) => {
      const formatted = prev
        .split("\n")
        .map((line) => line.replace(/\t/g, "    ").trimEnd())
        .join("\n");
      if (editorRef.current) {
        try { editorRef.current.setValue(formatted); } catch {}
      }
      return formatted;
    });
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  };

  const handleClearOutput = () => {
    setOutput("");
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditorLoadTimeout(false);
    setTimeout(() => {
      try {
        editor.layout();
        editor.focus();
      } catch (err) {
        console.warn("Editor layout warning:", err);
      }
    }, 150);
    // Smart Indentation Rule on Enter:
    // Strictly preserves user's typed indentation, never touching or corrupting previous lines.
    // When entering an indented block (e.g. if condition, loops, functions, or lines ending in '{', ':', '(', '['),
    // automatically indents the next line by 4 spaces.
    editor.addCommand(monaco.KeyCode.Enter, () => {
      const model = editor.getModel();
      const position = editor.getPosition();
      if (!model || !position) return;

      const lineNumber = position.lineNumber;
      const lineContent = model.getLineContent(lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);
      const textAfterCursor = lineContent.substring(position.column - 1);

      // Preserve current line's leading indentation exactly
      const leadingMatch = lineContent.match(/^(\s*)/);
      const currentIndent = leadingMatch ? leadingMatch[1] : "";

      // Check if current statement triggers an extra block indent:
      // 1. Line ends with '{', '[', '(', or ':' (Python/TS/JS)
      // 2. Starts with control flow keywords: if, for, while, else, elif, switch, case, try, catch, finally, def, function, class
      const trimmedBefore = textBeforeCursor.trim();
      const isBlockStarter =
        /[{\[:(]$/.test(trimmedBefore) ||
        /^(?:if|else|elif|for|while|switch|case|default|try|catch|finally|function|def|class)\b/i.test(trimmedBefore);

      // Cursor placed between matching braces: { | }
      const isBetweenBraces = /{\s*$/.test(textBeforeCursor) && /^\s*}/.test(textAfterCursor);

      if (isBetweenBraces) {
        const innerIndent = currentIndent + "    ";
        editor.executeEdits("indent-rules", [
          {
            range: new monaco.Range(lineNumber, position.column, lineNumber, position.column),
            text: "\n" + innerIndent + "\n" + currentIndent,
          },
        ]);
        editor.setPosition({ lineNumber: lineNumber + 1, column: innerIndent.length + 1 });
        return;
      }

      // Next line indentation (current indent + 4 spaces if block starter, otherwise exact match)
      const nextIndent = isBlockStarter ? currentIndent + "    " : currentIndent;

      editor.executeEdits("indent-rules", [
        {
          range: new monaco.Range(lineNumber, position.column, lineNumber, position.column),
          text: "\n" + nextIndent,
        },
      ]);
      editor.setPosition({ lineNumber: lineNumber + 1, column: nextIndent.length + 1 });
    });
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
    setEvaluating(true);
    if (isSubmit) {
      setOutput("Running 50 evaluation test suites before final submission...\n");
    } else {
      setOutput("Compiling code...\nInitializing execution sandbox...\n");
    }

    try {
      const token = user ? await user.getIdToken(true) : "";
      const isDualTask = !!(content?.codingTasks && content.codingTasks.length >= 2);
      // Ensure the currently active code in editor is sent
      const activeCode = code;
      const activeQuestion = isDualTask
        ? content!.codingTasks![activeCodingTaskIdx]
        : content?.coding;

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: skillParam,
          code: activeCode,
          language: selectedLanguage,
          isPublicTest: !isSubmit,
          dryRun: isSubmit,
          questionId: activeQuestion?.id,
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
          durationMs: data.durationMs || 45,
          cases: data.cases,
        });
        const firstFailedIdx = data.cases.findIndex((c: any) => !c.passed);
        setSelectedCaseIdx(firstFailedIdx >= 0 ? firstFailedIdx : 0);
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
        const totalCount = data.cases ? data.cases.length : (isSubmit ? 50 : 5);
        
        if (isSubmit) {
          consoleMsg += `Executed ${totalCount} evaluation test cases (${passedCount}/${totalCount} passed).\n`;
          if (passedCount === totalCount) {
             consoleMsg += "✓ All 50 test assertions succeeded! Ready for final submission.\n";
             setTimeout(() => setShowSubmitModal(true), 1500);
          } else {
             consoleMsg += "⚠ Some test assertions failed. Please fix your code to pass all 50 cases before submitting the exam.\n";
          }
        } else {
          consoleMsg += `Executed ${totalCount} public test cases (${passedCount}/${totalCount} passed).\n` +
            (passedCount === totalCount
              ? "✓ All 5 public test assertions succeeded. Ready for 50-case evaluation.\n"
              : "⚠ Some public assertions failed. Check input/output diffs in Test Cases tab.\n");
        }
        
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
    setSubmittingModal(true);
    setSubmissionProgress(15);
    setOutput("Submitting assessment...\nInitializing sandbox evaluation container...\nRunning 50 hidden test suites...\nGenerating verification analysis...\n");

    const progressInterval = setInterval(() => {
      setSubmissionProgress((prev) => {
        if (prev < 40) return prev + 15;
        if (prev < 80) return prev + 10;
        if (prev < 95) return prev + 3;
        return prev;
      });
    }, 280);

    try {
      const token = user ? await user.getIdToken(true) : "";
      const isDualTask = !!(content?.codingTasks && content.codingTasks.length >= 2);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: skillParam,
          answers: mcqAnswers,
          // Dual-task: send easy + medium separately, ensuring current editor code is used for active task
          easyCode: isDualTask ? (activeCodingTaskIdx === 0 ? code : (codeEasy || code)) : undefined,
          mediumCode: isDualTask ? (activeCodingTaskIdx === 1 ? code : (codeMedium || code)) : undefined,
          easyQuestionId: isDualTask ? content?.codingTasks?.[0]?.id : (content?.coding?.id || undefined),
          mediumQuestionId: isDualTask ? content?.codingTasks?.[1]?.id : undefined,
          // Legacy fallback
          code: code,
          language: selectedLanguage,
          isPublicTest: false,
        }),
      });

      clearInterval(progressInterval);
      setSubmissionProgress(100);

      const data = await res.json();

      if (!res.ok) {
        setSubmittingModal(false);
        setEvaluating(false);
        if (res.status === 503 || data.retryable) {
          setOutput((prev) => prev + "\n[Infrastructure Notice] " + (data.error || "Evaluation sandbox temporarily unreachable. Your attempt was NOT consumed. Please click Submit again."));
          return;
        }
        setOutput((prev) => prev + "\n" + (data.error || "Evaluation failed."));
        if (res.status !== 501) {
          setTimeout(() => {
            handleFail();
          }, 1500);
        }
        return;
      }

      const buildEnrichedResult = (isPassed: boolean, resScore: number, resStatus: string) => {
        const mcqList = (content?.mcqs || []).map((m, idx) => ({
          question: m.question,
          options: m.options,
          answerIndex: m.answerIndex,
          userAnswer: mcqAnswers[idx],
          explanation: m.explanation,
          topic: m.topic,
          difficulty: m.difficulty,
          isCorrect: m.answerIndex !== undefined ? mcqAnswers[idx] === m.answerIndex : undefined,
        }));

        const activeCodeForTask = (idx: 0 | 1) => {
          if (idx === activeCodingTaskIdx) return code;
          return idx === 0 ? (codeEasy || code) : (codeMedium || code);
        };

        const challenges = content?.codingTasks && content.codingTasks.length > 0
          ? content.codingTasks
          : (content?.coding ? [content.coding] : []);

        return {
          passed: isPassed,
          score: resScore,
          status: resStatus,
          skill: skillParam,
          retryAvailableAt: data.retryAvailableAt,
          aiFeedback: data.aiFeedback,
          track: data.track || selectedTrack,
          badge: data.badge || (isPassed ? (selectedTrack === "advanced" ? "gold_honors" : "verified_professional") : undefined),
          assessmentScores: data.assessmentScores,
          mcqs: mcqList,
          submittedCode: {
            easy: activeCodeForTask(0),
            medium: activeCodeForTask(1),
            single: code,
          },
          codingChallenges: challenges.map((c) => ({
            title: c.title,
            instructions: c.instructions,
            language: c.language,
            initialCode: c.initialCode,
          })),
          submittedLanguage: selectedLanguage,
          submittedAt: new Date().toISOString(),
          infractionCount: infractionCount,
        };
      };

      if (data.passed) {
        clearDraft();
        setOutput(
          (prev) =>
            prev +
            "Evaluating 50 test suites & generating AI feedback...\n[====================] 100%\nAll 50 test suites evaluated.\nOfficial verification record created."
        );
        logFunnelEvent("assessment_passed", { skill: skillParam });
        setTimeout(() => {
          setSubmittingModal(false);
          setAssessmentResult(buildEnrichedResult(true, data.score, "verified"));
        }, 600);
      } else {
        clearDraft();
        if (typeof window !== "undefined" && auth.currentUser) {
          localStorage.setItem(`meritlane_cooldown_${auth.currentUser.uid}_${skillParam}`, Date.now().toString());
          localStorage.setItem(`meritlane_last_score_${auth.currentUser.uid}_${skillParam}`, (data.score ?? 0).toString());
        }
        setOutput(
          (prev) =>
            prev +
            "Evaluating 50 test suites & generating AI feedback...\nScore: " +
            data.score +
            "% (Required Threshold Met)."
        );
        setTimeout(() => {
          setSubmittingModal(false);
          setAssessmentResult(buildEnrichedResult(false, data.score, "failed"));
        }, 600);
      }
    } catch (e) {
      clearInterval(progressInterval);
      console.error(e);
      setSubmittingModal(false);
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
  const handleReturn = async (targetPath: string = "/candidate/verification") => {
    clearDraft();
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }
    router.push(targetPath);
    setTimeout(() => {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/candidate/assessment")) {
        window.location.href = targetPath;
      }
    }, 150);
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

  // ── Public Test Cases (5 Test Cases for Run Code) ─────────────────────────
  const defaultPublicTestCases = useMemo<any[]>(() => {
    // 1. Check if the active task instructions contain parsed LeetCode examples
    const activeTask = content?.codingTasks?.[activeCodingTaskIdx] || content?.coding;
    if (activeTask?.instructions) {
      const parsed = parseLeetCodeExamples(activeTask.instructions);
      if (parsed.length > 0) {
        const cases = parsed.map((ex, idx) => ({
          name: `Test Case ${idx + 1}: Public Example ${idx + 1}`,
          input: ex.input,
          expected: ex.output,
          actual: "",
          passed: null as boolean | null,
        }));
        while (cases.length < 5) {
          const base = cases[cases.length % parsed.length];
          cases.push({
            name: `Test Case ${cases.length + 1}: Public Assertion ${cases.length + 1}`,
            input: base.input,
            expected: base.expected,
            actual: "",
            passed: null as boolean | null,
          });
        }
        return cases;
      }
    }

    const skillLower = (skillParam || "").toLowerCase();
    const langLower = (selectedLanguage || "").toLowerCase();

    if (skillLower.includes("python") || langLower === "python" || content?.coding?.id?.includes("transaction")) {
      return [
        {
          name: "Test Case 1: Standard Completed Transactions",
          input: "tx1,u1,10.5,COMPLETED\ntx2,u2,5.0,COMPLETED\ntx3,u1,4.5,COMPLETED",
          expected: '{"u1": 15.0, "u2": 5.0}',
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 2: Status Filtering (COMPLETED only)",
          input: "t1,u1,10,COMPLETED\nt2,u2,20,FAILED\nt3,u1,5,PENDING\nt4,u3,15,REFUNDED",
          expected: '{"u1": 10.0}',
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 3: Empty Dataset Handling",
          input: '"" (Empty string)',
          expected: "{}",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 4: Malformed Record Recovery",
          input: "t1,u1,10,COMPLETED\nBADROW\nt2,u2,5,COMPLETED\nt3,u1,bad_amount,COMPLETED\n,,,",
          expected: '{"u1": 10.0, "u2": 5.0}',
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 5: Negative Balances / Precision",
          input: "t1,u1,-5.5,COMPLETED\nt2,u1,10.25,COMPLETED\nt3,u2,0.001,COMPLETED",
          expected: '{"u1": 4.75, "u2": 0.001}',
          actual: "",
          passed: null as boolean | null,
        },
      ];
    }

    if (skillLower.includes("sql") || langLower === "sql") {
      return [
        {
          name: "Test Case 1: Status Filter & Aggregation",
          input: "orders table (mixed COMPLETED / PENDING)",
          expected: "Aggregates only status = 'COMPLETED'",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 2: Grouping & Ordering",
          input: "orders table with multi-user volume",
          expected: "GROUP BY user_id ORDER BY total_spent DESC",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 3: Top 3 Threshold Constraint",
          input: "orders table with 50+ records",
          expected: "Enforces LIMIT 3 constraint",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 4: Year 2024 Date Partitioning",
          input: "orders across 2022, 2023, 2024, 2025",
          expected: "Correctly isolates created_at within 2024",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 5: Composite Index Optimization",
          input: "EXPLAIN ANALYZE against status & created_at",
          expected: "Optimized index scan with minimal buffer hit",
          actual: "",
          passed: null as boolean | null,
        },
      ];
    }

    if (skillLower.includes("react")) {
      return [
        {
          name: "Test Case 1: Initial Component Mount",
          input: "<Counter />",
          expected: "Valid functional component rendered with initial count 0",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 2: State Hooks & Increment Event",
          input: "User triggers Increment button click",
          expected: "Count state increments cleanly to 1",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 3: Non-negative Boundary Guard",
          input: "User triggers Decrement when count is 0",
          expected: "Count remains bounded at 0 (never negative)",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 4: Upper Limit Threshold Guard",
          input: "Count reaches 10 and user clicks Increment",
          expected: "Increment button is disabled",
          actual: "",
          passed: null as boolean | null,
        },
        {
          name: "Test Case 5: Max Reached Notification",
          input: "Count state reaches 10",
          expected: "'Max reached' warning message appears in DOM",
          actual: "",
          passed: null as boolean | null,
        },
      ];
    }

    // Default 5 robust test suites
    return [
      {
        name: "Test Case 1: Standard Input Assertion",
        input: "Standard valid parameters and dataset",
        expected: "Correct deterministic output matching specifications",
        actual: "",
        passed: null as boolean | null,
      },
      {
        name: "Test Case 2: Boundary / Empty Collection",
        input: "Empty collection or null-safe structure",
        expected: "Handled gracefully with zero unhandled exceptions",
        actual: "",
        passed: null as boolean | null,
      },
      {
        name: "Test Case 3: Extreme Numeric Range",
        input: "Maximum and minimum numeric ranges",
        expected: "Numeric precision maintained without overflow",
        actual: "",
        passed: null as boolean | null,
      },
      {
        name: "Test Case 4: High-throughput Performance",
        input: "Batch input stream benchmark",
        expected: "Linear O(N) execution inside 50ms sandbox limit",
        actual: "",
        passed: null as boolean | null,
      },
      {
        name: "Test Case 5: Dirty / Corrupt Data Recovery",
        input: "Dirty tokens and malformed records",
        expected: "Resilient filtering and fallback execution",
        actual: "",
        passed: null as boolean | null,
      },
    ];
  }, [skillParam, selectedLanguage, content, activeCodingTaskIdx]);

  const displayCases = useMemo(() => {
    if (testRunStats?.cases && testRunStats.cases.length > 0) {
      return testRunStats.cases.slice(0, 5);
    }
    return defaultPublicTestCases;
  }, [testRunStats, defaultPublicTestCases]);

  // ── Integrity termination screen ──────────────────────────────────────────

  // ── Shared Audit & Report Items ──────────────────────────────────────────
  const mcqItems = assessmentResult?.mcqs || (content?.mcqs || []).map((m, idx) => ({
    ...m,
    userAnswer: mcqAnswers[idx],
    isCorrect: m.answerIndex !== undefined ? mcqAnswers[idx] === m.answerIndex : undefined,
  }));

  const codingItems = assessmentResult?.codingChallenges && assessmentResult.codingChallenges.length > 0
    ? assessmentResult.codingChallenges
    : (content?.codingTasks && content.codingTasks.length > 0
        ? content.codingTasks
        : (content?.coding ? [content.coding] : []));

  const submittedCodeEasy = assessmentResult?.submittedCode?.easy || codeEasy || code;
  const submittedCodeMedium = assessmentResult?.submittedCode?.medium || codeMedium || code;

  // ── Unified Full-Screen Assessment Report Modal ──
  const renderFullReportModal = () => {
    if (!showFullReportModal) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Full Assessment Report"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      >
        <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#F8F6F3]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-foreground">
                  Full Assessment Report: {displaySkill}
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Comprehensive audit record of all responses, code implementations, and session diagnostics.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFullReportModal(false)}
              className="h-8 w-8 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-[#F2EFE9] flex items-center justify-center transition-colors cursor-pointer"
              title="Close report modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-border bg-white shrink-0">
            <button
              onClick={() => setReportActiveTab("mcq")}
              className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                reportActiveTab === "mcq"
                  ? "border-emerald-900 text-emerald-900"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              MCQ Responses ({mcqItems.length})
            </button>
            <button
              onClick={() => setReportActiveTab("code")}
              className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                reportActiveTab === "code"
                  ? "border-emerald-900 text-emerald-900"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Submitted Code &amp; Tasks
            </button>
            <button
              onClick={() => setReportActiveTab("review")}
              className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                reportActiveTab === "review"
                  ? "border-emerald-900 text-emerald-900"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Feedback &amp; Trace
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
            
            {/* TAB 1: MCQ Responses */}
            {reportActiveTab === "mcq" && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F6F3] p-4 rounded-lg border border-border">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">Knowledge Section Audit</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      Answered: {mcqAnswers.filter((a) => a !== undefined).length} of {mcqItems.length} questions · Answer keys withheld for test security
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] font-mono uppercase text-muted-foreground">Section Score</div>
                    <div className="text-[18px] font-mono font-bold text-foreground">
                      {assessmentResult?.assessmentScores?.mcq ?? (assessmentResult?.score || 0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {mcqItems.map((item: any, idx: number) => {
                    const hasAnswered = item.userAnswer !== undefined;
                    const isCorrect = item.isCorrect ?? (item.answerIndex !== undefined && item.userAnswer === item.answerIndex);
                    const userSelectedText = hasAnswered && item.options ? item.options[item.userAnswer] : null;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-colors ${
                          !hasAnswered
                            ? "bg-surface border-border"
                            : isCorrect
                            ? "bg-white border-[#BBF7D0]"
                            : "bg-white border-[#FECACA]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <span className="text-[12px] font-mono font-bold text-muted-foreground">
                            Question {idx + 1}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                              !hasAnswered
                                ? "bg-surface text-muted-foreground border-border"
                                : isCorrect
                                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
                                : "bg-danger/10 text-danger border-[#FECACA]"
                            }`}
                          >
                            {!hasAnswered ? "Skipped" : isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                        </div>

                        <div className="text-[14px] font-medium text-foreground mb-3 leading-relaxed">
                          {item.question}
                        </div>

                        {/* Candidate Selected Response (No answers or answer key revealed) */}
                        <div className="p-3 rounded-lg border bg-surface border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono uppercase text-muted-foreground">
                              Your Selection:
                            </span>
                            <span className="text-[13px] font-medium text-foreground">
                              {hasAnswered ? (
                                <>
                                  <span className="font-mono font-bold mr-1">
                                    {String.fromCharCode(65 + item.userAnswer)}.
                                  </span>
                                  {userSelectedText}
                                </>
                              ) : (
                                <span className="text-muted-foreground italic">No answer submitted</span>
                              )}
                            </span>
                          </div>

                          <span className={`text-[12px] font-mono font-semibold shrink-0 ${
                            !hasAnswered ? "text-muted-foreground" : isCorrect ? "text-[#166534]" : "text-danger"
                          }`}>
                            {!hasAnswered ? "Not Attempted" : isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Submitted Code */}
            {reportActiveTab === "code" && (
              <div className="flex flex-col gap-6">
                {codingItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No coding challenge data recorded for this session.
                  </div>
                ) : (
                  codingItems.map((challenge: any, cIdx: number) => {
                    const challengeCode = cIdx === 0 ? submittedCodeEasy : submittedCodeMedium;
                    const taskLabel = cIdx === 0 ? "EASY Task" : "MEDIUM Task";

                    return (
                      <div key={cIdx} className="border border-border rounded-xl overflow-hidden bg-white shadow-xs">
                        <div className="p-5 border-b border-border bg-[#F8F6F3]">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-900 text-white px-2 py-0.5 rounded">
                                {taskLabel}
                              </span>
                              <span className="text-[16px] font-bold text-foreground">
                                {challenge.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono bg-white border border-border px-2.5 py-1 rounded text-muted-foreground">
                              {selectedLanguage.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#57534E] leading-relaxed whitespace-pre-line mt-2 bg-white p-3 rounded-lg border border-border">
                            {challenge.instructions}
                          </p>
                        </div>

                        <div className="p-4 bg-[#0D1117] text-[#E6EDF3] font-mono text-[12px] overflow-x-auto max-h-[350px]">
                          <pre className="whitespace-pre">
                            {challengeCode?.trim() || "// No code was written for this challenge."}
                          </pre>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: AI Review & Trace */}
            {reportActiveTab === "review" && (
              <div className="flex flex-col gap-5">
                <div className="p-4 rounded-xl border border-border bg-[#F8F6F3]">
                  <h3 className="text-[14px] font-bold text-foreground mb-3">Authoritative Score Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-border">
                      <div className="text-[11px] text-muted-foreground font-semibold uppercase">EASY Task</div>
                      <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                        assessmentResult?.assessmentScores?.easyPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult?.assessmentScores?.easy ?? 0}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Required: 100%</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-border">
                      <div className="text-[11px] text-muted-foreground font-semibold uppercase">MEDIUM Task</div>
                      <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                        assessmentResult?.assessmentScores?.mediumPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult?.assessmentScores?.medium ?? 0}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Required: ≥ 75%</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-border">
                      <div className="text-[11px] text-muted-foreground font-semibold uppercase">MCQ Section</div>
                      <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                        assessmentResult?.assessmentScores?.mcqPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult?.assessmentScores?.mcq ?? (assessmentResult?.score || 0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Required: ≥ 75%</div>
                    </div>
                  </div>
                </div>

                {assessmentResult?.aiFeedback && (
                  <div className="p-5 rounded-xl border border-border bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <h3 className="text-[15px] font-bold text-foreground">Session Audit &amp; Trace</h3>
                    </div>
                    <div className="text-[13px] text-[#44403C] leading-relaxed whitespace-pre-line p-4 rounded-lg bg-[#F8F6F3] border border-border">
                      {assessmentResult.aiFeedback}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-border bg-[#F8F6F3] flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Assessment Type: <span className="font-mono">ML-EVAL-{skillParam.toUpperCase().slice(0, 4)}</span>
            </span>
            <button
              onClick={() => setShowFullReportModal(false)}
              className="px-5 h-9 rounded-lg border border-border bg-white text-foreground font-semibold text-[13px] hover:border-foreground transition-colors cursor-pointer"
            >
              Close Report
            </button>
          </div>

        </div>
      </div>
    );
  };

  // ── Integrity termination screen ──────────────────────────────────────────
  if (integrityTerminated) {
    const mcqAnsweredCount = mcqAnswers.filter((a) => a !== undefined).length;
    const totalMcqs = content?.mcqs?.length || 15;
    const hasCode = !!(code || codeEasy || codeMedium)?.trim();

    return (
      <div className="min-h-screen w-full bg-surface text-foreground font-sans flex flex-col justify-start">
        {/* Top Header */}
        <header className="border-b border-border bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground tracking-tight">MERITLANE</span>
            <span>/</span>
            <span>Technical Verification</span>
            <span>/</span>
            <span className="text-foreground font-medium">{displaySkill}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 border border-[#FCA5A5] text-danger text-[11px] font-mono font-semibold rounded">
            <XCircle className="h-3.5 w-3.5" />
            TERMINATED
          </span>
        </header>

        {/* Full-width container */}
        <div className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Hero termination card */}
          <div className="w-full rounded-xl border border-danger/30 bg-gradient-to-r from-danger/10 to-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#FEE2E2] border border-danger/30 text-danger flex items-center justify-center shrink-0">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-danger text-white">
                    Integrity Policy Termination
                  </span>
                  <span className="text-[12px] text-muted-foreground font-mono">
                    {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h1 className="text-[24px] sm:text-[30px] font-bold text-foreground tracking-tight">
                  {displaySkill} Assessment Terminated
                </h1>
                <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  This examination was concluded due to navigation exit or security requirements. Your answers, code buffers, and attempt diagnostics are preserved in your official record.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center shrink-0 p-4 rounded-lg border bg-white border-danger/20 min-w-[160px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                Result Status
              </div>
              <div className="text-[38px] font-mono font-bold leading-none text-danger">
                0%
              </div>
              <div className="text-[11px] text-danger mt-1 font-medium">
                Terminated / Unverified
              </div>
            </div>
          </div>

          {/* Two-column layout matching the results screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 cols: Report Action & Question Summary */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Primary Report Card */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileCode className="h-5 w-5 text-emerald-900" />
                  <h2 className="text-[16px] font-bold text-foreground">Full Exam Audit Report</h2>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Inspect every question presented during the examination, your selected choices, your saved code buffer in {selectedLanguage.toUpperCase()}, and complete proctoring diagnostics.
                </p>
                <button
                  onClick={() => setShowFullReportModal(true)}
                  className="w-full h-12 bg-emerald-900 text-white font-semibold text-[14px] rounded-lg hover:bg-emerald-950 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:ring-offset-2"
                >
                  <FileCode className="h-4 w-4" />
                  <span>See Full Exam Report →</span>
                </button>
              </div>

              {/* Progress Summary */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs">
                <h3 className="text-[14px] font-bold text-foreground mb-4">Attempt Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-surface border border-border rounded p-3 text-center">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">MCQ Progress</div>
                    <div className="text-[18px] font-mono font-bold text-foreground mt-0.5">
                      {mcqAnsweredCount} / {totalMcqs}
                    </div>
                  </div>
                  <div className="bg-surface border border-border rounded p-3 text-center">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Code Buffer</div>
                    <div className="text-[18px] font-mono font-bold text-foreground mt-0.5">
                      {hasCode ? "Preserved" : "None"}
                    </div>
                  </div>
                  <div className="bg-surface border border-border rounded p-3 text-center">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Infractions</div>
                    <div className="text-[18px] font-mono font-bold text-danger mt-0.5">
                      {MAX_VIOLATIONS} of {MAX_VIOLATIONS}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Cooldown Timer & Navigation */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Cooldown Timer */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <h3 className="text-[15px] font-bold text-foreground">Mandatory Retake Cooldown</h3>
                </div>
                <p className="text-[12px] text-muted-foreground mb-4">
                  In accordance with testing standards, a mandatory 14-day study period is enforced before retaking this skill test.
                </p>
                <CooldownTimer
                  timestamp={Date.now()}
                  durationDays={14}
                  variant="boxes"
                />
              </div>

              {/* Navigation Actions */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs flex flex-col gap-3">
                <button
                  onClick={() => handleReturn("/candidate/verification")}
                  className="w-full h-11 border border-foreground bg-foreground text-white font-semibold text-[13px] rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verification Records</span>
                </button>
                <button
                  onClick={() => handleReturn("/candidate/dashboard")}
                  className="w-full h-11 border border-border bg-white text-foreground font-semibold text-[13px] rounded-lg hover:border-foreground hover:bg-[#F2EFE9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Dashboard
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Full Assessment Report Modal */}
        {renderFullReportModal()}
      </div>
    );
  }

  // ── Unified Full-Screen Result Screen ─────────────────────────────────────

  if (assessmentResult) {
    const isPassed = assessmentResult.passed;
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

    const mcqItems = assessmentResult.mcqs || (content?.mcqs || []).map((m, idx) => ({
      ...m,
      userAnswer: mcqAnswers[idx],
      isCorrect: m.answerIndex !== undefined ? mcqAnswers[idx] === m.answerIndex : undefined,
    }));

    const codingItems = assessmentResult.codingChallenges && assessmentResult.codingChallenges.length > 0
      ? assessmentResult.codingChallenges
      : (content?.codingTasks && content.codingTasks.length > 0
          ? content.codingTasks
          : (content?.coding ? [content.coding] : []));

    const submittedCodeEasy = assessmentResult.submittedCode?.easy || codeEasy || code;
    const submittedCodeMedium = assessmentResult.submittedCode?.medium || codeMedium || code;

    return (
      <div className="min-h-screen w-full bg-[#F8F6F3] text-foreground font-sans py-6 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Top Bar / Breadcrumb */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground tracking-tight">MERITLANE</span>
              <span>/</span>
              <span>Technical Verification</span>
              <span>/</span>
              <span className="text-foreground font-medium">{displaySkill}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-muted-foreground bg-white px-2.5 py-1 rounded border border-border">
                {assessmentResult.submittedLanguage === "javascript" ? "JavaScript (ES6)" : (assessmentResult.submittedLanguage || "Verified Sandbox")}
              </span>
            </div>
          </div>

          {/* Hero Banner (Full Width) */}
          <div className={`w-full rounded-xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs ${
            isPassed
              ? "bg-gradient-to-r from-[#F0FDF4] to-white border-[#16A34A]/30 text-emerald-900"
              : "bg-gradient-to-r from-danger/10 to-white border-danger/25 text-[#7F1D1D]"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border ${
                isPassed
                  ? "bg-[#DCFCE7] border-[#16A34A]/30 text-[#16A34A]"
                  : "bg-[#FEE2E2] border-danger/30 text-danger"
              }`}>
                {isPassed ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isPassed ? "bg-[#16A34A] text-white" : "bg-danger text-white"
                  }`}>
                    {isPassed ? "Assessment Verified" : "Assessment Not Passed"}
                  </span>
                  {isPassed && assessmentResult.badge && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                      assessmentResult.badge === "gold_honors"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-900/10 text-emerald-900 border border-emerald-900/20"
                    }`}>
                      {assessmentResult.badge === "gold_honors" ? (
                        <><Trophy className="h-3 w-3" /> Gold Honors</>
                      ) : (
                        <><Award className="h-3 w-3" /> Verified Professional</>
                      )}
                    </span>
                  )}
                  <span className="text-[12px] text-muted-foreground font-mono">
                    {new Date(assessmentResult.submittedAt || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h1 className="text-[26px] sm:text-[32px] font-bold text-foreground tracking-tight">
                  {displaySkill} Technical Assessment
                </h1>
                <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  {isPassed
                    ? "Congratulations! Your technical competency has been authoritatively verified. Your proof trace is recorded and visible to hiring teams."
                    : "Passing all component thresholds is required to verify this technical skill. Review your detailed score trace and full audit report below."}
                </p>
              </div>
            </div>

            {/* Score Callout */}
            <div className={`flex flex-col items-center md:items-end justify-center shrink-0 p-4 rounded-lg border min-w-[150px] ${
              isPassed ? "bg-white border-[#16A34A]/20" : "bg-white border-danger/20"
            }`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                Overall Score
              </div>
              <div className={`text-[44px] font-mono font-bold leading-none ${
                isPassed ? "text-[#16A34A]" : "text-danger"
              }`}>
                {assessmentResult.score}%
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-medium">
                {isPassed
                  ? assessmentResult.badge === "gold_honors"
                    ? "★ Gold Honors Credential"
                    : "✓ Verified Professional"
                  : "Required Threshold: 75%+"}
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Proof Trace + Action Cards */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Proof Trace Breakdown */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-900" />
                    <h2 className="text-[16px] font-bold text-foreground">Proof Trace & Component Breakdown</h2>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground bg-[#F8F6F3] px-2 py-0.5 rounded border border-border">
                    Authoritative Sandbox
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Easy Task */}
                  <div className="p-3.5 rounded-lg border border-border bg-[#FAFAF9]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">EASY Task</span>
                        <span className="text-[11px] text-muted-foreground font-mono">(Must be 100%)</span>
                      </div>
                      <span className={`text-[13px] font-mono font-bold ${
                        assessmentResult.assessmentScores?.easyPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult.assessmentScores?.easyPassed
                          ? "✓ 100% Passed"
                          : `✗ ${assessmentResult.assessmentScores?.easy ?? 0}%`}
                      </span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          assessmentResult.assessmentScores?.easyPassed ? "bg-[#16A34A]" : "bg-danger"
                        }`}
                        style={{ width: `${assessmentResult.assessmentScores?.easy ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium Task */}
                  <div className="p-3.5 rounded-lg border border-border bg-[#FAFAF9]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">MEDIUM Task</span>
                        <span className="text-[11px] text-muted-foreground font-mono">(Threshold ≥ 75%)</span>
                      </div>
                      <span className={`text-[13px] font-mono font-bold ${
                        assessmentResult.assessmentScores?.mediumPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult.assessmentScores?.mediumPassed
                          ? `✓ ${assessmentResult.assessmentScores?.medium ?? 0}% Passed`
                          : `✗ ${assessmentResult.assessmentScores?.medium ?? 0}%`}
                      </span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          assessmentResult.assessmentScores?.mediumPassed ? "bg-[#16A34A]" : "bg-danger"
                        }`}
                        style={{ width: `${assessmentResult.assessmentScores?.medium ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* MCQ */}
                  <div className="p-3.5 rounded-lg border border-border bg-[#FAFAF9]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">MCQ Knowledge Section</span>
                        <span className="text-[11px] text-muted-foreground font-mono">(Threshold ≥ 75%)</span>
                      </div>
                      <span className={`text-[13px] font-mono font-bold ${
                        assessmentResult.assessmentScores?.mcqPassed ? "text-[#16A34A]" : "text-danger"
                      }`}>
                        {assessmentResult.assessmentScores?.mcqPassed
                          ? `✓ ${assessmentResult.assessmentScores?.mcq ?? 0}% Passed`
                          : `✗ ${assessmentResult.assessmentScores?.mcq ?? 0}%`}
                      </span>
                    </div>
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          assessmentResult.assessmentScores?.mcqPassed ? "bg-[#16A34A]" : "bg-danger"
                        }`}
                        style={{ width: `${assessmentResult.assessmentScores?.mcq ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cooldown Information if Failed */}
                {!isPassed && (
                  <div className="mt-5 p-4 rounded-lg border border-border bg-[#F8F6F3] flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-medium text-muted-foreground">Next eligible attempt</div>
                      <div className="text-[15px] font-bold text-foreground">{retryDateStr}</div>
                    </div>
                    <span className="text-[11px] text-muted-foreground bg-white px-2.5 py-1 rounded border border-border">
                      14-day practice cooldown
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons & See Full Report CTA */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs flex flex-col gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-foreground">Assessment Audit & Report</h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Review every question asked, your selected answers, submitted code, and compiler test assertions.
                  </p>
                </div>

                {/* Primary Button: View Full Assessment Report */}
                <button
                  onClick={() => setShowFullReportModal(true)}
                  className="w-full h-12 bg-emerald-900 text-white font-semibold text-[14px] rounded-lg hover:bg-emerald-950 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:ring-offset-2"
                >
                  <FileCode className="h-4 w-4" />
                  <span>See Full Assessment Report</span>
                </button>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                  <button
                    onClick={() => handleReturn("/candidate/verification")}
                    className="flex-1 h-11 border border-foreground bg-foreground text-white font-semibold text-[13px] rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verification Results</span>
                  </button>
                  <button
                    onClick={() => handleReturn("/candidate/dashboard")}
                    className="flex-1 h-11 border border-border bg-white text-foreground font-semibold text-[13px] rounded-lg hover:border-foreground hover:bg-[#F2EFE9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleReturn("/candidate/provenance")}
                    className="flex-1 h-11 border border-border bg-white text-muted-foreground font-semibold text-[13px] rounded-lg hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Provenance</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: AI Feedback & Session Integrity */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Code Review Card */}
              {assessmentResult.aiFeedback && (
                <div className="bg-white border border-border rounded-xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <h3 className="text-[15px] font-bold text-foreground">Code Review & Analysis</h3>
                  </div>
                  <div className="text-[13px] text-[#44403C] leading-relaxed whitespace-pre-line bg-[#F8F6F3] p-4 rounded-lg border border-border">
                    {assessmentResult.aiFeedback}
                  </div>
                </div>
              )}

              {/* Assessment Integrity & Proctoring Summary */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                  <Monitor className="h-4 w-4 text-emerald-900" />
                  <h3 className="text-[15px] font-bold text-foreground">Integrity & Proctoring Audit</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Fullscreen Violations:</span>
                    <span className="font-mono font-medium text-[#16A34A]">
                      {assessmentResult.infractionCount || 0} / 2 (Verified)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Language Locked:</span>
                    <span className="font-mono text-foreground">
                      {assessmentResult.submittedLanguage === "javascript" ? "JavaScript (ES6)" : (assessmentResult.submittedLanguage || "Verified")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Execution Environment:</span>
                    <span className="font-mono text-foreground">Isolated Sandboxed Node.js</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Session Status:</span>
                    <span className="font-mono text-[#16A34A]">Authoritatively Evaluated</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Full Assessment Report Modal ── */}
        {showFullReportModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Full Assessment Report"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#F8F6F3]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-foreground">
                      Full Assessment Report: {displaySkill}
                    </h2>
                    <p className="text-[12px] text-muted-foreground">
                      Comprehensive audit record of all responses, code implementations, and test results.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullReportModal(false)}
                  className="h-8 w-8 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-[#F2EFE9] flex items-center justify-center transition-colors cursor-pointer"
                  title="Close report modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex items-center gap-1 px-6 pt-3 border-b border-border bg-white shrink-0">
                <button
                  onClick={() => setReportActiveTab("mcq")}
                  className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    reportActiveTab === "mcq"
                      ? "border-emerald-900 text-emerald-900"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  MCQ Responses ({mcqItems.length})
                </button>
                <button
                  onClick={() => setReportActiveTab("code")}
                  className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    reportActiveTab === "code"
                      ? "border-emerald-900 text-emerald-900"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Submitted Code & Tasks
                </button>
                <button
                  onClick={() => setReportActiveTab("review")}
                  className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    reportActiveTab === "review"
                      ? "border-emerald-900 text-emerald-900"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Feedback & Trace
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
                
                {/* TAB 1: MCQ Responses */}
                {reportActiveTab === "mcq" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between bg-[#F8F6F3] p-4 rounded-lg border border-border">
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">Knowledge Section Summary</div>
                        <div className="text-[12px] text-muted-foreground">
                          Passing threshold: 70% • Candidate score: {assessmentResult.assessmentScores?.mcq ?? assessmentResult.score}%
                        </div>
                      </div>
                      <span className={`text-[12px] font-mono font-bold px-2.5 py-1 rounded border ${
                        assessmentResult.assessmentScores?.mcqPassed ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]" : "bg-[#FEE2E2] text-danger border-[#FECACA]"
                      }`}>
                        {assessmentResult.assessmentScores?.mcqPassed ? "✓ Section Passed" : "✗ Below 70% Threshold"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {mcqItems.map((q: any, idx: number) => {
                        const isAnswered = q.userAnswer !== undefined && q.userAnswer !== null;
                        const isCorrect = q.answerIndex !== undefined && q.userAnswer === q.answerIndex;

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                              !isAnswered
                                ? "border-border bg-[#FAFAF9]"
                                : isCorrect
                                ? "border-[#16A34A]/30 bg-[#F0FDF4]/40"
                                : "border-danger/25 bg-danger/10/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-foreground">
                                  Question {idx + 1}
                                </span>
                                {q.topic && (
                                  <span className="text-[10px] font-mono uppercase bg-white border border-border px-2 py-0.5 rounded text-muted-foreground">
                                    {q.topic}
                                  </span>
                                )}
                                {q.difficulty && (
                                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                    q.difficulty === "easy" ? "bg-emerald-50 text-emerald-700" : q.difficulty === "hard" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                                  }`}>
                                    {q.difficulty}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[12px] font-mono font-bold flex items-center gap-1 ${
                                !isAnswered ? "text-muted-foreground" : isCorrect ? "text-[#16A34A]" : "text-danger"
                              }`}>
                                {!isAnswered ? "Unanswered" : isCorrect ? "✓ Correct" : "✗ Incorrect"}
                              </span>
                            </div>

                            <p className="text-[14px] font-medium text-foreground mb-3 leading-relaxed">
                              {q.question}
                            </p>

                            {/* Options List */}
                            <div className="flex flex-col gap-1.5">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isUserPick = q.userAnswer === optIdx;

                                let optClass = "border-border bg-white text-[#44403C]";
                                if (isUserPick && isCorrect) {
                                  optClass = "border-[#16A34A] bg-[#DCFCE7] text-emerald-900 font-semibold";
                                } else if (isUserPick && !isCorrect) {
                                  optClass = "border-danger bg-[#FEE2E2] text-[#991B1B] font-semibold";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`px-3.5 py-2 rounded-lg border text-[13px] flex items-center justify-between ${optClass}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] text-muted-foreground w-5">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isUserPick && (
                                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                          isCorrect ? "bg-[#16A34A] text-white border-[#16A34A]" : "bg-danger text-white border-danger"
                                        }`}>
                                          Your Selection ({isCorrect ? "Correct" : "Incorrect"})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Security Notice: Answer keys withheld */}
                            <div className="mt-2 text-[11px] font-mono text-muted-foreground flex items-center justify-between px-1">
                              <span>Status: {isCorrect ? "✓ Passed" : "✗ Needs Review"}</span>
                              <span className="italic text-muted-foreground/70">Correct answer keys withheld for exam integrity</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: Submitted Code */}
                {reportActiveTab === "code" && (
                  <div className="flex flex-col gap-6">
                    {codingItems.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No coding challenge data recorded for this session.
                      </div>
                    ) : (
                      codingItems.map((challenge: any, cIdx: number) => {
                        const challengeCode = cIdx === 0 ? submittedCodeEasy : submittedCodeMedium;
                        const taskLabel = cIdx === 0 ? "EASY Task" : "MEDIUM Task";

                        return (
                          <div key={cIdx} className="border border-border rounded-xl overflow-hidden bg-white shadow-xs">
                            {/* Challenge Header */}
                            <div className="p-5 border-b border-border bg-[#F8F6F3]">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-900 text-white px-2 py-0.5 rounded">
                                    {taskLabel}
                                  </span>
                                  <span className="text-[16px] font-bold text-foreground">
                                    {challenge.title}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono bg-white border border-border px-2.5 py-1 rounded text-muted-foreground">
                                  {assessmentResult.submittedLanguage === "javascript" ? "JavaScript (ES6)" : (assessmentResult.submittedLanguage || "JavaScript")}
                                </span>
                              </div>
                              <p className="text-[13px] text-[#57534E] leading-relaxed whitespace-pre-line mt-2 bg-white p-3 rounded-lg border border-border">
                                {challenge.instructions}
                              </p>
                            </div>

                            {/* Submitted Code Block */}
                            <div className="bg-[#0D1117] p-4 text-[#E6EDF3] font-mono text-[13px] relative group">
                              <div className="flex items-center justify-between border-b border-[#30363D] pb-2 mb-3 text-[11px] text-[#8B949E]">
                                <span>Submitted Solution Buffer</span>
                                <button
                                  onClick={() => {
                                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                                      navigator.clipboard.writeText(challengeCode);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] border border-[#30363D] text-[#C9D1D9] hover:text-white transition-colors cursor-pointer"
                                  title="Copy code to clipboard"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="overflow-x-auto whitespace-pre leading-relaxed font-mono">
                                {challengeCode || challenge.initialCode || "// No code submitted."}
                              </pre>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* TAB 3: AI Review & Trace */}
                {reportActiveTab === "review" && (
                  <div className="flex flex-col gap-5">
                    {/* Component Scores */}
                    <div className="p-4 rounded-xl border border-border bg-[#F8F6F3]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[14px] font-bold text-foreground">Authoritative Score Metrics (Proportional Scoring)</h3>
                        <span className="text-[11px] font-mono text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded font-semibold">
                          Passing Threshold: ≥ 75%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-border">
                          <div className="text-[11px] text-muted-foreground font-semibold uppercase">EASY Task (35%)</div>
                          <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                            (assessmentResult.assessmentScores?.easy ?? 0) >= 75 ? "text-[#16A34A]" : "text-danger"
                          }`}>
                            {assessmentResult.assessmentScores?.easy ?? 0}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {assessmentResult.assessmentScores?.easyPassedTests !== undefined 
                              ? `${assessmentResult.assessmentScores.easyPassedTests}/${assessmentResult.assessmentScores.easyTotalTests || 50} test cases`
                              : "Proportional test-case score"}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-border">
                          <div className="text-[11px] text-muted-foreground font-semibold uppercase">MEDIUM Task (35%)</div>
                          <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                            (assessmentResult.assessmentScores?.medium ?? 0) >= 75 ? "text-[#16A34A]" : "text-danger"
                          }`}>
                            {assessmentResult.assessmentScores?.medium ?? 0}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {assessmentResult.assessmentScores?.mediumPassedTests !== undefined 
                              ? `${assessmentResult.assessmentScores.mediumPassedTests}/${assessmentResult.assessmentScores.mediumTotalTests || 50} test cases`
                              : "Proportional test-case score"}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-border">
                          <div className="text-[11px] text-muted-foreground font-semibold uppercase">MCQ Section (30%)</div>
                          <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                            (assessmentResult.assessmentScores?.mcq ?? 0) >= 75 ? "text-[#16A34A]" : "text-danger"
                          }`}>
                            {assessmentResult.assessmentScores?.mcq ?? 0}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">Knowledge accuracy</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-border">
                          <div className="text-[11px] text-muted-foreground font-semibold uppercase">Overall Result</div>
                          <div className={`text-[20px] font-mono font-bold mt-0.5 ${
                            (assessmentResult.score ?? 0) >= 75 ? "text-[#16A34A]" : "text-danger"
                          }`}>
                            {assessmentResult.score ?? 0}%
                          </div>
                          <div className={`text-[10px] font-bold ${
                            (assessmentResult.score ?? 0) >= 75 ? "text-[#16A34A]" : "text-danger"
                          }`}>
                            {(assessmentResult.score ?? 0) >= 75 ? "✓ PASSED (≥75%)" : "✗ FAILED (<75%)"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Code Review */}
                    {assessmentResult.aiFeedback && (
                      <div className="p-5 rounded-xl border border-border bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <h3 className="text-[15px] font-bold text-foreground">AI Code Review & Invariant Analysis</h3>
                        </div>
                        <div className="text-[13px] text-[#44403C] leading-relaxed whitespace-pre-line p-4 rounded-lg bg-[#F8F6F3] border border-border">
                          {assessmentResult.aiFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-border bg-[#F8F6F3] flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">
                  Assessment Type: <span className="font-mono">ML-EVAL-{skillParam.toUpperCase().slice(0, 4)}</span>
                </span>
                <button
                  onClick={() => setShowFullReportModal(false)}
                  className="px-5 h-9 rounded-lg border border-border bg-white text-foreground font-semibold text-[13px] hover:border-foreground transition-colors cursor-pointer"
                >
                  Close Report
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ── Error screens ──────────────────────────────────────────────────────────

  if (errorMsg) {
    if (errorMsg === "SKILL NOT FOUND") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-border bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-danger mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Skill not in your profile
            </h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              The skill &quot;{displaySkill}&quot; is not part of your Technical Identity. Add it to
              your profile before starting verification.
            </p>
            <button
              onClick={() => handleReturn("/candidate/profile")}
              className="w-full h-11 border border-foreground bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
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
          <div className="max-w-md w-full border border-border bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#16A34A] mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Already Verified
            </h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              You have already successfully passed the assessment for {displaySkill}. Your
              verification is recorded and visible to employers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleReturn("/candidate/verification")}
                className="flex-1 h-11 border border-emerald-900 bg-emerald-900 text-white font-semibold text-[14px] rounded hover:bg-emerald-950 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verification Results</span>
              </button>
              <button
                onClick={() => handleReturn("/candidate/dashboard")}
                className="flex-1 h-11 border border-border text-foreground font-semibold text-[14px] rounded hover:border-foreground hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (errorMsg === "ASSESSMENT COOLDOWN ACTIVE") {
      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-border bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-danger mb-2">
              Assessment cooldown active
            </h2>
            <p className="text-[14px] text-muted-foreground mb-6">
              You are currently in a mandatory cooldown period for this skill.
            </p>
            <div className="border border-border bg-[#F8F6F3] p-5 rounded mb-8">
              <div className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center justify-between">
                <span>Time Remaining Until Unlock</span>
                <span className="text-[10px] font-mono text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded font-semibold">
                  LIVE COUNTDOWN
                </span>
              </div>
              <CooldownTimer
                timestamp={
                  retryAvailableAt
                    ? new Date(retryAvailableAt).getTime() - (cooldownDays || 14) * 24 * 60 * 60 * 1000
                    : Date.now()
                }
                durationDays={cooldownDays || 14}
                variant="boxes"
              />
              <div className="mt-3 text-right text-[11px] font-mono text-muted-foreground">
                Eligible on:{" "}
                <strong className="text-foreground">
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
                </strong>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleReturn("/candidate/verification")}
                className="flex-1 h-11 border border-foreground bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verification Records</span>
              </button>
              <button
                onClick={() => handleReturn("/candidate/dashboard")}
                className="flex-1 h-11 border border-border text-foreground font-semibold text-[14px] rounded hover:border-foreground hover:bg-[#F2EFE9] transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (errorMsg === "PROCTORING LOCKOUT") {
      const isSuperadmin = isAdmin || 
        user?.email?.toLowerCase() === "saitrishankb9@gmail.com" || 
        user?.email?.toLowerCase() === "saitrishankb1311@gmail.com";

      return (
        <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
          <div className="max-w-md w-full border border-border bg-white rounded p-8 shadow-sm">
            <h2 className="text-[18px] font-semibold text-danger mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              Proctoring Lockout Active
            </h2>
            <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
              Assessment access is temporarily suspended due to repeated proctoring departures or fullscreen exits. To preserve assessment integrity, a cooldown period is enforced.
            </p>
            <div className="border border-border bg-[#F8F6F3] p-5 rounded mb-8">
              <div className="text-[13px] font-medium text-muted-foreground mb-3 flex items-center justify-between">
                <span>Time Remaining Until Unlock</span>
                <span className="text-[10px] font-mono text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded font-semibold">
                  LOCKOUT
                </span>
              </div>
              <CooldownTimer
                timestamp={
                  retryAvailableAt
                    ? new Date(retryAvailableAt).getTime() - 90 * 24 * 60 * 60 * 1000
                    : Date.now()
                }
                durationDays={90}
                variant="boxes"
              />
              <div className="mt-3 text-right text-[11px] font-mono text-muted-foreground">
                Eligible on:{" "}
                <strong className="text-foreground">
                  {retryAvailableAt
                    ? new Date(retryAvailableAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                </strong>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {isSuperadmin ? (
                <button
                  disabled={resettingLockout}
                  onClick={async () => {
                    if (!user) return;
                    setResettingLockout(true);
                    try {
                      const token = await user.getIdToken();
                      await fetch("/api/start-assessment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ skill: skillParam, resetCooldown: true, resetLockout: true })
                      });
                      window.location.reload();
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setResettingLockout(false);
                    }
                  }}
                  className="flex-1 h-11 border border-foreground bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {resettingLockout ? "Resetting..." : "Reset Lockout (Admin)"}
                </button>
              ) : (
                <button
                  onClick={() => handleReturn("/candidate/verification")}
                  className="flex-1 h-11 border border-foreground bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verification</span>
                </button>
              )}
              <button
                onClick={() => handleReturn("/candidate/dashboard")}
                className="flex-1 h-11 border border-border text-foreground font-semibold text-[14px] rounded hover:border-foreground hover:bg-[#F2EFE9] transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Generic error fallback
    return (
      <div className="flex h-[100dvh] w-full bg-[#F8F6F3] items-center justify-center p-6">
        <div className="max-w-md w-full border border-border bg-white rounded p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold text-foreground mb-2">
            Unable to start assessment
          </h2>
          <p className="text-[14px] text-muted-foreground mb-6">
            {errorMsg || "An unexpected error occurred while preparing your assessment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 h-11 border border-foreground bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => handleReturn("/candidate/dashboard")}
              className="flex-1 h-11 border border-border text-foreground font-semibold text-[14px] rounded hover:border-foreground hover:bg-[#F2EFE9] transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (initializing || loading || !content || !Array.isArray(content.mcqs)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <MeritlaneLoader level="page" text={`Preparing ${displaySkill || "Skill"} Assessment…`} />
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
        <div className="min-h-[100dvh] w-full bg-[#F8F6F3] text-foreground font-sans p-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-3 py-1 rounded mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-900" />
                  {displaySkill.toUpperCase()} · Technical Assessment & Verification
                </div>
                <h1 className="text-[30px] sm:text-[36px] font-serif font-bold text-foreground leading-tight">
                  Assessment Verification Protocol
                </h1>
                <p className="text-[14px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  Review the assessment rules, select your challenge track, and verify system readiness. The proctored timer begins immediately upon entering fullscreen.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white border border-border px-4 py-2.5 rounded text-right shadow-xs">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-mono">Session Protocol</div>
                  <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 font-mono">
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-900" /> STRICT FULLSCREEN
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Track Selection, Proctoring Requirements & Guardrails (7-8 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                {/* ── Step 1: Track Selection Card (when coding challenges exist) ── */}
                {content.hasCoding && (
                  <div className="border border-border bg-white rounded overflow-hidden shadow-xs">
                    <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground uppercase tracking-[0.08em]">
                        <Layers className="h-4 w-4 text-emerald-900" />
                        Step 1 · Choose Your Assessment Track
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border transition-colors ${
                        switchingTrack
                          ? "bg-stone-100 text-stone-600 border-stone-300 animate-pulse"
                          : selectedTrack === "advanced"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-emerald-900/10 text-emerald-900 border-emerald-900/20"
                      }`}>
                        {switchingTrack
                          ? "Switching Track..."
                          : selectedTrack === "advanced"
                          ? "Gold Honors Track Selected"
                          : "Professional Track Selected"}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                        Choose your assessment difficulty level. Both tracks feature the same comprehensive MCQ section. The credential and honor badge awarded upon scoring ≥ 75% depends on the track you choose.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Standard Track */}
                        <button
                          type="button"
                          disabled={switchingTrack}
                          onClick={() => handleTrackSelect("standard")}
                          className={`relative text-left p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedTrack === "standard"
                              ? "border-emerald-700 bg-emerald-900/[0.04] ring-1 ring-emerald-700/30 shadow-xs"
                              : "border-border bg-surface hover:border-[#C8BFB0] hover:bg-white"
                          } ${switchingTrack ? "opacity-75 cursor-wait" : ""}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-lg bg-emerald-900/10 border border-emerald-900/20 flex items-center justify-center shrink-0">
                                  <ShieldCheck className="h-5 w-5 text-emerald-900" />
                                </div>
                                <div>
                                  <div className="text-[15px] font-bold text-foreground">Standard Track</div>
                                  <div className="text-[11px] text-muted-foreground">Recommended for most engineers</div>
                                </div>
                              </div>
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                selectedTrack === "standard"
                                  ? "bg-emerald-700 border-emerald-700 text-white"
                                  : "border-[#C8BFB0] bg-white"
                              }`}>
                                {selectedTrack === "standard" && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                            <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-3">
                              Solve <strong className="text-foreground">1 Easy</strong> + <strong className="text-foreground">1 Medium</strong> coding challenge from the core technical question bank.
                            </p>
                          </div>
                          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2 py-0.5 rounded">
                              <Award className="h-3 w-3" /> Verified Professional
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">Tier 1</span>
                          </div>
                        </button>

                        {/* Advanced Track */}
                        <button
                          type="button"
                          disabled={switchingTrack}
                          onClick={() => handleTrackSelect("advanced")}
                          className={`relative text-left p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedTrack === "advanced"
                              ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-500/30 shadow-xs"
                              : "border-border bg-surface hover:border-[#C8BFB0] hover:bg-white"
                          } ${switchingTrack ? "opacity-75 cursor-wait" : ""}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                                  <Trophy className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                  <div className="text-[15px] font-bold text-foreground">Advanced Track</div>
                                  <div className="text-[11px] text-muted-foreground">For senior & competitive engineers</div>
                                </div>
                              </div>
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                selectedTrack === "advanced"
                                  ? "bg-amber-600 border-amber-600 text-white"
                                  : "border-[#C8BFB0] bg-white"
                              }`}>
                                {selectedTrack === "advanced" && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                            <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-3">
                              Solve <strong className="text-foreground">1 Hard</strong> challenge designed to test algorithmic depth and performance optimization under pressure.
                            </p>
                          </div>
                          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                              <Trophy className="h-3 w-3" /> Gold Honors
                            </span>
                            <span className="text-[11px] font-mono text-amber-800 font-semibold">Honors Distinction</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Assessment Integrity & Proctoring Requirements ── */}
                <div className="border border-border bg-white rounded overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground uppercase tracking-[0.08em]">
                      <ShieldAlert className="h-4 w-4 text-danger" />
                      {content.hasCoding ? "Step 2 · Integrity & Proctoring Requirements" : "Assessment Integrity & Proctoring Requirements"}
                    </div>
                    <span className="text-[11px] font-sans font-semibold text-muted-foreground bg-white border border-border px-2 py-0.5 rounded">
                      Enforced
                    </span>
                  </div>
                  <div className="p-6 divide-y divide-[#E7E2DA]/60">
                    {[
                      {
                        icon: <Clock className="h-4 w-4 text-muted-foreground" />,
                        label: "Duration & Timer",
                        value: "60 minutes allocated. The countdown runs continuously once started.",
                      },
                      {
                        icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
                        label: "Evaluation model",
                        value: content.hasCoding
                          ? "Strict 40% MCQs (15 questions) + 60% Practical Coding Challenge with automated test cases."
                          : "100% Comprehensive Technical Evaluation covering fundamental and advanced topics.",
                      },
                      {
                        icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
                        label: "Passing threshold",
                        value: "Component thresholds must be met individually to earn the verified skill credential.",
                      },
                      {
                        icon: <Maximize2 className="h-4 w-4 text-muted-foreground" />,
                        label: "Fullscreen required",
                        value: "The assessment runs strictly in fullscreen mode. Exiting or minimizing fullscreen records an integrity violation.",
                      },
                      {
                        icon: <Monitor className="h-4 w-4 text-muted-foreground" />,
                        label: "Window & Tab Monitoring",
                        value: "Switching browser tabs, opening windows, or navigating away is actively monitored and recorded.",
                      },
                      {
                        icon: <AlertTriangle className="h-4 w-4 text-danger" />,
                        label: "3-Violation Limit",
                        value: "Accumulating 3 integrity infractions triggers immediate automatic exam termination with a 21-day lockout.",
                      },
                      {
                        icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
                        label: "Retake Policy",
                        value: "Standard retakes apply a 14-day cooldown. Terminations due to proctoring infractions incur a 21-day cooldown.",
                      },
                    ].map((rule, i) => (
                      <div key={i} className={`flex items-start gap-3.5 ${i === 0 ? "pb-3.5" : "py-3.5"}`}>
                        <div className="shrink-0 mt-0.5 p-1 rounded bg-surface border border-border">
                          {rule.icon}
                        </div>
                        <div className="flex-1">
                          <span className="text-[13px] font-semibold text-foreground block sm:inline">
                            {rule.label}:{" "}
                          </span>
                          <span className="text-[13px] text-muted-foreground leading-relaxed">
                            {rule.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Step 3: Candidate Checklist & Session Guardrails ── */}
                <div className="border border-border bg-white rounded p-5 shadow-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-foreground" />
                    Active Session Security Guardrails
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                    <div className="p-3.5 bg-surface border border-border rounded">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1 flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-emerald-900" /> Focus Guard
                      </div>
                      <div className="text-[11.5px] text-muted-foreground leading-normal">
                        Single-window fullscreen focus strictly enforced.
                      </div>
                    </div>
                    <div className="p-3.5 bg-surface border border-border rounded">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-danger" /> Anti-Tamper
                      </div>
                      <div className="text-[11.5px] text-muted-foreground leading-normal">
                        Right-click, dev shortcuts, and copy-paste locked.
                      </div>
                    </div>
                    <div className="p-3.5 bg-surface border border-border rounded">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900" /> Auto-Save
                      </div>
                      <div className="text-[11.5px] text-muted-foreground leading-normal">
                        MCQ answers and code drafts persist in real-time.
                      </div>
                    </div>
                    <div className="p-3.5 bg-surface border border-border rounded">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-1 flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-amber-700" /> Live Ledger
                      </div>
                      <div className="text-[11.5px] text-muted-foreground leading-normal">
                        Results cryptographically signed upon submission.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Assessment Overview, Verification Details & Action (4-5 cols) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
                <div className="border border-border bg-white rounded p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">
                      Assessment Overview
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">SESSION PRE-FLIGHT</span>
                  </div>

                  {/* Active Track Status Banner */}
                  {content.hasCoding && (
                    <div className={`p-3 rounded border flex items-center justify-between ${
                      selectedTrack === "advanced"
                        ? "bg-amber-50/70 border-amber-300"
                        : "bg-emerald-900/[0.04] border-emerald-900/20"
                    }`}>
                      <div className="flex items-center gap-2">
                        {selectedTrack === "advanced" ? (
                          <Trophy className="h-4 w-4 text-amber-700" />
                        ) : (
                          <Award className="h-4 w-4 text-emerald-900" />
                        )}
                        <div>
                          <div className="text-[11px] font-mono uppercase text-muted-foreground">Active Track</div>
                          <div className="text-[13px] font-bold text-foreground">
                            {selectedTrack === "advanced" ? "Advanced Track" : "Standard Track"}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        selectedTrack === "advanced" ? "bg-amber-200/60 text-amber-900" : "bg-emerald-900/10 text-emerald-900"
                      }`}>
                        {selectedTrack === "advanced" ? "Gold Honors" : "Professional"}
                      </span>
                    </div>
                  )}
                  
                  {/* Assessment Metric Boxes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-border bg-surface p-3.5 rounded">
                      <div className="text-[11px] text-muted-foreground mb-1">Duration</div>
                      <div className="text-[15px] font-semibold text-foreground flex items-center gap-1.5 font-mono">
                        <Clock className="h-4 w-4 text-muted-foreground" /> 60 mins
                      </div>
                    </div>
                    <div className="border border-border bg-surface p-3.5 rounded">
                      <div className="text-[11px] text-muted-foreground mb-1">Coding Challenge</div>
                      <div className="text-[13px] font-semibold text-foreground truncate font-mono">
                        {content.hasCoding
                          ? selectedTrack === "advanced"
                            ? "1 Hard Task"
                            : "1 Easy + 1 Medium"
                          : "No Coding"}
                      </div>
                    </div>
                    <div className="border border-border bg-surface p-3.5 rounded">
                      <div className="text-[11px] text-muted-foreground mb-1">Technical MCQs</div>
                      <div className="text-[15px] font-semibold text-foreground font-mono">
                        {content.mcqs?.length || 15} Questions
                      </div>
                    </div>
                    <div className="border border-border bg-surface p-3.5 rounded">
                      <div className="text-[11px] text-muted-foreground mb-1">Passing Mark</div>
                      <div className="text-[15px] font-semibold text-emerald-900 font-mono">
                        ≥ 75% Overall
                      </div>
                    </div>
                  </div>

                  {/* Credential Earned Card */}
                  <div className="border border-border bg-surface p-3.5 rounded">
                    <div className="text-[11px] text-muted-foreground mb-1">Credential Earned On Pass</div>
                    <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                      {content.hasCoding && selectedTrack === "advanced" ? (
                        <><Trophy className="h-3.5 w-3.5 text-amber-700" /> Gold Honors Credential</>
                      ) : (
                        <><Award className="h-3.5 w-3.5 text-emerald-900" /> Verified Professional Credential</>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Publishes directly to your public record and unlocks direct recruiter discovery.
                    </div>
                  </div>

                  {/* Readiness Status Checklist */}
                  <div className="p-3 bg-surface border border-border rounded space-y-1.5 text-[11px] text-muted-foreground font-mono">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900" />
                      <span>Fullscreen display mode armed</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900" />
                      <span>Tab &amp; focus tamper tracker armed</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900" />
                      <span>Cryptographic verification ready</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-3">
                    <button
                      onClick={handleStart}
                      className="w-full h-12 bg-foreground text-white font-semibold text-[14px] rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      I understand — Start Assessment
                    </button>
                    <button
                      onClick={() => router.push("/candidate/verification")}
                      className="w-full h-11 border border-border bg-white text-muted-foreground font-semibold text-[14px] rounded hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel / Return to Dashboard
                    </button>
                  </div>

                  {/* Important Integrity Alert */}
                  <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#92400E] leading-relaxed">
                    <span className="font-semibold block mb-0.5">⚠️ Important Integrity Rule:</span>
                    Do not click browser Back or switch tabs after starting. Forcefully navigating away will terminate your exam and register a 0% score with a 21-day lockout.
                  </div>
                </div>
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
      {infractionOverlay && !integrityTerminated && !showExitWarning && (
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

      {/* Critical Exit & Termination Warning Modal */}
      {showExitWarning && !integrityTerminated && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Assessment Exit and Termination Warning"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
        >
          <div className="w-full max-w-lg bg-white rounded border border-danger/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-2 w-full bg-danger" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-12 w-12 rounded-full bg-danger/10 border border-[#FECACA] flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-danger">
                    Critical Warning · Navigation Intercepted
                  </div>
                  <h2 className="text-[20px] font-semibold text-foreground leading-tight">
                    Leaving Will Terminate Assessment
                  </h2>
                </div>
              </div>

              <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
                You attempted to navigate back or leave the active exam. MeritLane assessments require continuous fullscreen focus.
              </p>

              <div className="bg-danger/10 border border-[#FECACA] rounded p-4 mb-6 space-y-2.5 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-danger mb-1">
                  What will happen if you exit or navigate back:
                </div>
                <div className="flex items-start gap-2.5 text-[12px] text-[#7F1D1D]">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
                  <span><strong>Immediate Exam Termination:</strong> Your active session will be ended and cannot be reopened.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[12px] text-[#7F1D1D]">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
                  <span><strong>Automatic Zero Score (0%):</strong> Your attempt will be recorded as Failed with a score of 0%.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[12px] text-[#7F1D1D]">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
                  <span><strong>21-Day Lockout:</strong> A mandatory 21-day integrity cooldown will be enforced before you can retry.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[12px] text-[#7F1D1D]">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
                  <span><strong>Integrity Violation Record:</strong> Unauthorized exit is permanently marked on your audit ledger.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={async () => {
                    setShowExitWarning(false);
                    window.history.pushState(null, "", window.location.href);
                    await requestFullscreenSafe();
                  }}
                  className="flex-1 h-12 bg-foreground text-white font-semibold text-[13px] rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Maximize2 className="h-4 w-4" />
                  Continue Assessment
                </button>
                <button
                  onClick={async () => {
                    setShowExitWarning(false);
                    await handleIntegrityTerminate();
                  }}
                  className="h-12 px-5 border border-danger text-danger hover:bg-danger/10 font-semibold text-[13px] rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Go Back (and Terminate Exam)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Leak Assessment Watermark */}
      <AssessmentWatermark
        candidateId={user?.uid || ""}
        candidateName={user?.displayName || userProfile?.displayName || ""}
        candidateEmail={user?.email || ""}
        skill={skillParam}
      />

      <div className="fixed inset-0 z-40 flex h-screen w-screen flex-col bg-[#F8F6F3] overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-2.5 shrink-0 bg-white/95 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 truncate mr-4">
            <span className="font-medium text-[11px] font-bold tracking-[0.2em] uppercase text-foreground shrink-0">
              MERITLANE
            </span>
            <span className="text-[#D4CFCB] shrink-0">/</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[11px] font-semibold tracking-wider uppercase text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2.5 py-0.5 rounded shrink-0">
              <ShieldAlert className="h-3 w-3 text-emerald-900" />
              {displaySkill} Verification
            </span>
            <button
              onClick={toggleFullscreen}
              className={`inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-2.5 py-0.5 rounded border transition-colors cursor-pointer ${
                isFullscreen
                  ? "bg-emerald-900 text-white border-emerald-900"
                  : "bg-surface text-muted-foreground hover:text-foreground border-border"
              }`}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3 text-emerald-900" />}
              <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
            <button
              onClick={() => {
                window.history.pushState(null, "", window.location.href);
                setShowExitWarning(true);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-2.5 py-0.5 rounded border border-[#FECACA] bg-danger/10 text-danger hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              title="Leaving the assessment will result in termination"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Exit</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress counter */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-surface border border-border px-2.5 py-1 rounded">
              <span>MCQs:</span>
              <strong className="text-foreground">{mcqAnswers.filter((a) => a !== undefined).length}/{content.mcqs?.length || 0}</strong>
            </div>

            {/* Violation counter */}
            {infractionCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-600 border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 rounded animate-in fade-in">
                <AlertTriangle className="h-3 w-3" />
                {infractionCount}/{MAX_VIOLATIONS} warnings
              </div>
            )}

            {/* High-visibility Timer Badge */}
            <div
              className={`flex items-center gap-1.5 font-mono text-[13px] font-bold tracking-wider px-3 py-1 rounded border transition-colors ${
                timeLeft < 300
                  ? "bg-danger/10 border-[#FECACA] text-danger animate-pulse"
                  : timeLeft < 900
                  ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                  : "bg-surface border-border text-foreground"
              }`}
              title="Assessment time remaining"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Prominent Submit Assessment Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={evaluating}
              className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold px-3.5 py-1.5 rounded bg-emerald-900 text-white hover:bg-emerald-950 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Submit entire assessment (MCQs + Coding Tasks) for final grading"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Submit Assessment</span>
            </button>
          </div>
        </header>

        {phase === "mcq" && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
            <div className="w-full space-y-6">
              {/* Question Navigator Ribbon */}
              <div className="bg-white border border-border rounded p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-[11px] font-sans font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Multiple Choice Questions
                  </span>
                  <div className="flex items-center gap-3">
                    {flaggedQuestions.filter(Boolean).length > 0 && (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Flag className="h-3 w-3 fill-amber-600" /> {flaggedQuestions.filter(Boolean).length} flagged
                      </span>
                    )}
                    <span>
                      Answered: <strong className="text-foreground">{mcqAnswers.filter((a) => a !== undefined).length}</strong> / {content.mcqs?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(content.mcqs || []).map((_, i) => {
                    const isAnswered = mcqAnswers[i] !== undefined;
                    const isCurrent = mcqIndex === i;
                    const isFlagged = flaggedQuestions[i];
                    return (
                      <button
                        key={i}
                        onClick={() => setMcqIndex(i)}
                        className={`relative w-8 h-8 rounded text-[12px] font-mono font-semibold transition-all flex items-center justify-center ${
                          isCurrent
                            ? "bg-foreground text-white ring-2 ring-foreground ring-offset-1"
                            : isAnswered
                            ? "bg-emerald-900 text-white"
                            : "bg-surface text-muted-foreground border border-border hover:border-foreground hover:text-foreground"
                        } ${isFlagged ? "ring-2 ring-amber-600" : ""}`}
                        title={`Question ${i + 1}${isAnswered ? " (Answered)" : " (Unanswered)"}${isFlagged ? " [Flagged for Review]" : ""}`}
                      >
                        {i + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white border border-border rounded p-6 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                      Question {mcqIndex + 1} of {content.mcqs?.length || 0}
                    </span>
                    {content.mcqs[mcqIndex]?.difficulty && (
                      <span
                        className={`text-[10px] font-medium uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          content.mcqs[mcqIndex].difficulty === "hard"
                            ? "bg-danger/10 text-[#991B1B] border border-[#FECACA]"
                            : content.mcqs[mcqIndex].difficulty === "medium"
                            ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                            : "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
                        }`}
                      >
                        {content.mcqs[mcqIndex].difficulty}
                      </span>
                    )}
                    {content.mcqs[mcqIndex]?.topic && (
                      <span className="text-[11px] font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
                        {content.mcqs[mcqIndex].topic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFlagQuestion(mcqIndex)}
                    className={`flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wide px-2.5 py-1 rounded transition-colors border ${
                      flaggedQuestions[mcqIndex]
                        ? "bg-[#FFFBEB] text-amber-600 border-[#FDE68A] font-semibold"
                        : "bg-white text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <Flag className={`h-3 w-3 ${flaggedQuestions[mcqIndex] ? "fill-amber-600 text-amber-600" : ""}`} />
                    {flaggedQuestions[mcqIndex] ? "Flagged for Review" : "Flag for Review"}
                  </button>
                </div>

                <h3 className="text-[17px] sm:text-[19px] font-medium text-foreground mb-6 leading-relaxed whitespace-pre-wrap font-sans">
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
                            ? "border-foreground bg-surface ring-1 ring-foreground shadow-xs"
                            : "border-border bg-white hover:border-foreground/50 hover:bg-[#FAFAF9]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                            isSelected
                              ? "bg-foreground text-white"
                              : "border border-[#D4CFCB] text-muted-foreground bg-white"
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-[14px] leading-relaxed font-sans ${isSelected ? "text-foreground font-medium" : "text-[#44403C]"}`}>
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
                    className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold border border-border bg-white text-foreground rounded hover:border-foreground disabled:opacity-40 disabled:hover:border-border transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    onClick={() => setMcqIndex((prev) => Math.min(content.mcqs.length - 1, prev + 1))}
                    disabled={mcqIndex === content.mcqs.length - 1}
                    className="flex-1 sm:flex-none px-4 py-2 text-[13px] font-semibold border border-border bg-white text-foreground rounded hover:border-foreground disabled:opacity-40 disabled:hover:border-border transition-colors flex items-center justify-center gap-1.5"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  {content.hasCoding ? (
                    <button
                      onClick={() => setPhase("coding")}
                      className="w-full sm:w-auto px-5 py-2 text-[13px] font-semibold bg-emerald-900 text-white rounded hover:bg-emerald-950 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span>Proceed to Coding Challenge</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full sm:w-auto px-5 py-2 text-[13px] font-semibold bg-emerald-900 text-white rounded hover:bg-emerald-950 transition-colors flex items-center justify-center gap-2 shadow-2xs"
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

        {phase === "coding" && (content.coding || (content.codingTasks && content.codingTasks.length > 0)) && (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-3 gap-3 bg-[#F4F1EA] min-h-0">
            {/* Left Pane: Problem Description & Guidelines */}
            <div className="w-full lg:w-[42%] lg:max-w-[560px] bg-white border border-border rounded flex flex-col h-[38vh] lg:h-full shrink-0 overflow-hidden shadow-xs min-h-0">
              {/* Problem Tab Header */}
              <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 shrink-0">
                <div className="flex items-center gap-2 truncate mr-2">
                  <button
                    onClick={() => setPhase("mcq")}
                    className="flex items-center gap-1 text-[11px] font-sans font-semibold uppercase tracking-wide text-muted-foreground bg-white hover:text-foreground hover:border-foreground border border-border px-2 py-0.5 rounded transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" /> MCQs ({mcqAnswers.filter((a) => a !== undefined).length}/{content.mcqs.length})
                  </button>
                  {content.codingTasks && content.codingTasks.length >= 2 ? (
                    <div className="flex items-center gap-1 bg-[#EFECE6] p-0.5 rounded border border-border">
                      <button
                        onClick={() => handleSwitchCodingTask(0)}
                        className={`px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                          activeCodingTaskIdx === 0
                            ? "bg-white text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {content.codingTasks[0]?.difficulty === "hard"
                          ? "Task 1 (Hard)"
                          : content.codingTasks[0]?.difficulty === "medium"
                          ? "Task 1 (Medium)"
                          : "Task 1 (Easy)"}
                      </button>
                      <button
                        onClick={() => handleSwitchCodingTask(1)}
                        className={`px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                          activeCodingTaskIdx === 1
                            ? "bg-white text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {content.codingTasks[1]?.difficulty === "hard"
                          ? "Task 2 (Hard)"
                          : content.codingTasks[1]?.difficulty === "easy"
                          ? "Task 2 (Easy)"
                          : "Task 2 (Medium)"}
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[11px] font-sans font-semibold uppercase tracking-wide px-2 py-0.5 rounded shrink-0 ${
                      content.codingTasks?.[0]?.difficulty === "hard"
                        ? "text-rose-900 bg-rose-100/80 border border-rose-300 font-bold"
                        : content.codingTasks?.[0]?.difficulty === "medium"
                        ? "text-amber-900 bg-amber-100/80 border border-amber-300 font-bold"
                        : "text-emerald-900 bg-emerald-900/10 font-bold"
                    }`}>
                      {content.codingTasks?.[0]?.difficulty === "hard"
                        ? "Task 1 (Hard Challenge)"
                        : content.codingTasks?.[0]?.difficulty === "medium"
                        ? "Task 1 (Medium Challenge)"
                        : "Task 1 (Easy Challenge)"}
                    </span>
                  )}
                  <span className="text-[13px] font-sans font-semibold text-foreground truncate">
                    {(content.codingTasks?.[activeCodingTaskIdx] || content.coding)?.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground bg-white border border-border px-2 py-0.5 rounded shrink-0">
                  {selectedLanguage.toUpperCase()}
                </span>
              </div>

              {/* Problem Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-h-0">
                <div>
                  <h3 className="text-[11px] font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Problem Description
                  </h3>
                  <div className="bg-surface/50 p-4 sm:p-5 rounded-lg border border-border">
                    <LeetCodeProblemDescription
                      instructions={(content.codingTasks?.[activeCodingTaskIdx] || content.coding)?.instructions || ""}
                    />
                  </div>
                </div>

                <div className="border border-border rounded p-4 bg-white">
                  <h4 className="text-[12px] font-sans font-semibold uppercase tracking-wide text-emerald-900 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Examination Rule
                  </h4>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    Complete the solution implementation in the required language and compile against public test cases before submitting for authoritative evaluation.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Pane: Code Editor + Test Console */}
            <div className="flex flex-1 flex-col gap-3 min-h-0 overflow-hidden">
              {/* Top Section: Code Editor Pane */}
              <div className={`flex-1 min-h-0 rounded flex flex-col overflow-hidden shadow-xs border transition-colors ${
                editorTheme === "dark" ? "bg-[#0D1117] border-[#30363D]" : "bg-white border-border"
              }`}>
                {/* Editor Header Bar */}
                <div className={`flex flex-wrap items-center justify-between px-4 py-2 shrink-0 border-b gap-2 ${
                  editorTheme === "dark" ? "bg-[#161B22] border-[#30363D]" : "bg-surface border-border"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Code className={`h-4 w-4 ${editorTheme === "dark" ? "text-[#58A6FF]" : "text-emerald-900"}`} />
                    <span className={`text-[12px] font-mono font-medium ${editorTheme === "dark" ? "text-[#E6EDF3]" : "text-foreground"}`}>
                      Solution.{
                        selectedLanguage === 'go' ? 'go' :
                        selectedLanguage === 'python' ? 'py' :
                        selectedLanguage === 'javascript' ? 'js' :
                        selectedLanguage === 'typescript' ? 'ts' :
                        selectedLanguage === 'java' ? 'java' :
                        selectedLanguage === 'cpp' ? 'cpp' :
                        selectedLanguage === 'csharp' ? 'cs' :
                        selectedLanguage === 'sql' ? 'sql' :
                        selectedLanguage === 'rust' ? 'rs' : 'txt'
                      }
                    </span>
                    {draftSavedToast && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-900 bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#BBF7D0] animate-in fade-in duration-150">
                        <Check className="h-3 w-3" /> Draft saved
                      </span>
                    )}
                    {copiedCodeToast && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-900 bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#BBF7D0] animate-in fade-in duration-150">
                        <Check className="h-3 w-3" /> Code copied
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(code);
                          setCopiedCodeToast(true);
                          setTimeout(() => setCopiedCodeToast(false), 1500);
                        }
                      }}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white hover:border-[#8B949E]"
                          : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                      }`}
                      title="Copy full code buffer"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                    <button
                      onClick={handleFormatCode}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white hover:border-[#8B949E]"
                          : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                      }`}
                      title="Format indentation (4 spaces) and clean trailing whitespace"
                    >
                      <Sparkles className="h-3 w-3 text-amber-600" /> Format
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#F85149] hover:bg-danger/20"
                          : "bg-white border-border text-muted-foreground hover:text-danger hover:border-[#FECACA]"
                      }`}
                      title="Reset code to starter template"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset to starter code
                    </button>

                    {/* Editor Engine Mode (Monaco vs Standard) */}
                    <button
                      onClick={() => setUseFallbackEditor(!useFallbackEditor)}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#58A6FF] hover:text-white"
                          : "bg-white border-border text-emerald-900 hover:text-foreground"
                      }`}
                      title={useFallbackEditor ? "Switch to Monaco Editor" : "Switch to Simple Editor"}
                    >
                      <FileCode className="h-3 w-3" />
                      <span className="hidden sm:inline">{useFallbackEditor ? "Monaco" : "Editor"}</span>
                    </button>

                    {/* Editor Theme Switcher */}
                    <button
                      onClick={() => setEditorTheme(editorTheme === "dark" ? "light" : "dark")}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white"
                          : "bg-white border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title={`Switch to ${editorTheme === "dark" ? "Light" : "Dark"} editor theme`}
                    >
                      {editorTheme === "dark" ? <Sun className="h-3 w-3 text-[#FBBF24]" /> : <Moon className="h-3 w-3 text-[#6366F1]" />}
                      <span className="hidden sm:inline">{editorTheme === "dark" ? "Light" : "Dark"}</span>
                    </button>

                    {/* Font Size Selector */}
                    <select
                      value={editorFontSize}
                      onChange={(e) => setEditorFontSize(Number(e.target.value))}
                      className={`text-[11px] font-mono rounded px-1.5 py-1 border outline-none ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9]"
                          : "bg-white border-border text-foreground"
                      }`}
                      title="Editor font size"
                    >
                      <option value={12}>12px</option>
                      <option value={13}>13px</option>
                      <option value={14}>14px</option>
                      <option value={15}>15px</option>
                    </select>

                    {/* Strict Language Lock Badge (No Dropdown When Locked) */}
                    {(() => {
                      const currentLocked = lockedLang || (isSqlSkill ? { id: "sql", name: "SQL", monacoLang: "sql", ext: "sql" } : null);
                      const isLocked = Boolean(currentLocked || isLanguageLocked);
                      const currentName =
                        currentLocked?.name ||
                        (selectedLanguage === "go" ? "Go 1.22" :
                         selectedLanguage === "javascript" ? "JavaScript (Node/ES6)" :
                         selectedLanguage === "typescript" ? "TypeScript" :
                         selectedLanguage === "python" ? "Python 3" :
                         selectedLanguage === "java" ? "Java 21" :
                         selectedLanguage === "cpp" ? "C++ (GCC 14)" :
                         selectedLanguage === "csharp" ? "C# (.NET 8)" :
                         selectedLanguage === "sql" ? "SQL" : selectedLanguage);

                      if (isLocked) {
                        return (
                          <div
                            className={`text-[11px] font-mono font-semibold border rounded px-3 py-1 flex items-center gap-1.5 select-none ${
                              editorTheme === "dark"
                                ? "bg-[#21262D] border-[#30363D] text-[#58A6FF]"
                                : "bg-surface border-border text-foreground"
                            }`}
                            title={`Language strictly locked to ${currentName} for this examination`}
                          >
                            <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>{currentName}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                              LOCKED
                            </span>
                          </div>
                        );
                      }

                      const availableLangs = content.codingTasks?.[activeCodingTaskIdx]?.supportedLanguages || content.coding?.supportedLanguages || COMMON_SUPPORTED_LANGUAGES;
                      return (
                        <select
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className={`text-[11px] font-mono font-medium border rounded px-2 py-1 outline-none ${
                            editorTheme === "dark"
                              ? "bg-[#21262D] border-[#30363D] text-[#58A6FF]"
                              : "bg-white border-border text-foreground"
                          }`}
                        >
                          {availableLangs.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>

                {/* Monaco Editor (LeetCode 100% Experience) with Resilient Fallback */}
                <div className="flex-1 min-h-0 relative w-full h-full overflow-hidden bg-[#0D1117] flex flex-col">
                  {useFallbackEditor ? (
                    <div className="flex-1 w-full h-full flex flex-col relative bg-[#0D1117]">
                      <div className="flex items-center justify-between px-3 py-1 bg-[#161B22] border-b border-[#30363D] text-[11px] text-[#8B949E] font-mono">
                        <span>Standard Code Editor (Typing Active)</span>
                        <button
                          onClick={() => setUseFallbackEditor(false)}
                          className="text-[#58A6FF] hover:underline"
                        >
                          Switch to Monaco Editor
                        </button>
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => {
                          handleCodeChange(e.target.value);
                          updateCursorPosition();
                        }}
                        onKeyDown={handleEditorKeyDown}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder={`Write your ${selectedLanguage.toUpperCase()} solution here...`}
                        className="flex-1 w-full h-full p-4 bg-[#0D1117] text-[#E6EDF3] font-mono text-[13px] leading-relaxed resize-none outline-none border-none selection:bg-[#264F78]"
                      />
                    </div>
                  ) : (
                    <MonacoEditor
                      height="100%"
                      path={`task-${activeCodingTaskIdx}-lang-${selectedLanguage}`}
                      language={
                        SKILL_LOCKED_LANGUAGES[selectedLanguage]?.monacoLang ||
                        (selectedLanguage === "go" ? "go" :
                        selectedLanguage === "python" ? "python" :
                        selectedLanguage === "javascript" ? "javascript" :
                        selectedLanguage === "typescript" ? "typescript" :
                        selectedLanguage === "java" ? "java" :
                        selectedLanguage === "cpp" ? "cpp" :
                        selectedLanguage === "c" ? "c" :
                        selectedLanguage === "csharp" ? "csharp" :
                        selectedLanguage === "sql" ? "sql" :
                        selectedLanguage === "rust" ? "rust" : "plaintext")
                      }
                      theme={editorTheme === "dark" ? "vs-dark" : "light"}
                      defaultValue={code}
                      onMount={handleEditorMount}
                      onChange={(val) => handleCodeChange(val || "")}
                    options={{
                      fontSize: editorFontSize,
                      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
                      fontLigatures: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: "on",
                      lineNumbersMinChars: 3,
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      roundedSelection: true,
                      automaticLayout: true,
                      tabSize: 4,
                      insertSpaces: true,
                      detectIndentation: false,
                      autoIndent: "advanced",
                      matchBrackets: "always",
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      formatOnPaste: false,
                      formatOnType: false,
                      trimAutoWhitespace: false,
                      wordWrap: "on",
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      quickSuggestions: false,
                      suggestOnTriggerCharacters: false,
                      snippetSuggestions: "none",
                      wordBasedSuggestions: "off",
                      parameterHints: { enabled: false },
                      suggest: {
                        showKeywords: false,
                        showSnippets: false,
                        showWords: false,
                        showFunctions: false,
                        showVariables: false,
                        showClasses: false,
                        showModules: false,
                        showProperties: false,
                        showInterfaces: false,
                        showReferences: false,
                        showConstants: false,
                        showConstructors: false,
                        showFields: false,
                        showEvents: false,
                        showOperators: false,
                        showUnits: false,
                        showValues: false,
                        showStructs: false,
                        showTypeParameters: false,
                      },
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                  )}
                </div>

                {/* Shortcuts & Editor Hints Bar */}
                <div className={`px-4 py-1.5 border-t text-[11px] font-mono flex items-center justify-between shrink-0 ${
                  editorTheme === "dark"
                    ? "bg-[#161B22] border-[#30363D] text-[#8B949E]"
                    : "bg-surface border-border text-muted-foreground"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={editorTheme === "dark" ? "text-[#6E7681]" : "text-muted-foreground/70"}>Shortcuts:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      editorTheme === "dark" ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9]" : "bg-white border-border text-foreground"
                    }`}>Tab</span>
                    <span>Indent ·</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      editorTheme === "dark" ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9]" : "bg-white border-border text-foreground"
                    }`}>Ctrl+Enter</span>
                    <span>Run (5 Cases) ·</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      editorTheme === "dark" ? "bg-[#21262D] border-[#30363D] text-[#C9D1D9]" : "bg-white border-border text-foreground"
                    }`}>Ctrl+S</span>
                    <span>Save</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                    <span className={editorTheme === "dark" ? "text-[#30363D]" : "text-border"}>|</span>
                    <span className="hidden sm:inline">{code?.length || 0} chars</span>
                    <span className={editorTheme === "dark" ? "text-[#30363D]" : "text-border"}>|</span>
                    <span className="hidden md:inline text-[#10B981] font-semibold">● Sandbox Ready</span>
                    <span className={editorTheme === "dark" ? "text-[#30363D]" : "text-border"}>|</span>
                    <span className={editorTheme === "dark" ? "text-[#58A6FF] font-semibold" : "text-emerald-900 font-semibold"}>
                      {selectedLanguage.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Testcase Console & Action Buttons */}
              <div className={`rounded-lg flex flex-col overflow-hidden shadow-sm shrink-0 border transition-all duration-300 ease-in-out ${
                isConsoleExpanded ? "h-[460px] lg:h-[500px]" : "h-[240px] lg:h-[265px]"
              } ${
                editorTheme === "dark" ? "bg-[#0B111A]/95 backdrop-blur-md border-[#30363D]" : "bg-white/95 backdrop-blur-md border-border"
              }`}>
                {/* Console Tab Header */}
                <div className={`flex flex-wrap items-center justify-between px-3.5 py-2 shrink-0 border-b gap-2 ${
                  editorTheme === "dark" ? "bg-[#161B22]/90 border-[#30363D]" : "bg-surface/90 border-border"
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConsoleTab("testcases")}
                      className={`text-[12px] font-sans font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeConsoleTab === "testcases"
                          ? editorTheme === "dark" ? "border-[#58A6FF] text-[#58A6FF]" : "border-emerald-900 text-emerald-900"
                          : editorTheme === "dark" ? "border-transparent text-[#8B949E] hover:text-[#E6EDF3]" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Test Cases (5 Cases)</span>
                      {testRunStats && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            testRunStats.passed === testRunStats.total
                              ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30"
                              : "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30"
                          }`}
                        >
                          {testRunStats.passed}/{testRunStats.total}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("console")}
                      className={`text-[12px] font-sans font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeConsoleTab === "console"
                          ? editorTheme === "dark" ? "border-[#58A6FF] text-[#58A6FF]" : "border-emerald-900 text-emerald-900"
                          : editorTheme === "dark" ? "border-transparent text-[#8B949E] hover:text-[#E6EDF3]" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Console Output</span>
                      {output && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeConsoleTab === "console" && output && (
                      <button
                        onClick={handleClearOutput}
                        className={`text-[11px] font-mono px-2 py-1.5 rounded border transition-colors cursor-pointer ${
                          editorTheme === "dark"
                            ? "bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-white"
                            : "bg-white border-border text-muted-foreground hover:text-foreground"
                        }`}
                        title="Clear console output"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => handleTest(false)}
                      disabled={evaluating || timeLeft <= 0}
                      className={`text-[12px] font-sans font-semibold border px-3.5 py-1.5 rounded transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                        editorTheme === "dark"
                          ? "bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]"
                          : "bg-white border-border text-foreground hover:bg-surface"
                      } disabled:opacity-50`}
                      title="Run code against the 5 public test cases"
                    >
                      {evaluating ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                          <span>Running 5 Cases...</span>
                        </>
                      ) : (
                        "Run Code (5 Cases)"
                      )}
                    </button>
                    <button
                      onClick={() => handleTest(true)}
                      disabled={evaluating || timeLeft <= 0}
                      className="text-[12px] font-sans font-semibold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-1.5 disabled:opacity-50 rounded transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Run all 50 evaluation test suites for this task"
                    >
                      <span>Evaluate Task (50 Tests)</span>
                    </button>
                  </div>
                </div>

                {/* Console Log, Test Output, or Custom Test Runner */}
                <div className={`flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed scrollbar-hide ${
                  editorTheme === "dark" ? "bg-[#0B111A] text-[#E6EDF3]" : "bg-[#FAFAF9] text-foreground"
                }`}>
                  {activeConsoleTab === "custom" ? (
                    <div className="flex flex-col h-full space-y-2 font-sans">
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Interactive Input Parameters / Stdin:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground/70">Presets:</span>
                          <button
                            onClick={() => setCustomInput("T1,USD,100.50,COMPLETED\nT2,USD,50.25,PENDING\nT3,EUR,75.00,COMPLETED")}
                            className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-foreground hover:border-foreground"
                          >
                            Sample 1
                          </button>
                          <button
                            onClick={() => setCustomInput("TX1,CAD,200.00,COMPLETED\nTX2,CAD,150.00,COMPLETED")}
                            className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-foreground hover:border-foreground"
                          >
                            Sample 2
                          </button>
                          <button
                            onClick={() => setCustomInput("")}
                            className="text-[10px] bg-white border border-border px-1.5 py-0.5 rounded text-muted-foreground hover:text-danger"
                          >
                            Empty
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Provide test arguments or stdin (e.g. CSV lines or parameter arguments) to test your implementation."
                        className={`w-full flex-1 p-3 font-mono text-[12px] rounded outline-none resize-none border ${
                          editorTheme === "dark"
                            ? "bg-[#161B22] border-[#30363D] text-[#E6EDF3] focus:border-[#58A6FF]"
                            : "bg-white border-border text-foreground focus:border-foreground"
                        }`}
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Click <strong>Run Custom</strong> or press <strong>Ctrl+Enter</strong> to execute with this input.</span>
                      </div>
                    </div>
                  ) : activeConsoleTab === "console" ? (
                    <div className="h-full flex flex-col justify-between">
                      <pre className={`whitespace-pre-wrap font-mono ${
                        output.includes("[Compilation / Syntax Error]") || output.includes("[Execution Error]")
                          ? "text-[#F85149]"
                          : editorTheme === "dark" ? "text-[#7EE787]" : "text-foreground"
                      }`}>
                        {output || (
                          <span className={editorTheme === "dark" ? "text-[#8B949E]" : "text-muted-foreground"}>
                            Sandbox compiler ready. Press &apos;Run Code (5 Cases)&apos; or Ctrl+Enter to execute test assertions.
                          </span>
                        )}
                      </pre>
                    </div>
                  ) : (
                    /* Test Cases Tab: Pill switchers for Case 1 to 5 */
                    <div className="space-y-3 font-sans">
                      {/* Pill tabs for the 5 public test cases */}
                      <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                          {displayCases.map((tCase, idx) => {
                            const isSelected = selectedCaseIdx === idx;
                            const isPassed = tCase.passed === true;
                            const isFailed = tCase.passed === false;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedCaseIdx(idx)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                                  isSelected
                                    ? editorTheme === "dark"
                                      ? "bg-[#21262D] text-white border border-[#58A6FF]"
                                      : "bg-white text-foreground border border-foreground shadow-xs"
                                    : editorTheme === "dark"
                                      ? "bg-[#161B22] text-[#8B949E] border border-[#30363D] hover:text-white"
                                      : "bg-surface text-muted-foreground border border-border hover:text-foreground"
                                }`}
                              >
                                <span>Case {idx + 1}</span>
                                {isPassed && (
                                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#10B981] text-white text-[9px] font-bold">
                                    ✓
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#EF4444] text-white text-[9px] font-bold">
                                    ✗
                                  </span>
                                )}
                                {tCase.passed === null && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {testRunStats && (
                          <div className="text-[11px] font-mono flex items-center gap-2">
                            <span className={editorTheme === "dark" ? "text-[#8B949E]" : "text-muted-foreground"}>
                              Runtime: <strong className={editorTheme === "dark" ? "text-white" : "text-foreground"}>{testRunStats.durationMs}ms</strong>
                            </span>
                            <span className={testRunStats.passed === testRunStats.total ? "text-[#10B981] font-semibold" : "text-[#EF4444] font-semibold"}>
                              ({testRunStats.passed}/{testRunStats.total} Passed)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selected Case Content */}
                      {displayCases[selectedCaseIdx] && (
                        <div className="space-y-2.5 text-[12px] font-mono">
                          {/* Case Header */}
                          <div className="flex items-center justify-between">
                            <span className={`font-sans font-semibold text-[13px] ${
                              editorTheme === "dark" ? "text-white" : "text-foreground"
                            }`}>
                              {displayCases[selectedCaseIdx].name}
                            </span>
                            {displayCases[selectedCaseIdx].passed !== null && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-bold ${
                                displayCases[selectedCaseIdx].status === "TLE"
                                  ? "bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40"
                                  : displayCases[selectedCaseIdx].status === "RE"
                                  ? "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40"
                                  : displayCases[selectedCaseIdx].passed
                                  ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
                                  : "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40"
                              }`}>
                                {displayCases[selectedCaseIdx].status === "TLE" ? "Time Limit Exceeded ⏱"
                                  : displayCases[selectedCaseIdx].status === "RE" ? "Runtime Error ⚠"
                                  : displayCases[selectedCaseIdx].status === "WA" ? "Wrong Answer ✗"
                                  : displayCases[selectedCaseIdx].passed ? "Accepted ✓"
                                  : "Failed ✗"}
                              </span>
                            )}
                          </div>

                          {/* Input Box with Copy Button */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8B949E] mb-1">
                              <span>Input / Parameters:</span>
                              <button
                                onClick={() => {
                                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                                    navigator.clipboard.writeText(displayCases[selectedCaseIdx].input);
                                    setCopiedInputIdx(selectedCaseIdx);
                                    setTimeout(() => setCopiedInputIdx(null), 1500);
                                  }
                                }}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                              >
                                {copiedInputIdx === selectedCaseIdx ? (
                                  <>
                                    <Check className="h-3 w-3 text-[#10B981]" />
                                    <span className="text-[#10B981]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Input</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className={`p-2.5 rounded-md font-mono text-[12px] whitespace-pre-wrap overflow-x-auto transition-all ${
                              isConsoleExpanded ? "max-h-36" : "max-h-20"
                            } ${
                              editorTheme === "dark"
                                ? "bg-[#161B22] text-[#E6EDF3] border border-[#30363D]"
                                : "bg-white text-foreground border border-border"
                            }`}>
                              {displayCases[selectedCaseIdx].input}
                            </div>
                          </div>

                          {/* Expected Output */}
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[#8B949E] mb-1">
                              Expected Output:
                            </div>
                            <div className={`p-2.5 rounded-md font-mono text-[12px] whitespace-pre-wrap overflow-x-auto transition-all ${
                              isConsoleExpanded ? "max-h-28" : "max-h-16"
                            } ${
                              editorTheme === "dark"
                                ? "bg-[#161B22] text-[#7EE787] border border-[#30363D]"
                                : "bg-white text-emerald-900 border border-border"
                            }`}>
                              {displayCases[selectedCaseIdx].expected}
                            </div>
                          </div>

                          {/* Actual Output (if executed) */}
                          {displayCases[selectedCaseIdx].actual !== undefined && displayCases[selectedCaseIdx].actual !== "" && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[#8B949E] mb-1 flex items-center justify-between">
                                <span>Your Output:</span>
                                {displayCases[selectedCaseIdx].runtimeMs !== undefined && (
                                  <span className="text-[10px] text-[#8B949E] font-sans">Runtime: {displayCases[selectedCaseIdx].runtimeMs} ms</span>
                                )}
                              </div>
                              <div className={`p-2.5 rounded-md font-mono text-[12px] whitespace-pre-wrap overflow-x-auto transition-all ${
                                isConsoleExpanded ? "max-h-28" : "max-h-16"
                              } ${
                                displayCases[selectedCaseIdx].passed
                                  ? editorTheme === "dark"
                                    ? "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30"
                                    : "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
                                  : editorTheme === "dark"
                                    ? "bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30"
                                    : "bg-danger/10 text-[#991B1B] border border-[#FECACA]"
                              }`}>
                                {displayCases[selectedCaseIdx].actual}
                              </div>
                            </div>
                          )}

                          {/* Stdout / Console Logs (if any) */}
                          {displayCases[selectedCaseIdx].consoleLogs && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[#8B949E] mb-1 mt-2">
                                Stdout:
                              </div>
                              <div className={`p-2.5 rounded font-mono text-[12px] whitespace-pre-wrap overflow-x-auto max-h-16 ${
                                editorTheme === "dark"
                                  ? "bg-[#161B22] text-[#E6EDF3] border border-[#30363D]"
                                  : "bg-[#F3F4F6] text-foreground border border-border"
                              }`}>
                                {displayCases[selectedCaseIdx].consoleLogs}
                              </div>
                            </div>
                          )}
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
          <div className="max-w-md w-full bg-white rounded border border-border shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-danger/10 text-danger border border-[#FECACA]">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">Reset Code to Template</h3>
                <p className="text-[12px] text-muted-foreground">Restore starting solution code</p>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              Are you sure you want to reset your code to the starter template? All uncommitted edits in this editor will be replaced.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-10 border border-border text-muted-foreground font-semibold text-[13px] rounded hover:border-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCode}
                className="flex-1 h-10 bg-danger text-white font-semibold text-[13px] rounded hover:bg-[#991B1B] transition-colors"
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
          <div className="max-w-md w-full bg-white rounded border border-border shadow-xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-surface text-foreground border border-border">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">Confirm Final Submission</h3>
                <p className="text-[12px] text-muted-foreground">MeritLane Technical Assessment</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="border border-border bg-surface p-3 rounded flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Multiple Choice:</span>
                <span className="font-semibold text-foreground">
                  {mcqAnswers.filter((a) => a !== undefined).length} of {content.mcqs.length} answered
                </span>
              </div>

              {flaggedQuestions.filter(Boolean).length > 0 && (
                <div className="border border-[#FDE68A] bg-[#FFFBEB] p-3 rounded flex items-start gap-2 text-[12px] text-[#92400E]">
                  <Flag className="h-4 w-4 shrink-0 mt-0.5 fill-amber-600 text-amber-600" />
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
                <div className="border border-border bg-surface p-3 rounded flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Coding ({selectedLanguage.toUpperCase()}):</span>
                  <span className="font-semibold text-foreground">
                    {testRunStats ? `${testRunStats.passed}/${testRunStats.total} public tests passed` : "Solution ready"}
                  </span>
                </div>
              )}

              <div className="border border-border bg-surface p-3 rounded flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Time Remaining:</span>
                <span className="font-mono font-semibold text-foreground">{formatTime(timeLeft)}</span>
              </div>

              <p className="text-[12px] text-muted-foreground leading-relaxed pt-1">
                Once submitted, your answers and code will be authoritatively graded against hidden test suites. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={evaluating}
                className="flex-1 h-10 border border-border text-muted-foreground font-semibold text-[13px] rounded hover:border-foreground hover:text-foreground transition-colors"
              >
                Return to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={evaluating}
                className="flex-1 h-10 bg-emerald-900 text-white font-semibold text-[13px] rounded hover:bg-emerald-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {evaluating ? "Evaluating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 50-Test-Case Submission & Grading Progress Modal */}
      {submittingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-white text-foreground rounded-2xl border border-border shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5 border-b border-border pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900/10 text-emerald-900 border border-emerald-900/20 shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-foreground tracking-tight">
                  Authoritative Evaluation &amp; Grading
                </h3>
                <p className="text-[12px] text-muted-foreground font-mono">
                  MeritLane Sandbox Compiler · 50-Case Test Suite
                </p>
              </div>
            </div>

            {/* Progress Bar & Numerical Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] font-mono">
                <span className="text-muted-foreground">
                  Test Suites Executed:
                </span>
                <span className="text-emerald-900 font-bold">
                  {Math.min(50, Math.floor((submissionProgress / 100) * 50))} / 50 Cases ({submissionProgress}%)
                </span>
              </div>
              <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className="h-full bg-emerald-900 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(4, submissionProgress)}%` }}
                />
              </div>
            </div>

            {/* Dynamic Stage Checklist */}
            <div className="space-y-2.5 font-mono text-[11.5px] bg-surface p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${submissionProgress >= 20 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {submissionProgress >= 20 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-900 animate-spin shrink-0" />
                  )}
                  <span>Suites 1–10: Baseline Functionality &amp; Types</span>
                </span>
                {submissionProgress >= 20 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Passed</span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Running</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${submissionProgress >= 50 ? "text-foreground font-medium" : submissionProgress >= 20 ? "text-emerald-900 font-semibold" : "text-muted-foreground/70"}`}>
                  {submissionProgress >= 50 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                  ) : submissionProgress >= 20 ? (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-900 animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span>Suites 11–25: Boundary &amp; Corner Cases</span>
                </span>
                {submissionProgress >= 50 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Passed</span>
                ) : submissionProgress >= 20 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Running</span>
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground/70">Queued</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${submissionProgress >= 80 ? "text-foreground font-medium" : submissionProgress >= 50 ? "text-emerald-900 font-semibold" : "text-muted-foreground/70"}`}>
                  {submissionProgress >= 80 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                  ) : submissionProgress >= 50 ? (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-900 animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span>Suites 26–40: Computational Scale</span>
                </span>
                {submissionProgress >= 80 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Passed</span>
                ) : submissionProgress >= 50 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Running</span>
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground/70">Queued</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${submissionProgress >= 95 ? "text-foreground font-medium" : submissionProgress >= 80 ? "text-emerald-900 font-semibold" : "text-muted-foreground/70"}`}>
                  {submissionProgress >= 95 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                  ) : submissionProgress >= 80 ? (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-900 animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span>Suites 41–50: Memory &amp; Concurrency</span>
                </span>
                {submissionProgress >= 95 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Passed</span>
                ) : submissionProgress >= 80 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Running</span>
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground/70">Queued</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${submissionProgress >= 100 ? "text-foreground font-medium" : submissionProgress >= 95 ? "text-emerald-900 font-semibold" : "text-muted-foreground/70"}`}>
                  {submissionProgress >= 100 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                  ) : submissionProgress >= 95 ? (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-900 animate-spin shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                  )}
                  <span>Ledger Sync &amp; Assessment Scorecard</span>
                </span>
                {submissionProgress >= 100 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Synced</span>
                ) : submissionProgress >= 95 ? (
                  <span className="text-[10px] uppercase font-bold text-emerald-900">Syncing</span>
                ) : (
                  <span className="text-[10px] uppercase text-muted-foreground/70">Pending</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[12px] text-muted-foreground font-sans">
              <Lock className="h-3.5 w-3.5 text-emerald-900" />
              <span>Please keep this window open while the sandbox grades your solution.</span>
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
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <MeritlaneLoader level="page" text="Loading Assessment Environment…" />
        </div>
      }
    >
      <AssessmentContentWrapper />
    </Suspense>
  );
}
