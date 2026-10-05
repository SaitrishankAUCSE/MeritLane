"use client";

import React from "react";
import { X, ExternalLink, ShieldCheck, Cpu, Code2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProofSignal, EvidenceRail } from "@/components/ui/ProofSignal";
import { ProofTrace } from "@/components/ui/ProofTrace";

interface CandidateProofModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateProofModal({ candidate, isOpen, onClose }: CandidateProofModalProps) {
  if (!isOpen || !candidate) return null;

  const verifiedList = Object.entries(candidate.verifiedSkills || {}).filter(([_, s]: [string, any]) => s?.status === "verified");
  const verifiedSkillsCount = candidate.qualifiedSkillsCount ?? verifiedList.length;
  const candidateSkills = candidate.skills || [];
  const totalSkillsCount = candidate.totalSkillsCount || candidateSkills.length || (verifiedSkillsCount > 0 ? verifiedSkillsCount * 2 : 1);
  const verificationPct = typeof candidate.skillVerificationPct === "number"
    ? candidate.skillVerificationPct
    : (totalSkillsCount > 0 ? Math.round((verifiedSkillsCount / totalSkillsCount) * 100) : 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border border-border shadow-sm flex flex-col">
        
        {/* MODAL DOSSIER HEADER */}
        <div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-4 sm:px-8 py-4 sm:py-5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Verified Technical Profile</h4>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">{candidate.name}</h2>
              <ProofTrace 
                status={candidate.verificationStatus || "unverified"} 
                assessmentScores={candidate.assessmentScores} 
                assessmentDate={candidate.assessmentDate}
                candidateName={candidate.name}
                size="sm"
              />
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#ECFDF5] border border-[#BBF7D0] text-[#166534] text-[11px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>{verificationPct}% Skills Verified</span>
                <span className="text-[#15803D] font-normal text-[10px]">
                  ({verifiedSkillsCount}/{totalSkillsCount} passed ≥75%)
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1 uppercase tracking-wider truncate">
              {candidate.branch || "Software Engineering"} · {candidate.college || "N/A"} · {candidate.gradYear || "N/A"}
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-surface-low hover:text-foreground transition-colors bg-surface"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* DOSSIER BODY */}
        <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
          
          {/* SECTION: CANDIDATE EVIDENCE SUMMARY (Factual, no AI rankings) */}
          <section className="bg-surface-low border border-border p-5 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                Evidence Summary
              </h3>
              <span className="text-[11px] font-mono text-[#059669] font-semibold bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                {verificationPct}% of Cataloged Skills Passed (≥75%)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Verified Skills
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-[#059669]">
                    {verificationPct}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({verifiedSkillsCount}/{totalSkillsCount})
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-[#059669] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, verificationPct))}%` }}
                  />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Verified Projects
                </span>
                <span className="text-base font-bold text-foreground">
                  {candidate.projects?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  GitHub Repos
                </span>
                <span className="text-base font-bold text-foreground">
                  {candidate.githubEvidence?.repoCount || (candidate.githubUrl ? "Linked" : "None")}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Education
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {candidate.college || "Self-taught"}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION: MATCH COVERAGE */}
          <section>
            <div className="flex items-end gap-3 mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Match Coverage</h3>
              {candidate.totalRequiredSkillCount > 0 && (
                <span className="text-[11px] font-bold text-muted-foreground bg-surface-low px-2 py-0.5 rounded-sm">
                  {candidate.matchedRequiredSkillCount} of {candidate.totalRequiredSkillCount} Required Skills
                </span>
              )}
            </div>
            
            {candidate.matchReasons && candidate.matchReasons.length > 0 ? (
              <div className="bg-surface border-l-2 border-border pl-4 space-y-2">
                {candidate.matchReasons.map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific match reasons provided for this role.</p>
            )}
          </section>

          <hr className="border-t border-border" />

          {/* SECTION: PROOF SIGNALS (Skills) */}
          <section>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Proof Signals</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verified Stack */}
              {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Role Matches</span>
                  <div className="flex flex-col gap-2">
                    {candidate.matchedSkills.map((skill: string) => (
                      <div key={skill} className="flex items-center justify-between border border-border p-3 bg-surface">
                        <span className="text-sm font-bold text-foreground">{skill}</span>
                        <ProofSignal type="assessed" label="Verified" source="Algorithm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Declared Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Declared Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill: string) => (
                      <span key={skill} className="bg-surface-low text-muted-foreground px-3 py-1.5 rounded-sm text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-t border-border" />

          {/* SECTION: PROJECT EVIDENCE */}
          <section>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Project Evidence</h3>
            
            {candidate.projects && candidate.projects.length > 0 ? (
              <div className="space-y-4">
                {candidate.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="relative border border-border bg-surface p-5 shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-foreground opacity-20"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-bold text-foreground text-base">{proj.title}</h4>
                        <div className="mt-1">
                          <ProofSignal type="authenticated" label="Attached Evidence" source="Candidate Provided" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {proj.repoUrl && (
                          <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-surface-low px-3 py-1.5 rounded-sm transition-colors">
                            <Code2 className="h-3.5 w-3.5" /> Repository
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-indigo-900 bg-transparent px-3 py-1.5 rounded-sm transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3 mt-4">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No project evidence provided.</p>
            )}
          </section>

          <hr className="border-t border-border" />

          {/* SECTION: ASSESSMENT SIGNAL & TIMELINE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Assessment Signals</h3>
              {candidate.assessmentScores && Object.keys(candidate.assessmentScores).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(candidate.assessmentScores).map(([key, score]) => {
                    const testName = key.replace('python_', 'Python (Variant ').replace('_', ' ') + (key.startsWith('python_') ? ')' : '');
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-4 bg-surface shadow-sm gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-foreground capitalize">{testName}</h4>
                          <div className="mt-1.5">
                            <ProofSignal type="assessed" label="Completed" source="Proctored Engine" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 text-right bg-surface-low px-4 py-2 border border-border">
                          <span className="text-xl font-black text-foreground">{String(score)}</span>
                          <span className="text-xs font-medium text-muted-foreground">/ 5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No assessment signals on record.</p>
              )}
              
              {candidate.verifiedSkills && Object.entries(candidate.verifiedSkills).map(([skill, data]: [string, any]) => {
                if (data.aiFeedback) {
                  return (
                    <div key={`ai-${skill}`} className="mt-4 border border-[#15803D]/20 bg-[#F0FDF4]/50 p-4 rounded-md shadow-sm">
                      <div className="text-[10px] font-bold text-[#15803D] uppercase tracking-widest mb-2 flex items-center gap-1">✨ AI Senior Engineer Review: {skill}</div>
                      <p className="text-xs text-foreground leading-relaxed font-medium">
                        {data.aiFeedback}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Verification History</h3>
              <EvidenceRail>
                {candidate.verificationStatus === "verified" && (
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <p className="text-xs font-bold text-foreground">Verification Passed</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: Meritlane Auditors</p>
                  </div>
                )}
                
                {candidate.assessmentScores && Object.keys(candidate.assessmentScores).length > 0 && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded bg-[#064E3B] ring-4 ring-white" />
                    <p className="text-xs font-bold text-foreground">Standardized Assessment</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: Proctored Engine</p>
                  </div>
                )}

                {candidate.projects && candidate.projects.length > 0 && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded bg-foreground ring-4 ring-white" />
                    <p className="text-xs font-bold text-foreground">Portfolio Attached</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: Candidate Declaration</p>
                  </div>
                )}

                <div className="relative pt-2">
                  <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded bg-zinc-300 ring-4 ring-white" />
                  <p className="text-xs font-bold text-foreground">Identity Initialized</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: System</p>
                </div>
              </EvidenceRail>
            </div>
            
          </section>

        </div>
      </div>
    </div>
  );
}

