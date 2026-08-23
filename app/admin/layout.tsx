"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

import { MobileNav } from "@/components/ui/MobileNav";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profileLoading, handleSignOut } = useAuth();
  const router = useRouter();

  const isUserAdmin = isAdmin || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || profileLoading) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (!isUserAdmin) {
    return (
      <div className="flex h-[100dvh] w-full flex-col bg-[#FAFAFA] text-[#0D0D0D] font-sans">
        <MobileNav role="admin" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md w-full border border-danger bg-[#FFFFFF] p-8 rounded-md text-center">
            <ShieldAlert className="h-8 w-8 text-danger mx-auto mb-4" />
            <h1 className="font-serif text-[24px] text-danger mb-2">Access Denied</h1>
            <p className="text-[14px] text-muted-foreground mb-6">
              You do not have administrator privileges to view this area.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSignOut().then(() => router.push("/"))}
              >
                Sign Out
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans">
      <MobileNav role="admin" />
      <div className="flex-1 overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
