"use client";

import React, { useState, useEffect } from "react";
import { Info, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  storageKey
}: ContextGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show if the user hasn't explicitly dismissed it for this specific context
    const dismissed = localStorage.getItem(`meritlane_guide_dismissed_${storageKey}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`meritlane_guide_dismissed_${storageKey}`, "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, height: 0, overflow: 'hidden' }}
          className="mb-8 rounded-xl border border-border bg-surface shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3">
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Dismiss guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-surface-low border border-border flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="pt-0.5">
                <h3 className="text-[18px] font-serif text-foreground mb-1">{title}</h3>
                {description && <p className="text-[14px] text-muted-foreground">{description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pl-14">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {idx !== steps.length - 1 && (
                    <div className="hidden md:block absolute top-[11px] left-6 right-0 h-[1px] bg-border" />
                  )}
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-medium ${step.isCompleted ? "bg-[#15803D] text-white" : "bg-surface-low border border-border text-muted-foreground"}`}>
                      {step.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-[14px] font-medium mb-1 ${step.isCompleted ? "text-[#15803D]" : "text-foreground"}`}>
                        {step.title}
                      </h4>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ctaLabel && (ctaHref || ctaOnClick) && (
              <div className="pl-14">
                {ctaHref ? (
                  <Link href={ctaHref}>
                    <Button variant="outline" size="sm" className="font-medium text-[13px] bg-background hover:bg-surface-low" disabled={ctaDisabled}>
                      {ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" onClick={ctaOnClick} className="font-medium text-[13px] bg-background hover:bg-surface-low" disabled={ctaDisabled}>
                    {ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
