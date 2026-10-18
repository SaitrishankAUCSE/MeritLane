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
        return "text-emerald-900 bg-emerald-900/10 border-emerald-900/30";
      case "draft":
        return "text-muted-foreground bg-surface border-border";
      case "paused":
        return "text-[#B45309] bg-[#FEF3C7] border-amber-600/30";
      case "closed":
        return "text-danger bg-danger/10 border-danger/30";
      default:
        return "text-muted-foreground bg-surface border-border";
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface pb-24 text-foreground">
      {/* ── Command Header Strip ── */}
      <div className="border-b border-border bg-white px-6 sm:px-10 py-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Employer Hiring Operations · Meritlane Registry
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-foreground leading-tight">
              JOBS MANAGEMENT HUB
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard">
              <button className="px-4 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold rounded transition-colors shadow-2xs">
                CANDIDATE DISCOVERY
              </button>
            </Link>
            <Link href="/employer/jobs/new">
              <button className="flex items-center gap-2 px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs">
                <Plus className="h-4 w-4" />
                POST A NEW JOB
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-6 sm:px-10 py-8 space-y-6">


        {/* Action Error Banner */}
        {actionError && (
          <div className="border border-danger/20 bg-danger/10 rounded px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-[13px] text-danger">{actionError}</p>
            <button
              onClick={() => setActionError("")}
              className="text-[11px] font-mono text-danger hover:underline shrink-0"
            >
              DISMISS
            </button>
          </div>
        )}


        {loading ? (
          <div className="border border-border bg-white p-16 text-center rounded">
            <MeritlaneLoader level="section" text="Loading your posted roles…" />
          </div>
        ) : error ? (
          <div className="border border-danger/20 bg-danger/10 p-8 text-center rounded">
            <p className="text-[14px] text-danger mb-4">{error}</p>
            <button
              onClick={loadEmployerJobs}
              className="px-4 py-2 bg-foreground text-white text-[12px] font-mono font-semibold rounded"
            >
              RETRY
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-foreground mb-2">
              NO ROLES POSTED YET
            </h2>
            <p className="text-[13px] text-muted-foreground font-sans max-w-md mx-auto mb-6">
              Establish your first engineering job posting to start receiving verified candidate dossiers directly into your hiring pipeline.
            </p>
            <Link href="/employer/jobs/new">
              <button className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs">
                + POST YOUR FIRST JOB
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-border bg-white rounded shadow-xs overflow-hidden">
            <div className="border-b border-border bg-surface px-6 py-3.5 flex items-center justify-between">
              <div className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase font-semibold">
                POSTED ROLES DIRECTORY ({jobs.length})
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">
                Proof-Based Hiring
              </div>
            </div>

            <div className="divide-y divide-[#E7E2DA]">
              {paginatedJobs.map((job) => {
                const busy = actionLoading[job.id] || false;
                return (
                  <div key={job.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-surface/50 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[10px] font-medium font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded border ${getStatusBadge(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">
                          {job.workMode} · {job.employmentType}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          · {job.location}
                        </span>
                      </div>

                      <h2 className="text-[18px] sm:text-[20px] font-bold text-foreground tracking-tight">
                        {job.title}
                      </h2>

                      <div className="flex items-center gap-2 flex-wrap">
                        {job.requiredSkills.map((sk) => (
                          <span key={sk} className="text-[10px] font-mono bg-surface text-foreground border border-border px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Applicant Count & Operations */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Applicants Button */}
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold text-foreground rounded transition-colors shadow-2xs">
                          <Users className="h-3.5 w-3.5 text-emerald-900" />
                          <span>APPLICANTS ({job.applicationCount || 0})</span>
                        </button>
                      </Link>

                      {/* Edit Button */}
                      <Link href={`/employer/jobs/${job.id}/edit`}>
                        <button className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold text-foreground rounded transition-colors">
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>EDIT</span>
                        </button>
                      </Link>

                      {/* Public Preview Button (if published) */}
                      {job.status === "published" && (
                        <Link href={`/jobs/${job.id}`} target="_blank">
                          <button className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold text-foreground rounded transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                            <span>VIEW LIVE</span>
                          </button>
                        </Link>
                      )}

                      {/* Status Toggles */}
                      {job.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "published")}
                          disabled={busy}
                          className="px-4 py-2 bg-emerald-900 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded hover:bg-emerald-950 transition-colors disabled:opacity-50"
                        >
                          PUBLISH NOW
                        </button>
                      )}

                      {job.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "paused")}
                          disabled={busy}
                          className="px-3.5 py-2 border border-amber-600/30 text-[#92400E] bg-[#FFFBEB] text-[11px] font-sans font-semibold uppercase tracking-wide rounded hover:bg-[#FEF3C7] transition-colors disabled:opacity-50"
                        >
                          PAUSE
                        </button>
                      )}

                      {job.status === "paused" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "published")}
                          disabled={busy}
                          className="px-3.5 py-2 bg-emerald-900 text-white text-[11px] font-sans font-semibold uppercase tracking-wide rounded hover:bg-emerald-950 transition-colors disabled:opacity-50"
                        >
                          RESUME
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
                          className="px-3.5 py-2 border border-danger/30 text-danger bg-danger/10 text-[11px] font-sans font-semibold uppercase tracking-wide rounded hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                        >
                          CLOSE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {jobs.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, jobs.length)} of {jobs.length} jobs
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
                    disabled={currentPage * ITEMS_PER_PAGE >= jobs.length}
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
    </div>
  );
}
