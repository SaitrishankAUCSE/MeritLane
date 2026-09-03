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
  { id: "all", label: "All Submissions", color: "text-[#1C1917] bg-white border-[#E7E2DA]" },
  { id: "applied", label: "Applied", color: "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]" },
  { id: "shortlisted", label: "Shortlisted", color: "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]" },
  { id: "interviewing", label: "Interviewing", color: "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]" },
  { id: "offer", label: "Offer Extended", color: "text-[#7E22CE] bg-[#FAF5FF] border-[#E9D5FF]" },
  { id: "hired", label: "Hired", color: "text-[#064E3B] bg-[#ECFDF5] border-[#A7F3D0]" },
  { id: "rejected", label: "Archived", color: "text-[#B42318] bg-[#FEF2F2] border-[#FECACA]" },
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
      const token = await user.getIdToken(true);
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
      router.replace("/login");
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
      const token = await user.getIdToken(true);
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
      alert(err.message || "Failed to transition stage.");
    } finally {
      setUpdatingStage((prev) => ({ ...prev, [appId]: false }));
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (selectedJobId !== "all" && app.jobId !== selectedJobId) return false;
    if (selectedStage !== "all" && app.status !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (app.candidateName || "").toLowerCase().includes(q);
      const matchCollege = (app.candidateCollege || "").toLowerCase().includes(q);
      const matchRole = (app.jobTitle || "").toLowerCase().includes(q);
      const matchSkills = (app.candidateSkills || []).some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchCollege && !matchRole && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Employer Hiring Ingress · Meritlane Technical Registry
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight flex items-center gap-3">
              <Users className="h-7 w-7 text-[#064E3B]" />
              Candidate Submissions
            </h1>
            <p className="text-[13px] text-[#78716C] mt-1 font-sans">
              All verified applications submitted by candidates for your published opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employer/jobs/new">
              <button className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
                + POST NEW OPPORTUNITY
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {/* ── Filter Bar ── */}
        <div className="bg-white border border-[#E7E2DA] p-4 sm:p-5 rounded-2xl mb-8 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search candidates, college, or skills…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            {/* Filter by Job */}
            <div>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 text-[13px] text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors cursor-pointer"
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
                className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 text-[13px] text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors cursor-pointer"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    Status: {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-1 border-t border-[#F5F1EB]">
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
                  className={`text-[12px] font-mono px-3 py-1 rounded-full border transition-all shrink-0 ${
                    isActive
                      ? "bg-[#1C1917] text-white border-[#1C1917] font-semibold shadow-xs"
                      : "bg-[#FAF8F5] text-[#78716C] border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
                  }`}
                >
                  {s.label} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Submissions Feed ── */}
        {loading ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center rounded-2xl shadow-xs">
            <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
              Retrieving applicant submissions…
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#FECACA] bg-[#FEF2F2] p-8 text-center rounded-2xl text-[#B42318]">
            <p className="font-medium text-[14px]">{error}</p>
            <button
              onClick={fetchApplicants}
              className="mt-3 px-4 py-1.5 bg-[#B42318] text-white text-[12px] font-mono rounded-full uppercase"
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="border border-[#E7E2DA] border-dashed bg-white p-16 text-center rounded-2xl shadow-xs">
            <Users className="h-10 w-10 text-[#78716C] mx-auto mb-3 opacity-60" />
            <h3 className="text-[18px] font-semibold text-[#1C1917] mb-1">
              No Submissions in this View
            </h3>
            <p className="text-[13px] text-[#78716C] max-w-md mx-auto mb-6">
              {searchQuery || selectedJobId !== "all" || selectedStage !== "all"
                ? "No applicant records matched your filters. Try clearing your search or selecting all stages."
                : "When candidates apply to your published opportunities, their audited technical dossiers will appear here."}
            </p>
            {(searchQuery || selectedJobId !== "all" || selectedStage !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedJobId("all");
                  setSelectedStage("all");
                }}
                className="px-4 py-2 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[12px] font-mono font-semibold rounded-full uppercase"
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

              const verifiedSkillKeys = Object.keys(app.candidateVerifiedSkills || {}).filter(
                (k) => app.candidateVerifiedSkills[k]?.status === "verified"
              );

              return (
                <div
                  key={app.id}
                  className="border border-[#E7E2DA] bg-white p-6 sm:p-7 rounded-2xl shadow-2xs hover:border-[#1C1917]/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Candidate Info & Role */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C1917]">
                          {app.candidateName}
                        </h2>
                        <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-0.5 rounded-full">
                          {app.candidateKey || `#${app.candidateId.slice(0, 8).toUpperCase()}`}
                        </span>
                        <span className="text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> 100% Verified Profile
                        </span>
                      </div>

                      {/* Job Applied Details */}
                      <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#525252]">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                          <Briefcase className="h-3.5 w-3.5 text-[#064E3B]" />
                          <span>Applied for: {app.jobTitle}</span>
                        </div>
                        <span className="text-[#D6D3D1]">·</span>
                        <div className="flex items-center gap-1 text-[#78716C] font-mono text-[12px]">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{appliedDate}</span>
                        </div>
                      </div>

                      {/* Academic Background */}
                      {app.candidateCollege && (
                        <div className="flex items-center gap-2 text-[12px] text-[#78716C] font-sans">
                          <GraduationCap className="h-4 w-4 text-[#78716C] shrink-0" />
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
                              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                                isVerified
                                  ? "bg-[#ECFDF5] text-[#064E3B] border-[#A7F3D0] font-semibold"
                                  : "bg-[#FAF8F5] text-[#78716C] border-[#E7E2DA]"
                              }`}
                            >
                              {isVerified ? `✓ ${skill}${score ? ` [${score}%]` : ""}` : skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stage Pipeline Controller & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F5F1EB]">
                      {/* Pipeline Stage Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase text-[#78716C]">
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
                          className="text-[12px] font-medium bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg px-3 py-1.5 text-[#1C1917] outline-none cursor-pointer hover:border-[#1C1917] transition-colors disabled:opacity-50"
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
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E7E2DA] hover:border-[#1C1917] text-[12px] font-mono text-[#1C1917] rounded-full transition-colors shadow-2xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#78716C]" />
                          Message
                        </button>

                        <Link href={`/employer/candidate/${app.candidateId}`}>
                          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold rounded-full transition-colors shadow-2xs">
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
