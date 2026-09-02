"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Lock, Copy, Check, GitCommit, Network } from "lucide-react";

interface PublicProofRecordProps {
  id: string;
  candidate: any;
  user: any;
  hideHeader?: boolean;
}

export function PublicProofRecord({ id, candidate, user, hideHeader = false }: PublicProofRecordProps) {
  const [copied, setCopied] = useState(false);
  const name = candidate.name || "Anonymous Candidate";
  const skills = candidate.skills || ["Software Engineering"];
  const projects = candidate.projects || [];
  const recordId = id.substring(0, 8).toLowerCase();
  const avatarUrl = user?.photoURL || "";
  
  const verifiedDate = candidate.verifiedAt 
    ? new Date(candidate.verifiedAt).toISOString()
    : (candidate.updatedAt ? new Date(candidate.updatedAt).toISOString() : new Date().toISOString());

  const hasAnyVerifiedSkill = skills.some((skill: string) => candidate.verifiedSkills?.[skill]?.status === "verified");
  const isPractitionerVerified = candidate.verificationStatus === "verified" || hasAnyVerifiedSkill;
  const totalProofs = skills.length + projects.length;

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1C1917] font-sans">
      
      {/* Top Navbar */}
      {!hideHeader && (
        <header className="flex h-[72px] items-center justify-between px-8 lg:px-16 border-b border-[#E7E2DA] bg-white">
          <Link href="/" className="font-serif text-[26px] font-medium tracking-tight text-[#1C1917]">Meritlane</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 rounded-lg border border-[#E7E2DA] hover:border-[#1C1917] transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Link copied" : "Copy public link"}
            </button>
            <div className="font-mono text-[10px] tracking-[0.1em] text-[#78716C] uppercase flex items-center gap-2">
              <Shield className="h-3 w-3" /> Public artifact
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 pb-10 sm:pb-14 border-b border-[#E7E2DA] bg-white">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start max-w-[1200px] mx-auto">
          <div className="h-[96px] w-[96px] sm:h-[120px] sm:w-[120px] shrink-0 rounded-2xl border border-[#E7E2DA] overflow-hidden bg-[#F8F6F3]">
            {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover grayscale opacity-90" /> : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-[#78716C]">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-1 sm:mt-2">
            <h1 className="font-serif text-[32px] sm:text-[42px] lg:text-[48px] text-[#1C1917] tracking-tight leading-[1.1] mb-3 sm:mb-4">
              {name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-[12px] sm:text-[13px] font-sans font-medium">
              {isPractitionerVerified ? (
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle2 className="h-[14px] w-[14px] text-[#16A34A]" />
                  <span>Verified Practitioner</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#78716C]">
                  <span>Self-Declared Candidate</span>
                </div>
              )}
              <div className="w-px h-3 bg-[#E7E2DA]" />
              <div className="text-[#78716C] lowercase tracking-normal font-mono text-[12px]">ID: {recordId}</div>
            </div>
            
            <p className="max-w-2xl text-[14px] sm:text-[16px] leading-[1.6] text-[#78716C] font-sans italic">
              Verified assertion of skills and professional history. All claims below are backed by verifiable evidence evaluated by the Meritlane system.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Archival Register Grid */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-16 bg-white border-b border-[#E7E2DA]">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-10 lg:gap-16">
          
          {/* Left: Assertion metadata & Education */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-6 pb-2 border-b border-[#E7E2DA]">
                Assertion Metadata
              </h3>
              
              <div className="space-y-5 text-[13px]">
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase mb-1">Registry Record</div>
                  <div className="font-mono text-[#1C1917] font-medium">#{recordId}</div>
                </div>
                
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase mb-1">Verification Date</div>
                  <div className="font-mono text-[#1C1917] text-[12px]">{verifiedDate.split('T')[0]}</div>
                </div>
                
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase mb-1">Auditing Authority</div>
                  <div className="text-[#1C1917] font-serif">Meritlane Evaluation Board</div>
                </div>
                
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase mb-1">Evidence Records</div>
                  <div className="text-[#1C1917]">{totalProofs} Artifacts Linked</div>
                </div>
              </div>
            </div>

            {candidate.college && (
              <div className="pt-6 border-t border-[#E7E2DA]">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-3">
                  Academic Record
                </h3>
                <div className="text-[14px] font-serif text-[#1C1917]">{candidate.college}</div>
                <div className="text-[12px] text-[#78716C] mt-0.5">{candidate.branch}</div>
                <div className="text-[11px] font-mono text-[#78716C] mt-1">Class of {candidate.gradYear}</div>
              </div>
            )}

            {candidate.githubEvidence && (
              <div className="pt-6 border-t border-[#E7E2DA] space-y-4">
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <Shield className="h-3.5 w-3.5 text-[#064E3B]" />
                  <span className="text-[12px] font-mono uppercase tracking-wider font-semibold">GitHub Audit</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F8F6F3] border border-[#E7E2DA]">
                    <div className="text-[10px] font-mono text-[#78716C] uppercase mb-1">Repos</div>
                    <div className="text-[18px] font-serif text-[#1C1917]">{candidate.githubEvidence.repoCount}</div>
                  </div>
                  <div className="p-3 bg-[#F8F6F3] border border-[#E7E2DA]">
                    <div className="text-[10px] font-mono text-[#78716C] uppercase mb-1">Commits</div>
                    <div className="text-[18px] font-serif text-[#1C1917]">~{candidate.githubEvidence.totalCommits}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#78716C] uppercase mb-2">Evaluated Languages</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {candidate.githubEvidence.topLanguages.map((lang: string) => (
                      <span key={lang} className="text-[11px] font-mono bg-[#F8F6F3] border border-[#E7E2DA] text-[#1C1917] px-2 py-0.5">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Center: Audited Proof Ledger */}
          <article className="lg:border-l lg:border-r border-[#E7E2DA] lg:px-10">
            <h2 className="font-serif text-[28px] sm:text-[34px] text-[#1C1917] mb-8 font-normal pb-4 border-b border-[#E7E2DA]">
              Audited Evidence Register
            </h2>
            
            <div className="space-y-12">
              {skills.map((skill: string, index: number) => {
                const projectEvidence = projects.find((p: any) => p.supportsClaim === skill) || null;
                const isVerified = candidate.verifiedSkills?.[skill]?.status === "verified";
                const verifiedAt = candidate.verifiedSkills?.[skill]?.verifiedAt;
                const verifiedDate = verifiedAt ? new Date(verifiedAt).toISOString().split('T')[0] : "";
                const score = candidate.verifiedSkills?.[skill]?.score;

                return (
                  <div key={index} className="border-b border-[#E7E2DA] pb-10 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-serif text-[22px] text-[#1C1917] font-normal">
                        {skill}
                      </h3>
                      <div>
                        {isVerified ? (
                          <span className="text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 border border-[#064E3B]/20 font-medium">
                            ✓ VERIFIED {score ? `[${score}%]` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#78716C] bg-[#F8F6F3] px-2 py-0.5 border border-[#E7E2DA]">
                            SELF-DECLARED
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[14px] text-[#525252] font-sans leading-relaxed mb-5">
                      {isVerified 
                        ? `Demonstrated architectural competency and code correctness in timed evaluation on ${verifiedDate}.`
                        : "Candidate self-declaration. Primary repository evidence linked below."}
                    </p>
                    
                    {/* Primary Evidence Artifact */}
                    {projectEvidence && (
                      <div className="p-4 bg-[#F8F6F3] border border-[#E7E2DA]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <span className="text-[13px] font-serif text-[#1C1917] font-medium">{projectEvidence.title}</span>
                          {projectEvidence.repoUrl && (
                            <a 
                              href={projectEvidence.repoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] font-mono text-[#064E3B] underline hover:text-[#022c22] shrink-0"
                            >
                              Inspect Source ↗
                            </a>
                          )}
                        </div>
                        {projectEvidence.description && (
                          <p className="text-[13px] text-[#78716C] font-sans leading-relaxed">
                            {projectEvidence.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Archival Legal Guarantee */}
            <div className="mt-12 pt-8 border-t border-[#E7E2DA]">
              <div className="border border-[#E7E2DA] p-6 bg-[#F8F6F3]">
                <h4 className="text-[13px] font-mono uppercase tracking-wider text-[#1C1917] mb-2 font-semibold">
                  Standard of Technical Verification
                </h4>
                <p className="text-[13px] text-[#525252] font-sans leading-relaxed">
                  Meritlane verifies technical skill through evaluated challenge environments and code audits. This public record is maintained under cryptographic custody and represents validated evaluation marks on the date signed.
                </p>
              </div>
            </div>
          </article>

          {/* Right: Security Ledger & Custody */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-4 pb-2 border-b border-[#E7E2DA]">
                Custody & Integrity
              </h3>
              <p className="text-[12px] text-[#78716C] leading-relaxed mb-6 font-sans">
                Tamper-resistant audit ledger. Once stamped, candidate verified records cannot be altered without re-evaluation.
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-4 pb-2 border-b border-[#E7E2DA]">
                Audit Trail
              </h3>
              
              <div className="space-y-4 border-l border-[#E7E2DA] pl-4 text-[12px]">
                <div>
                  <div className="font-mono text-[#064E3B] font-medium">[ ISSUED ]</div>
                  <div className="text-[#1C1917]">Credential Certified</div>
                </div>

                <div>
                  <div className="font-mono text-[#78716C]">[ ATTACHED ]</div>
                  <div className="text-[#525252]">Repositories Synced</div>
                </div>

                <div>
                  <div className="font-mono text-[#78716C]">[ LOGGED ]</div>
                  <div className="text-[#525252]">Candidate Identity Stamped</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
}

