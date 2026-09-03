"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CandidateApplicationsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || role !== "candidate")) {
      router.replace("/login");
      return;
    }

    if (user && role === "candidate") {
      (async () => {
        setLoading(true);
        try {
          const token = await user.getIdToken(true);
          const res = await fetch("/api/candidate/applications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to load your applications.");
          const data = await res.json();
          setApplications(data.applications || []);
        } catch (err: any) {
          setError(err.message || "Failed to load applications.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [user, role, authLoading, router]);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "applied":
        return "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]";
      case "shortlisted":
        return "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]";
      case "interviewing":
        return "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]";
      case "offer":
        return "text-[#7E22CE] bg-[#FAF5FF] border-[#E9D5FF]";
      case "hired":
        return "text-[#064E3B] bg-[#ECFDF5] border-[#A7F3D0]";
      case "rejected":
        return "text-[#B42318] bg-[#FEF2F2] border-[#FECACA]";
      default:
        return "text-[#78716C] bg-[#FAF8F5] border-[#E7E2DA]";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Candidate Dossier Dispatch · Meritlane Registry
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight">
              MY APPLICATIONS
            </h1>
          </div>

          <Link href="/candidate/jobs">
            <button className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
              EXPLORE MORE ROLES →
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8">
        {loading ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center rounded-2xl">
            <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
              Retrieving application records…
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#B42318]/20 bg-[#FEF2F2] p-8 text-center rounded-2xl">
            <p className="text-[14px] text-[#B42318] mb-4">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-[#1C1917] mb-2">
              NO SUBMITTED APPLICATIONS
            </h2>
            <p className="text-[13px] text-[#78716C] font-sans max-w-md mx-auto mb-6">
              You have not submitted your dossier to any job openings yet. Ensure your profile completion is 100% and browse active engineering roles.
            </p>
            <Link href="/candidate/jobs">
              <button className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs">
                BROWSE VERIFIED JOBS
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E7E2DA] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-[#E7E2DA] bg-[#FAF8F5] px-6 py-3.5 flex items-center justify-between text-[11px] font-mono text-[#78716C] uppercase font-semibold">
              <div>DISPATCHED DOSSIERS ({applications.length})</div>
              <div>STAGE STATUS</div>
            </div>

            <div className="divide-y divide-[#F5F1EB]">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-[#FAF8F5]/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full border ${getStageBadge(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        Submitted {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="text-[18px] font-bold text-[#1C1917] tracking-tight">
                      {app.jobTitle}
                    </h2>

                    <div className="flex items-center gap-4 text-[13px] text-[#78716C] flex-wrap font-sans">
                      <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                        <Building2 className="h-4 w-4 text-[#78716C]" />
                        {app.companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#78716C]" />
                        {app.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link href={`/candidate/jobs/${app.jobId}`}>
                      <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold text-[#1C1917] rounded-full transition-colors shadow-2xs">
                        <span>VIEW ROLE</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
