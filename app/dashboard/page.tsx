"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

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

  return <MeritlaneLoader level="page" text="Authenticating" />;
}
