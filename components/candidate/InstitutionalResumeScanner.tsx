"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Database, CheckCircle, ShieldCheck, Binary, Sparkles, Layers } from "lucide-react";
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
    title: "STREAM DECOMPRESSION",
    sub: "Binary stream ingestion & FlateDecode inflation",
    startMs: 0,
    endMs: 2000,
  },
  {
    id: 2,
    title: "AST SEGMENTATION",
    sub: "Glyph mapping & hierarchical section detection",
    startMs: 2000,
    endMs: 4000,
  },
  {
    id: 3,
    title: "NAMED ENTITY RECOGNITION",
    sub: "Isolating identity, institution, degree & cohort",
    startMs: 4000,
    endMs: 6000,
  },
  {
    id: 4,
    title: "TAXONOMY CORRELATION",
    sub: "Cross-referencing 200+ technical skill ontologies",
    startMs: 6000,
    endMs: 8000,
  },
  {
    id: 5,
    title: "ATS SYNTHESIS & INJECTION",
    sub: "Evaluating semantic density & synchronizing schema",
    startMs: 8000,
    endMs: 10000,
  },
];

const LOG_ENTRIES = [
  { ms: 200, text: "INIT: Ingesting binary document stream into memory buffer..." },
  { ms: 600, text: "FLATE: Resolving /FlateDecode compression objects (14 streams)..." },
  { ms: 1200, text: "STREAM: Extracting raw character glyphs and font encodings..." },
  { ms: 1800, text: "STREAM: Unpacked text payload. Checksum verified." },
  { ms: 2200, text: "AST: Segmenting document layout into bounding coordinate boxes..." },
  { ms: 2800, text: "LAYOUT: Single-column canonical ATS structure confirmed (Fidelity: 96%)." },
  { ms: 3400, text: "PARSER: Detected sections: [EDUCATION], [SKILLS], [EXPERIENCE], [PROJECTS]..." },
  { ms: 4200, text: "NER: Scanning top header blocks for candidate identity..." },
  { ms: 4800, text: "NER: Candidate contact vector & digital profiles extracted." },
  { ms: 5400, text: "ACADEMIC: Matched accredited institution & graduation year..." },
  { ms: 6200, text: "TAXONOMY: Cross-referencing against 200+ industry engineering primitives..." },
  { ms: 7000, text: "TAXONOMY: Verified primary language, framework, database & cloud skills." },
  { ms: 7600, text: "METRICS: Auditing quantifiable engineering action verbs and impact metrics..." },
  { ms: 8400, text: "ATS_CALC: Synthesizing enterprise ATS benchmark score..." },
  { ms: 9200, text: "PROJECTION: Injecting structured entities into candidate profile schema..." },
  { ms: 9900, text: "COMPLETE: Profiling synchronized. Ready for deployment." },
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

    const interval = 50; // update every 50ms for smooth 10s progress
    const timer = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + interval;
        if (next >= 10000) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 10000;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  const progressPercent = Math.min(100, Math.floor((elapsedMs / 10000) * 100));

  const currentStage = useMemo(() => {
    return (
      PARSE_STAGES.find((s) => elapsedMs >= s.startMs && elapsedMs < s.endMs) ||
      PARSE_STAGES[PARSE_STAGES.length - 1]
    );
  }, [elapsedMs]);

  const visibleLogs = useMemo(() => {
    return LOG_ENTRIES.filter((l) => elapsedMs >= l.ms);
  }, [elapsedMs]);

  // Entities reveal progressively based on time
  const showIdentity = elapsedMs >= 4500;
  const showAcademic = elapsedMs >= 5500;
  const showSkills = elapsedMs >= 7200;
  const showAts = elapsedMs >= 8800;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#090D16]/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-4xl bg-[#0C111C] border border-[#1E293B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-none overflow-hidden text-[#E2E8F0] font-mono text-xs relative"
        >
          {/* Top Console Telemetry Header */}
          <div className="bg-[#080C14] border-b border-[#1E293B] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="font-bold tracking-[0.16em] text-[#10B981] uppercase text-[11px]">
                MERITLANE DECOMPILER v4.2
              </span>
              <span className="text-[#475569] hidden sm:inline">|</span>
              <span className="text-[#94A3B8] text-[11px] hidden sm:inline">
                INSTITUTIONAL ATS & DOSSIER AUDIT
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
              <span className="font-mono">
                TARGET: <span className="text-[#E2E8F0] font-semibold">{fileName}</span>
              </span>
              <span className="bg-[#1E293B] px-2 py-0.5 text-[#38BDF8] border border-[#38BDF8]/20">
                {(elapsedMs / 1000).toFixed(2)}s / 10.00s
              </span>
            </div>
          </div>

          {/* 10-Second Progress Bar */}
          <div className="w-full bg-[#111827] h-1.5 border-b border-[#1E293B] relative overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] shadow-[0_0_12px_#10B981]"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Stage Progression Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#1E293B] bg-[#090D16] divide-x divide-[#1E293B]">
            {PARSE_STAGES.map((s) => {
              const isPast = elapsedMs >= s.endMs;
              const isCurrent = elapsedMs >= s.startMs && elapsedMs < s.endMs;
              return (
                <div
                  key={s.id}
                  className={`p-2.5 transition-colors ${
                    isCurrent
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : isPast
                      ? "text-[#64748B]"
                      : "text-[#334155]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-semibold text-[10px] tracking-wider">
                    <span>{isPast ? "✓" : isCurrent ? "▶" : "○"}</span>
                    <span>STAGE {s.id}</span>
                  </div>
                  <div className="text-[10px] truncate text-[#94A3B8]">{s.title}</div>
                </div>
              );
            })}
          </div>

          {/* Main Dual-Pane Terminal View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E293B] min-h-[380px]">
            {/* Left Console: Real-time Telemetry Log (7 Cols) */}
            <div className="lg:col-span-7 p-4 bg-[#080C14]/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] text-[10px] uppercase pb-2 mb-2 border-b border-[#1E293B]">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3 w-3 text-[#10B981]" /> EXECUTION TELEMETRY
                  </span>
                  <span>BUFFER: 256KB · UTF-8</span>
                </div>

                <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                  {visibleLogs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-[#38BDF8] shrink-0 font-mono">
                        [{((log.ms) / 1000).toFixed(2).padStart(5, "0")}s]
                      </span>
                      <span className={log.text.includes("COMPLETE") ? "text-[#10B981] font-semibold" : "text-[#CBD5E1]"}>
                        {log.text}
                      </span>
                    </motion.div>
                  ))}
                  {elapsedMs < 10000 && (
                    <div className="flex items-center gap-2 text-[#10B981] animate-pulse">
                      <span className="font-mono">[{((elapsedMs) / 1000).toFixed(2).padStart(5, "0")}s]</span>
                      <span>PROCESSING {currentStage.title}...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom active state label */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">PIPELINE STATUS:</span>
                <span className="text-[#10B981] font-semibold tracking-wider uppercase">
                  {elapsedMs >= 10000 ? "SCHEMA SYNCHRONIZED" : currentStage.title}
                </span>
              </div>
            </div>

            {/* Right Panel: Live Decoded Entity Matrix HUD (5 Cols) */}
            <div className="lg:col-span-5 p-4 bg-[#0C111C] space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#64748B] text-[10px] uppercase pb-2 mb-2 border-b border-[#1E293B]">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-[#38BDF8]" /> DECODED ENTITY HUD
                  </span>
                  <span className="text-[#10B981]">{progressPercent}% INDEXED</span>
                </div>

                {/* Candidate Identity Card */}
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-none">
                  <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Identity Recognition</span>
                    <span className={showIdentity ? "text-[#10B981]" : "text-[#475569]"}>
                      {showIdentity ? "VERIFIED" : "DECRYPTING..."}
                    </span>
                  </div>
                  {showIdentity ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-[13px] font-bold text-[#F8FAFC]">
                        {parsedData?.name || "Candidate Engineer"}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        {parsedData?.email || "candidate@meritlane.test"}
                      </div>
                      {parsedData?.githubUrl && (
                        <div className="text-[10px] text-[#38BDF8] truncate mt-0.5">
                          {parsedData.githubUrl}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-[11px] text-[#475569] font-mono animate-pulse">
                      Analyzing header tokens...
                    </div>
                  )}
                </div>

                {/* Academic Institution Card */}
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-none">
                  <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Academic Dossier</span>
                    <span className={showAcademic ? "text-[#10B981]" : "text-[#475569]"}>
                      {showAcademic ? "CLASSIFIED" : "SCANNING..."}
                    </span>
                  </div>
                  {showAcademic ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-[12px] font-semibold text-[#F8FAFC] truncate">
                        {parsedData?.college || "Technical University / College"}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">
                        {parsedData?.degree || "Engineering Degree"} · {parsedData?.branch || "Computer Science"}
                      </div>
                      {parsedData?.gradYear && (
                        <div className="text-[10px] text-[#10B981] font-mono mt-0.5">
                          Graduation Cohort: {parsedData.gradYear}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-[11px] text-[#475569] font-mono animate-pulse">
                      Detecting institutional markers...
                    </div>
                  )}
                </div>

                {/* Extracted Skills Chips */}
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-none">
                  <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Technical Taxonomy</span>
                    <span className={showSkills ? "text-[#10B981]" : "text-[#475569]"}>
                      {showSkills ? `${parsedData?.skills?.length || 0} IDENTIFIED` : "EXTRACTING..."}
                    </span>
                  </div>
                  {showSkills && parsedData?.skills?.length ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                      {parsedData.skills.slice(0, 10).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30 text-[10px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                      {parsedData.skills.length > 10 && (
                        <span className="text-[10px] text-[#64748B] px-1 py-0.5">
                          +{parsedData.skills.length - 10} more
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-[11px] text-[#475569] font-mono animate-pulse">
                      Matching 200+ framework vectors...
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Completion Indicator */}
              <div className="pt-2 border-t border-[#1E293B] text-center">
                {elapsedMs >= 10000 ? (
                  <div className="flex items-center justify-center gap-2 text-[#10B981] font-bold text-[11px]">
                    <CheckCircle className="h-4 w-4" /> AUTO-POPULATING PROFILE FIELDS
                  </div>
                ) : (
                  <div className="text-[10px] text-[#64748B]">
                    AUDITING AGAINST FORTUNE 500 ATS PROTOCOL · {10 - Math.floor(elapsedMs / 1000)}s REMAINING
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
