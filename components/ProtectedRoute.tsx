"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Loader2 } from "lucide-react";
import { Role } from "@/lib/firebase/users";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until Firebase authentication and Firestore profile fetch have completed
    if (loading || profileLoading) return;

    const enforceAuth = async () => {
      // 1. Missing Firebase Session OR Missing Firestore Profile
      if (!user || !userProfile) {
        if (user && !userProfile) {
          // Edge case: Firebase session exists, but Meritlane profile doesn't. Destroy the session.
          await signOut(auth);
        }
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // 2. Role-based Authorization
      if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        // Correctly authenticated, but trying to access a route meant for another role
        router.push(userProfile.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
        return;
      }

      // Fully Authorized
      setIsAuthorized(true);
    };

    enforceAuth();
  }, [user, userProfile, loading, profileLoading, router, pathname, allowedRoles]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
