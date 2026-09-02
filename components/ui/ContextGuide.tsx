"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GuideStep {
  title: string;
  description: string;
  isCompleted?: boolean;
}

interface ContextGuideProps {
  title: string;
  description?: string;
  steps: GuideStep[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  ctaDisabled?: boolean;
  storageKey: string;
}

export function ContextGuide({
  title,
  description,
  steps,
  ctaLabel,
  ctaHref,
  ctaOnClick,
  ctaDisabled,
  storageKey,
}: ContextGuideProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`meritlane_guide_dismissed_${storageKey}`);
    if (!dismissed) setIsVisible(true);
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`meritlane_guide_dismissed_${storageKey}`, "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-8 rounded-xl border border-[#E7E2DA] bg-white relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="h-[3px] bg-[#1C1917] w-full" />

          <div className="p-6">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#78716C] font-mono">
                    Getting started
                  </span>
                  <span className="h-px flex-1 bg-[#E7E2DA] w-8 inline-block" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1C1917] leading-snug">{title}</h3>
                {description && (
                  <p className="text-[13px] text-[#78716C] mt-1 leading-relaxed">{description}</p>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[#A8A29E]
                           hover:text-[#1C1917] hover:bg-[#F2EFE9] transition-colors mt-0.5"
                aria-label="Dismiss guide"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Steps */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex-1 flex items-start gap-3 p-3.5 rounded-lg border transition-colors ${
                    step.isCompleted
                      ? "border-[#BBF7D0] bg-[#F0FDF4]"
                      : "border-[#E7E2DA] bg-[#F8F6F3]"
                  }`}
                >
                  {/* Step number / check */}
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold mt-0.5 ${
                      step.isCompleted
                        ? "bg-[#16A34A] text-white"
                        : "bg-white border border-[#E7E2DA] text-[#78716C]"
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-[13px] font-semibold leading-tight mb-0.5 ${
                        step.isCompleted ? "text-[#15803D]" : "text-[#1C1917]"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[12px] text-[#78716C] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {ctaLabel && (ctaHref || ctaOnClick) ? (
                ctaHref ? (
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1C1917]
                               hover:opacity-70 transition-opacity"
                  >
                    {ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={ctaOnClick}
                    disabled={ctaDisabled}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1C1917]
                               hover:opacity-70 transition-opacity disabled:opacity-40"
                  >
                    {ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )
              ) : (
                <span />
              )}
              <button
                onClick={handleDismiss}
                className="text-[12px] text-[#A8A29E] hover:text-[#78716C] transition-colors"
              >
                Don't show again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
