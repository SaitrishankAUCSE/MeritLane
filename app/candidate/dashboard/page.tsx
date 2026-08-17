"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CandidateDashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [profileStatus, setProfileStatus] = useState<string>("loading");

  useEffect(() => {
    if (!loading && user) {
      // Fetch profile to see verification status
      fetchCandidateProfile(user.uid).then(profile => {
        if (profile) {
          setProfileStatus(profile.verificationStatus || "draft");
        } else {
          setProfileStatus("missing");
        }
      });
    }
  }, [user, loading]);

  if (loading || profileStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Candidate Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">Track your application status and opportunities.</p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Verification Status</h2>
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {profileStatus === "verified" ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900">
                  {profileStatus === "verified" ? "Profile Verified" : 
                   profileStatus === "pending" ? "Verification Pending" : 
                   "Action Required"}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  {profileStatus === "verified" 
                    ? "Your profile has been verified. You are now visible to top employers."
                    : profileStatus === "pending"
                    ? "Your profile is complete! The final step is to pass the Skill Assessment to get verified."
                    : "Your profile is incomplete or saved as a draft. Please submit it before taking the assessment."}
                </p>
                
                <div className="mt-6">
                  {(profileStatus === "draft" || profileStatus === "missing") && (
                    <Button 
                      variant="primary"
                      onClick={() => router.push("/candidate/profile")}
                    >
                      Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {profileStatus === "pending" && (
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
