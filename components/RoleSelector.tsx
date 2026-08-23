"use client";

import React, { useState } from "react";
import { Users, Briefcase, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { createUserProfile } from "@/lib/firebase/users";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function RoleSelector() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectRole = async (role: "candidate" | "employer") => {
    if (!user) return;
    setLoading(true);
    setError(null);
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
    } catch (err: any) {
      console.error("Error setting role:", err);
      setError("Failed to save your role. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return <MeritlaneLoader level="page" text="Setting Up" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-muted-foreground shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Choose your role
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How will you be using Meritlane? This selection configures your verified workspace.
        </p>

        {error && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Candidate Card */}
          <button
            type="button"
            onClick={() => handleSelectRole("candidate")}
            className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm transition-all duration-150 hover:border-zinc-600  active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-low text-muted-foreground group-hover:bg-zinc-600 group-hover:text-[#0D0D0D] transition-colors duration-150">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">I&apos;m a Candidate</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                I want to submit projects, pass code verification, and get discovered by top teams.
              </p>
            </div>
          </button>

          {/* Employer Card */}
          <button
            type="button"
            onClick={() => handleSelectRole("employer")}
            className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm transition-all duration-150 hover:border-zinc-600  active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-low text-muted-foreground group-hover:bg-zinc-600 group-hover:text-[#0D0D0D] transition-colors duration-150">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">I&apos;m Hiring</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                I want to source and evaluate verified engineering talent without pedigree bias.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
