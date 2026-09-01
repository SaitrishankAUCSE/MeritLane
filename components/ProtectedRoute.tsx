"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Role } from "@/lib/firebase/users";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (Role | "admin")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, isAdmin, loading, profileLoading, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authPrompted, setAuthPrompted] = useState(false);

  useEffect(() => {
    // Wait until Firebase authentication and profile resolution have completed
    if (loading || profileLoading) return;

    const enforceAuth = async () => {
      // 1. Not authenticated with Firebase
      if (!user) {
        if (!authPrompted) {
          setAuthPrompted(true);
          openAuthModal("login");
        }
        return;
      }

      const isUserAdmin = isAdmin || user.email?.toLowerCase() === "saitrishankb9@gmail.com";

      // 2. Admin User Routing
      if (isUserAdmin) {
        if (allowedRoles?.includes("admin")) {
          setIsAuthorized(true);
        } else {
          router.push("/admin");
        }
        return;
      }

      // 3. Normal User Routing (Non-Admin)
      // If a non-admin attempts to access an admin-only route
      if (allowedRoles?.includes("admin") && !isUserAdmin) {
        const dest = userProfile?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard";
        router.push(dest);
        return;
      }

      // If user has no Firestore profile
      if (!userProfile) {
        await signOut(auth);
        if (!authPrompted) {
          setAuthPrompted(true);
          openAuthModal("login");
        }
        return;
      }

      // Role-based authorization for candidate/employer routes
      const normalizedRole = (userProfile.role || "").trim().toLowerCase() as Role;
      if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
        router.push("/dashboard");
        return;
      }

      // Candidate Onboarding Guard
      if (normalizedRole === "candidate" && pathname !== "/candidate/profile") {
        try {
          const profile = await fetchCandidateProfile(user.uid);
          const isProfileIncomplete = !profile || (!profile.name && (!profile.skills || profile.skills.length === 0));
          if (isProfileIncomplete) {
            router.replace("/candidate/profile");
            return;
          }
        } catch (error) {
          router.replace("/candidate/profile");
          return;
        }
      }

      // Fully Authorized
      setIsAuthorized(true);
    };

    enforceAuth();
  }, [user, userProfile, isAdmin, loading, profileLoading, router, pathname, allowedRoles]);

  if (loading || profileLoading || !user || !isAuthorized) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return <>{children}</>;
}
