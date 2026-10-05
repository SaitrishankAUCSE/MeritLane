"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  CheckCircle2,
  GraduationCap,
  Code2,
  ArrowRight,
  AlertTriangle,
  X,
  User,
} from "lucide-react";
import { ParsedResumeProfile } from "@/lib/resume/parser";

interface InstitutionalResumeScannerProps {
  isOpen: boolean;
  fileName?: string;
  parsedData: ParsedResumeProfile | null;
  currentProfileName?: string;
  currentProfileCollege?: string;
  isAnalyzing?: boolean;
  error?: string | null;
  onComplete: () => void;
  onClose?: () => void;
}

export function InstitutionalResumeScanner({
  isOpen,
  fileName = "resume.pdf",
  parsedData,
  currentProfileName,
  currentProfileCollege,
  isAnalyzing = false,
  error = null,
  onComplete,
  onClose,
}: InstitutionalResumeScannerProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(15);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple progress animation while waiting for API
  useEffect(() => {
    if (!isOpen) {
      setProgress(15);
      setCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (parsedData) {
          if (prev < 100) return Math.min(100, prev + 15);
          return 100;
        }
        if (prev < 88) {
          return prev + Math.floor(Math.random() * 5 + 3);
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isOpen, parsedData]);

  // Mark completed when progress hits 100 and parsedData is received
  useEffect(() => {
    if (parsedData && progress >= 100) {
      setCompleted(true);
    }
  }, [parsedData, progress]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const skillsList = parsedData?.skills || [];

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-[#E7E2DA] shadow-2xl rounded-lg overflow-hidden text-[#1C1917] relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#FAF8F5] border-b border-[#E7E2DA] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-white border border-[#E7E2DA] flex items-center justify-center text-[#1C1917] shrink-0">
              <FileText className="h-4 w-4 text-[#064E3B]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#1C1917] leading-tight">
                {error
                  ? "Couldn't read resume"
                  : completed
                  ? "Resume Read Successfully"
                  : "Checking Resume"}
              </h2>
              <p className="text-[11px] font-mono text-[#78716C] truncate mt-0.5">
                {fileName}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-[#78716C] hover:text-[#1C1917] p-1.5 rounded hover:bg-white transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-[#C0392B] p-4 rounded text-[13px] flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Couldn't read this resume</div>
                <div className="text-[12px] text-red-700">{error}</div>
              </div>
            </div>
          ) : !completed ? (
            /* Very Simple Loading & Parsing Animation */
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-full border-[3px] border-[#E7E2DA] border-t-[#064E3B] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#064E3B]" />
                </div>
              </div>

              <h3 className="text-[16px] font-semibold text-[#1C1917] mb-1">
                Reading Your Resume
              </h3>
              <p className="text-[13px] text-[#78716C] max-w-xs mb-5">
                {progress < 40
                  ? "Reading document..."
                  : progress < 75
                  ? "Finding your skills and education..."
                  : "Almost done..."}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs bg-[#FAF8F5] border border-[#E7E2DA] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#064E3B] h-full transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[#78716C] mt-2">
                {progress}%
              </span>
            </div>
          ) : (
            /* Simple Extracted Data Review */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 p-2.5 rounded text-[12px] font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Found your details. Ready to update your profile?</span>
              </div>

              <div className="border border-[#E7E2DA] rounded p-4 space-y-3 bg-[#FAF8F5]">
                {/* Candidate Name */}
                <div>
                  <span className="text-[10px] font-mono text-[#78716C] uppercase block mb-0.5">
                    Full Name
                  </span>
                  <div className="text-[14px] font-semibold text-[#1C1917] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#78716C]" />
                    <span>
                      {parsedData?.name && parsedData.name !== "Candidate"
                        ? parsedData.name
                        : currentProfileName || "Candidate"}
                    </span>
                    {!parsedData?.name && currentProfileName && (
                      <span className="text-[10px] font-mono text-[#78716C] bg-white border border-[#E7E2DA] px-1.5 py-0.2 rounded">
                        From your profile
                      </span>
                    )}
                  </div>
                </div>

                {/* College / Degree */}
                {(() => {
                  const academicItems = [
                    parsedData?.degree,
                    parsedData?.branch,
                    parsedData?.college || currentProfileCollege,
                    parsedData?.gradYear ? `Class of ${parsedData.gradYear}` : null,
                  ].filter(Boolean);
                  const academicText = academicItems.join(" · ");
                  if (!academicText) return null;
                  return (
                    <div>
                      <span className="text-[10px] font-mono text-[#78716C] uppercase block mb-0.5">
                        Education
                      </span>
                      <div className="text-[13px] text-[#1C1917] flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-[#78716C] shrink-0" />
                        <span className="truncate">{academicText}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Skills Identified */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[#78716C] uppercase">
                      Skills Found ({skillsList.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white border border-[#E7E2DA] rounded">
                    {skillsList.length > 0 ? (
                      skillsList.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917]"
                        >
                          <Code2 className="h-2.5 w-2.5 text-[#064E3B]" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12px] text-[#78716C] italic p-1">
                        No skills found in resume text.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E7E2DA] px-5 py-3.5 flex items-center justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="text-[12px] font-medium text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 rounded transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onComplete}
            disabled={!parsedData && !error}
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer ${
              completed
                ? "bg-[#064E3B] hover:bg-[#043327] text-white"
                : "bg-[#1C1917] hover:bg-[#2C2927] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <span>{error ? "Close" : "Save to Profile"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
