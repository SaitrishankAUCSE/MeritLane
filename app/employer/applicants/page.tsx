"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react";
import { ApplicationStage } from "@/lib/firebase/jobs";
import { MessageModal } from "@/components/employer/MessageModal";

const PIPELINE_STAGES: { id: ApplicationStage | "all"; label: string; color: string }[] = [
  { id: "all", label: "All Submissions", color: "text-[#101010] bg-white border-black/[0.08]" },
  { id: "applied", label: "Applied", color: "text-[#71717A] bg-black/[0.04] border-black/[0.08]" },
  { id: "shortlisted", label: "Shortlisted", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "interviewing", label: "Interviewing", color: "text-amber-800 bg-amber-50 border-amber-200" },
  { id: "offer", label: "Offer Extended", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "hired", label: "Hired", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "rejected", label: "Archived", color: "text-red-700 bg-red-50 border-red-200" },
];

export default function EmployerApplicantsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingStage, setUpdatingStage] = useState<Record<string, boolean>>({});

  // Messaging Modal
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchApplicants = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/employer/applicants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load applicants.");
      const data = await res.json();
      setApplications(data.applications || []);
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load candidate applications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && (!user || role !== "employer")) {
      router.replace("/");
      return;
    }
    if (user && role === "employer") {
      fetchApplicants();
    }
  }, [user, role, authLoading, router, fetchApplicants]);

  const handleStageChange = async (appId: string, jobId: string, candidateId: string, stage: ApplicationStage) => {
    if (!user) return;
    setUpdatingStage((prev) => ({ ...prev, [appId]: true }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/employer/jobs/${jobId}/applicants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId, stage }),
      });

      if (!res.ok) throw new Error("Failed to update candidate stage.");

      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: stage } : app))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update candidate pipeline stage.");
    } finally {
      setUpdatingStage((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJobId === "all" || app.jobId === selectedJobId;
    const matchesStage = selectedStage === "all" || app.status === selectedStage;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.candidateName?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q) ||
      app.candidateKey?.toLowerCase().includes(q) ||
      (app.candidateSkills || []).some((s: string) => s.toLowerCase().includes(q));

    return matchesJob && matchesStage && matchesSearch;
  });

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010] font-sans">
      {/* ── Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#71717A] uppercase mb-1">
              Employer Ingress · MeritLane
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.035em] text-[#101010] leading-tight flex items-center gap-2.5">
              <Users className="h-6 w-6 text-[#101010]" />
              Candidate Submissions
            </h1>
            <p className="text-[13px] text-[#71717A] mt-0.5">
              All verified applications submitted by candidates for your published opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employer/jobs/new">
              <button className="px-5 py-2 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full transition-all shadow-xs cursor-pointer active:scale-[0.98]">
                + Post a Job
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8">
        {/* ── Filter Bar ── */}
        <div className="bg-white border border-black/[0.08] p-5 sm:p-6 rounded-2xl mb-8 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search candidates, skills, or Candidate ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAFAF9] focus:bg-white border border-black/[0.12] focus:border-[#101010] rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#101010] placeholder:text-[#A1A1AA] outline-none transition-colors"
              />
            </div>

            {/* Filter by Job */}
            <div>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-[#FAFAF9] focus:bg-white border border-black/[0.12] focus:border-[#101010] rounded-xl px-3.5 py-2 text-[13px] text-[#101010] outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Opportunities ({applications.length})</option>
                {jobs.map((job) => {
                  const count = applications.filter((a) => a.jobId === job.id).length;
                  return (
                    <option key={job.id} value={job.id}>
                      {job.title} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stage Quick Filter */}
            <div>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as any)}
                className="w-full bg-[#FAFAF9] focus:bg-white border border-black/[0.12] focus:border-[#101010] rounded-xl px-3.5 py-2 text-[13px] text-[#101010] outline-none transition-colors cursor-pointer"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    Status: {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage Pills (Devin Minimalist) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-2 border-t border-black/[0.06]">
            {PIPELINE_STAGES.map((s) => {
              const isActive = selectedStage === s.id;
              const count =
                s.id === "all"
                  ? applications.length
                  : applications.filter((a) => a.status === s.id).length;

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStage(s.id)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#101010] text-white border-[#101010] shadow-xs"
                      : "bg-[#FAFAF9] text-[#71717A] border-black/[0.08] hover:border-black/[0.2] hover:text-[#101010]"
                  }`}
                >
                  {s.label} <span className="opacity-70 text-[11px] font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Submissions Feed ── */}
        {loading ? (
          <div className="border border-black/[0.08] bg-white p-16 text-center rounded-2xl shadow-xs">
            <div className="h-6 w-6 border-2 border-black/[0.1] border-t-[#101010] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs text-[#71717A]">
              Retrieving applicant submissions…
            </div>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-8 text-center rounded-2xl text-red-600">
            <p className="font-medium text-sm">{error}</p>
            <button
              onClick={fetchApplicants}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full shadow-xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="border border-black/[0.08] border-dashed bg-white p-16 text-center rounded-2xl shadow-xs">
            <Users className="h-10 w-10 text-[#A1A1AA] mx-auto mb-3 opacity-60" />
            <h3 className="text-[18px] font-semibold text-[#101010] mb-1 tracking-tight">
              No submissions in this view
            </h3>
            <p className="text-[13px] text-[#71717A] max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery || selectedJobId !== "all" || selectedStage !== "all"
                ? "No applicant records matched your filters. Try clearing your search or selecting all stages."
                : "When candidates apply to your published opportunities, their verified technical dossiers will appear here."}
            </p>
            {(searchQuery || selectedJobId !== "all" || selectedStage !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedJobId("all");
                  setSelectedStage("all");
                }}
                className="px-4 py-2 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium rounded-full text-[#101010] shadow-xs cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={app.id}
                  className="border border-black/[0.08] bg-white p-6 sm:p-7 rounded-2xl shadow-xs hover:border-black/[0.2] transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Candidate Info & Role */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#101010] tracking-tight">
                          {app.candidateName}
                        </h2>
                        <span className="text-xs font-mono text-[#71717A] bg-black/[0.04] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                          {app.candidateKey || (app.candidateId ? `ML-${app.candidateId.slice(0, 8).toUpperCase()}` : "CANDIDATE")}
                        </span>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified Candidate
                        </span>
                      </div>

                      {/* Job Applied Details */}
                      <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#71717A]">
                        <div className="flex items-center gap-1.5 font-medium text-[#101010]">
                          <Briefcase className="h-3.5 w-3.5 text-[#71717A]" />
                          <span>Applied for: {app.jobTitle}</span>
                        </div>
                        <span className="text-black/20">·</span>
                        <div className="flex items-center gap-1 text-[#71717A] font-mono text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{appliedDate}</span>
                        </div>
                      </div>

                      {/* Academic Background */}
                      {app.candidateCollege && (
                        <div className="flex items-center gap-2 text-xs text-[#71717A]">
                          <GraduationCap className="h-3.5 w-3.5 text-[#71717A] shrink-0" />
                          <span>
                            {app.candidateCollege} · {app.candidateBranch} (Class of {app.candidateGradYear})
                          </span>
                        </div>
                      )}

                      {/* Skill Ledger Highlights */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {app.candidateSkills?.slice(0, 5).map((skill: string) => {
                          const isVerified =
                            app.candidateVerifiedSkills?.[skill]?.status === "verified";
                          const score = app.candidateVerifiedSkills?.[skill]?.score;

                          return (
                            <span
                              key={skill}
                              className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                                isVerified
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                  : "bg-black/[0.04] text-[#71717A] border-black/[0.08]"
                              }`}
                            >
                              {isVerified ? `✓ ${skill}${score ? ` [${score}%]` : ""}` : skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage Pipeline Controller & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-black/[0.06]">
                      {/* Pipeline Stage Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#71717A]">
                          Stage:
                        </span>
                        <select
                          value={app.status || "applied"}
                          disabled={updatingStage[app.id]}
                          onChange={(e) =>
                            handleStageChange(
                              app.id,
                              app.jobId,
                              app.candidateId,
                              e.target.value as ApplicationStage
                            )
                          }
                          className="text-xs font-medium bg-[#FAFAF9] border border-black/[0.12] rounded-xl px-3 py-1.5 text-[#101010] outline-none cursor-pointer hover:border-black/[0.3] transition-colors disabled:opacity-50"
                        >
                          {PIPELINE_STAGES.filter((s) => s.id !== "all").map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setMessagingTarget({
                              id: app.candidateId,
                              name: app.candidateName,
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-black/[0.12] hover:bg-[#F4F4F2] text-xs font-medium text-[#101010] rounded-full transition-colors shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#71717A]" />
                          Message
                        </button>

                        <Link href={`/employer/candidate/${app.candidateId}`}>
                          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full transition-colors shadow-xs cursor-pointer active:scale-[0.98]">
                            View Dossier <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Messaging Modal */}
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
