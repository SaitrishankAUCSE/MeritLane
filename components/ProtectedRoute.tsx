"use client";

import { useEffect, useState, useRef } from "react";
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

// Session cache to prevent re-fetching profile on every internal tab switch
const verifiedCandidateCache = new Set<string>();

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, isAdmin, loading, profileLoading, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Fast initial authorization if user already loaded in AuthContext
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (!user || !userProfile) return false;
    const normalizedRole = (userProfile.role || "").trim().toLowerCase() as Role;
    if (allowedRoles && !allowedRoles.includes(normalizedRole)) return false;
    return true;
  });

  const [authPrompted, setAuthPrompted] = useState(false);
  const checkedCandidateUid = useRef<string | null>(null);

  useEffect(() => {
    // Wait until initial Firebase auth resolution
    if (loading || profileLoading) return;

    const enforceAuth = async () => {
      // 1. Not authenticated
      if (!user) {
        setIsAuthorized(false);
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

      // 3. Normal User Routing (Non-Admin trying to hit /admin)
      if (allowedRoles?.includes("admin") && !isUserAdmin) {
        const dest = userProfile?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard";
        router.push(dest);
        return;
      }

      // 4. No Firestore profile
      if (!userProfile) {
        setIsAuthorized(false);
        await signOut(auth);
        if (!authPrompted) {
          setAuthPrompted(true);
          openAuthModal("login");
        }
        return;
      }

      // 5. Role match check
      const normalizedRole = (userProfile.role || "").trim().toLowerCase() as Role;
      if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
        setIsAuthorized(false);
        router.push("/dashboard");
        return;
      }

      // 6. Candidate Incomplete Profile Check (Only once per candidate UID)
      if (
        normalizedRole === "candidate" &&
        pathname !== "/candidate/profile" &&
        !verifiedCandidateCache.has(user.uid) &&
        checkedCandidateUid.current !== user.uid
      ) {
        checkedCandidateUid.current = user.uid;
        try {
          const profile = await fetchCandidateProfile(user.uid);
          const isProfileIncomplete = !profile || (!profile.name && (!profile.skills || profile.skills.length === 0));
          if (isProfileIncomplete) {
            setIsAuthorized(false);
            router.replace("/candidate/profile");
            return;
          }
          verifiedCandidateCache.add(user.uid);
        } catch {
          // If error fetching, proceed gracefully without blocking
          verifiedCandidateCache.add(user.uid);
        }
      }

      // Fully Authorized
      setIsAuthorized(true);
    };

    enforceAuth();
  }, [user, userProfile, isAdmin, loading, profileLoading, router, pathname, allowedRoles, authPrompted, openAuthModal]);

  // Only show full page loader on cold initial boot when no user state exists yet
  if ((loading || profileLoading) && !user) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (!user && !loading) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (!isAuthorized && !loading && !profileLoading) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return <>{children}</>;
}
