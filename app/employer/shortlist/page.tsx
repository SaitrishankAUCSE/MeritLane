"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CheckCircle2,
  BookmarkX,
  ArrowRight,
  BookMarked,
  MessageSquare,
  Sparkles,
  Users,
  ExternalLink,
  ChevronDown,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { Button } from "@/components/ui/Button";
import { MessageModal } from "@/components/employer/MessageModal";

const PIPELINE_STAGES = [
  { id: "shortlisted", label: "Shortlisted", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "offer", label: "Offer Extended", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "hired", label: "Hired", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "rejected", label: "Archived / Rejected", color: "bg-zinc-100 text-zinc-600 border-zinc-200" },
];

export default function EmployerShortlistPage() {
  const { user, loading } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Active messaging target
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  // AI Briefs cache
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [activeAiCard, setActiveAiCard] = useState<string | null>(null);

  // Filter by stage
  const [stageFilter, setStageFilter] = useState<string>("all");

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/employer/shortlist/list", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to fetch shortlist");
        setFetching(false);
        return;
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
      setPipeline(data.pipeline || {});
      setFetching(false);
    } catch (e) {
      console.error(e);
      setErrorMsg("Internal system error");
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      fetchCandidates();
    }
  }, [loading, user, router, fetchCandidates]);

  const updateStage = async (candidateId: string, stage: string) => {
    setPipeline((prev) => ({ ...prev, [candidateId]: stage }));
    try {
      const token = await user?.getIdToken(true);
      await fetch("/api/employer/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId, stage }),
      });
    } catch (e) {
      console.error("Failed to update pipeline stage:", e);
    }
  };

  const removeShortlist = async (candidateId: string) => {
    setCandidates((prev) => prev.filter((c) => c.uid !== candidateId));
    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/shortlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ candidateId }),
      });
      if (!res.ok) fetchCandidates();
    } catch {
      fetchCandidates();
    }
  };

  const toggleAiSummary = async (candidateId: string) => {
    if (activeAiCard === candidateId) {
      setActiveAiCard(null);
      return;
    }
    setActiveAiCard(candidateId);
    if (aiSummaries[candidateId]) return;

    setLoadingAi((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaries((prev) => ({ ...prev, [candidateId]: data.summary || "Summary generated." }));
      } else {
        setAiSummaries((prev) => ({ ...prev, [candidateId]: "Unable to generate summary." }));
      }
    } catch {
      setAiSummaries((prev) => ({ ...prev, [candidateId]: "Failed to contact AI service." }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  if (loading && !user) return <MeritlaneLoader level="page" text="Authenticating" />;
  if (errorMsg) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#FAFAFA]">
        <div className="border border-[#E5E5E5] p-10 bg-white rounded-md max-w-md w-full">
          <h2 className="text-[20px] font-serif text-[#B42318] mb-4">Access Denied</h2>
          <p className="text-[14px] text-[#737373]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // Pipeline metrics
  const stageCounts = candidates.reduce(
    (acc, c) => {
      const st = pipeline[c.uid] || "shortlisted";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredCandidates = candidates.filter((c) => {
    if (stageFilter === "all") return true;
    const currentStage = pipeline[c.uid] || "shortlisted";
    return currentStage === stageFilter;
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA]">
      <div className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto scrollbar-hide">
        {/* Page Header */}
        <div className="max-w-[1000px] mx-auto mb-8 border-b border-[#E5E5E5] pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-[#0D0D0D] mb-2">
                <BookMarked className="h-7 w-7 text-[#0D0D0D]" />
                <h1 className="font-serif text-[38px] leading-tight">Shortlist & Pipeline</h1>
              </div>
              <p className="text-[15px] text-[#737373] font-sans">
                Manage your saved candidates, track interview progression, and message verified talent.
              </p>
            </div>
            <Link href="/employer/dashboard">
              <Button variant="outline" className="text-[13px] border-[#E5E5E5]">
                + Discover More Talent
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto">
          {/* Pipeline Stage Summary Bar */}
          {candidates.length > 0 && (
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setStageFilter("all")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  stageFilter === "all"
                    ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-sm"
                    : "bg-white border-[#E5E5E5] text-[#0D0D0D] hover:border-[#D2D2D2]"
                }`}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider opacity-70">Total Saved</div>
                <div className="text-[20px] font-bold font-serif">{candidates.length}</div>
              </button>
              {PIPELINE_STAGES.slice(0, 4).map((st) => {
                const count = stageCounts[st.id] || 0;
                const isActive = stageFilter === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStageFilter(isActive ? "all" : st.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-sm"
                        : "bg-white border-[#E5E5E5] text-[#0D0D0D] hover:border-[#D2D2D2]"
                    }`}
                  >
                    <div className="text-[11px] font-mono uppercase tracking-wider opacity-70">{st.label}</div>
                    <div className="text-[20px] font-bold font-serif">{count}</div>
                  </button>
                );
              })}
            </div>
          )}

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
              <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
              <p className="text-[13px] font-sans">Loading shortlist...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="border border-[#E5E5E5] border-dashed rounded-2xl bg-white p-16 text-center shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[#F3F3F1] text-[#737373] flex items-center justify-center mx-auto mb-4">
                <BookMarked className="h-6 w-6" />
              </div>
              <h2 className="text-[20px] font-serif text-[#0D0D0D] mb-3">Your shortlist is empty</h2>
              <p className="text-[14px] text-[#737373] mb-6 max-w-md mx-auto">
                You haven&apos;t saved any verified candidates yet. Explore the discovery engine to shortlist candidates with proven code skills.
              </p>
              <Link href="/employer/dashboard">
                <Button>Discover Verified Candidates</Button>
              </Link>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="border border-[#E5E5E5] border-dashed rounded-2xl bg-white p-12 text-center">
              <p className="text-[14px] text-[#737373] mb-4">No candidates currently in this pipeline stage.</p>
              <Button variant="outline" size="sm" onClick={() => setStageFilter("all")}>
                View all candidates
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCandidates.map((c) => {
                const verifiedSkillsList = Object.keys(c.verifiedSkills || {}).filter(
                  (k) => c.verifiedSkills[k].status === "verified"
                );
                const currentStage = pipeline[c.uid] || "shortlisted";
                const stageObj = PIPELINE_STAGES.find((s) => s.id === currentStage) || PIPELINE_STAGES[0];

                return (
                  <div
                    key={c.uid}
                    className="border border-[#E5E5E5] rounded-2xl bg-white p-6 md:p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className="h-16 w-16 shrink-0 rounded-2xl bg-[#F3F3F1] border border-[#E5E5E5] flex items-center justify-center text-[#0D0D0D] font-serif text-[26px]">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-serif text-[24px] text-[#0D0D0D] leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span
                              className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${stageObj.color}`}
                            >
                              {stageObj.label}
                            </span>
                          </div>

                          {(c.college || c.branch) && (
                            <p className="text-[14px] text-[#737373] mt-1 mb-4">
                              {c.branch}
                              {c.branch && c.college ? " · " : ""}
                              {c.college} {c.gradYear ? `(${c.gradYear.toString().slice(-2)})` : ""}
                            </p>
                          )}

                          {verifiedSkillsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {verifiedSkillsList.map((skill, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D] text-[12px] font-medium"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {skill}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recruiter Actions */}
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        {/* Pipeline Stage Select */}
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[#737373] font-medium">Stage:</span>
                          <select
                            value={currentStage}
                            onChange={(e) => updateStage(c.uid, e.target.value)}
                            className="text-[12px] font-medium bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-[#0D0D0D] outline-none cursor-pointer hover:border-[#0D0D0D] transition-colors"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAiSummary(c.uid)}
                            className="gap-1.5 text-[12px] bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-300"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                            {activeAiCard === c.uid ? "Hide AI Brief" : "AI Brief"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessagingTarget({ id: c.uid, name: c.name || "Candidate" })}
                            className="gap-1.5 text-[12px] border-[#E5E5E5] text-[#0D0D0D] hover:bg-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#737373]" />
                            Message
                          </Button>

                          <Link href={`/employer/candidate/${c.uid}`}>
                            <Button size="sm" className="gap-1.5 text-[12px] bg-[#0D0D0D] hover:bg-[#404040]">
                              Dossier <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#B42318] hover:text-[#B42318] hover:bg-[#B42318]/5 border-[#E5E5E5]"
                            onClick={() => removeShortlist(c.uid)}
                            title="Remove from shortlist"
                          >
                            <BookmarkX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable AI Recruiter Summary */}
                    {activeAiCard === c.uid && (
                      <div className="mt-6 pt-5 border-t border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-xl p-5 border">
                        <div className="flex items-center gap-2 mb-2 text-indigo-950 font-semibold text-[13px]">
                          <Sparkles className="h-4 w-4 text-indigo-600" /> AI Recruiter Summary
                        </div>
                        {loadingAi[c.uid] ? (
                          <div className="py-4 flex items-center gap-3 text-indigo-600">
                            <div className="h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                            <span className="text-[13px] text-zinc-500 font-sans">
                              Evaluating verified project signals with OpenRouter...
                            </span>
                          </div>
                        ) : (
                          <p className="text-[13px] text-zinc-700 leading-relaxed font-sans">
                            {aiSummaries[c.uid] || "Summary unavailable."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {messagingTarget && (
        <MessageModal
          isOpen={true}
          onClose={() => setMessagingTarget(null)}
          recipientId={messagingTarget.id}
          recipientName={messagingTarget.name}
        />
      )}
    </div>
  );
}
