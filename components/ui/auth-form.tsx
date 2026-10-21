"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "login" | "signup";
}

type Role = "candidate" | "employer" | "admin";

export function AuthForm({ mode: initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "employer">("candidate");

  const router = useRouter();
  const { user, role: userRole, loading: authLoading, profileLoading, refreshProfile: refreshAuth } = useAuth();

  useEffect(() => {
    // If signup is in progress or just completed, do NOT navigate to dashboard
    if (isSigningUp || signupSuccess) return;

    if (user && !authLoading && !profileLoading) {
      if (userRole) {
        router.push("/dashboard");
      } else {
        setShowRoleSelector(true);
      }
    }
  }, [user, userRole, authLoading, profileLoading, router, isSigningUp, signupSuccess]);

  const [emailStatus, setEmailStatus] = useState<{
    valid?: boolean;
    error?: string;
    suggestion?: string;
    exists?: boolean;
  }>({});

  const validateEmailFormatAndSpelling = async (val: string) => {
    if (!val || val.length < 5 || !val.includes("@")) {
      setEmailStatus({});
      return;
    }
    try {
      const res = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
      });
      const data = await res.json();
      setEmailStatus(data);
    } catch {
      // Non-blocking fallback
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Perform email format & spelling verification
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const verifyRes = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        setError(verifyData.error || "Please enter a valid email address.");
        return;
      }
      if (mode === "signup" && verifyData.exists) {
        setError("An account already exists with this email address. Please sign in instead.");
        return;
      }
      if (mode === "login" && verifyData.exists === false) {
        setError("No account found with this email. Please check your spelling or sign up.");
        return;
      }
    } catch {
      // Continue if network fails
    }

    setLoadingAction(true);
    try {
      if (mode === "signup") {
        setIsSigningUp(true);
        if (!db) throw new Error("Firestore not initialized");
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: selectedRole,
          createdAt: new Date().toISOString(),
          isNewUser: true,
          hasSeenWelcomeOnboarding: false,
        });
        posthog.capture("user_signed_up", { method: 'email', role: selectedRole });
        
        // Immediately sign out so user MUST log in again with credentials
        await signOut(auth);
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("meritlane_pending_signup_celebration", userCredential.user.uid);
          sessionStorage.setItem("meritlane_just_signed_up_email", trimmedEmail);
          localStorage.removeItem(`meritlane_new_signup_${userCredential.user.uid}`);
          localStorage.removeItem(`meritlane_show_welcome_${userCredential.user.uid}`);
        }

        setSignupSuccess(true);
        setIsSigningUp(false);
        setLoadingAction(false);
        setPassword("");
        setSuccessMessage("Account created successfully! Please sign in with your credentials to access your dashboard.");
        setMode("login");
        router.replace("/login?signedUp=true");
        return;
      } else {
        // If coming from a successful signup, reset the signupSuccess state so login can proceed
        setSignupSuccess(false);
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        posthog.capture("user_logged_in", { method: 'email' });
        if (typeof window !== "undefined" && cred.user) {
          const isImmediateFirstLoginAfterSignup =
            sessionStorage.getItem("meritlane_pending_signup_celebration") === cred.user.uid &&
            sessionStorage.getItem("meritlane_just_signed_up_email") === trimmedEmail;

          // Consume and clean up flags immediately so subsequent logins will NEVER show the animation
          sessionStorage.removeItem("meritlane_pending_signup_celebration");
          sessionStorage.removeItem("meritlane_just_signed_up_email");
          localStorage.removeItem(`meritlane_new_signup_${cred.user.uid}`);
          localStorage.removeItem(`meritlane_show_welcome_${cred.user.uid}`);

          if (isImmediateFirstLoginAfterSignup) {
            sessionStorage.setItem("meritlane_trigger_signup_welcome", cred.user.uid);
          } else {
            sessionStorage.removeItem("meritlane_trigger_signup_welcome");
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      setIsSigningUp(false);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Unable to sign in. Please check your email and password and try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email address. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === "auth/network-request-failed") {
        setError("We couldn't connect right now. Please check your connection and try again.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/password sign-in is not enabled in Firebase Console.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
      setLoadingAction(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      posthog.capture(mode === "login" ? "user_logged_in" : "user_signed_up", { method: 'google' });
      setLoadingAction(false);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google.");
      setLoadingAction(false);
    }
  };

  const handleRoleSelection = async (role: Role) => {
    setLoadingAction(true);
    setError(null);
    try {
      const currentUser = auth.currentUser || user;
      if (!currentUser) throw new Error("No authenticated user found. Please try logging in again.");

      // 1. Assign role via authenticated server endpoint (bypasses any client Firestore permission issues)
      try {
        const idToken = await currentUser.getIdToken(true);
        const res = await fetch("/api/auth/set-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ role }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("Server set-role fallback warning:", errData);
        }
      } catch (serverErr) {
        console.warn("Server set-role error:", serverErr);
      }

      // 2. Also write to client Firestore if available
      if (db) {
        try {
          await setDoc(doc(db, "users", currentUser.uid), {
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            role: role,
            authProvider: "google",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isNewUser: true,
            hasSeenWelcomeOnboarding: false,
          }, { merge: true });

          if (typeof window !== "undefined") {
            sessionStorage.setItem("meritlane_trigger_signup_welcome", currentUser.uid);
            localStorage.removeItem(`meritlane_show_welcome_${currentUser.uid}`);
            localStorage.removeItem(`meritlane_new_signup_${currentUser.uid}`);
          }

          if (role === "candidate") {
            await setDoc(doc(db, "candidates", currentUser.uid), {
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              verificationStatus: "draft",
              createdAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (dbErr) {
          console.warn("Client Firestore write warning:", dbErr);
        }
      }

      await refreshAuth();

      // 3. Immediate, reliable redirection to destination workspace
      if (role === "employer") {
        window.location.href = "/employer/dashboard";
      } else {
        window.location.href = "/candidate/dashboard";
      }
    } catch (err: any) {
      console.error("handleRoleSelection error:", err);
      setError(err.message || "Failed to save role. Please try again.");
      setLoadingAction(false);
    }
  };

  if (!isSigningUp && !signupSuccess && (profileLoading || (user && userRole))) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-border border-t-[#1C1917] rounded-full animate-spin" />
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#101010] font-sans flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 selection:bg-black selection:text-white">
      {/* Top Brand Header */}
      <div className="w-full max-w-[440px] mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-[#101010] flex items-center justify-center text-white font-bold text-[13px] tracking-tight">
            M
          </div>
          <span className="font-sans font-semibold text-[17px] tracking-[-0.025em] text-[#101010]">
            MeritLane
          </span>
        </Link>
        <Link 
          href="/" 
          className="text-xs text-[#71717A] hover:text-[#101010] transition-colors"
        >
          Back to home →
        </Link>
      </div>

      {/* Main Bento Auth Card */}
      <div className="w-full max-w-[440px] mx-auto my-8">
        <div className="bg-white border border-black/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-7 sm:p-9">
          <AnimatePresence mode="wait">
            {showRoleSelector ? (
              <motion.div
                key="role-selector"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#101010] mb-1.5">
                    Select Your Role
                  </h2>
                  <p className="text-xs text-[#71717A]">
                    Choose how you want to use MeritLane
                  </p>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleRoleSelection("candidate")}
                    disabled={loadingAction}
                    className="flex flex-col items-center justify-center p-5 border border-black/[0.1] rounded-xl hover:border-black hover:bg-[#FAFAF9] transition-all group disabled:opacity-50 cursor-pointer text-center"
                  >
                    <div className="w-11 h-11 bg-[#F4F4F2] border border-black/[0.06] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#101010] group-hover:text-white transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span className="font-semibold text-sm text-[#101010]">Candidate</span>
                    <span className="text-[11px] text-[#71717A] mt-0.5">Take verified assessments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelection("employer")}
                    disabled={loadingAction}
                    className="flex flex-col items-center justify-center p-5 border border-black/[0.1] rounded-xl hover:border-black hover:bg-[#FAFAF9] transition-all group disabled:opacity-50 cursor-pointer text-center"
                  >
                    <div className="w-11 h-11 bg-[#F4F4F2] border border-black/[0.06] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#101010] group-hover:text-white transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <span className="font-semibold text-sm text-[#101010]">Employer</span>
                    <span className="text-[11px] text-[#71717A] mt-0.5">Hire verified engineers</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-5">
                  {(successMessage || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("signedUp") === "true")) && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 text-left"
                    >
                      <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-semibold block">Account Created</span>
                        <span className="text-[11px]">Sign in with your email and password to continue.</span>
                      </div>
                    </motion.div>
                  )}
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#101010]">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    {mode === "login" 
                      ? "Sign in to access your verified profile and reports" 
                      : "Join MeritLane to benchmark your engineering skills"}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#F4F4F2] rounded-lg border border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`text-xs py-1.5 rounded-md transition-all font-medium ${
                      mode === 'login' 
                        ? 'bg-white text-[#101010] shadow-xs' 
                        : 'text-[#71717A] hover:text-[#101010]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`text-xs py-1.5 rounded-md transition-all font-medium ${
                      mode === 'signup' 
                        ? 'bg-white text-[#101010] shadow-xs' 
                        : 'text-[#71717A] hover:text-[#101010]'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleAuth}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-2.5 bg-white text-[#101010] border border-black/[0.12] hover:bg-[#F4F4F2] rounded-lg py-2.5 px-4 focus:outline-none transition-colors disabled:opacity-50 text-xs font-medium shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-black/[0.08]"></div>
                  <span className="text-[11px] font-medium text-[#71717A]">or with email</span>
                  <div className="flex-1 h-px bg-black/[0.08]"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#71717A] block">I want to join as</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <label className={`relative border rounded-xl p-2.5 cursor-pointer transition-all ${selectedRole === 'candidate' ? 'border-[#101010] bg-[#FAFAF9]' : 'border-black/[0.1] hover:border-black/[0.3]'}`}>
                          <input type="radio" name="role" value="candidate" checked={selectedRole === 'candidate'} onChange={() => setSelectedRole('candidate')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === 'candidate' ? 'border-[#101010]' : 'border-zinc-400'}`}>
                              {selectedRole === 'candidate' && <div className="w-1.5 h-1.5 rounded-full bg-[#101010]" />}
                            </div>
                            <span className="text-xs font-medium text-[#101010]">Candidate</span>
                          </div>
                        </label>
                        <label className={`relative border rounded-xl p-2.5 cursor-pointer transition-all ${selectedRole === 'employer' ? 'border-[#101010] bg-[#FAFAF9]' : 'border-black/[0.1] hover:border-black/[0.3]'}`}>
                          <input type="radio" name="role" value="employer" checked={selectedRole === 'employer'} onChange={() => setSelectedRole('employer')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === 'employer' ? 'border-[#101010]' : 'border-zinc-400'}`}>
                              {selectedRole === 'employer' && <div className="w-1.5 h-1.5 rounded-full bg-[#101010]" />}
                            </div>
                            <span className="text-xs font-medium text-[#101010]">Employer</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-[#71717A] block mb-1">Email address</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => {
                        setEmail(e.target.value);
                        if (emailStatus.error || emailStatus.suggestion) setEmailStatus({});
                      }} 
                      onBlur={e => validateEmailFormatAndSpelling(e.target.value)}
                      disabled={loadingAction} 
                      placeholder="name@example.com" 
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        emailStatus.error ? "border-amber-400 focus:border-amber-500" : "border-black/[0.12] focus:border-[#101010]"
                      } focus:ring-1 focus:ring-[#101010] bg-[#FAFAF9] focus:bg-white text-[#101010] text-[13px] outline-none transition-all placeholder:text-[#A1A1AA]`} 
                    />

                    {emailStatus.suggestion && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(emailStatus.suggestion!);
                          setEmailStatus({});
                        }}
                        className="mt-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors flex items-center gap-1 text-left"
                      >
                        <span>Did you mean <strong>{emailStatus.suggestion}</strong>?</span>
                      </button>
                    )}
                    {emailStatus.error && !emailStatus.suggestion && (
                      <p className="mt-1 text-[11px] text-red-600">
                        {emailStatus.error}
                      </p>
                    )}
                    {mode === "signup" && emailStatus.exists && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        Account already exists. Please sign in.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-medium text-[#71717A] block mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        disabled={loadingAction} 
                        placeholder="••••••••" 
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-black/[0.12] focus:border-[#101010] focus:ring-1 focus:ring-[#101010] bg-[#FAFAF9] focus:bg-white text-[#101010] text-[13px] outline-none transition-all placeholder:text-[#A1A1AA]" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#71717A] hover:text-[#101010] focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" 
                    disabled={loadingAction}
                    className="w-full mt-3 h-[42px] rounded-lg bg-[#101010] text-white hover:bg-[#252525] active:scale-[0.99] transition-all font-medium text-xs flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {loadingAction ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      mode === "signup" ? "Create Account" : "Sign In"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Note */}
      <div className="w-full max-w-[440px] mx-auto text-center text-[11px] text-[#A1A1AA]">
        MeritLane • Skill-Verified Engineering Proof
      </div>
    </div>
  );
}
