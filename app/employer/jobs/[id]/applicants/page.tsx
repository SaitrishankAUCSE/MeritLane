"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
} from "lucide-react";
import { Job, JobApplication, ApplicationStage } from "@/lib/firebase/jobs";
import { MessageModal } from "@/components/employer/MessageModal";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
const PIPELINE_OPTIONS: { id: ApplicationStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "text-muted-foreground bg-surface border-border" },
  { id: "shortlisted", label: "Shortlisted", color: "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]" },
  { id: "interviewing", label: "Interviewing", color: "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]" },
  { id: "offer", label: "Offer Extended", color: "text-[#7E22CE] bg-[#FAF5FF] border-[#E9D5FF]" },
  { id: "hired", label: "Hired", color: "text-emerald-900 bg-[#ECFDF5] border-[#A7F3D0]" },
  { id: "rejected", label: "Archived / Rejected", color: "text-danger bg-danger/10 border-[#FECACA]" },
];

export default function JobApplicantsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStage, setUpdatingStage] = useState<Record<string, boolean>>({});

  // Messaging state
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const paginatedApplicants = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return applicants.slice(start, start + ITEMS_PER_PAGE);
  }, [applicants, currentPage]);

  const loadApplicants = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/employer/jobs/${id}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load applicants.");
      const data = await res.json();
      setJob(data.job);
      setApplicants(data.applicants || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (!authLoading && (!user || role !== "employer")) {
      router.replace("/");
      return;
    }
    if (user && role === "employer" && id) {
      loadApplicants();
    }
  }, [user, role, authLoading, id, router, loadApplicants]);

  const handleStageChange = async (candidateId: string, stage: ApplicationStage) => {
    if (!user) return;
    setUpdatingStage((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/employer/jobs/${id}/applicants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId, stage }),
      });

      if (!res.ok) throw new Error("Failed to update candidate stage.");
      setApplicants((prev) =>
        prev.map((app) => (app.candidateId === candidateId ? { ...app, status: stage } : app))
      );
    } catch (err: any) {
      alert(err.message || "Failed to transition stage.");
    } finally {
      setUpdatingStage((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <MeritlaneLoader level="section" text="Loading applicant dossiers…" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-surface pb-24 text-foreground">
      {/* ── Header Strip ── */}
      <div className="border-b border-border bg-white px-6 sm:px-10 py-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/employer/jobs"
              className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK TO JOBS HUB
            </Link>
            <h1 className="text-[24px] sm:text-[30px] font-bold uppercase tracking-[0.06em] text-foreground leading-tight">
              APPLICANTS — {job?.title}
            </h1>
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-mono mt-1">
              <span>{job?.location}</span>
              <span>·</span>
              <span>{job?.workMode?.toUpperCase()}</span>
              <span>·</span>
              <span className="text-emerald-900 font-semibold">{applicants.length} SUBMISSIONS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/jobs/${id}`} target="_blank">
              <button className="px-4 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold rounded transition-colors shadow-2xs">
                VIEW PUBLIC POSTING ↗
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-6 sm:px-10 py-8">
        {error ? (
          <div className="border border-danger/20 bg-danger/10 p-8 text-center rounded-2xl">
            <p className="text-[14px] text-danger mb-4">{error}</p>
            <button onClick={loadApplicants} className="px-4 py-2 bg-foreground text-white text-[12px] font-mono rounded">
              RETRY
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Users className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-foreground mb-2">
              NO SUBMISSIONS YET
            </h2>
            <p className="text-[13px] text-muted-foreground font-sans max-w-md mx-auto">
              This job is actively accepting candidates with 100% profile completion. As soon as candidates apply, their verified dossiers will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-border bg-surface px-6 py-3.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase font-semibold">
              <div>APPLICANT DOSSIER INDEX ({applicants.length})</div>
              <div>VERIFIED MATCHING MATRIX</div>
            </div>

            <div className="divide-y divide-[#E7E2DA]">
              {paginatedApplicants.map((app) => {
                const isBusy = updatingStage[app.candidateId] || false;
                const requiredSkills = job?.requiredSkills || [];
                const verifiedSkillsMap: Record<string, any> = app.candidateVerifiedSkills || {};

                return (
                  <div
                    key={app.id}
                    className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-surface/40 transition-colors"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Candidate Name */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-serif text-[22px] sm:text-[24px] text-foreground leading-tight font-bold">
                          {app.candidateName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-emerald-900 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-900/20">
                          {app.candidateKey || (app.candidateId ? `ML-${app.candidateId.slice(0, 8).toUpperCase()}` : "CANDIDATE")}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Applied {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      {/* Academic Background */}
                      {(app.candidateCollege || app.candidateBranch) && (
                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-sans">
                          <GraduationCap className="h-4 w-4 text-emerald-900 shrink-0" />
                          <span className="font-medium text-foreground">{app.candidateBranch}</span>
                          {app.candidateCollege && <span>· {app.candidateCollege}</span>}
                          {app.candidateGradYear && <span className="font-mono">({app.candidateGradYear})</span>}
                        </div>
                      )}

                      {/* Required vs Verified Skill Match Matrix */}
                      <div className="pt-1">
                        <div className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider mb-1.5">
                          Capabilities vs Role Requirements:
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {requiredSkills.map((reqSkill) => {
                            const isVerified = verifiedSkillsMap[reqSkill]?.status === "verified";
                            const isDeclared = app.candidateSkills?.includes(reqSkill);
                            return (
                              <span
                                key={reqSkill}
                                className={`text-[11px] font-mono px-2.5 py-0.5 rounded border flex items-center gap-1 ${
                                  isVerified
                                    ? "bg-emerald-900/10 text-emerald-900 border-emerald-900/30 font-semibold"
                                    : isDeclared
                                    ? "bg-surface text-foreground border-border"
                                    : "bg-white text-muted-foreground/70 border-border line-through opacity-70"
                                }`}
                              >
                                {isVerified && <ShieldCheck className="h-3 w-3" />}
                                <span>{reqSkill}</span>
                                {isVerified ? " (Verified)" : isDeclared ? " (Claimed)" : ""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions & Pipeline Stage Selector */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Pipeline Stage Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          disabled={isBusy}
                          onChange={(e) => handleStageChange(app.candidateId, e.target.value as ApplicationStage)}
                          className="h-10 px-3.5 bg-white border border-border rounded text-[12px] font-mono font-semibold text-foreground focus:outline-none shadow-2xs cursor-pointer"
                        >
                          {PIPELINE_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              Stage: {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Open Full Dossier */}
                      <Link href={`/employer/candidate/${app.candidateId}`} target="_blank">
                        <button className="flex items-center justify-center gap-1.5 px-4 h-10 bg-foreground hover:bg-emerald-900 text-white text-[11px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs">
                          <span>OPEN DOSSIER</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </Link>

                      {/* Message Candidate */}
                      <button
                        onClick={() =>
                          setMessagingTarget({
                            id: app.candidateId,
                            name: app.candidateName,
                          })
                        }
                        className="flex items-center justify-center gap-1.5 px-4 h-10 border border-border bg-white hover:bg-surface text-foreground text-[11px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>MESSAGE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {applicants.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, applicants.length)} of {applicants.length} applicants
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-border bg-white text-foreground text-xs rounded hover:bg-surface disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= applicants.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 border border-border bg-white text-foreground text-xs rounded hover:bg-surface disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Existing Message Modal Integration */}
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
