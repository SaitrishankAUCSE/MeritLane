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
import { Button } from "@/components/ui/Button";

const PIPELINE_OPTIONS: { id: ApplicationStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "text-[#101010] bg-black/[0.04] border-black/[0.08]" },
  { id: "shortlisted", label: "Shortlisted", color: "text-blue-900 bg-blue-500/10 border-blue-500/20" },
  { id: "interviewing", label: "Interviewing", color: "text-amber-900 bg-amber-500/10 border-amber-500/20" },
  { id: "offer", label: "Offer Extended", color: "text-purple-900 bg-purple-500/10 border-purple-500/20" },
  { id: "hired", label: "Hired", color: "text-emerald-900 bg-emerald-500/10 border-emerald-500/20" },
  { id: "rejected", label: "Archived / Rejected", color: "text-red-700 bg-red-500/10 border-red-500/20" },
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
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center p-8">
        <MeritlaneLoader level="section" text="Loading applicant dossiers…" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F8F6] pb-24 text-[#101010] font-sans">
      {/* ── Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/employer/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-black/60 hover:text-[#101010] transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to jobs hub
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101010] leading-tight">
              Applicants — {job?.title}
            </h1>
            <div className="flex items-center gap-2.5 text-xs text-black/60 font-sans mt-1.5 flex-wrap">
              <span>{job?.location}</span>
              <span>·</span>
              <span className="capitalize">{job?.workMode}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-[#101010] font-medium">
                {applicants.length} Submissions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/jobs/${id}`} target="_blank">
              <Button variant="outline" className="text-xs rounded-full border-black/[0.12] bg-white text-[#101010] hover:bg-black/[0.04] shadow-xs px-4 py-2">
                View Public Posting ↗
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8">
        {error ? (
          <div className="border border-red-500/20 bg-red-500/10 p-8 text-center rounded-2xl">
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <Button onClick={loadApplicants} className="rounded-full bg-[#101010] text-white hover:bg-black text-xs px-4 py-2">
              Retry
            </Button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-16 text-center shadow-xs">
            <div className="h-12 w-12 rounded-full bg-black/[0.04] border border-black/[0.08] text-black/60 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#101010] mb-2">
              No submissions yet
            </h2>
            <p className="text-sm text-black/60 font-sans max-w-md mx-auto">
              This job is actively accepting candidates with verified skill profiles. As soon as candidates apply, their verified dossiers will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-xs overflow-hidden">
            <div className="border-b border-black/[0.08] bg-[#F8F8F6] px-6 py-3.5 flex items-center justify-between text-xs font-medium text-black/60">
              <div>Applicant Dossier Index ({applicants.length})</div>
              <div>Verified Matching Matrix</div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {paginatedApplicants.map((app) => {
                const isBusy = updatingStage[app.candidateId] || false;
                const requiredSkills = job?.requiredSkills || [];
                const verifiedSkillsMap: Record<string, any> = app.candidateVerifiedSkills || {};

                return (
                  <div
                    key={app.id}
                    className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Candidate Name */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-bold tracking-tight text-[#101010] leading-tight">
                          {app.candidateName}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-black/70 bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                          {app.candidateKey || (app.candidateId ? `ML-${app.candidateId.slice(0, 8).toUpperCase()}` : "CANDIDATE")}
                        </span>
                        <span className="text-xs text-black/50">
                          Applied {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      {/* Academic Background */}
                      {(app.candidateCollege || app.candidateBranch) && (
                        <div className="flex items-center gap-2 text-sm text-black/60 font-sans">
                          <GraduationCap className="h-4 w-4 text-[#101010] shrink-0" />
                          <span className="font-medium text-[#101010]">{app.candidateBranch}</span>
                          {app.candidateCollege && <span>· {app.candidateCollege}</span>}
                          {app.candidateGradYear && <span className="font-mono">({app.candidateGradYear})</span>}
                        </div>
                      )}

                      {/* Required vs Verified Skill Match Matrix */}
                      <div className="pt-1">
                        <div className="text-[11px] font-medium text-black/50 uppercase tracking-wider mb-2">
                          Capabilities vs Role Requirements:
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {requiredSkills.map((reqSkill) => {
                            const isVerified = verifiedSkillsMap[reqSkill]?.status === "verified";
                            const isDeclared = app.candidateSkills?.includes(reqSkill);
                            return (
                              <span
                                key={reqSkill}
                                className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                  isVerified
                                    ? "bg-emerald-500/10 text-emerald-900 border-emerald-500/20 font-medium"
                                    : isDeclared
                                    ? "bg-black/[0.04] text-[#101010] border-black/[0.08]"
                                    : "bg-white text-black/40 border-black/[0.08] line-through opacity-60"
                                }`}
                              >
                                {isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                                <span>{reqSkill}</span>
                                {isVerified ? " (Verified)" : isDeclared ? " (Claimed)" : ""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions & Pipeline Stage Selector */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {/* Pipeline Stage Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          disabled={isBusy}
                          onChange={(e) => handleStageChange(app.candidateId, e.target.value as ApplicationStage)}
                          className="h-9 px-3.5 bg-[#F8F8F6] border border-black/[0.12] rounded-full text-xs font-medium text-[#101010] focus:outline-none focus:border-black cursor-pointer shadow-xs"
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
                        <Button size="sm" className="gap-1.5 text-xs rounded-full bg-[#101010] hover:bg-black text-white shadow-xs">
                          <span>Open Dossier</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>

                      {/* Message Candidate */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setMessagingTarget({
                            id: app.candidateId,
                            name: app.candidateName,
                          })
                        }
                        className="gap-1.5 text-xs rounded-full border-black/[0.12] bg-white text-[#101010] hover:bg-black/[0.04] shadow-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-black/60" />
                        <span>Message</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {applicants.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-black/[0.08] px-6 py-4">
                <span className="text-xs text-black/60 font-medium">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, applicants.length)} of {applicants.length} applicants
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-black/[0.12] bg-white text-[#101010] text-xs rounded-full hover:bg-black/[0.04] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= applicants.length}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border border-black/[0.12] bg-white text-[#101010] text-xs rounded-full hover:bg-black/[0.04] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
