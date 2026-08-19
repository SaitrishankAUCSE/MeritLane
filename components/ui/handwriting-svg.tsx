"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import * as opentype from "opentype.js";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function HandwritingSvg({ 
  text = "Meritlane", 
  className, 
  onAnimationComplete 
}: { 
  text?: string, 
  className?: string,
  onAnimationComplete?: () => void 
}) {
  const [pathData, setPathData] = useState<{ d: string, viewBox: string } | null>(null);
  const [error, setError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion is preferred, immediately signal completion
  useEffect(() => {
    if (shouldReduceMotion && onAnimationComplete) {
      // Small timeout to avoid React state updates during render
      const t = setTimeout(() => onAnimationComplete(), 50);
      return () => clearTimeout(t);
    }
  }, [shouldReduceMotion, onAnimationComplete]);

  useEffect(() => {
    let isMounted = true;
    
    if (shouldReduceMotion) return;

    console.log("HandwritingSvg loading font...");
    opentype.load("/fonts/IndieFlower-Regular.ttf", (err, font) => {
      console.log("opentype.load callback", { err, hasFont: !!font, isMounted });
      if (!isMounted) return;
      if (err || !font) {
        console.error("Font could not be loaded:", err);
        setError(true);
        if (onAnimationComplete) onAnimationComplete();
        return;
      }

      try {
        const path = font.getPath(text, 0, 72, 72);
        const bbox = path.getBoundingBox();
        const d = path.toPathData(2);
        console.log("Font loaded successfully, path generated", { bbox, dLength: d.length });
        
        // Add padding to ensure the stroke doesn't get clipped
        const paddingX = 10;
        const paddingY = 20;
        const viewBox = `${bbox.x1 - paddingX} ${bbox.y1 - paddingY} ${bbox.x2 - bbox.x1 + paddingX * 2} ${bbox.y2 - bbox.y1 + paddingY * 2}`;
        
        setPathData({ d, viewBox });
      } catch (e) {
        console.error("Failed to parse font path:", e);
        setError(true);
        if (onAnimationComplete) onAnimationComplete();
      }
    });

    return () => { isMounted = false; };
  }, [text, shouldReduceMotion]); // Removed onAnimationComplete to prevent re-triggering font load

  if (error || shouldReduceMotion) {
    return (
      <div className={cn("font-bold text-4xl text-slate-900 tracking-tight flex items-center justify-center", className)}>
        {text}
      </div>
    );
  }

  if (!pathData) {
    return <div className={cn("h-[100px] flex items-center justify-center", className)} />;
  }

  return (
    <div className={cn("flex items-center justify-center text-slate-900", className)}>
      <svg
        viewBox={pathData.viewBox}
        className="w-full h-auto overflow-visible"
        style={{ maxWidth: "460px", minWidth: "260px" }}
      >
        <motion.path
          d={pathData.d}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={1.2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2.0, ease: "easeInOut", delay: 0.1 },
            opacity: { duration: 0.1, delay: 0.1 }
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
          onAnimationComplete={() => {
            // Signal completion right after drawing finishes and fill begins
            setTimeout(() => {
              if (onAnimationComplete) onAnimationComplete();
            }, 300);
          }}
        />
        <motion.path
          d={pathData.d}
          fill="currentColor"
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.1 }}
        />
      </svg>
    </div>
  );
}
