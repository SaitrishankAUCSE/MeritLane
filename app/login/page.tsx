"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateLastLogin, fetchUserProfile } from "@/lib/firebase/users";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const { user, role: userRole, loading: authLoading, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Client-side extraction of URL params to avoid Next.js static generation Suspense boundary issues
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const msg = params.get("message");
      if (msg) {
        setSuccessMessage(msg);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Redirect authenticated users with valid profiles
  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole) {
      updateLastLogin(user.uid).catch(console.error);
      
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

  const ADMIN_EMAIL = "saitrishankb9@gmail.com";

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

      const profile = await fetchUserProfile(userCred.user.uid);
      if (!profile) {
        await signOut(auth);
        setError("Account doesn't exist. Please sign up first.");
        setLoadingAction(false);
        return;
      }
      
      await refreshProfile();
      // useEffect redirects automatically
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else {
        setError("Unable to sign in with these credentials.");
      }
      setLoadingAction(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingAction(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      const tokenResult = await userCred.user.getIdTokenResult(true);
      if (tokenResult.claims.admin === true || userCred.user.email?.toLowerCase() === ADMIN_EMAIL) {
        await refreshProfile();
        router.push("/admin");
        return;
      }

      const profile = await fetchUserProfile(userCred.user.uid);
      if (!profile) {
        await signOut(auth);
        setError("Account doesn't exist. Please sign up first.");
        setLoadingAction(false);
        return;
      }

      await refreshProfile();
      // useEffect redirects automatically
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setLoadingAction(false);
    }
  };

  // Prevent UI flash while evaluating an existing valid session
  if (authLoading || (user && profileLoading) || (user && userRole)) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-outline" />
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
            Sign In to Meritlane
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back. Please sign in to access your verified profile.
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/10/80 p-3.5 text-xs text-danger animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-success/10/80 p-3.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
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
          />
          <Button 
            type="submit" 
            className="w-full mt-2" 
            loading={loadingAction} 
            variant="primary"
          >
            Sign In
          </Button>
        </form>

        <div className="relative mt-6 flex items-center py-2">
          <div className="flex-grow border-t border-border"></div>
          <span className="shrink-0 px-4 text-xs font-semibold text-outline uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
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
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-foreground hover:text-muted-foreground transition-colors underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

