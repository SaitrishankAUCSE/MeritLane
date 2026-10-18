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
  { id: "shortlisted", label: "Shortlisted", color: "bg-surface text-foreground border-border" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-50/80 text-amber-900 border-amber-200" },
  { id: "offer", label: "Offer Extended", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  { id: "hired", label: "Hired", color: "bg-foreground text-white border-foreground" },
  { id: "rejected", label: "Archived / Rejected", color: "bg-surface text-muted-foreground border-border" },
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
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#FAFAFA]">
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA]">
      <div className="flex-1 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 overflow-y-auto scrollbar-hide w-full">
        {/* Page Header */}
        <div className="w-full mb-8 border-b border-border pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-foreground mb-2">
                <BookMarked className="h-7 w-7 text-foreground" />
                <h1 className="font-serif text-[28px] sm:text-[34px] lg:text-[38px] leading-tight">Shortlist & Pipeline</h1>
              </div>
              <p className="text-[14px] sm:text-[15px] text-muted-foreground font-sans">
                Manage your saved candidates, track interview progression, and message verified talent.
              </p>
            </div>
            <Link href="/employer/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="text-[13px] border-border w-full sm:w-auto justify-center">
                + Discover More Talent
              </Button>
            </Link>
          </div>
        </div>



        <div className="w-full">


          {fetching ? (
            <MeritlaneLoader level="section" text="Loading shortlist..." className="py-20" />
          ) : candidates.length === 0 ? (
            <div className="border border-border border-dashed rounded bg-white p-16 text-center shadow-sm">
              <div className="h-12 w-12 rounded bg-surface-dim text-muted-foreground flex items-center justify-center mx-auto mb-4">
                <BookMarked className="h-6 w-6" />
              </div>
              <h2 className="text-[20px] font-serif text-foreground mb-3">Your shortlist is empty</h2>
              <p className="text-[14px] text-muted-foreground mb-6 max-w-md mx-auto">
                You haven&apos;t saved any verified candidates yet. Explore the discovery engine to shortlist candidates with proven code skills.
              </p>
              <Link href="/employer/dashboard">
                <Button>Discover Verified Candidates</Button>
              </Link>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="border border-border border-dashed rounded bg-white p-12 text-center">
              <p className="text-[14px] text-muted-foreground mb-4">No candidates currently in this pipeline stage.</p>
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
                    className="border border-border rounded bg-white p-4 sm:p-6 md:p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-6">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded bg-surface-dim border border-border flex items-center justify-center text-foreground font-serif text-[20px] sm:text-[26px]">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-serif text-[24px] text-foreground leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span
                              className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded border ${stageObj.color}`}
                            >
                              {stageObj.label}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{verificationPct}% Skills Verified</span>
                              <span className="text-[#047857] font-normal text-[10px]">
                                ({verifiedCount}/{totalSkills})
                              </span>
                            </div>
                          </div>

                          {(c.college || c.branch) && (
                            <p className="text-[14px] text-muted-foreground mt-1 mb-4">
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
                                  className="flex items-center gap-1.5 px-3 py-1 rounded border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D] text-[12px] font-medium"
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
                          <span className="text-[12px] text-muted-foreground font-medium">Stage:</span>
                          <select
                            value={currentStage}
                            onChange={(e) => updateStage(c.uid, e.target.value)}
                            className="text-[12px] font-medium bg-[#FAFAFA] border border-border rounded px-3 py-1.5 text-foreground outline-none cursor-pointer hover:border-foreground transition-colors"
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
                            onClick={() => setMessagingTarget({ id: c.uid, name: c.name || "Candidate" })}
                            className="gap-1.5 text-[12px] border-border text-foreground hover:bg-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            Message
                          </Button>

                          <Link href={`/employer/candidate/${c.uid}`}>
                            <Button size="sm" className="gap-1.5 text-[12px] bg-foreground hover:bg-[#404040]">
                              Dossier <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-danger hover:text-danger hover:bg-danger/5 border-border"
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
