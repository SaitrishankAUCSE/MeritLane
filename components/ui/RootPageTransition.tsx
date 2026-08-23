
"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function RootPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  // Dashboard routes handle their own inner content transitions so the sidebars stay stable.
  // We lock the root key for all dashboard routes to prevent the root from animating them.
  const isDashboardRoute = 
    pathname?.startsWith("/candidate") || 
    pathname?.startsWith("/employer") || 
    pathname?.startsWith("/admin");
    
  const key = isDashboardRoute ? "dashboard-lock" : pathname;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0.85, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full w-full flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

