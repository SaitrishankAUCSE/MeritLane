"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Mail, Key } from "lucide-react";

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

  if (loading || (user && profileLoading)) {
    return <div className="min-h-[50vh]"></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 h-full overflow-y-auto">
      <div className="border-b border-[#272a2f] pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-sm text-[#8e928f]">
          Manage your account preferences and session credentials.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#272a2f] bg-[#111316] rounded-xl overflow-hidden">
          <div className="border-b border-[#272a2f] px-6 py-5">
            <h2 className="text-base font-bold text-white">Profile &amp; Credentials</h2>
            <p className="mt-1 text-xs text-[#8e928f]">Your verified identity details on Meritlane.</p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#272a2f] pb-4">
                <span className="font-semibold text-[#8e928f] flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </span>
                <span className="font-medium text-white sm:text-right">{user.email}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#272a2f] pb-4">
                <span className="font-semibold text-[#8e928f] flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Workspace Role
                </span>
                <span className="capitalize font-semibold text-white">{userProfile?.role || "Candidate"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <span className="font-semibold text-[#8e928f] flex items-center gap-2">
                  <Key className="h-4 w-4" /> Authentication Method
                </span>
                <span className="capitalize font-medium text-white">{userProfile?.authProvider || "password"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-red-900/30 bg-red-950/10 rounded-xl overflow-hidden">
          <div className="border-b border-red-900/30 px-6 py-5">
            <h2 className="text-base font-bold text-red-500">Active Session</h2>
            <p className="mt-1 text-xs text-red-400/70">
              Terminate your current session on this browser.
            </p>
          </div>
          <div className="px-6 py-5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-transparent border border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
