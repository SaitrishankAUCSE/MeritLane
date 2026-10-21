"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CheckCircle2,
  BookmarkX,
  ArrowRight,
  BookMarked,
  MessageSquare,
  Users,
  ExternalLink,
  ChevronDown,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { Button } from "@/components/ui/Button";
import { MessageModal } from "@/components/employer/MessageModal";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/ErrorState";

const PIPELINE_STAGES = [
  { id: "shortlisted", label: "Shortlisted", color: "bg-black/[0.04] text-[#101010] border-black/[0.08]" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-500/10 text-amber-900 border-amber-500/20" },
  { id: "offer", label: "Offer Extended", color: "bg-emerald-500/10 text-emerald-900 border-emerald-500/20" },
  { id: "hired", label: "Hired", color: "bg-[#101010] text-white border-[#101010]" },
  { id: "rejected", label: "Archived / Rejected", color: "bg-black/[0.02] text-black/40 border-black/[0.06]" },
];

export default function EmployerShortlistPage() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Active messaging target
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  // Filter by stage
  const [stageFilter, setStageFilter] = useState<string>("all");

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setErrorMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/employer/shortlist/list", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Unable to load your shortlist. Your data has not been changed.");
        setFetching(false);
        return;
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
      setPipeline(data.pipeline || {});
      setFetching(false);
    } catch (e) {
      console.error(e);
      setErrorMsg("Unable to load your shortlist. Please check your connection and try again.");
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
        return;
      }
      fetchCandidates();
    }
  }, [loading, user, router, fetchCandidates]);

  const updateStage = async (candidateId: string, stage: string) => {
    setPipeline((prev) => ({ ...prev, [candidateId]: stage }));
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/employer/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId, stage }),
      });
      if (res.ok) {
        addToast({
          type: "success",
          title: "Pipeline stage updated.",
        });
      }
    } catch (e) {
      console.error("Failed to update pipeline stage:", e);
    }
  };

  const removeShortlist = async (candidateId: string) => {
    setCandidates((prev) => prev.filter((c) => c.uid !== candidateId));
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/employer/shortlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ candidateId }),
      });
      if (!res.ok) {
        fetchCandidates();
      } else {
        addToast({
          type: "info",
          title: "Candidate removed from shortlist.",
        });
      }
    } catch {
      fetchCandidates();
    }
  };

  if (loading && !user) return <MeritlaneLoader level="page" text="Authenticating" />;
  if (errorMsg) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#F8F8F6]">
        <ErrorState
          title="Unable to load shortlist"
          description={errorMsg}
          onRetry={fetchCandidates}
          retryLabel="Try again"
        />
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#F8F8F6]">
      <div className="flex-1 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 overflow-y-auto scrollbar-hide w-full max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="w-full mb-8 border-b border-black/[0.08] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 text-[#101010] mb-2">
                <div className="h-8 w-8 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center">
                  <BookMarked className="h-4 w-4 text-[#101010]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101010]">Shortlist & Pipeline</h1>
              </div>
              <p className="text-sm text-black/60 font-sans">
                Manage your saved candidates, track interview progression, and message verified talent.
              </p>
            </div>
            <Link href="/employer/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="text-xs rounded-full border-black/[0.12] bg-white text-[#101010] hover:bg-black/[0.04] shadow-xs px-4 py-2 w-full sm:w-auto justify-center">
                + Discover More Talent
              </Button>
            </Link>
          </div>

          {/* Pipeline Stage Filters */}
          {candidates.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 scrollbar-hide">
              <button
                onClick={() => setStageFilter("all")}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  stageFilter === "all"
                    ? "bg-[#101010] text-white shadow-xs"
                    : "bg-white border border-black/[0.08] text-black/70 hover:bg-black/[0.04]"
                }`}
              >
                All ({candidates.length})
              </button>
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStageFilter(s.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                    stageFilter === s.id
                      ? "bg-[#101010] text-white shadow-xs"
                      : "bg-white border border-black/[0.08] text-black/70 hover:bg-black/[0.04]"
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${stageFilter === s.id ? "bg-white/20 text-white" : "bg-black/[0.05] text-black/60"}`}>
                    {stageCounts[s.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full">
          {fetching ? (
            <MeritlaneLoader level="section" text="Loading shortlist..." className="py-20" />
          ) : candidates.length === 0 ? (
            <div className="rounded-2xl border border-black/[0.08] bg-white p-16 text-center shadow-xs">
              <div className="h-12 w-12 rounded-full bg-black/[0.04] border border-black/[0.08] text-black/60 flex items-center justify-center mx-auto mb-4">
                <BookMarked className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#101010] mb-2">Your shortlist is empty</h2>
              <p className="text-sm text-black/60 mb-6 max-w-md mx-auto">
                You haven&apos;t saved any verified candidates yet. Explore the discovery engine to shortlist candidates with proven code skills.
              </p>
              <Link href="/employer/dashboard">
                <Button className="rounded-full bg-[#101010] text-white hover:bg-black shadow-xs px-5 py-2.5 text-xs font-medium">
                  Discover Verified Candidates
                </Button>
              </Link>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-2xl border border-black/[0.08] bg-white p-12 text-center shadow-xs">
              <p className="text-sm text-black/60 mb-4">No candidates currently in this pipeline stage.</p>
              <Button variant="outline" size="sm" onClick={() => setStageFilter("all")} className="rounded-full border-black/[0.12] text-xs">
                View all candidates
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((c) => {
                const verifiedSkillsList = Object.keys(c.verifiedSkills || {}).filter(
                  (k) => c.verifiedSkills[k].status === "verified"
                );
                const totalSkills = c.totalSkillsCount || c.skills?.length || (verifiedSkillsList.length > 0 ? verifiedSkillsList.length * 2 : 1);
                const verifiedCount = c.qualifiedSkillsCount ?? verifiedSkillsList.length;
                const verificationPct = typeof c.skillVerificationPct === "number"
                  ? c.skillVerificationPct
                  : (totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 50);

                const currentStage = pipeline[c.uid] || "shortlisted";
                const stageObj = PIPELINE_STAGES.find((s) => s.id === currentStage) || PIPELINE_STAGES[0];

                return (
                  <div
                    key={c.uid}
                    className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-xs hover:border-black/[0.16] transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] font-bold text-lg sm:text-xl">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#101010] leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span
                              className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${stageObj.color}`}
                            >
                              {stageObj.label}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-[11px] font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{verificationPct}% Verified</span>
                              <span className="text-emerald-700/80 font-normal text-[10px]">
                                ({verifiedCount}/{totalSkills})
                              </span>
                            </div>
                          </div>

                          {(c.college || c.branch) && (
                            <p className="text-sm text-black/60 mt-1 mb-3">
                              {c.branch}
                              {c.branch && c.college ? " · " : ""}
                              {c.college} {c.gradYear ? `(${c.gradYear.toString().slice(-2)})` : ""}
                            </p>
                          )}

                          {verifiedSkillsList.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {verifiedSkillsList.map((skill, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-black/[0.08] bg-black/[0.03] text-[#101010] text-xs font-medium"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
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
                          <span className="text-xs text-black/50 font-medium">Stage:</span>
                          <select
                            value={currentStage}
                            onChange={(e) => updateStage(c.uid, e.target.value)}
                            className="text-xs font-medium bg-[#F8F8F6] border border-black/[0.12] rounded-full px-3 py-1.5 text-[#101010] outline-none cursor-pointer hover:border-black transition-colors"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessagingTarget({ id: c.uid, name: c.name || "Candidate" })}
                            className="gap-1.5 text-xs rounded-full border-black/[0.12] text-[#101010] hover:bg-black/[0.04]"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-black/60" />
                            Message
                          </Button>

                          <Link href={`/employer/candidate/${c.uid}`}>
                            <Button size="sm" className="gap-1.5 text-xs rounded-full bg-[#101010] text-white hover:bg-black">
                              Dossier <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-black/[0.12] rounded-full px-2.5"
                            onClick={() => removeShortlist(c.uid)}
                            title="Remove from shortlist"
                          >
                            <BookmarkX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
