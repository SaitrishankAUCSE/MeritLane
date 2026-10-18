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
        return "text-muted-foreground bg-surface border-border";
      case "shortlisted":
        return "text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]";
      case "interviewing":
        return "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]";
      case "offer":
        return "text-[#7E22CE] bg-[#FAF5FF] border-[#E9D5FF]";
      case "hired":
        return "text-emerald-900 bg-[#ECFDF5] border-[#A7F3D0]";
      case "rejected":
        return "text-danger bg-danger/10 border-[#FECACA]";
      default:
        return "text-muted-foreground bg-surface border-border";
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface pb-24 text-foreground">
      {/* ── Header Strip ── */}
      <div className="border-b border-border bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Applications · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold uppercase tracking-[0.06em] text-foreground leading-tight">
              MY APPLICATIONS
            </h1>
          </div>

          <Link href="/candidate/jobs">
            <button className="px-5 py-2.5 bg-foreground hover:bg-emerald-900 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs">
              BROWSE MORE JOBS →
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="border border-border bg-white p-16 text-center rounded">
            <MeritlaneLoader level="section" text="Loading your applications…" />
          </div>
        ) : error ? (
          <div className="border border-danger/20 bg-danger/10 p-8 text-center rounded">
            <p className="text-[14px] text-danger mb-4">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-foreground mb-2">
              NO APPLICATIONS YET
            </h2>
            <p className="text-[13px] text-muted-foreground font-sans max-w-md mx-auto mb-6">
              You haven&apos;t applied to any jobs yet. Check out open engineering roles and apply with one click.
            </p>
            <Link href="/candidate/jobs">
              <button className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-xs">
                BROWSE JOBS
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-border bg-white rounded shadow-xs overflow-hidden">
            <div className="border-b border-border bg-surface px-6 py-3.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase font-semibold">
              <div>SUBMITTED APPLICATIONS ({applications.length})</div>
              <div>STATUS</div>
            </div>

            <div className="divide-y divide-[#E7E2DA]">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-surface/40 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-medium font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded border ${getStageBadge(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Submitted {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="text-[18px] font-bold text-foreground tracking-tight">
                      {app.jobTitle}
                    </h2>

                    <div className="flex items-center gap-4 text-[13px] text-muted-foreground flex-wrap font-sans">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {app.companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {app.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link href={`/candidate/jobs/${app.jobId}`}>
                      <button className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border bg-white hover:bg-surface text-[12px] font-mono font-semibold text-foreground rounded transition-colors shadow-2xs">
                        <span>VIEW JOB</span>
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
