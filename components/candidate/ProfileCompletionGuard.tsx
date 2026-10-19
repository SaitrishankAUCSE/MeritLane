"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ArrowRight, UserCheck } from "lucide-react";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

/**
 * ProfileCompletionGuard
 *
 * Ensures candidates must fill and save their Profile (Identity) page before accessing
 * other pages.
 * - When on any non-profile page (/candidate/dashboard, /candidate/verification, etc.)
 *   with an incomplete profile, everything behind is blurred with a professional backdrop.
 * - Displays a sleek, non-blocking modal directing them to complete their profile.
 * - Once profile is saved, the blur smoothly animates away and unlocks all remaining pages.
 */
export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { user, role, loading, profileLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const [isNavigating, setIsNavigating] = useState(false);

  const checkProfile = async () => {
    if (!user || role !== "candidate") {
      setChecking(false);
      setIsProfileComplete(true);
      return;
    }

    try {
      const p = await fetchCandidateProfile(user.uid);
      const complete = !!(p && p.name && p.name.trim().length > 0 && p.skills && p.skills.length > 0);
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

  // Pre-load the profile page chunk for an instantaneous transition
  useEffect(() => {
    if (user && role === "candidate") {
      try {
        router.prefetch("/candidate/profile");
      } catch {}
    }
  }, [user, role, router]);

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

  const isProfilePage = pathname === "/candidate/profile";
  const shouldBlur = !checking && isProfileComplete === false && !isProfilePage && !isTourActive;

  // Reset navigating state once on profile page
  useEffect(() => {
    if (isProfilePage) {
      setIsNavigating(false);
    }
  }, [isProfilePage]);

  const handleOpenProfile = () => {
    setIsNavigating(true);
    router.push("/candidate/profile");
  };

  return (
    <div className="relative h-full min-h-0 w-full flex flex-col">
      {/* Main page content with smooth blur transition */}
      <motion.div
        animate={{
          filter: shouldBlur ? "blur(8px)" : "none",
          opacity: shouldBlur ? 0.45 : 1,
          pointerEvents: shouldBlur ? "none" : "auto",
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-full min-h-0 w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>

      {/* Professional Blur Overlay & Guidance Dialog */}
      <AnimatePresence mode="wait">
        {shouldBlur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md w-full bg-white border border-border rounded p-7 sm:p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-[#F8F6F3] text-foreground border border-border">
                <UserCheck className="h-7 w-7" />
              </div>

              <div className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Quick Setup
              </div>

              <h2 className="text-[22px] font-semibold text-foreground tracking-tight mb-2">
                Please Complete Your Profile
              </h2>

              <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                Fill in your basic details and skills first to unlock skill tests, job applications, and get discovered by employers.
              </p>

              <button
                type="button"
                onClick={handleOpenProfile}
                disabled={isNavigating}
                className="w-full h-11 bg-foreground hover:bg-stone-800 disabled:opacity-85 text-white text-[13px] font-semibold rounded transition-all duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 cursor-pointer active:scale-[0.99]"
              >
                {isNavigating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Opening Profile…</span>
                  </>
                ) : (
                  <>
                    <span>Open Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileCompletionGuard;
