"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { createUserProfile } from "@/lib/firebase/users";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, Users, Briefcase } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

interface AuthSwitchProps {
  defaultMode?: "login" | "signup";
}

export function AuthSwitch({ defaultMode = "login" }: AuthSwitchProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  
  // Shared state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [role, setRole] = useState<"candidate" | "employer" | null>(null);

  const { user, role: userRole, loading: authLoading, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();

  // Handle URL messages
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const msg = params.get("message");
      if (msg) {
        setSuccessMessage(msg);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Redirect on successful auth
  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole) {
      let redirectDest = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          redirectDest = redirectParam;
        }
      }
      router.push(redirectDest);
    }
  }, [user, userRole, authLoading, profileLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      const tokenResult = await userCred.user.getIdTokenResult(true);
      if (tokenResult.claims.admin === true || userCred.user.email?.toLowerCase() === ADMIN_EMAIL) {
        await refreshProfile();
        router.push("/admin");
        return;
      }

      const profile = await fetchCandidateProfile(userCred.user.uid);
      if (!profile) {
        await signOut(auth);
        setError("Account doesn't exist. Please sign up first.");
        setLoadingAction(false);
        return;
      }
      
      await refreshProfile();
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else {
        setError("Unable to sign in with these credentials.");
      }
      setLoadingAction(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select whether you are a candidate or employer.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoadingAction(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCred.user.uid, {
        email: userCred.user.email || email,
        role: role,
        authProvider: "password",
        displayName: ""
      });
      await refreshProfile();
      
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(err.message || "Failed to create an account.");
      }
      setLoadingAction(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (mode === "signup" && !role) {
      setError("Please select whether you are a candidate or employer before signing up with Google.");
      return;
    }

    setLoadingAction(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      if (mode === "login") {
        const tokenResult = await userCred.user.getIdTokenResult(true);
        if (tokenResult.claims.admin === true || userCred.user.email?.toLowerCase() === ADMIN_EMAIL) {
          await refreshProfile();
          router.push("/admin");
          return;
        }

        const profile = await fetchCandidateProfile(userCred.user.uid);
        if (!profile) {
          await signOut(auth);
          setError("Account doesn't exist. Please sign up first.");
          setLoadingAction(false);
          return;
        }
        await refreshProfile();
      } else {
        // Signup Flow
        const existingProfile = await fetchCandidateProfile(userCred.user.uid);
        if (existingProfile) {
          await signOut(auth);
          setError("An account already exists. Please sign in.");
          setLoadingAction(false);
          return;
        }

        await createUserProfile(userCred.user.uid, {
          email: userCred.user.email || "",
          role: role!,
          displayName: userCred.user.displayName || "",
          authProvider: "google"
        });
        await refreshProfile();
        
      }
    } catch (err: any) {
      setError(err.message || `Failed to sign ${mode === "login" ? "in" : "up"} with Google.`);
      setLoadingAction(false);
    }
  };

  // Prevent UI flash while evaluating an existing valid session
  if (authLoading || (user && profileLoading) || (user && userRole)) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 overflow-hidden">
      <div className="w-full max-w-md rounded-2xl border border-border/90 bg-surface p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-muted-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground">
            {mode === "login" ? "Sign In to Meritlane" : "Join Meritlane"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" 
              ? "Welcome back. Please sign in to access your verified profile."
              : "Create an account to build your verified engineering track record."}
          </p>
        </div>

        {/* Animated Switcher */}
        <div className="relative flex rounded-xl bg-surface-low border border-border p-1 mb-8">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`relative flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={`relative flex-1 py-2 text-sm font-medium z-10 transition-colors ${mode === "signup" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign Up
          </button>
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-surface shadow-sm border border-border/50"
            animate={{ left: mode === "login" ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/10/80 p-3.5 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#15803D]/20 bg-[#15803D]/10 p-3.5 text-xs text-[#15803D]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={mode === "login" ? handleEmailLogin : handleEmailSignup} className="space-y-4">
              
              {mode === "signup" && (
                <div className="space-y-2 text-left pb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Your Role <span className="text-danger">*</span>
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
              )}

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
                helperText={mode === "signup" ? "Must be at least 6 characters long." : undefined}
              />
              <Button 
                type="submit" 
                className="w-full mt-2" 
                loading={loadingAction} 
                variant="primary"
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-6 flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="shrink-0 px-4 text-xs font-semibold text-outline uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleAuth}
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
      </div>
    </div>
  );
}
