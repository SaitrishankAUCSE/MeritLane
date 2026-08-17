"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const status = profile?.verificationStatus || "draft";

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      case "pending":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        );
      case "changes_required":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "rejected":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
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
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Candidate Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">Track your application status and verification progress.</p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Verification Status</h2>
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {getStatusIcon()}
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900">
                  {getStatusTitle()}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  {getStatusDescription()}
                </p>

                {/* Feedback Box for Changes Required */}
                {status === "changes_required" && profile?.verificationReason && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Feedback from Meritlane
                    </span>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {profile.verificationReason}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-3">
                  {(status === "draft" || !profile) && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/profile")}
                    >
                      Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {status === "changes_required" && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/profile")}
                    >
                      Update Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {status === "pending" && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/assessment")}
                    >
                      Start Skill Assessment <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
