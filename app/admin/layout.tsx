"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profileLoading, handleSignOut } = useAuth();
  const router = useRouter();

  const isUserAdmin = isAdmin || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (!user) {
    return null;
  }

  // If logged in with a non-admin account, display a clear access gate with account switcher
  if (!isUserAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-red-200 bg-[#0D0D0D] p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA]">Admin Privileges Required</h2>
          <p className="mt-2 text-xs text-[#D2D2D2] leading-relaxed">
            You are currently signed in as <strong className="text-[#FAFAFA] font-mono">{user.email}</strong>. 
            Only the administrator (<strong className="text-[#FAFAFA] font-mono">{ADMIN_EMAIL}</strong>) can access the Command Center.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSignOut}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Sign Out &amp; Log In as {ADMIN_EMAIL}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/candidate/dashboard")}
            >
              Return to Candidate Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
