"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
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
  const [loadingAction, setLoadingAction] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "employer">("candidate");

  const router = useRouter();
  const { user, role: userRole, loading: authLoading, profileLoading, refreshProfile: refreshAuth } = useAuth();

  useEffect(() => {
    if (user && !authLoading && !profileLoading) {
      if (userRole) {
        router.push("/dashboard");
      } else {
        setShowRoleSelector(true);
      }
    }
  }, [user, userRole, authLoading, profileLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setError(null);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: selectedRole,
          createdAt: new Date().toISOString(),
        });
        posthog.capture("user_signed_up", { method: 'email', role: selectedRole });
        await refreshAuth();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        posthog.capture("user_logged_in", { method: 'email' });
      }
    } catch (err: any) {
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

  if (authLoading || profileLoading || (user && userRole)) {
    return <div className="min-h-screen bg-black"></div>; 
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Premium Brand Area with Animation */}
      <div className="relative hidden md:flex flex-col justify-between w-full md:w-5/12 lg:w-1/2 bg-black text-white p-8 lg:p-12 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black pointer-events-none"
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            Meritlane
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-12 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] mb-6 text-white"
          >
            Proof of skill.<br/>
            <span className="text-zinc-500">Not just credentials.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-zinc-400"
          >
            Join the platform where verified engineering talent connects with top tier employers through rigorous, objective assessment.
          </motion.p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
              Verified Pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          <div className="md:hidden mb-8 flex justify-center">
             <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-black">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              Meritlane
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
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">Select your role</h2>
                  <p className="text-sm text-zinc-500">How do you want to use Meritlane?</p>
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
                    className="flex flex-col items-center justify-center p-6 border-2 border-zinc-200 rounded-2xl hover:border-black hover:bg-zinc-50 transition-all group disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span className="font-semibold text-zinc-900">Candidate</span>
                    <span className="text-xs text-zinc-500 mt-1 text-center">Get verified</span>
                  </button>

                  <button
                    onClick={() => handleRoleSelection("employer")}
                    disabled={loadingAction}
                    className="flex flex-col items-center justify-center p-6 border-2 border-zinc-200 rounded-2xl hover:border-black hover:bg-zinc-50 transition-all group disabled:opacity-50"
                  >
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <span className="font-semibold text-zinc-900">Employer</span>
                    <span className="text-xs text-zinc-500 mt-1 text-center">Hire talent</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {mode === "login" 
                      ? "Enter your details to sign in to your account" 
                      : "Start building your verified engineering track record"}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex p-1 bg-zinc-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`flex-1 text-sm py-2 rounded-md transition-all font-medium ${mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 text-sm py-2 rounded-md transition-all font-medium ${mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleAuth}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 rounded-lg p-3 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors disabled:opacity-50 text-sm font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-zinc-200"></div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Or with email</span>
                  <div className="flex-1 h-px bg-zinc-200"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-3 pb-2">
                      <label className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Select Role</label>
                      <div className="flex gap-3">
                        <label className={`flex-1 relative border rounded-xl p-3 cursor-pointer transition-all ${selectedRole === 'candidate' ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <input type="radio" name="role" value="candidate" checked={selectedRole === 'candidate'} onChange={() => setSelectedRole('candidate')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === 'candidate' ? 'border-zinc-900' : 'border-zinc-300'}`}>
                              {selectedRole === 'candidate' && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                            </div>
                            <span className="text-sm font-medium text-zinc-900">Candidate</span>
                          </div>
                        </label>
                        <label className={`flex-1 relative border rounded-xl p-3 cursor-pointer transition-all ${selectedRole === 'employer' ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <input type="radio" name="role" value="employer" checked={selectedRole === 'employer'} onChange={() => setSelectedRole('employer')} className="sr-only" />
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === 'employer' ? 'border-zinc-900' : 'border-zinc-300'}`}>
                              {selectedRole === 'employer' && <div className="w-2 h-2 rounded-full bg-zinc-900" />}
                            </div>
                            <span className="text-sm font-medium text-zinc-900">Employer</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-900 uppercase block mb-1.5">Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loadingAction} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm placeholder:text-zinc-400" />
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-zinc-900 uppercase block mb-1.5">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        disabled={loadingAction} 
                        placeholder="••••••••" 
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm placeholder:text-zinc-400" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loadingAction} className="w-full bg-black hover:bg-zinc-800 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                    {loadingAction ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {mode === "signup" ? "Creating Account..." : "Signing in..."}
                      </>
                    ) : (
                      mode === "signup" ? "Create Account" : "Sign In to Meritlane"
                    )}
                  </button>
                </form>

                <p className="text-xs text-center text-zinc-500 mt-6">
                  By continuing, you agree to our <Link href="/terms" className="underline hover:text-zinc-900">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-zinc-900">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
