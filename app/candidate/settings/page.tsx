"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Mail, Key } from "lucide-react";

export default function SettingsPage() {
  const { user, userProfile, loading, profileLoading, handleSignOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profileLoading && (!user || !userProfile)) {
      router.push("/login");
    }
  }, [user, loading, profileLoading, router]);

  if (loading || (user && profileLoading)) {
    return <div className="min-h-[50vh]"></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 h-full overflow-y-auto scrollbar-hide">
      <div className="border-b border-[#E5E5E5] pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0D0D0D] sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-sm text-[#737373]">
          Manage your account preferences and session credentials.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D]">Profile &amp; Credentials</h2>
            <p className="mt-1 text-xs text-[#666666]">Your verified identity details on Meritlane.</p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E5E5] pb-4">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </span>
                <span className="font-medium text-[#0D0D0D] sm:text-right">{user.email}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E5E5] pb-4">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Workspace Role
                </span>
                <span className="capitalize font-semibold text-[#0D0D0D]">{userProfile?.role || "Candidate"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <Key className="h-4 w-4" /> Authentication Method
                </span>
                <span className="capitalize font-medium text-[#0D0D0D]">{userProfile?.authProvider || "password"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Security Block */}
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D]">Password &amp; Security</h2>
            <p className="mt-1 text-xs text-[#666666]">Manage your security settings and authentication methods.</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Change Password</span>
                <span className="block text-xs text-[#666666]">Update your account password</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#E5E5E5] hover:bg-[#F3F3F1] text-[#0D0D0D] rounded-md transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Two-Factor Authentication</span>
                <span className="block text-xs text-[#666666]">Add an extra layer of security to your account</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#0D0D0D] rounded-md transition-colors">
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Block */}
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D]">Preferences &amp; Notifications</h2>
            <p className="mt-1 text-xs text-[#666666]">Customize your workspace experience.</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Email Notifications</span>
                <span className="block text-xs text-[#666666]">Receive updates about your verification status</span>
              </div>
              <div className="w-10 h-5 bg-[#15803D] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-[#FFFFFF] rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Workspace Theme</span>
                <span className="block text-xs text-[#666666]">Meritlane defaults to Dark Mode</span>
              </div>
              <span className="text-xs font-mono text-[#666666] uppercase tracking-widest bg-[#F3F3F1] px-2 py-1 rounded border border-[#E5E5E5]">
                Locked (Dark)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Public Profile Visibility</span>
                <span className="block text-xs text-[#666666]">Allow employers to search your public record</span>
              </div>
              <div className="w-10 h-5 bg-[#15803D] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-[#FFFFFF] rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-red-900/30 bg-red-950/10 rounded-xl overflow-hidden">
          <div className="border-b border-red-900/30 px-6 py-5">
            <h2 className="text-base font-bold text-red-500">Active Session &amp; Danger Zone</h2>
            <p className="mt-1 text-xs text-red-400/70">
              Terminate your current session or delete your identity record.
            </p>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-transparent border border-red-900/50 text-red-500 hover:bg-red-950/30 hover:text-red-400 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <button
              className="flex items-center gap-2 bg-red-500 text-[#0D0D0D] hover:bg-red-600 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
