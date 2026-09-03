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
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function EmployerJobsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const loadEmployerJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken(true);
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
      router.replace("/login");
      return;
    }
    if (user && role === "employer") {
      loadEmployerJobs();
    }
  }, [user, role, authLoading, router, loadEmployerJobs]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      await loadEmployerJobs();
    } catch (err: any) {
      alert(err.message || "Action failed.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case "published":
        return "text-[#064E3B] bg-[#064E3B]/10 border-[#064E3B]/30";
      case "draft":
        return "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]";
      case "paused":
        return "text-[#B45309] bg-[#FEF3C7] border-[#D97706]/30";
      case "closed":
        return "text-[#B42318] bg-[#FEF2F2] border-[#B42318]/30";
      default:
        return "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Command Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Employer Hiring Operations · Meritlane Registry
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight">
              JOBS MANAGEMENT HUB
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employer/dashboard">
              <button className="px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded-full transition-colors shadow-2xs">
                CANDIDATE DISCOVERY
              </button>
            </Link>
            <Link href="/employer/jobs/new">
              <button className="flex items-center gap-2 px-5 py-2 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
                <Plus className="h-4 w-4" />
                POST A NEW JOB
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 space-y-6">
        <ContextGuide
          storageKey="employer_jobs_hub"
          title="Jobs & Application Intake"
          description="Publish verified engineering roles to the public MeritLane catalog. Applications are exclusively accepted from candidates who have completed 100% of their verified profile."
          steps={[
            { title: "Define Role", description: "Specify skills, environment, and job description.", isCompleted: true },
            { title: "Publish Live", description: "Activate posting for public candidate intake.", isCompleted: jobs.some(j => j.status === "published") },
            { title: "Review Dossiers", description: "Evaluate candidates through the existing proof pipeline.", isCompleted: jobs.some(j => j.applicationCount > 0) },
          ]}
        />

        {loading ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center rounded-2xl">
            <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
              Loading your posted roles…
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#B42318]/20 bg-[#FEF2F2] p-8 text-center rounded-2xl">
            <p className="text-[14px] text-[#B42318] mb-4">{error}</p>
            <button
              onClick={loadEmployerJobs}
              className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-mono font-semibold rounded-full"
            >
              RETRY
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-[#1C1917] mb-2">
              NO ROLES POSTED YET
            </h2>
            <p className="text-[13px] text-[#78716C] font-sans max-w-md mx-auto mb-6">
              Establish your first engineering job posting to start receiving verified candidate dossiers directly into your hiring pipeline.
            </p>
            <Link href="/employer/jobs/new">
              <button className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
                + POST YOUR FIRST JOB
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E7E2DA] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-[#E7E2DA] bg-[#FAF8F5] px-6 py-3.5 flex items-center justify-between">
              <div className="text-[11px] font-mono tracking-[0.14em] text-[#78716C] uppercase font-semibold">
                POSTED ROLES DIRECTORY ({jobs.length})
              </div>
              <div className="text-[11px] font-mono text-[#78716C]">
                Proof-Based Hiring
              </div>
            </div>

            <div className="divide-y divide-[#F5F1EB]">
              {jobs.map((job) => {
                const busy = actionLoading[job.id] || false;
                return (
                  <div key={job.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#FAF8F5]/50 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[10px] font-mono font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full border ${getStatusBadge(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C] uppercase">
                          {job.workMode} · {job.employmentType}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C]">
                          · {job.location}
                        </span>
                      </div>

                      <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C1917] tracking-tight">
                        {job.title}
                      </h2>

                      <div className="flex items-center gap-2 flex-wrap">
                        {job.requiredSkills.map((sk) => (
                          <span key={sk} className="text-[10px] font-mono bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA] px-2 py-0.5 rounded-full">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Applicant Count & Operations */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {/* Applicants Button */}
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold text-[#1C1917] rounded-full transition-colors shadow-2xs">
                          <Users className="h-3.5 w-3.5 text-[#064E3B]" />
                          <span>APPLICANTS ({job.applicationCount || 0})</span>
                        </button>
                      </Link>

                      {/* Edit Button */}
                      <Link href={`/employer/jobs/${job.id}/edit`}>
                        <button className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold text-[#1C1917] rounded-full transition-colors">
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>EDIT</span>
                        </button>
                      </Link>

                      {/* Public Preview Button (if published) */}
                      {job.status === "published" && (
                        <Link href={`/jobs/${job.id}`} target="_blank">
                          <button className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold text-[#1C1917] rounded-full transition-colors">
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
                          className="px-4 py-2 bg-[#064E3B] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full hover:bg-[#043327] transition-colors disabled:opacity-50"
                        >
                          PUBLISH NOW
                        </button>
                      )}

                      {job.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "paused")}
                          disabled={busy}
                          className="px-3.5 py-2 border border-[#D97706]/30 text-[#92400E] bg-[#FFFBEB] text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full hover:bg-[#FEF3C7] transition-colors disabled:opacity-50"
                        >
                          PAUSE
                        </button>
                      )}

                      {job.status === "paused" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "published")}
                          disabled={busy}
                          className="px-3.5 py-2 bg-[#064E3B] text-white text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full hover:bg-[#043327] transition-colors disabled:opacity-50"
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
                          className="px-3.5 py-2 border border-[#B42318]/30 text-[#B42318] bg-[#FEF2F2] text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                        >
                          CLOSE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
