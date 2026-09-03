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
      const token = user ? await user.getIdToken(true) : null;
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
      const token = await user.getIdToken(true);
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
      <div className="w-full min-h-full bg-[#FAF8F5] flex items-center justify-center p-16">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
            Loading opportunity file #{id.slice(0, 8)}…
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full min-h-full bg-[#FAF8F5] flex items-center justify-center p-16 text-[#1C1917]">
        <div className="max-w-md w-full bg-white border border-[#E7E2DA] p-8 text-center rounded-2xl shadow-xs">
          <AlertCircle className="h-10 w-10 text-[#B42318] mx-auto mb-3" />
          <h2 className="text-[20px] font-semibold mb-2">
            Opportunity Unavailable
          </h2>
          <p className="text-[13px] text-[#78716C] mb-6">
            {error || "The requested job posting could not be found or has been removed."}
          </p>
          <Link href="/candidate/jobs">
            <button className="px-5 py-2.5 bg-[#1C1917] text-white text-[12px] font-mono font-semibold rounded-full hover:bg-[#064E3B] transition-colors uppercase">
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
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Institutional Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK TO ALL ROLES
          </Link>

          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            RECORD #{job.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Main Job Specification ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-[#E7E2DA] bg-white p-7 sm:p-9 rounded-2xl shadow-xs">
            {/* Metadata Tags */}
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#064E3B] bg-[#064E3B]/10 px-3 py-1 rounded-full border border-[#064E3B]/20">
                {job.workMode.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E7E2DA]">
                {job.employmentType.replace("-", " ").toUpperCase()}
              </span>
              {job.salaryRange && (
                <span className="text-[12px] font-mono text-[#1C1917] font-semibold bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E7E2DA]">
                  {job.salaryRange}
                </span>
              )}
            </div>

            <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#1C1917] tracking-tight leading-tight mb-2">
              {job.title}
            </h1>

            <div className="flex items-center gap-4 text-[14px] text-[#78716C] flex-wrap pb-6 border-b border-[#F5F1EB]">
              <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                <Building2 className="h-4 w-4 text-[#78716C]" />
                {job.companyName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#78716C]" />
                {job.location}
              </span>
            </div>

            {/* Description */}
            <div className="py-6 space-y-4">
              <h2 className="text-[13px] font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1917]">
                ROLE SPECIFICATION & RESPONSIBILITIES
              </h2>
              <div className="text-[14px] text-[#333333] leading-relaxed whitespace-pre-line font-sans">
                {job.description}
              </div>
            </div>

            {/* Required Skills Matrix */}
            <div className="pt-6 border-t border-[#F5F1EB] space-y-3">
              <h2 className="text-[13px] font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1917]">
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
                          ? "bg-[#064E3B]/[0.03] border-[#064E3B]/30 text-[#064E3B]"
                          : "bg-[#FAF8F5] border-[#E7E2DA] text-[#1C1917]"
                      }`}
                    >
                      <span className="font-semibold">{skill}</span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#064E3B] font-semibold">
                          <ShieldCheck className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#78716C]">Required</span>
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
          <div className="border border-[#E7E2DA] bg-white p-6 sm:p-7 rounded-2xl shadow-xs space-y-5">
            <h2 className="text-[13px] font-mono font-semibold uppercase tracking-[0.08em] text-[#1C1917]">
              APPLICATION DOSSIER
            </h2>

            {/* Status if Closed */}
            {isClosed ? (
              <div className="border border-[#B45309]/30 bg-[#FFFBEB] p-4 rounded-xl text-center">
                <AlertCircle className="h-5 w-5 text-[#B45309] mx-auto mb-1.5" />
                <div className="text-[12px] font-bold uppercase text-[#92400E]">
                  APPLICATIONS CLOSED
                </div>
                <p className="text-[12px] text-[#78716C] mt-1">
                  This opportunity is currently paused or no longer accepting new submissions.
                </p>
              </div>
            ) : hasApplied ? (
              <div className="border border-[#064E3B]/30 bg-[#064E3B]/[0.04] p-5 rounded-xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#064E3B] mx-auto" />
                <div className="text-[14px] font-bold uppercase tracking-wide text-[#064E3B]">
                  APPLICATION SUBMITTED
                </div>
                <p className="text-[12px] text-[#78716C] leading-relaxed">
                  Your verified candidate dossier has been delivered to {job.companyName || "the hiring organization"} for review.
                </p>
                <div className="pt-1">
                  <Link
                    href="/candidate/applications"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#064E3B] font-semibold hover:underline"
                  >
                    View in My Applications →
                  </Link>
                </div>
              </div>
            ) : !user ? (
              /* Unauthenticated Call to Action */
              <div className="space-y-3 text-center">
                <p className="text-[13px] text-[#78716C]">
                  Sign in with your verified MeritLane candidate credentials to submit your application.
                </p>
                <Link href={`/login?redirect=/candidate/jobs/${job.id}`}>
                  <button className="w-full h-11 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-2xs">
                    AUTHENTICATE TO APPLY
                  </button>
                </Link>
              </div>
            ) : role !== "candidate" ? (
              /* Employer / Admin Account Warning */
              <div className="border border-[#E7E2DA] bg-[#FAF8F5] p-4 rounded-xl text-center">
                <p className="text-[12px] text-[#78716C]">
                  You are signed in as an {role}. Only candidate accounts may submit job applications.
                </p>
              </div>
            ) : (
              /* ── 100% PROFILE COMPLETION GATE ── */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider mb-1.5">
                    <span className="text-[#78716C]">Profile Completeness:</span>
                    <span
                      className={`font-semibold ${
                        completion?.isComplete ? "text-[#064E3B]" : "text-[#B45309]"
                      }`}
                    >
                      {completion?.percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-[#E7E2DA] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completion?.isComplete ? "bg-[#064E3B]" : "bg-[#B45309]"
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
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      Complete your profile to 100% before applying. Please resolve the following missing sections:
                    </p>
                    <ul className="text-[11px] font-mono text-[#92400E] space-y-1 list-disc list-inside">
                      {completion?.missingFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                    <div className="pt-2">
                      <Link href="/candidate/profile">
                        <button className="w-full h-10 border border-[#B45309] bg-white hover:bg-[#FFFBEB] text-[#92400E] text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors">
                          COMPLETE PROFILE NOW →
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[#064E3B]/30 bg-[#064E3B]/[0.03] p-3 rounded-xl flex items-center gap-2 text-[12px] text-[#064E3B] font-mono font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Profile 100% Complete · Application Eligible
                  </div>
                )}

                {/* Error Banner */}
                {applyError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#B42318]/20 rounded-xl text-[12px] text-[#B42318] font-sans">
                    {applyError}
                  </div>
                )}

                {/* Apply Button */}
                <button
                  onClick={handleApply}
                  disabled={applying || !completion?.isComplete || (completion?.percentage || 0) < 100}
                  className="w-full h-11 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="border border-[#E7E2DA] bg-white p-5 rounded-2xl shadow-xs space-y-2 text-[12px] text-[#78716C] leading-relaxed font-sans">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#1C1917] font-semibold">
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
