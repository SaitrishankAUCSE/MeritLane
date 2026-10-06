"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { collection, onSnapshot, getDocs, query, orderBy } from "firebase/firestore";
import { getIdToken } from "firebase/auth";
import {
  Sparkles, Brain, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, Code2, FileQuestion,
  Play, ShieldCheck, ShieldX, RefreshCw, Loader2,
  Check, X, Eye, EyeOff, ArrowRight, Terminal,
  BookOpen, Cpu, Layers, Star, Trophy, Info,
  Lock, Unlock, FlaskConical, ClipboardList,
} from "lucide-react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

const AVAILABLE_SKILLS = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js",
  "Node.js", "Java", "C++", "SQL", "Go",
  "Vue.js", "Angular", "Rust", "Swift", "Kotlin",
];

type DraftStatus = "pending" | "approved" | "rejected" | "verifying";

interface MCQDraft {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  status: DraftStatus;
}

interface CodingDraft {
  id: string;
  difficulty: "easy" | "medium_hard";
  title: string;
  instructions: string;
  functionName: string;
  starterCode: { javascript?: string };
  publicTests: { name: string; inputArgs: unknown[]; expected: unknown }[];
  proposedReferenceCode: string;
  proposedWrongCode: string;
  status: DraftStatus;
  referenceRunResult?: RunResult | null;
  wrongRunResult?: RunResult | null;
  verifyGatePassed?: boolean;
}

interface RunResult {
  success: boolean;
  compileSuccess: boolean;
  passedTests: number;
  totalTests: number;
  cases: { name: string; passed: boolean; actual: string; expected: string }[];
  stderr: string;
  stdout: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    easy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    medium_hard: "bg-orange-50 text-orange-700 border border-orange-200",
    hard: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${map[level] || map.medium}`}>
      {level.replace("_", "-").toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: DraftStatus }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <Check className="h-3 w-3" /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
      <X className="h-3 w-3" /> Rejected
    </span>
  );
  if (status === "verifying") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <Loader2 className="h-3 w-3 animate-spin" /> Verifying
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
      <Clock className="h-3 w-3" /> Pending Review
    </span>
  );
}

function Clock({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

function RunResultPanel({ result, label }: { result: RunResult | null | undefined; label: string }) {
  if (!result) return null;
  const allPassed = result.passedTests === result.totalTests;
  return (
    <div className={`rounded-lg border p-4 ${allPassed ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-stone-700 uppercase tracking-wide">{label}</span>
        <span className={`text-[13px] font-bold ${allPassed ? "text-emerald-700" : "text-red-700"}`}>
          {result.passedTests}/{result.totalTests} Passed {allPassed ? "✓" : "✗"}
        </span>
      </div>
      <div className="space-y-1.5">
        {result.cases.slice(0, 5).map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px]">
            <span className={`mt-0.5 shrink-0 ${c.passed ? "text-emerald-600" : "text-red-600"}`}>
              {c.passed ? "●" : "○"}
            </span>
            <span className="text-stone-600 truncate">{c.name}</span>
          </div>
        ))}
      </div>
      {result.stderr && (
        <div className="mt-2 rounded bg-stone-900 p-2 font-mono text-[11px] text-red-300 overflow-x-auto">
          {result.stderr.slice(0, 200)}
        </div>
      )}
    </div>
  );
}

// ─── MCQ Card ────────────────────────────────────────────────────────────────

function MCQDraftCard({
  draft, index, onApprove, onReject,
}: {
  draft: MCQDraft; index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isReviewed = draft.status === "approved" || draft.status === "rejected";

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      draft.status === "approved" ? "border-emerald-200 bg-emerald-50/30" :
      draft.status === "rejected" ? "border-red-100 bg-red-50/20 opacity-60" :
      "border-stone-200 bg-white hover:border-stone-300"
    }`}>
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="shrink-0 w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[12px] font-bold text-stone-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <DifficultyBadge level={draft.difficulty} />
            <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{draft.topic}</span>
            <StatusBadge status={draft.status} />
          </div>
          <p className="text-[13px] text-stone-800 leading-relaxed line-clamp-2">{draft.question}</p>
        </div>
        <div className="shrink-0 text-stone-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 pt-4">
          {/* Options */}
          <div className="space-y-2 mb-4">
            {draft.options.map((opt, oi) => (
              <div key={oi} className={`flex items-start gap-2.5 p-3 rounded-lg border text-[13px] transition-all ${
                showAnswer && oi === draft.answerIndex
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-medium"
                  : "border-stone-200 text-stone-700"
              }`}>
                <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                  showAnswer && oi === draft.answerIndex
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-stone-300 text-stone-500"
                }`}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <span>{opt}</span>
              </div>
            ))}
          </div>

          {/* Reveal / Explanation */}
          <button
            onClick={() => setShowAnswer(s => !s)}
            className="flex items-center gap-1.5 text-[12px] text-stone-500 hover:text-stone-800 transition-colors mb-4"
          >
            {showAnswer ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAnswer ? "Hide" : "Reveal"} Correct Answer
          </button>

          {showAnswer && (
            <div className="mb-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Explanation</p>
              <p className="text-[13px] text-stone-700 leading-relaxed">{draft.explanation}</p>
            </div>
          )}

          {/* Action buttons — individual, no bulk */}
          {!isReviewed && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(draft.id)}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => onReject(draft.id)}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-red-300 hover:bg-red-50 text-red-600 text-[13px] font-semibold transition-colors"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coding Draft Card ───────────────────────────────────────────────────────

function CodingDraftCard({
  draft, skill, idToken, onApprove, onReject, onUpdateDraft,
}: {
  draft: CodingDraft;
  skill: string;
  idToken: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateDraft: (id: string, updates: Partial<CodingDraft>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [referenceCode, setReferenceCode] = useState(draft.proposedReferenceCode || "");
  const [wrongCode, setWrongCode] = useState(draft.proposedWrongCode || "");
  const [running, setRunning] = useState(false);
  const [manualConfirm, setManualConfirm] = useState(false);

  const canApprove =
    draft.referenceRunResult &&
    draft.wrongRunResult &&
    draft.referenceRunResult.passedTests === draft.referenceRunResult.totalTests &&
    draft.wrongRunResult.passedTests < draft.wrongRunResult.totalTests &&
    manualConfirm;

  const isReviewed = draft.status === "approved" || draft.status === "rejected";

  const runVerification = useCallback(async (refCode: string, wrgCode: string) => {
    setRunning(true);
    onUpdateDraft(draft.id, { status: "verifying" });

    try {
      const [refRes, wrongRes] = await Promise.all([
        fetch("/api/admin/run-solution", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ code: refCode, language: "javascript", solutionType: "reference", skill }),
        }).then(r => r.json()),
        fetch("/api/admin/run-solution", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ code: wrgCode, language: "javascript", solutionType: "wrong", skill }),
        }).then(r => r.json()),
      ]);

      const gatePassed =
        refRes.passedTests === refRes.totalTests &&
        wrongRes.passedTests < wrongRes.totalTests;

      onUpdateDraft(draft.id, {
        referenceRunResult: refRes,
        wrongRunResult: wrongRes,
        verifyGatePassed: gatePassed,
        status: "pending",
      });
    } catch {
      onUpdateDraft(draft.id, { status: "pending" });
    } finally {
      setRunning(false);
    }
  }, [draft.id, idToken, skill, onUpdateDraft]);

  // Auto-run if AI provided code and we haven't run it yet
  useEffect(() => {
    if (expanded && !draft.referenceRunResult && referenceCode && wrongCode && !running) {
      runVerification(referenceCode, wrongCode);
    }
  }, [expanded, draft.referenceRunResult, referenceCode, wrongCode, running, runVerification]);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      draft.status === "approved" ? "border-emerald-200 bg-emerald-50/30" :
      draft.status === "rejected" ? "border-red-100 bg-red-50/20 opacity-60" :
      draft.verifyGatePassed ? "border-emerald-300 bg-white" :
      draft.referenceRunResult ? "border-amber-300 bg-white" :
      "border-stone-200 bg-white hover:border-stone-300"
    }`}>
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="shrink-0 w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center">
          <Code2 className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <DifficultyBadge level={draft.difficulty} />
            <StatusBadge status={draft.status} />
            {draft.verifyGatePassed === true && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3 w-3" /> Gate Passed
              </span>
            )}
            {draft.verifyGatePassed === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                <ShieldX className="h-3 w-3" /> Gate Failed
              </span>
            )}
          </div>
          <p className="text-[14px] font-semibold text-stone-900">{draft.title}</p>
          <p className="text-[12px] text-stone-500 mt-0.5">{draft.functionName}()</p>
        </div>
        <div className="shrink-0 text-stone-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100">
          {/* Problem statement */}
          <div className="p-4 border-b border-stone-100">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Problem Statement
            </p>
            <div className="prose prose-sm max-w-none text-stone-700 text-[13px] leading-relaxed whitespace-pre-line">
              {draft.instructions}
            </div>
          </div>

          {/* Public test cases */}
          <div className="p-4 border-b border-stone-100">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> Public Test Cases ({draft.publicTests.length})
            </p>
            <div className="space-y-2">
              {draft.publicTests.map((tc, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] font-mono bg-stone-50 border border-stone-200 rounded p-2">
                  <span className="text-stone-400 w-5 shrink-0">#{i + 1}</span>
                  <span className="text-stone-700 truncate">{tc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification gate */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="h-4 w-4 text-stone-600" />
              <p className="text-[13px] font-semibold text-stone-800">Mandatory Verification Gate</p>
              <div className="flex-1 h-px bg-stone-200" />
              {!canApprove && !isReviewed && (
                <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Approval locked
                </span>
              )}
              {canApprove && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <Unlock className="h-3 w-3" /> Approval unlocked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Reference code */}
              <div>
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Correct Reference Solution
                </label>
                <textarea
                  value={referenceCode}
                  onChange={e => setReferenceCode(e.target.value)}
                  rows={12}
                  disabled={isReviewed}
                  className="w-full font-mono text-[12px] bg-stone-950 text-emerald-300 border border-stone-800 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                  placeholder="Paste or write the correct reference solution here..."
                />
              </div>

              {/* Wrong code */}
              <div>
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-600" /> Deliberately Wrong Solution
                </label>
                <textarea
                  value={wrongCode}
                  onChange={e => setWrongCode(e.target.value)}
                  rows={12}
                  disabled={isReviewed}
                  className="w-full font-mono text-[12px] bg-stone-950 text-red-300 border border-stone-800 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                  placeholder="Paste a deliberately wrong/naive solution here..."
                />
              </div>
            </div>

            {/* Run results side-by-side */}
            {(draft.referenceRunResult || draft.wrongRunResult) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <RunResultPanel result={draft.referenceRunResult} label="✓ Correct Solution" />
                <RunResultPanel result={draft.wrongRunResult} label="✗ Wrong Solution" />
              </div>
            )}

            {/* Gate status explanation */}
            {draft.referenceRunResult && draft.wrongRunResult && (
              <div className={`mb-4 p-3 rounded-lg border text-[12px] ${canApprove ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {draft.referenceRunResult.passedTests === draft.referenceRunResult.totalTests && draft.wrongRunResult.passedTests < draft.wrongRunResult.totalTests ? (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    Automated Gate Passed: Correct solution passes all tests AND wrong solution fails at least one.
                  </span>
                ) : (
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Automated Gate Failed
                    </span>
                    {draft.referenceRunResult.passedTests < draft.referenceRunResult.totalTests && (
                      <span className="ml-6 text-amber-700">
                        • The correct solution failed {draft.referenceRunResult.totalTests - draft.referenceRunResult.passedTests} tests. The test cases might be broken or testing the wrong invariants.
                      </span>
                    )}
                    {draft.wrongRunResult.passedTests === draft.wrongRunResult.totalTests && (
                      <span className="ml-6 text-amber-700">
                        • The deliberately wrong solution passed 100% of the tests! This means the AI-generated test suite is too weak to catch naive/wrong logic. Reject this draft.
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}

            {/* Manual Confirmation Checkbox */}
            {!isReviewed && (
              <div className="mb-5 flex items-start gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id={`confirm-${draft.id}`}
                  checked={manualConfirm}
                  onChange={(e) => setManualConfirm(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <label htmlFor={`confirm-${draft.id}`} className="text-[13px] text-stone-700 leading-relaxed cursor-pointer select-none">
                  <span className="font-semibold block mb-0.5">Mandatory Human Review</span>
                  I have read the problem brief and visually confirmed that the auto-generated reference solution genuinely and correctly solves the stated problem without ambiguity.
                </label>
              </div>
            )}

            {/* Action buttons */}
            {!isReviewed && (
              <div className="flex gap-2">
                <button
                  onClick={() => runVerification(referenceCode, wrongCode)}
                  disabled={running || !referenceCode || !wrongCode}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {running ? "Running..." : "Run Verification"}
                </button>

                <button
                  onClick={() => onApprove(draft.id)}
                  disabled={!canApprove}
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canApprove ? "Run verification and pass the gate first" : ""}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                </button>
                <button
                  onClick={() => onReject(draft.id)}
                  className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-red-300 hover:bg-red-50 text-red-600 text-[13px] font-semibold transition-colors"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function QuestionDraftsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [idToken, setIdToken] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("JavaScript");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

  const [mcqDrafts, setMcqDrafts] = useState<MCQDraft[]>([]);
  const [codingDrafts, setCodingDrafts] = useState<CodingDraft[]>([]);
  const [activeTab, setActiveTab] = useState<"mcq" | "coding">("mcq");
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const isUserAdmin = isAdmin || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

  // Fetch token
  useEffect(() => {
    if (user) {
      getIdToken(user).then(setIdToken);
    }
  }, [user]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  const loadDrafts = useCallback(async () => {
    if (!db || !selectedSkill) return;
    const skillKey = selectedSkill.toLowerCase().replace(/[^a-z0-9]/g, "_");
    setLoadingDrafts(true);
    try {
      const [mcqSnap, codingSnap] = await Promise.all([
        getDocs(collection(db, "questionDrafts", skillKey, "mcqs")),
        getDocs(collection(db, "questionDrafts", skillKey, "coding")),
      ]);
      setMcqDrafts(mcqSnap.docs.map(d => ({ id: d.id, ...d.data() } as MCQDraft)));
      setCodingDrafts(codingSnap.docs.map(d => ({ id: d.id, ...d.data() } as CodingDraft)));
    } catch {
      // empty
    } finally {
      setLoadingDrafts(false);
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (idToken) loadDrafts();
  }, [idToken, loadDrafts]);

  const handleGenerate = async () => {
    if (!idToken) return;
    setGenerating(true);
    setGenError("");
    setGenSuccess("");
    try {
      const res = await fetch("/api/admin/generate-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ skill: selectedSkill }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGenSuccess(data.message);
      await loadDrafts();
    } catch (e: any) {
      setGenError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleMCQAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/admin/promote-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ skill: selectedSkill, itemId: id, itemType: "mcq", action }),
      });
      if (res.ok) {
        setMcqDrafts(prev => prev.map(q =>
          q.id === id ? { ...q, status: action === "approve" ? "approved" : "rejected" } : q
        ));
      }
    } finally {
      setActionLoading(p => ({ ...p, [id]: false }));
    }
  };

  const handleCodingAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/admin/promote-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ skill: selectedSkill, itemId: id, itemType: "coding", action }),
      });
      if (res.ok) {
        setCodingDrafts(prev => prev.map(q =>
          q.id === id ? { ...q, status: action === "approve" ? "approved" : "rejected" } : q
        ));
      }
    } finally {
      setActionLoading(p => ({ ...p, [id]: false }));
    }
  };

  const updateCodingDraft = useCallback((id: string, updates: Partial<CodingDraft>) => {
    setCodingDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  if (loading) return <MeritlaneLoader level="page" text="Loading" />;
  if (!isUserAdmin) return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-stone-700 font-semibold">Access Denied</p>
      </div>
    </div>
  );

  const approvedMCQs = mcqDrafts.filter(q => q.status === "approved").length;
  const pendingMCQs = mcqDrafts.filter(q => q.status === "pending").length;
  const approvedCoding = codingDrafts.filter(q => q.status === "approved").length;

  return (
    <div className="min-h-full bg-[#F8F6F3]">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-stone-900 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-stone-900">Question Drafting Studio</h1>
              <p className="text-[12px] text-stone-500">AI-assisted · Human-reviewed · Mandatory gate before publishing</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-[13px] text-stone-500 hover:text-stone-800 transition-colors"
          >
            ← Back to Admin
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-800 leading-relaxed">
            <strong>Phase 1 — Mock Mode:</strong> The AI generator currently returns realistic mock questions for UI validation.
            To activate real Gemini generation, add <code className="bg-blue-100 px-1 rounded font-mono text-[12px]">AI_PROVIDER_API_KEY</code> to your Vercel environment variables.
            All review gates, approval flows, and Firestore promotion logic are fully wired and production-ready.
          </p>
        </div>

        {/* Controls row */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Target Skill
              </label>
              <select
                value={selectedSkill}
                onChange={e => { setSelectedSkill(e.target.value); setMcqDrafts([]); setCodingDrafts([]); }}
                className="h-10 w-full sm:w-56 border border-stone-300 rounded-lg px-3 text-[14px] text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                {AVAILABLE_SKILLS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadDrafts}
                disabled={loadingDrafts}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-stone-300 hover:bg-stone-50 text-[13px] font-medium text-stone-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingDrafts ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : `Generate ${selectedSkill} Drafts`}
              </button>
            </div>
          </div>

          {genSuccess && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {genSuccess}
            </div>
          )}
          {genError && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {genError}
            </div>
          )}
        </div>

        {/* Stats row */}
        {(mcqDrafts.length > 0 || codingDrafts.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total MCQs", value: mcqDrafts.length, icon: FileQuestion, color: "text-stone-700" },
              { label: "MCQs Approved", value: approvedMCQs, icon: CheckCircle2, color: "text-emerald-700" },
              { label: "MCQs Pending", value: pendingMCQs, icon: Clock, color: "text-amber-600" },
              { label: "Coding Tasks", value: `${approvedCoding}/${codingDrafts.length}`, icon: Code2, color: "text-stone-700", label2: "Approved" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-[11px] text-stone-500 font-medium">{stat.label2 || stat.label}</span>
                </div>
                <p className={`text-[22px] font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab switcher */}
        {(mcqDrafts.length > 0 || codingDrafts.length > 0) && (
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 mb-5 w-fit">
            <button
              onClick={() => setActiveTab("mcq")}
              className={`flex items-center gap-2 h-8 px-4 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === "mcq"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <FileQuestion className="h-3.5 w-3.5" />
              MCQs ({mcqDrafts.length})
            </button>
            <button
              onClick={() => setActiveTab("coding")}
              className={`flex items-center gap-2 h-8 px-4 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === "coding"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Coding Tasks ({codingDrafts.length})
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loadingDrafts && mcqDrafts.length === 0 && codingDrafts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
            <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-stone-400" />
            </div>
            <p className="text-[16px] font-semibold text-stone-700 mb-1">No drafts yet for {selectedSkill}</p>
            <p className="text-[13px] text-stone-500 mb-6">Click "Generate Drafts" to create AI-drafted questions for human review.</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate {selectedSkill} Drafts
            </button>
          </div>
        )}

        {loadingDrafts && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
          </div>
        )}

        {/* MCQ list */}
        {activeTab === "mcq" && mcqDrafts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-stone-700">
                {mcqDrafts.length} MCQ Drafts · Review each individually
              </p>
              <p className="text-[12px] text-stone-500">
                {approvedMCQs} approved · {pendingMCQs} pending · {mcqDrafts.filter(q => q.status === "rejected").length} rejected
              </p>
            </div>
            <div className="space-y-3">
              {mcqDrafts.map((draft, i) => (
                <MCQDraftCard
                  key={draft.id}
                  draft={draft}
                  index={i}
                  onApprove={(id) => handleMCQAction(id, "approve")}
                  onReject={(id) => handleMCQAction(id, "reject")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Coding list */}
        {activeTab === "coding" && codingDrafts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-stone-700">
                {codingDrafts.length} Coding Task Drafts · Verification gate required before approval
              </p>
            </div>
            <div className="space-y-4">
              {codingDrafts.map((draft) => (
                <CodingDraftCard
                  key={draft.id}
                  draft={draft}
                  skill={selectedSkill}
                  idToken={idToken}
                  onApprove={(id) => handleCodingAction(id, "approve")}
                  onReject={(id) => handleCodingAction(id, "reject")}
                  onUpdateDraft={updateCodingDraft}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
