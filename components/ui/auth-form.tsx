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
        });
        posthog.capture("user_signed_up", { method: 'email', role: selectedRole });
        
        // Immediately sign out so user MUST log in again with credentials
        await signOut(auth);
        
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
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        posthog.capture("user_logged_in", { method: 'email' });
      }
    } catch (err: any) {
      setIsSigningUp(false);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Unable to sign in. Please check your email and password and try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email address.");
      } else if (err.code === "auth/network-request-failed") {
        setError("We couldn't connect right now. Please check your connection and try again.");
      } else {
        setError("Authentication failed. Please try again.");
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
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google.");
      setLoadingAction(false);
    }
  };

  const handleRoleSelection = async (role: Role) => {
    setLoadingAction(true);
    setError(null);
    try {
      if (!user) throw new Error("No authenticated user found.");
      if (!db) throw new Error("Firestore not initialized");

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date().toISOString(),
      });
      await refreshAuth();
    } catch (err: any) {
      setError(err.message || "Failed to save role.");
      setLoadingAction(false);
    }
  };

  if (!isSigningUp && !signupSuccess && (authLoading || profileLoading || (user && userRole))) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin" />
      </div>
    ); 
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Authentic Institutional Archival Column */}
      <div className="relative hidden md:flex flex-col justify-between w-full md:w-5/12 lg:w-1/2 bg-[#FAF8F5] text-[#1C1917] p-6 lg:p-8 border-r border-[#E7E2DA] h-full overflow-hidden">
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img src="/logo-m.png" alt="Meritlane Emblem" className="h-6 w-auto object-contain" />
            <span className="font-semibold text-lg tracking-tight text-[#1C1917]">Meritlane</span>
          </Link>
        </div>

        {/* Centerpiece: Prestigious Archival Architecture */}
        <div className="relative z-10 my-auto max-w-sm mx-auto w-full">
          <div className="mb-4 border border-[#E7E2DA] bg-white p-1.5 shadow-xs">
            <div className="relative aspect-[16/11] overflow-hidden bg-[#1C1917]">
              <img 
                src="/editorial_archive.jpg" 
                alt="Meritlane Institutional Verification Archive" 
                className="w-full h-full object-cover contrast-[1.03]"
              />
            </div>
          </div>

          <h1 className="text-xl lg:text-[22px] font-sans font-semibold tracking-tight leading-[1.25] mb-1.5 text-[#1C1917]">
            Verified Engineering Records
          </h1>
          <p className="text-[13px] text-[#78716C] leading-relaxed font-sans">
            Evaluated code, monitored technical assessments, and verified candidate proof.
          </p>
        </div>

        <div className="relative z-10 text-[11px] font-sans text-[#78716C] shrink-0">
          Meritlane
        </div>
      </div>

      {/* Right Side: Auth Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white relative h-full overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[390px] my-auto">
          <div className="md:hidden mb-8 flex justify-center">
             <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <img src="/logo-m.png" alt="Meritlane" className="h-7 w-auto" />
              <span className="font-serif text-xl">Meritlane</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {showRoleSelector ? (
              <motion.div
                key="role-selector"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-serif font-medium tracking-tight text-[#1C1917] mb-2">Select Registration Category</h2>
                  <p className="text-sm text-[#78716C]">Identify your organizational status within the registry</p>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleRoleSelection("candidate")}
                    disabled={loadingAction}
                    className="flex flex-col items-center justify-center p-6 border border-[#E7E2DA] rounded-md hover:border-[#1C1917] hover:bg-[#FAF8F5] transition-all group disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E7E2DA] rounded-md flex items-center justify-center mb-4 group-hover:bg-[#1C1917] group-hover:text-white transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span className="font-serif font-medium text-[#1C1917]">Candidate</span>
                    <span className="text-[11px] font-mono text-[#78716C] mt-1 text-center">Undergo Audit</span>
                  </button>

                  <button
                    onClick={() => handleRoleSelection("employer")}
                    disabled={loadingAction}
                    className="flex flex-col items-center justify-center p-6 border border-[#E7E2DA] rounded-md hover:border-[#1C1917] hover:bg-[#FAF8F5] transition-all group disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E7E2DA] rounded-md flex items-center justify-center mb-4 group-hover:bg-[#1C1917] group-hover:text-white transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <span className="font-serif font-medium text-[#1C1917]">Organization</span>
                    <span className="text-[11px] font-mono text-[#78716C] mt-1 text-center">Inspect Provenance</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  {(successMessage || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("signedUp") === "true")) && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-2.5 bg-[#F0FDF4] border border-[#86EFAC] text-[#166534] text-[12px] rounded-md flex items-start gap-2 font-sans shadow-xs"
                    >
                      <svg className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-semibold block text-[#14532D]">Account Created Successfully</span>
                        <span className="text-[#166534] text-[11px]">Please sign in with your credentials to enter the registry.</span>
                      </div>
                    </motion.div>
                  )}
                  <h2 className="text-[20px] font-semibold tracking-tight text-[#1C1917]">
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </h2>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 border border-[#E7E2DA] bg-[#FAF8F5] p-0.5 rounded">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`text-xs py-1.5 rounded font-sans tracking-normal transition-all ${mode === 'login' ? 'bg-white text-[#1C1917] font-semibold shadow-xs border border-[#E7E2DA]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`text-xs py-1.5 rounded font-sans tracking-normal transition-all ${mode === 'signup' ? 'bg-white text-[#1C1917] font-semibold shadow-xs border border-[#E7E2DA]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
                  >
                    Register
                  </button>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded font-sans">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleAuth}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-2.5 bg-white text-[#1C1917] border border-[#E7E2DA] hover:border-[#1C1917] rounded py-2 px-3 hover:bg-[#FAF8F5] focus:outline-none transition-colors disabled:opacity-50 text-xs font-sans font-medium shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-[#E7E2DA]"></div>
                  <span className="text-[10px] font-sans font-medium text-[#78716C]">or with email</span>
                  <div className="flex-1 h-px bg-[#E7E2DA]"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3 font-sans">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-medium text-[#78716C] block">Role</label>
                      <div className="flex gap-2.5">
                        <label className={`flex-1 relative border rounded p-2 cursor-pointer transition-all ${selectedRole === 'candidate' ? 'border-[#1C1917] bg-[#FAF8F5]' : 'border-[#E7E2DA] hover:border-[#1C1917]'}`}>
                          <input type="radio" name="role" value="candidate" checked={selectedRole === 'candidate'} onChange={() => setSelectedRole('candidate')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === 'candidate' ? 'border-[#1C1917]' : 'border-[#D5CEBF]'}`}>
                              {selectedRole === 'candidate' && <div className="w-1.5 h-1.5 rounded-full bg-[#1C1917]" />}
                            </div>
                            <span className="text-xs font-sans font-medium text-[#1C1917]">Candidate</span>
                          </div>
                        </label>
                        <label className={`flex-1 relative border rounded p-2 cursor-pointer transition-all ${selectedRole === 'employer' ? 'border-[#1C1917] bg-[#FAF8F5]' : 'border-[#E7E2DA] hover:border-[#1C1917]'}`}>
                          <input type="radio" name="role" value="employer" checked={selectedRole === 'employer'} onChange={() => setSelectedRole('employer')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRole === 'employer' ? 'border-[#1C1917]' : 'border-[#D5CEBF]'}`}>
                              {selectedRole === 'employer' && <div className="w-1.5 h-1.5 rounded-full bg-[#1C1917]" />}
                            </div>
                            <span className="text-xs font-sans font-medium text-[#1C1917]">Employer</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-sans font-medium text-[#78716C] block mb-1">Email</label>
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
                      className={`w-full px-3 py-2 rounded border ${
                        emailStatus.error ? "border-amber-400 focus:border-amber-500" : "border-[#D5CEBF] focus:border-[#1C1917]"
                      } focus:ring-1 focus:ring-[#1C1917] bg-white text-[#1C1917] text-[13px] outline-none transition-colors placeholder:text-[#A8A29E] font-sans`} 
                    />

                    {/* Email Typo / Format Feedback */}
                    {emailStatus.suggestion && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(emailStatus.suggestion!);
                          setEmailStatus({});
                        }}
                        className="mt-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors flex items-center gap-1 text-left font-sans"
                      >
                        <span>Did you mean <strong>{emailStatus.suggestion}</strong>?</span>
                      </button>
                    )}
                    {emailStatus.error && !emailStatus.suggestion && (
                      <p className="mt-1 text-[11px] text-red-600 font-sans">
                        {emailStatus.error}
                      </p>
                    )}
                    {mode === "signup" && emailStatus.exists && (
                      <p className="mt-1 text-[11px] text-amber-700 font-sans">
                        Account already exists. Please sign in.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-sans font-medium text-[#78716C] block mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        disabled={loadingAction} 
                        placeholder="••••••••" 
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        className="w-full px-3 py-2 pr-9 rounded border border-[#D5CEBF] focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] bg-white text-[#1C1917] text-[13px] outline-none transition-colors placeholder:text-[#A8A29E] font-sans" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#78716C] hover:text-[#1C1917] focus:outline-none"
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
                    className="w-full bg-[#064E3B] hover:bg-[#043327] text-white rounded py-2.5 px-4 text-[13px] font-sans font-medium transition-colors shadow-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    {loadingAction ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {mode === "signup" ? "Creating..." : "Signing in..."}
                      </>
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
    </div>
  );
}
