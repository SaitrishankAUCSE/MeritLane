"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, ShieldCheck, GraduationCap, Code2, ArrowRight } from "lucide-react";
import { ParsedResumeProfile } from "@/lib/resume/parser";

interface InstitutionalResumeScannerProps {
  isOpen: boolean;
  fileName?: string;
  parsedData: ParsedResumeProfile | null;
  onComplete: () => void;
}

const PARSE_STAGES = [
  {
    id: 1,
    title: "DOCUMENT STRUCTURE",
    description: "Ingesting document layout and canonical ATS structure",
    startMs: 0,
    endMs: 700,
  },
  {
    id: 2,
    title: "ACADEMIC CREDENTIALS",
    description: "Extracting institution, degree, branch, and graduation cohort",
    startMs: 700,
    endMs: 1400,
  },
  {
    id: 3,
    title: "SKILL EXTRACTION",
    description: "Matching technical capabilities and programming frameworks",
    startMs: 1400,
    endMs: 2200,
  },
  {
    id: 4,
    title: "PROFILE SYNCHRONIZATION",
    description: "Synthesizing candidate profile schema and capability ledger",
    startMs: 2200,
    endMs: 3000,
  },
];

export function InstitutionalResumeScanner({
  isOpen,
  fileName = "resume.pdf",
  parsedData,
  onComplete,
}: InstitutionalResumeScannerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsedMs(0);
      return;
    }

    const interval = 40; // update smoothly over 3000ms total
    const timer = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + interval;
        if (next >= 3000) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 3000;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  const progressPercent = Math.min(100, Math.floor((elapsedMs / 3000) * 100));

  const currentStage = useMemo(() => {
    return (
      PARSE_STAGES.find((s) => elapsedMs >= s.startMs && elapsedMs < s.endMs) ||
      PARSE_STAGES[PARSE_STAGES.length - 1]
    );
  }, [elapsedMs]);

  const showAcademic = elapsedMs >= 900;
  const showSkills = elapsedMs >= 1600;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          className="w-full max-w-2xl bg-[#FAF8F5] border border-[#E7E2DA] shadow-2xl rounded-lg overflow-hidden text-[#1C1917] relative"
        >
          {/* Header */}
          <div className="bg-white border-b border-[#E7E2DA] px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#1C1917]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#78716C]">
                    MeritLane Registry · Credential Extraction
                  </div>
                  <h2 className="font-serif text-[18px] sm:text-[20px] font-semibold text-[#1C1917] leading-tight">
                    Document Examination
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded">
                  {fileName}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-[#E7E2DA] h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#064E3B]"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stage Progression */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARSE_STAGES.map((stage) => {
                const isPast = elapsedMs >= stage.endMs;
                const isCurrent = elapsedMs >= stage.startMs && elapsedMs < stage.endMs;
                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded border text-left transition-colors ${
                      isCurrent
                        ? "bg-white border-[#064E3B] shadow-xs"
                        : isPast
                        ? "bg-[#FAF8F5] border-[#E7E2DA] text-[#78716C]"
                        : "bg-white/50 border-[#E7E2DA]/60 text-[#A8A29E]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase mb-1">
                      {isPast ? (
                        <CheckCircle2 className="h-3 w-3 text-[#064E3B]" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-[#064E3B] animate-pulse" : "bg-[#D6D3D1]"}`} />
                      )}
                      <span>Stage {stage.id}</span>
                    </div>
                    <div className="text-[11px] font-sans font-medium line-clamp-1">
                      {stage.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Extracted Information Preview Card */}
            <div className="bg-white border border-[#E7E2DA] rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#064E3B]" />
                  <span>Extracted Profile Records</span>
                </div>
                <span className="text-[11px] font-mono text-[#064E3B] font-semibold">
                  {progressPercent}% Complete
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-[#78716C] uppercase block mb-1">
                    Candidate Identity
                  </span>
                  <div className="text-[14px] font-serif font-semibold text-[#1C1917]">
                    {parsedData?.name || "Candidate"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#78716C] uppercase block mb-1">
                    Academic Institution
                  </span>
                  <div className="text-[13px] font-sans text-[#1C1917] flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[#78716C] shrink-0" />
                    <span className="truncate">
                      {showAcademic ? (parsedData?.college || "Recognized Technical University") : "Verifying records..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Extracted */}
              <div>
                <span className="text-[10px] font-mono text-[#78716C] uppercase block mb-2 flex items-center justify-between">
                  <span>Declared Technical Skills (To Be Verified)</span>
                  {showSkills && parsedData?.skills && (
                    <span className="text-[#064E3B] font-medium font-sans">
                      {parsedData.skills.length} competencies isolated
                    </span>
                  )}
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                  {showSkills && parsedData?.skills && parsedData.skills.length > 0 ? (
                    parsedData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917]"
                      >
                        <Code2 className="h-2.5 w-2.5 text-[#78716C]" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] font-sans text-[#78716C] italic">
                      Scanning technical competency taxonomy...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="bg-white border-t border-[#E7E2DA] px-6 py-3.5 flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#78716C]">
              Status: <span className="text-[#064E3B] font-medium">{currentStage.title}</span>
            </div>
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-4 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white rounded transition-colors"
            >
              <span>Apply & Review Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
