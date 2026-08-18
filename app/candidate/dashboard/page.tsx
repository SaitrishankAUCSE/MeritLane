"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight, Code2, Sparkles, FileText, Layers } from "lucide-react";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
        })
        .catch((err) => {
          console.error("Error fetching candidate profile:", err);
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">Loading your profile status...</p>
      </div>
    );
  }

  const status = profile?.verificationStatus || "draft";

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      case "pending":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
        );
      case "changes_required":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "rejected":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200/80 shadow-sm">
            <XCircle className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Verification Pending";
      case "changes_required":
        return "Action Required";
      case "rejected":
        return "Not Verified";
      default:
        return "Action Required";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "verified":
        return "Your Meritlane profile has been verified.";
      case "pending":
        return "Your profile is currently being reviewed by Meritlane.";
      case "changes_required":
        return "Please review the feedback and update your profile.";
      case "rejected":
        return profile?.verificationReason 
          ? `Your profile was not verified: ${profile.verificationReason}` 
          : "Your profile was not verified by Meritlane.";
      default:
        return "Your profile is incomplete or saved as a draft. Please submit it for verification.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Direct Shortcut Banner */}
        {user?.email?.toLowerCase().trim() === "saitrishankb9@gmail.com" && (
          <div className="rounded-md border border-slate-300 bg-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#1a56db] animate-pulse"></span>
                Administrator Account Detected ({user.email})
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                You have full access to the verification pipeline, directory, and candidate audit tools.
              </p>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => router.push("/admin")}
              className="shrink-0"
            >
              Open Admin Command Center
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Candidate Dashboard
              </h1>
              <Badge variant={status === "verified" ? "verified" : status === "pending" ? "pending" : status === "changes_required" ? "changes_required" : status === "rejected" ? "rejected" : "neutral"}>
                {getStatusTitle()}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Manage your engineering profile and verification status.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/candidate/profile")}
            className="shrink-0"
          >
            Edit Profile
          </Button>
        </div>

        {/* Verification Status Card */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {getStatusIcon()}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900">
                    {getStatusTitle()}
                  </h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {getStatusDescription()}
                </p>

                {/* Feedback Box for Changes Required */}
                {status === "changes_required" && profile?.verificationReason && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Feedback from Meritlane
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-amber-950 font-mono">
                      {profile.verificationReason}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-3">
                  {(status === "draft" || !profile) && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/profile")}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Complete Profile
                    </Button>
                  )}

                  {status === "changes_required" && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/profile")}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Update Profile
                    </Button>
                  )}

                  {status === "pending" && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/assessment")}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Start Skill Assessment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Project Portfolio</span>
              <Layers className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-zinc-900">
                {profile?.projects?.length || 0}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {profile?.projects?.length === 1 ? "1 project submitted" : `${profile?.projects?.length || 0} projects submitted as code evidence`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Skills Track</span>
              <Code2 className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s) => (
                    <span key={s} className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400">No skills added yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
