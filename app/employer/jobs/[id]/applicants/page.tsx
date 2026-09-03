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

const PIPELINE_OPTIONS: { id: ApplicationStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]" },
  { id: "shortlisted", label: "Shortlisted", color: "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]" },
  { id: "interviewing", label: "Interviewing", color: "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]" },
  { id: "offer", label: "Offer Extended", color: "text-[#7E22CE] bg-[#FAF5FF] border-[#E9D5FF]" },
  { id: "hired", label: "Hired", color: "text-[#064E3B] bg-[#ECFDF5] border-[#A7F3D0]" },
  { id: "rejected", label: "Archived / Rejected", color: "text-[#B42318] bg-[#FEF2F2] border-[#FECACA]" },
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
      router.replace("/login");
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
            Loading applicant dossiers…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/employer/jobs"
              className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK TO JOBS HUB
            </Link>
            <h1 className="text-[24px] sm:text-[30px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight">
              APPLICANTS — {job?.title}
            </h1>
            <div className="flex items-center gap-3 text-[12px] text-[#78716C] font-mono mt-1">
              <span>{job?.location}</span>
              <span>·</span>
              <span>{job?.workMode?.toUpperCase()}</span>
              <span>·</span>
              <span className="text-[#064E3B] font-semibold">{applicants.length} SUBMISSIONS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/jobs/${id}`} target="_blank">
              <button className="px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded-full transition-colors shadow-2xs">
                VIEW PUBLIC POSTING ↗
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {error ? (
          <div className="border border-[#B42318]/20 bg-[#FEF2F2] p-8 text-center rounded-2xl">
            <p className="text-[14px] text-[#B42318] mb-4">{error}</p>
            <button onClick={loadApplicants} className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-mono rounded-full">
              RETRY
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Users className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-[#1C1917] mb-2">
              NO SUBMISSIONS YET
            </h2>
            <p className="text-[13px] text-[#78716C] font-sans max-w-md mx-auto">
              This job is actively accepting candidates with 100% profile completion. As soon as candidates apply, their verified dossiers will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-[#E7E2DA] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-[#E7E2DA] bg-[#FAF8F5] px-6 py-3.5 flex items-center justify-between text-[11px] font-mono text-[#78716C] uppercase font-semibold">
              <div>APPLICANT DOSSIER INDEX ({applicants.length})</div>
              <div>VERIFIED MATCHING MATRIX</div>
            </div>

            <div className="divide-y divide-[#F5F1EB]">
              {applicants.map((app) => {
                const isBusy = updatingStage[app.candidateId] || false;
                const requiredSkills = job?.requiredSkills || [];
                const verifiedSkillsMap = app.candidateVerifiedSkills || {};

                return (
                  <div
                    key={app.id}
                    className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#FAF8F5]/40 transition-colors"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Name with subtle cursive flair */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-signature text-[32px] sm:text-[38px] text-[#1C1917] leading-none font-semibold">
                          {app.candidateName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded-full border border-[#064E3B]/20">
                          {app.candidateKey || "KEY: RECORDED"}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C]">
                          Applied {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      {/* Academic Background */}
                      {(app.candidateCollege || app.candidateBranch) && (
                        <div className="flex items-center gap-2 text-[13px] text-[#78716C] font-sans">
                          <GraduationCap className="h-4 w-4 text-[#064E3B] shrink-0" />
                          <span className="font-medium text-[#1C1917]">{app.candidateBranch}</span>
                          {app.candidateCollege && <span>· {app.candidateCollege}</span>}
                          {app.candidateGradYear && <span className="font-mono">({app.candidateGradYear})</span>}
                        </div>
                      )}

                      {/* Required vs Verified Skill Match Matrix */}
                      <div className="pt-1">
                        <div className="text-[10px] font-mono uppercase text-[#78716C] tracking-wider mb-1.5">
                          Capabilities vs Role Requirements:
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {requiredSkills.map((reqSkill) => {
                            const isVerified = verifiedSkillsMap[reqSkill]?.status === "verified";
                            const isDeclared = app.candidateSkills?.includes(reqSkill);
                            return (
                              <span
                                key={reqSkill}
                                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isVerified
                                    ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30 font-semibold"
                                    : isDeclared
                                    ? "bg-[#FAF8F5] text-[#1C1917] border-[#E7E2DA]"
                                    : "bg-white text-[#A8A29E] border-[#E7E2DA] line-through opacity-70"
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
                          className="h-10 px-3.5 bg-white border border-[#E7E2DA] rounded-full text-[12px] font-mono font-semibold text-[#1C1917] focus:outline-none shadow-2xs cursor-pointer"
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
                        <button className="flex items-center justify-center gap-1.5 px-4 h-10 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
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
                        className="flex items-center justify-center gap-1.5 px-4 h-10 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[#1C1917] text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-[#78716C]" />
                        <span>MESSAGE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
