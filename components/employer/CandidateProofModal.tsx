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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border border-border shadow-sm flex flex-col">
        
        {/* MODAL DOSSIER HEADER */}
        <div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-8 py-5 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Verified Technical Profile</h4>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{candidate.name}</h2>
              <ProofTrace 
                status={candidate.verificationStatus || "unverified"} 
                assessmentScores={candidate.assessmentScores} 
                assessmentDate={candidate.assessmentDate}
                candidateName={candidate.name}
                size="sm"
              />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
              {candidate.branch || "Software Engineering"} · {candidate.college || "N/A"} · {candidate.gradYear || "N/A"}
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-surface-low hover:text-foreground transition-colors bg-surface"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* DOSSIER BODY */}
        <div className="p-8 space-y-12">
          
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
                    <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <p className="text-xs font-bold text-foreground">Standardized Assessment</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: Proctored Engine</p>
                  </div>
                )}

                {candidate.projects && candidate.projects.length > 0 && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded-full bg-foreground ring-4 ring-white" />
                    <p className="text-xs font-bold text-foreground">Portfolio Attached</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-wider">Source: Candidate Declaration</p>
                  </div>
                )}

                <div className="relative pt-2">
                  <div className="absolute -left-[17px] top-3 h-1.5 w-1.5 rounded-full bg-zinc-300 ring-4 ring-white" />
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

