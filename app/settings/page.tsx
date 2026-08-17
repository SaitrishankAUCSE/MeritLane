"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LogOut, User as UserIcon, ShieldCheck, Mail, Key } from "lucide-react";
import RoleSelector from "@/components/RoleSelector";

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

  // Auth States Handled Explicitly
  if (loading || (user && profileLoading)) {
    return <div className="min-h-[50vh]"></div>; // Skeleton
  }

  if (!user) {
    return null; // Wait for redirect
  }

  if (user && !userProfile?.role) {
    return <RoleSelector />; // Logged in but missing role
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-zinc-200/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Manage your account preferences and session credentials.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-zinc-900">Profile &amp; Credentials</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Your verified identity details on Meritlane.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-100 pb-3.5">
                <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </span>
                <span className="font-medium text-zinc-900 sm:text-right">{user.email}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-100 pb-3.5">
                <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" /> Workspace Role
                </span>
                <span className="capitalize font-semibold text-zinc-900">{userProfile?.role || "Candidate"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" /> Authentication Method
                </span>
                <span className="capitalize font-medium text-zinc-900">{userProfile?.authProvider || "password"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200/80 bg-red-50/30">
          <CardHeader>
            <h2 className="text-base font-bold text-red-950">Active Session</h2>
            <p className="mt-0.5 text-xs text-red-800">
              Terminate your current session on this browser.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
