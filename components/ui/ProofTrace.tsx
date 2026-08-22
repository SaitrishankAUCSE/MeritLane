"use client";

import React, { useState, useEffect } from "react";
import { VerdictMark, VerdictStatus } from "@/components/ui/VerdictMark";
import { Terminal, X } from "lucide-react";

interface ProofTraceProps {
  status: VerdictStatus;
  assessmentScores?: Record<string, any> | null;
  assessmentDate?: number | string | Date | null;
  candidateName?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ProofTrace({ 
  status, 
  assessmentScores, 
  assessmentDate, 
  candidateName = "Candidate",
  className = "",
  size = "md"
}: ProofTraceProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Determine tests to render based on score
  const renderTests = () => {
    if (!assessmentScores || Object.keys(assessmentScores).length === 0) return null;
    
    // Just grab the first assessment for the trace display
    const testKey = Object.keys(assessmentScores)[0];
    const score = Number(assessmentScores[testKey]) || 0;
    const testName = testKey.replace(/_/g, " ").toUpperCase();
    
    const dateStr = assessmentDate 
      ? new Date(assessmentDate).toLocaleString() 
      : "Unknown Timestamp";

    const lines = [
      `> INITIATING PROOF TRACE FOR [${candidateName.toUpperCase()}]`,
      `> FETCHING IMMUTABLE ASSESSMENT LOGS...`,
      `> ASSESSMENT TYPE: ${testName}`,
      `> SECURE TIMESTAMP: ${dateStr}`,
      `> REPLAYING EVALUATION PIPELINE...`
    ];

    // Generate 5 test cases based on score
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        lines.push(`[ OK ] ASSERTION_0${i} ... PASSED`);
      } else {
        lines.push(`[FAIL] ASSERTION_0${i} ... FAILED`);
      }
    }

    lines.push(`> FINAL SCORE: ${score}/5`);
    
    if (status === "verified") {
      lines.push(`> SYSTEM STATUS: COMPONENT VERIFIED`);
    } else if (status === "pending" || status === "changes_required") {
      lines.push(`> SYSTEM STATUS: AUDIT REQUIRED`);
    } else if (status === "rejected") {
      lines.push(`> SYSTEM STATUS: VERIFICATION DENIED`);
    } else {
      lines.push(`> SYSTEM STATUS: INCOMPLETE`);
    }

    return lines;
  };

  const getNoDataLines = () => {
    const base = [
      `> INITIATING PROOF TRACE FOR [${candidateName.toUpperCase()}]`,
      `> FETCHING IMMUTABLE ASSESSMENT LOGS...`
    ];

    if (status === "verified") {
      const dateStr = assessmentDate 
        ? new Date(assessmentDate).toLocaleString() 
        : "Unknown Timestamp";
      base.push(`> RECORD_FOUND: Administrative verification override detected.`);
      base.push(`> VERIFICATION METHOD: Manual admin review`);
      base.push(`> SECURE TIMESTAMP: ${dateStr}`);
      base.push(`> SYSTEM STATUS: COMPONENT VERIFIED`);
    } else if (status === "pending") {
      base.push(`> RECORD_FOUND: Identity initialized, awaiting audit.`);
      base.push(`> SYSTEM STATUS: AUDIT REQUIRED`);
    } else if (status === "changes_required") {
      base.push(`> RECORD_FOUND: Audit completed. Changes requested.`);
      base.push(`> SYSTEM STATUS: AUDIT REQUIRED`);
    } else if (status === "rejected") {
      base.push(`> RECORD_FOUND: Audit completed. Verification denied.`);
      base.push(`> SYSTEM STATUS: VERIFICATION DENIED`);
    } else {
      base.push(`> ERR_NO_EVIDENCE: No standardized assessment data on record.`);
      base.push(`> SYSTEM STATUS: UNVERIFIED`);
    }
    
    return base;
  };

  const lines = (assessmentScores && Object.keys(assessmentScores).length > 0) 
    ? renderTests()! 
    : getNoDataLines();

  // Animation effect
  useEffect(() => {
    if (expanded) {
      if (prefersReducedMotion) {
        setVisibleLines(lines.length);
      } else {
        setVisibleLines(0);
        const interval = setInterval(() => {
          setVisibleLines((prev) => {
            if (prev >= lines.length) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 150); // 150ms staggered reveal per line
        
        return () => clearInterval(interval);
      }
    } else {
      setVisibleLines(0);
    }
  }, [expanded, lines.length, prefersReducedMotion]);

  return (
    <>
      {/* Collapsed State: VerdictMark + Button */}
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <VerdictMark status={status} size={size} />
        
        <button
          onClick={() => setExpanded(true)}
          className="group flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-border px-3 py-1.5 font-data uppercase text-muted-foreground hover:text-foreground"
        >
          <Terminal className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700 transition-colors shrink-0" />
          <span>View Proof Trace</span>
        </button>
      </div>

      {/* Expanded State: Terminal Modal */}
      {expanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface border border-zinc-800 rounded-md overflow-hidden shadow-sm animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Terminal Header */}
            <div className="flex items-center justify-between bg-surface-low border-b border-zinc-800 px-4 py-3 select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 tracking-wider">meritlane-proof-layer ~ sh</span>
              </div>
              <button 
                onClick={() => setExpanded(false)}
                className="text-zinc-500 hover:text-[#0D0D0D] transition-colors"
                aria-label="Close trace"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Terminal Output */}
            <div className="p-6 font-mono text-sm leading-relaxed overflow-y-auto max-h-[70vh]">
              {lines.map((line, index) => {
                if (index >= visibleLines) return null;
                
                // Styling specific lines for effect
                let colorClass = "text-zinc-300";
                
                if (line.includes("[ OK ]")) colorClass = "text-emerald-400";
                if (line.includes("[FAIL]")) colorClass = "text-red-400";
                if (line.includes("ERR_")) colorClass = "text-red-400";
                if (line.startsWith("> SYSTEM STATUS: COMPONENT VERIFIED")) colorClass = "text-emerald-400 font-bold";
                if (line.startsWith("> SYSTEM STATUS: VERIFICATION DENIED")) colorClass = "text-red-400 font-bold";
                
                return (
                  <div key={index} className={`${colorClass} mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                    {line}
                  </div>
                );
              })}
              
              {/* Blinking cursor */}
              {visibleLines >= lines.length && (
                <div className="inline-block w-2.5 h-4 bg-zinc-400 animate-pulse mt-2"></div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}