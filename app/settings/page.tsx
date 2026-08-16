"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profileLoading && !user) {
      router.push("/login");
    }
  }, [user, loading, profileLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || profileLoading || !user) {
    return <div className="min-h-[50vh]"></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account preferences and session.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <section className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500">Email Address</label>
              <div className="mt-1 text-sm text-zinc-900 font-medium">{user.email}</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-500">Account Role</label>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 capitalize">
                  <UserIcon className="h-3.5 w-3.5" />
                  {userProfile?.role || "Unknown"}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-zinc-500">Authentication Method</label>
                <div className="mt-1 text-sm text-zinc-900 capitalize">
                  {userProfile?.authProvider || "password"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded border border-red-200 bg-red-50/50 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-red-900">Session</h2>
          <p className="mt-1 text-xs text-red-700">
            Securely sign out of your Meritlane account.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
