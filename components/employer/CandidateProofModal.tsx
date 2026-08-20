"use client";

import React from "react";
import { X, ShieldCheck, ExternalLink, Code2, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CandidateProofModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateProofModal({ candidate, isOpen, onClose }: CandidateProofModalProps) {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-xl border border-zinc-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-zinc-900">{candidate.name}</h2>
            {candidate.verificationStatus === "verified" && (
              <Badge variant="verified">Verified</Badge>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Section: Match Reasons */}
          {candidate.matchReasons && candidate.matchReasons.length > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2.5 gap-2">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Why this candidate matches</h3>
                {candidate.totalRequiredSkillCount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded w-fit">
                    {candidate.matchedRequiredSkillCount} of {candidate.totalRequiredSkillCount} required skills
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {candidate.matchReasons.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Academic Identity */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">
              Academic Background
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-zinc-400 mb-0.5">College / University</span>
                <span className="font-semibold text-zinc-900">{candidate.college || "N/A"}</span>
              </div>
              <div>
                <span className="block text-zinc-400 mb-0.5">Branch</span>
                <span className="font-semibold text-zinc-900">{candidate.branch || "N/A"}</span>
              </div>
              <div>
                <span className="block text-zinc-400 mb-0.5">Graduation Year</span>
                <span className="font-semibold text-zinc-900">{candidate.gradYear || "N/A"}</span>
              </div>
              {candidate.githubUrl && (
                <div>
                  <span className="block text-zinc-400 mb-0.5">GitHub</span>
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:underline">
                    View Profile <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section: Verified Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">
                Declared Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill: string) => (
                  <span key={skill} className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Assessment Evidence */}
          {candidate.assessmentScores && Object.keys(candidate.assessmentScores).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">
                Assessment Results
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(candidate.assessmentScores).map(([key, score]) => {
                  const testName = key.split('_')[0];
                  return (
                    <div key={key} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-lg">
                      <span className="text-xs font-semibold text-zinc-900 capitalize">{testName}</span>
                      <Badge variant="verified" size="sm">{String(score)}/5 Score</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Project Evidence */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">
                Project Codebases ({candidate.projects.length})
              </h3>
              <div className="space-y-3">
                {candidate.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-lg p-4">
                    <h4 className="font-bold text-zinc-900 text-sm">{proj.title}</h4>
                    <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{proj.description}</p>
                    <div className="mt-3 flex gap-3">
                      {proj.repoUrl && (
                        <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900">
                          <ExternalLink className="h-3.5 w-3.5" /> Repository
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-zinc-900 hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
