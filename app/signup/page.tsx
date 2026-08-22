"use client";

import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { createUserProfile, fetchUserProfile, Role } from "@/lib/firebase/users";
import RoleSelector from "@/components/RoleSelector";
import { Users, Briefcase, Loader2, ShieldCheck, AlertCircle, Check } from "lucide-react";
import { logFunnelEvent } from "@/lib/analytics/logEvent";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const { user, role: userRole, loading: authLoading, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();

  // Redirect authenticated users with valid profiles away from signup
  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole) {
      router.push("/dashboard");
    }
  }, [user, userRole, authLoading, profileLoading, router]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select whether you are a candidate or employer.");
      return;
    }
    
    setLoadingAction(true);
    setError(null);
    logFunnelEvent("signup_started", { method: "email", role });
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database connection timed out. Check your network or adblocker.")), 8000)
      );

      await Promise.race([
        createUserProfile(userCred.user.uid, {
          email: userCred.user.email || email,
          role: role,
          displayName: "",
          authProvider: "password"
        }),
        timeoutPromise
      ]);

      logFunnelEvent("signup_completed", { method: "email", role });
      
      // Sign out immediately so they are forced to log in manually
      await signOut(auth);
      router.push("/login?message=Account+created+successfully.+Please+sign+in+to+continue.");
      
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(err.message || "Failed to create an account.");
      }
      setLoadingAction(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!role) {
      setError("Please select whether you are a candidate or employer before signing up with Google.");
      return;
    }

    setLoadingAction(true);
    setError(null);
    logFunnelEvent("signup_started", { method: "google", role });
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      const existingProfile = await fetchUserProfile(userCred.user.uid);
      if (existingProfile) {
        await signOut(auth);
        setError("An account already exists. Please sign in.");
        setLoadingAction(false);
        return;
      }

      await createUserProfile(userCred.user.uid, {
        email: userCred.user.email || "",
        role: role,
        displayName: userCred.user.displayName || "",
        authProvider: "google"
      });

      await refreshProfile();
      logFunnelEvent("signup_completed", { method: "google", role });
      // Role routing is handled by the useEffect above when profile loads
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
      setLoadingAction(false);
    }
  };

  // Auth States Handled Explicitly
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-outline" />
        <p className="text-sm font-medium text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  if (user && !userRole) {
    return <RoleSelector />; // Logged in via Google but no role selected yet
  }

  if (user && userRole) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-outline" />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/90 bg-surface p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-muted-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground">
            Join Meritlane
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to build your verified engineering track record.
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/10/80 p-3.5 text-xs text-danger animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="mt-6 space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Your Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 text-sm font-medium transition-all duration-150 select-none ${
                  role === "candidate"
                    ? "border-zinc-600 bg-surface-low/70 text-zinc-950 ring-1 ring-zinc-600 shadow-sm"
                    : "border-border bg-surface text-muted-foreground hover:border-border hover:bg-surface-low"
                }`}
              >
                <Users className={`h-5 w-5 ${role === "candidate" ? "text-muted-foreground" : "text-outline"}`} />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 text-sm font-medium transition-all duration-150 select-none ${
                  role === "employer"
                    ? "border-zinc-600 bg-surface-low/70 text-zinc-950 ring-1 ring-zinc-600 shadow-sm"
                    : "border-border bg-surface text-muted-foreground hover:border-border hover:bg-surface-low"
                }`}
              >
                <Briefcase className={`h-5 w-5 ${role === "employer" ? "text-muted-foreground" : "text-outline"}`} />
                <span>Employer</span>
              </button>
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            helperText="Must be at least 6 characters long."
          />
          <Button 
            type="submit" 
            className="w-full mt-2" 
            loading={loadingAction} 
            variant="primary"
          >
            Create Account
          </Button>
        </form>

        <div className="relative mt-6 flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="shrink-0 px-4 text-xs font-semibold text-outline uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignup}
          className="mt-2 w-full"
          variant="outline"
          disabled={loadingAction}
          leftIcon={
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:text-muted-foreground transition-colors underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

