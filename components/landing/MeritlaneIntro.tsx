"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HandwritingSvg } from "@/components/ui/handwriting-svg";

export function MeritlaneIntro() {
  const [show, setShow] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const seen = sessionStorage.getItem("meritlane_intro_seen");
    if (!seen) {
      setShow(true);
    }
  }, []);

  const finishIntro = useCallback(() => {
    setShow(false);
    sessionStorage.setItem("meritlane_intro_seen", "true");
  }, []);

  // Auto-finish after animation
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      finishIntro();
    }, 3000);
    return () => clearTimeout(timer);
  }, [show, finishIntro]);

  // Handle Escape key
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finishIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, finishIntro]);

  // Don't render anything during SSR to avoid hydration mismatch
  if (!isClient) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={finishIntro}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") finishIntro();
          }}
          aria-label="Skip introduction animation"
        >
          <div className="w-full max-w-md px-8 text-center" onClick={(e) => e.stopPropagation()}>
            <HandwritingSvg 
              text="Meritlane" 
              className="text-slate-900 mx-auto" 
              fontUrl="/fonts/IndieFlower-Regular.ttf"
              width={320}
              height={160}
              fontSize={72}
              strokeWidth={1.5}
              duration={2.0}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
