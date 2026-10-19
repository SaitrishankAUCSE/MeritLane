"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchEmployerProfile } from "@/lib/firebase/employer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";

interface EmployerProfileCompletionGuardProps {
  children: React.ReactNode;
}

/**
 * EmployerProfileCompletionGuard
 *
 * Ensures employers must fill and save their Profile page before accessing
 * other pages.
 */
export function EmployerProfileCompletionGuard({ children }: EmployerProfileCompletionGuardProps) {
  const { user, role, loading, profileLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const checkProfile = async () => {
    if (!user || role !== "employer") {
      setChecking(false);
      setIsProfileComplete(true);
      return;
    }

    try {
      const p = await fetchEmployerProfile(user.uid);
      // Profile is complete if they have provided their company name and their own role
      const complete = !!(p && p.companyName && p.companyName.trim().length > 0 && p.role && p.role.trim().length > 0);
      setIsProfileComplete(complete);
    } catch {
      setIsProfileComplete(true); // Graceful fallback
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!loading && !profileLoading && user) {
      checkProfile();
    }
  }, [user, role, loading, profileLoading, pathname]);

  const [isTourActive, setIsTourActive] = useState(false);
  useEffect(() => {
    const checkTour = () => {
      const active = typeof window !== "undefined" && localStorage.getItem("meritlane_live_tour_active") === "true";
      setIsTourActive(active);
    };
    checkTour();
    window.addEventListener("meritlane-tour-state-change", checkTour);
    return () => window.removeEventListener("meritlane-tour-state-change", checkTour);
  }, []);

  const isProfilePage = pathname === "/employer/profile";
  const shouldBlur = !checking && isProfileComplete === false && !isProfilePage && !isTourActive;

  return (
    <div className="relative h-full min-h-0 w-full flex-1 flex flex-col min-w-0">
      {/* Main page content with smooth blur transition */}
      <motion.div
        animate={{
          filter: shouldBlur ? "blur(8px)" : "none",
          opacity: shouldBlur ? 0.45 : 1,
          pointerEvents: shouldBlur ? "none" : "auto",
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="h-full min-h-0 w-full flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>

      {/* Professional Blur Overlay & Guidance Dialog */}
      <AnimatePresence>
        {shouldBlur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md w-full bg-white border border-border rounded p-7 sm:p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-[#F8F6F3] text-foreground border border-border">
                <Briefcase className="h-7 w-7" />
              </div>

              <div className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Quick Setup
              </div>

              <h2 className="text-[22px] font-semibold text-foreground tracking-tight mb-2">
                Complete Your Employer Profile
              </h2>

              <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                Tell us about your company, your role, and connect your LinkedIn to start discovering verified talent.
              </p>

              <button
                onClick={() => router.push("/employer/profile")}
                className="w-full h-11 bg-foreground hover:bg-stone-800 text-white text-[13px] font-semibold rounded transition-all duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                <span>Go to Profile Setup</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerProfileCompletionGuard;
