"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Building2,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Lock,
} from "lucide-react";
import { Job } from "@/lib/firebase/jobs";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { calculateProfileCompletion, ProfileCompletionResult } from "@/lib/profileCompletion";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function CandidateJobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);

  // Candidate Profile Completion State
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletionResult | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Application Submission State
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = user ? await user.getIdToken() : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/jobs/${id}`, { headers });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Job not found.");
        throw new Error("Failed to load job details.");
      }
      const data = await res.json();
      setJob(data.job);
      if (data.hasApplied) setHasApplied(true);
      if (data.candidateCompletion) setCompletion(data.candidateCompletion);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (!user || role !== "candidate") return;
    setCheckingProfile(true);
    fetchCandidateProfile(user.uid)
      .then((p) => {
        setCandidateProfile(p);
        if (p) {
          const res = calculateProfileCompletion(p);
          setCompletion(res);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setCheckingProfile(false));
  }, [user, role]);

  useEffect(() => {
    if (id) loadJob();
  }, [id, loadJob]);

  const handleApply = async () => {
    if (!user || role !== "candidate") {
      router.push(`/login?redirect=/candidate/jobs/${id}`);
      return;
    }

    if (!completion || !completion.isComplete || completion.percentage < 100) {
      setApplyError("Complete your profile to 100% before applying.");
      return;
    }

    setApplying(true);
    setApplyError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setApplySuccess(true);
      setHasApplied(true);
    } catch (err: any) {
      console.error("Application error:", err);
      setApplyError(err.message || "Unable to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-full bg-surface flex items-center justify-center p-16">
        <MeritlaneLoader level="section" text="Loading role specifications…" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full min-h-full bg-surface flex items-center justify-center p-16 text-foreground">
        <div className="max-w-md w-full bg-white border border-border p-8 text-center rounded-2xl shadow-xs">
          <AlertCircle className="h-10 w-10 text-danger mx-auto mb-3" />
          <h2 className="text-[20px] font-semibold mb-2">
            Opportunity Unavailable
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            {error || "The requested job posting could not be found or has been removed."}
          </p>
          <Link href="/candidate/jobs">
            <button className="px-5 py-2.5 bg-foreground text-white text-[12px] font-medium font-semibold rounded hover:bg-emerald-900 transition-colors uppercase">
              Return to Roles
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = job.status === "closed" || job.status === "paused";
  const verifiedSkills = candidateProfile?.verifiedSkills || {};

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-foreground">
      {/* ── Institutional Header Strip ── */}
      <div className="border-b border-border bg-white px-6 sm:px-10 py-5">
        <div className="w-full flex items-center justify-between">
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK TO ALL ROLES
          </Link>

          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Verified Role
          </span>
        </div>
      </div>

      <div className="w-full px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Main Job Specification ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-white p-7 sm:p-9 rounded-2xl shadow-xs">
            {/* Metadata Tags */}
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              <span className="text-[10px] font-medium font-semibold uppercase tracking-[0.14em] text-emerald-900 bg-emerald-900/10 px-3 py-1 rounded border border-emerald-900/20">
                {job.workMode.toUpperCase()}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground bg-surface px-3 py-1 rounded border border-border">
                {job.employmentType.replace("-", " ").toUpperCase()}
              </span>
              {job.salaryRange && (
                <span className="text-[12px] font-mono text-foreground font-semibold bg-surface px-3 py-1 rounded border border-border">
                  {job.salaryRange}
                </span>
              )}
            </div>

            <h1 className="text-[26px] sm:text-[32px] font-semibold text-foreground tracking-tight leading-tight mb-2">
              {job.title}
            </h1>

            <div className="flex items-center gap-4 text-[14px] text-muted-foreground flex-wrap pb-6 border-b border-border">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {job.companyName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {job.location}
              </span>
            </div>

            {/* Description */}
            <div className="py-6 space-y-4">
              <h2 className="text-[13px] font-medium font-semibold uppercase tracking-[0.08em] text-foreground">
                ROLE SPECIFICATION & RESPONSIBILITIES
              </h2>
              <div className="text-[14px] text-[#333333] leading-relaxed whitespace-pre-line font-sans">
                {job.description}
              </div>
            </div>

            {/* Required Skills Matrix */}
            <div className="pt-6 border-t border-border space-y-3">
              <h2 className="text-[13px] font-medium font-semibold uppercase tracking-[0.08em] text-foreground">
                REQUIRED TECHNICAL CAPABILITIES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {job.requiredSkills.map((skill) => {
                  const isVerified = verifiedSkills[skill]?.status === "verified";
                  return (
                    <div
                      key={skill}
                      className={`flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-[12px] font-mono ${
                        isVerified
                          ? "bg-emerald-900/[0.03] border-emerald-900/30 text-emerald-900"
                          : "bg-surface border-border text-foreground"
                      }`}
                    >
                      <span className="font-semibold">{skill}</span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-900 font-semibold">
                          <ShieldCheck className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Required</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Application & Profile Gate Column ── */}
        <div className="space-y-6">
          <div className="border border-border bg-white p-6 sm:p-7 rounded-2xl shadow-xs space-y-5">
            <h2 className="text-[13px] font-medium font-semibold uppercase tracking-[0.08em] text-foreground">
              APPLICATION DOSSIER
            </h2>

            {/* Status if Closed */}
            {isClosed ? (
              <div className="border border-[#B45309]/30 bg-[#FFFBEB] p-4 rounded-xl text-center">
                <AlertCircle className="h-5 w-5 text-[#B45309] mx-auto mb-1.5" />
                <div className="text-[12px] font-bold uppercase text-[#92400E]">
                  APPLICATIONS CLOSED
                </div>
                <p className="text-[12px] text-muted-foreground mt-1">
                  This opportunity is currently paused or no longer accepting new submissions.
                </p>
              </div>
            ) : hasApplied ? (
              <div className="border border-emerald-900/30 bg-emerald-900/[0.04] p-5 rounded-xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-900 mx-auto" />
                <div className="text-[14px] font-bold uppercase tracking-wide text-emerald-900">
                  APPLICATION SUBMITTED
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your verified candidate dossier has been delivered to {job.companyName || "the hiring organization"} for review.
                </p>
                <div className="pt-1">
                  <Link
                    href="/candidate/applications"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-900 font-semibold hover:underline"
                  >
                    View in My Applications →
                  </Link>
                </div>
              </div>
            ) : !user ? (
              /* Unauthenticated Call to Action */
              <div className="space-y-3 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Sign in with your verified MeritLane candidate credentials to submit your application.
                </p>
                <Link href={`/login?redirect=/candidate/jobs/${job.id}`}>
                  <button className="w-full h-11 bg-foreground hover:bg-emerald-900 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-2xs">
                    AUTHENTICATE TO APPLY
                  </button>
                </Link>
              </div>
            ) : role !== "candidate" ? (
              /* Employer / Admin Account Warning */
              <div className="border border-border bg-surface p-4 rounded-xl text-center">
                <p className="text-[12px] text-muted-foreground">
                  You are signed in as an {role}. Only candidate accounts may submit job applications.
                </p>
              </div>
            ) : (
              /* ── 100% PROFILE COMPLETION GATE ── */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-sans font-semibold uppercase tracking-wide mb-1.5">
                    <span className="text-muted-foreground">Profile Completeness:</span>
                    <span
                      className={`font-semibold ${
                        completion?.isComplete ? "text-emerald-900" : "text-[#B45309]"
                      }`}
                    >
                      {completion?.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-border h-2 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completion?.isComplete ? "bg-emerald-900" : "bg-[#B45309]"
                      }`}
                      style={{ width: `${completion?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Eligibility Guidance */}
                {!completion?.isComplete || (completion?.percentage || 0) < 100 ? (
                  <div className="border border-[#B45309]/30 bg-[#FFFBEB] p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#92400E] uppercase tracking-wide">
                      <Lock className="h-4 w-4 shrink-0" />
                      100% Profile Required
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Complete your profile to 100% before applying. Please resolve the following missing sections:
                    </p>
                    <ul className="text-[11px] font-mono text-[#92400E] space-y-1 list-disc list-inside">
                      {completion?.missingFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                    <div className="pt-2">
                      <Link href="/candidate/profile">
                        <button className="w-full h-10 border border-[#B45309] bg-white hover:bg-[#FFFBEB] text-[#92400E] text-[11px] font-sans font-semibold uppercase tracking-wide rounded transition-colors">
                          COMPLETE PROFILE NOW →
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="border border-emerald-900/30 bg-emerald-900/[0.03] p-3 rounded-xl flex items-center gap-2 text-[12px] text-emerald-900 font-mono font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Profile 100% Complete · Application Eligible
                  </div>
                )}

                {/* Error Banner */}
                {applyError && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-[12px] text-danger font-sans">
                    {applyError}
                  </div>
                )}

                {/* Apply Button */}
                <button
                  onClick={handleApply}
                  disabled={applying || !completion?.isComplete || (completion?.percentage || 0) < 100}
                  className="w-full h-11 bg-emerald-900 hover:bg-emerald-950 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>SUBMITTING DOSSIER…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>APPLY NOW</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Institutional Trust Note */}
          <div className="border border-border bg-white p-5 rounded-2xl shadow-xs space-y-2 text-[12px] text-muted-foreground leading-relaxed font-sans">
            <div className="text-[10px] font-sans font-semibold uppercase tracking-wide text-foreground font-semibold">
              Evaluation Protocol
            </div>
            <p>
              Meritlane delivers your audited candidate dossier directly to {job.companyName}. Proctored skill assessments and verified GitHub evidence will be displayed prominently to the review team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
