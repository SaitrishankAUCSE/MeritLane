"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.32, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="h-full w-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}

