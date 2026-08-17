"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";

export default function CandidateDashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [profileStatus, setProfileStatus] = useState<string>("loading");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "candidate") {
        router.push("/employer/dashboard");
      } else {
        // Fetch profile to see verification status
        fetchCandidateProfile(user.uid).then(profile => {
          if (profile) {
            setProfileStatus(profile.verificationStatus || "draft");
          } else {
            setProfileStatus("missing");
          }
        });
      }
    }
  }, [user, role, loading, router]);

  if (loading || profileStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Candidate Dashboard</h1>
        <p className="mt-2 text-zinc-500">Track your application status and opportunities.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Verification Status</h2>
        
        <div className="mt-4 flex items-start gap-4">
          {profileStatus === "verified" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-zinc-900">
              {profileStatus === "verified" ? "Profile Verified" : 
               profileStatus === "pending" ? "Verification Pending" : 
               "Action Required"}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {profileStatus === "verified" 
                ? "Your profile has been verified. You are now visible to top employers."
                : profileStatus === "pending"
                ? "Your profile is currently under review by our team. We will notify you once verified."
                : "Your profile is incomplete or saved as a draft. Please submit it for verification."}
            </p>
            
            {(profileStatus === "draft" || profileStatus === "missing") && (
              <button 
                onClick={() => router.push("/candidate/profile")}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
