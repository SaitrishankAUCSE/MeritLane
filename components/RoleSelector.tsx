"use client";

import React, { useState } from "react";
import { Users, Briefcase, Loader2 } from "lucide-react";
import { createUserProfile } from "@/lib/firebase/users";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function RoleSelector() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectRole = async (role: "candidate" | "employer") => {
    if (!user) return;
    setLoading(true);
    try {
      await createUserProfile(user.uid, {
        email: user.email || "",
        role,
        displayName: user.displayName || "",
        authProvider: "google",
      });
      await refreshProfile();
      if (role === "candidate") {
        router.push("/candidate/profile");
      } else {
        router.push("/employer/dashboard");
      }
    } catch (error) {
      console.error("Error setting role:", error);
      alert("Failed to save your role. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
        <p className="mt-4 text-sm font-medium text-zinc-600">Setting up your account...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Choose your role
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          How will you be using Meritlane? This selection is permanent.
          <br />
          <span className="text-xs text-zinc-400 mt-1 block">
            If you already had an account, we just need to set up your profile role.
          </span>
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Candidate Card */}
          <button
            onClick={() => handleSelectRole("candidate")}
            className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-200 bg-white p-8 text-center transition-all hover:border-zinc-900 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">I'm a Candidate</h3>
              <p className="mt-2 text-sm text-zinc-500">
                I want to submit projects, pass verification, and get hired.
              </p>
            </div>
          </button>

          {/* Employer Card */}
          <button
            onClick={() => handleSelectRole("employer")}
            className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-zinc-200 bg-white p-8 text-center transition-all hover:border-blue-600 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">I'm Hiring</h3>
              <p className="mt-2 text-sm text-zinc-500">
                I want to source and hire verified engineering talent.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
