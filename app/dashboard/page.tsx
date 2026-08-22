"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";

/**
 * /dashboard — Smart role-based router.
 * 
 * Every login/signup redirects here. This page checks the user's role
 * and forwards them to the correct workspace:
 *   - admin    → /admin
 *   - employer → /employer/dashboard
 *   - candidate with profile → /candidate/dashboard
 *   - candidate without profile → /candidate/profile (onboarding)
 *   - not logged in → /login
 */
export default function DashboardRouter() {
  const { user, role, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Still resolving auth state — wait
    if (loading || (user && profileLoading)) return;

    // Not logged in — send to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Admin
    if (role === "admin" || user.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
      return;
    }

    // Employer
    if (role === "employer") {
      router.replace("/employer/dashboard");
      return;
    }

    // Candidate — check if they have a profile started
    if (role === "candidate") {
      fetchCandidateProfile(user.uid)
        .then((profile) => {
          if (profile && (profile.name || (profile.skills && profile.skills.length > 0))) {
            router.replace("/candidate/dashboard");
          } else {
            router.replace("/candidate/profile");
          }
        })
        .catch(() => {
          router.replace("/candidate/profile");
        });
      return;
    }

    // Fallback — role not yet resolved or unknown
    // Wait a moment, then try login
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [user, role, loading, profileLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b0c0e]">
      <div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div>
    </div>
  );
}
