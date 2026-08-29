"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthSwitch } from "./auth-switch";
import { X } from "lucide-react";

export function GlobalAuthModal() {
  const { showAuthModal, authModalMode, closeAuthModal, user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal if user signs in successfully
  useEffect(() => {
    if (user && !loading && showAuthModal) {
      closeAuthModal();
    }
  }, [user, loading, showAuthModal, closeAuthModal]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAuthModal]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeAuthModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative z-10 w-full max-w-[460px] mx-4"
          >
            <button
              onClick={closeAuthModal}
              className="absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-surface-low text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border">
              <AuthSwitch defaultMode={authModalMode} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
