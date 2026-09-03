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

  const isProfilePage = pathname === "/candidate/profile";
  const shouldBlur = !checking && isProfileComplete === false && !isProfilePage;

  return (
    <div className="relative min-h-full w-full flex flex-col">
      {/* Main page content with smooth blur transition */}
      <motion.div
        animate={{
          filter: shouldBlur ? "blur(8px)" : "blur(0px)",
          opacity: shouldBlur ? 0.45 : 1,
          pointerEvents: shouldBlur ? "none" : "auto",
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-full w-full flex-1 flex flex-col"
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
              className="max-w-md w-full bg-white border border-[#E7E2DA] rounded-2xl p-7 sm:p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F6F3] text-[#1C1917] border border-[#E7E2DA]">
                <UserCheck className="h-7 w-7" />
              </div>

              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-2">
                Profile Setup Required
              </div>

              <h2 className="text-[22px] font-semibold text-[#1C1917] tracking-tight mb-2">
                Complete Your Profile First
              </h2>

              <p className="text-[14px] text-[#78716C] leading-relaxed mb-6">
                To unlock MeritLane&apos;s verified assessments, evidence submissions, and employer visibility, please fill and save your initial candidate profile.
              </p>

              <button
                onClick={() => router.push("/candidate/profile")}
                className="w-full h-11 bg-[#1C1917] hover:bg-[#292524] text-white text-[13px] font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
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

export default ProfileCompletionGuard;
