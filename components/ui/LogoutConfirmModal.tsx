"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, AlertTriangle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function LogoutConfirmModal({ isOpen, onConfirm, onCancel }: LogoutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoggingOut) {
          onCancel();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, isLoggingOut, onCancel]);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isLoggingOut ? onCancel : undefined}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-border p-6 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
          >
            {/* Top Close Button */}
            {!isLoggingOut && (
              <button
                type="button"
                onClick={onCancel}
                className="absolute top-5 right-5 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Icon Banner */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-red-50 text-red-600 border border-red-100 shadow-sm">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h2 id="logout-title" className="font-serif text-[22px] font-bold text-foreground tracking-tight mb-2">
                Sign out of MeritLane?
              </h2>
              <p id="logout-description" className="text-[14px] text-muted-foreground font-sans leading-relaxed">
                You will be securely signed out. You can log back in at any time to access your profile, assessments, and verified talent feed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoggingOut}
                className="w-full h-11 px-4 rounded-[4px_16px_4px_16px] hover:rounded-[16px_4px_16px_4px] border border-[#D5CBBA] bg-gradient-to-b from-white via-[#FAF6ED] to-[#F1EAE0] text-foreground font-sans font-semibold text-[14px] hover:bg-[#EFE9DC] active:scale-[0.98] transition-all duration-300 shadow-[0_1px_3px_rgba(28,25,23,0.08),inset_0_1px_0_#FFFFFF] disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoggingOut}
                className="w-full h-11 px-4 rounded-[16px_4px_16px_4px] hover:rounded-[4px_16px_4px_16px] bg-gradient-to-b from-[#8F4435] via-[#7B382B] to-[#632B21] border border-[#4D2018] text-white font-sans font-semibold text-[14px] shadow-[0_2px_5px_rgba(99,43,33,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_6px_16px_-2px_rgba(99,43,33,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
