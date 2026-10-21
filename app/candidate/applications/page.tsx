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
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function CandidateApplicationsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || role !== "candidate")) {
      router.replace("/");
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
        return "text-neutral-600 bg-neutral-100 border-black/[0.08]";
      case "shortlisted":
        return "text-[#101010] bg-neutral-200 border-black/[0.12]";
      case "interviewing":
        return "text-[#101010] bg-neutral-100 border-black/[0.12]";
      case "offer":
        return "text-[#101010] bg-neutral-100 border-black/[0.12]";
      case "hired":
        return "text-[#101010] bg-neutral-100 border-black/[0.12]";
      case "rejected":
        return "text-neutral-500 bg-neutral-50 border-black/[0.06]";
      default:
        return "text-neutral-600 bg-neutral-100 border-black/[0.08]";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F8F6] pb-24 text-[#101010]">
      {/* ── Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase mb-1 font-medium">
              Applications · Candidate Portal
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-[#101010] leading-tight">
              My Applications
            </h1>
          </div>

          <Link href="/candidate/jobs">
            <button className="px-5 py-2.5 bg-[#101010] hover:bg-black text-white text-[13px] font-medium rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1.5">
              <span>Browse open roles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="border border-black/[0.08] bg-white p-16 text-center rounded-2xl shadow-xs">
            <MeritlaneLoader level="section" text="Loading your applications…" />
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50/70 p-8 text-center rounded-2xl">
            <p className="text-[14px] text-red-900 mb-4">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="border border-black/[0.08] bg-white p-16 text-center rounded-2xl shadow-xs max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 border border-black/[0.08]">
              <Briefcase className="h-5 w-5 text-neutral-600" />
            </div>
            <h2 className="text-[18px] font-bold tracking-tight text-[#101010] mb-2">
              No applications yet
            </h2>
            <p className="text-[13px] text-neutral-500 max-w-md mx-auto mb-6">
              You haven&apos;t applied to any roles yet. Explore open engineering opportunities and apply directly with your verified credentials.
            </p>
            <Link href="/candidate/jobs">
              <button className="px-6 py-2.5 bg-[#101010] hover:bg-black text-white text-[13px] font-medium rounded-full transition-all shadow-xs cursor-pointer">
                Browse open roles
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-black/[0.08] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-black/[0.08] bg-[#F8F8F6] px-6 py-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
              <div>Submitted Applications ({applications.length})</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-neutral-50/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-medium uppercase tracking-wider px-3 py-0.5 rounded-full border ${getStageBadge(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Submitted {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="text-[17px] font-bold text-[#101010] tracking-tight">
                      {app.jobTitle}
                    </h2>

                    <div className="flex items-center gap-4 text-[13px] text-neutral-500 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium text-[#101010]">
                        <Building2 className="h-4 w-4 text-neutral-400" />
                        {app.companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        {app.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link href={`/candidate/jobs/${app.jobId}`}>
                      <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-black/[0.08] bg-white hover:bg-neutral-50 text-[12px] font-medium text-[#101010] rounded-full transition-colors shadow-xs cursor-pointer">
                        <span>View Role</span>
                        <ExternalLink className="h-3 w-3 text-neutral-400" />
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
