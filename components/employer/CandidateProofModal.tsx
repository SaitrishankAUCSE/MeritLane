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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
            {candidate.verificationStatus === "verified" && (
              <Badge variant="verified" className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </Badge>
            )}
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Section: Match Reasons */}
          {candidate.matchReasons && candidate.matchReasons.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Why this candidate matches</h3>
                {candidate.totalRequiredSkillCount > 0 && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/50 px-2 py-1 rounded w-fit">
                    {candidate.matchedRequiredSkillCount} of {candidate.totalRequiredSkillCount} required skills
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {candidate.matchReasons.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Academic Identity */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Academic Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">College / University</span>
                <span className="text-sm font-medium text-slate-900">{candidate.college || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Branch</span>
                <span className="text-sm font-medium text-slate-900">{candidate.branch || "N/A"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Graduation Year</span>
                <span className="text-sm font-medium text-slate-900">{candidate.gradYear || "N/A"}</span>
              </div>
              {candidate.githubUrl && (
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">GitHub</span>
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[#1a56db] hover:underline">
                    View Profile <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section: Verified Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-slate-500" /> Declared Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Assessment Evidence */}
          {candidate.assessmentScores && Object.keys(candidate.assessmentScores).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-slate-500" /> Assessment Evidence
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(candidate.assessmentScores).map(([key, score]) => {
                  const testName = key.split('_')[0];
                  return (
                    <div key={key} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <span className="font-semibold text-slate-900 capitalize">{testName}</span>
                      <Badge variant="verified" className="text-sm px-2.5 py-0.5">{String(score)}/5 Score</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Project Evidence */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Project Evidence ({candidate.projects.length})</h3>
              <div className="space-y-4">
                {candidate.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h4 className="font-semibold text-slate-900 text-base">{proj.title}</h4>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                    <div className="mt-4 flex gap-4">
                      {proj.repoUrl && (
                        <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                          <ExternalLink className="h-4 w-4" /> Repository
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a56db] hover:underline">
                          <ExternalLink className="h-4 w-4" /> Live Demo
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
