"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  XCircle,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { Job, JobStatus } from "@/lib/firebase/jobs";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function EmployerJobsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const paginatedJobs = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return jobs.slice(start, start + ITEMS_PER_PAGE);
  }, [jobs, currentPage]);

  const loadEmployerJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load your posted jobs.");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load jobs.");
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
      loadEmployerJobs();
    }
  }, [user, role, authLoading, router, loadEmployerJobs]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));
    setActionError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status.");
      }
      await loadEmployerJobs();
    } catch (err: any) {
      setActionError(err.message || "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "published":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "paused":
        return "text-amber-800 bg-amber-50 border-amber-200";
      case "closed":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-[#71717A] bg-black/[0.04] border-black/[0.08]";
    }
  };

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010] font-sans">
      {/* ── Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#71717A] uppercase mb-1">
              Employer Hiring Operations · MeritLane
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.035em] text-[#101010] leading-tight">
              Jobs Management
            </h1>
            <p className="text-[13px] text-[#71717A] mt-0.5">
              Create and manage job postings targeted at verified engineering talent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard">
              <button className="px-4 py-2 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium rounded-full text-[#101010] transition-colors shadow-xs cursor-pointer">
                Candidate Discovery
              </button>
            </Link>
            <Link href="/employer/jobs/new">
              <button className="flex items-center gap-2 px-5 py-2 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full transition-all shadow-xs cursor-pointer active:scale-[0.98]">
                <Plus className="h-4 w-4" />
                Post a Job
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 space-y-6">

        {/* Action Error Banner */}
        {actionError && (
          <div className="border border-red-200 bg-red-50 rounded-xl px-5 py-3 flex items-center justify-between gap-4 text-xs text-red-600">
            <p>{actionError}</p>
            <button
              onClick={() => setActionError("")}
              className="font-medium hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="border border-black/[0.08] bg-white p-16 text-center rounded-2xl shadow-xs">
            <MeritlaneLoader level="section" text="Loading your posted roles…" />
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-8 text-center rounded-2xl">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadEmployerJobs}
              className="px-4 py-2 bg-[#101010] text-white text-xs font-medium rounded-full shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-dashed border-black/[0.12] bg-white p-16 text-center rounded-2xl shadow-xs">
            <Briefcase className="h-10 w-10 text-[#A1A1AA] mx-auto mb-4" />
            <h2 className="text-[18px] font-semibold text-[#101010] mb-2 tracking-tight">
              No roles posted yet
            </h2>
            <p className="text-[13px] text-[#71717A] max-w-md mx-auto mb-6 leading-relaxed">
              Create your first engineering job posting to start receiving verified candidate dossiers directly into your hiring pipeline.
            </p>
            <Link href="/employer/jobs/new">
              <button className="px-6 py-2.5 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full transition-all shadow-xs cursor-pointer">
                + Post Your First Job
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-black/[0.08] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-black/[0.08] bg-[#FAFAF9] px-6 py-4 flex items-center justify-between">
              <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                Posted Roles Directory ({jobs.length})
              </div>
              <div className="text-xs text-[#71717A]">
                Proof-Based Hiring
              </div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {paginatedJobs.map((job) => {
                const busy = actionLoading[job.id] || false;
                return (
                  <div key={job.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#FAFAF9] transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                        <span className="text-xs text-[#71717A]">
                          {job.workMode} · {job.employmentType}
                        </span>
                        <span className="text-xs font-mono text-[#71717A]">
                          · {job.location}
                        </span>
                      </div>

                      <h2 className="text-[20px] font-semibold text-[#101010] tracking-tight">
                        {job.title}
                      </h2>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {job.requiredSkills.map((sk) => (
                          <span key={sk} className="text-xs font-mono bg-black/[0.04] text-[#101010] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Applicant Count & Operations */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {/* Applicants Button */}
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <button className="flex items-center justify-center gap-2 px-4 py-1.5 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium text-[#101010] rounded-full transition-colors shadow-xs cursor-pointer">
                          <Users className="h-3.5 w-3.5 text-[#71717A]" />
                          <span>Applicants ({job.applicationCount || 0})</span>
                        </button>
                      </Link>

                      {/* Edit Button */}
                      <Link href={`/employer/jobs/${job.id}/edit`}>
                        <button className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium text-[#101010] rounded-full transition-colors cursor-pointer">
                          <Edit3 className="h-3.5 w-3.5 text-[#71717A]" />
                          <span>Edit</span>
                        </button>
                      </Link>

                      {/* Public Preview Button (if published) */}
                      {job.status === "published" && (
                        <Link href={`/jobs/${job.id}`} target="_blank">
                          <button className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium text-[#101010] rounded-full transition-colors cursor-pointer">
                            <Eye className="h-3.5 w-3.5 text-[#71717A]" />
                            <span>Preview ↗</span>
                          </button>
                        </Link>
                      )}

                      {/* Status Toggles */}
                      {job.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "published")}
                          disabled={busy}
                          className="px-4 py-1.5 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Publish Now
                        </button>
                      )}

                      {job.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "paused")}
                          disabled={busy}
                          className="px-3.5 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-medium rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Pause
                        </button>
                      )}

                      {job.status === "paused" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "published")}
                          disabled={busy}
                          className="px-3.5 py-1.5 bg-[#101010] hover:bg-[#252525] text-white text-xs font-medium rounded-full shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Resume
                        </button>
                      )}

                      {job.status !== "closed" && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to close this job? It will no longer accept applications.")) {
                              handleStatusChange(job.id, "closed");
                            }
                          }}
                          disabled={busy}
                          className="px-3.5 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-medium rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {jobs.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-black/[0.08] px-6 py-4">
                <span className="text-xs text-[#71717A]">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, jobs.length)} of {jobs.length} jobs
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-black/[0.12] bg-white text-[#101010] text-xs rounded-full hover:bg-[#F4F4F2] disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= jobs.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 border border-black/[0.12] bg-white text-[#101010] text-xs rounded-full hover:bg-[#F4F4F2] disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
