"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, profileLoading } = useAuth();
  const router = useRouter();

  const isUserAdmin = isAdmin || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">Authenticating administrator...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If logged in with a non-admin account, display a clear access gate with account switcher
  if (!isUserAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-red-200 bg-[#0D0D0D] p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Admin Privileges Required</h2>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            You are currently signed in as <strong className="text-zinc-800 font-mono">{user.email}</strong>. 
            Only the administrator (<strong className="text-zinc-800 font-mono">{ADMIN_EMAIL}</strong>) can access the Command Center.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                await signOut(auth);
                router.push("/login");
              }}
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
