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
            <h1 className="font-signature text-[42px] sm:text-[54px] lg:text-[60px] text-[#1C1917] leading-none mb-3 sm:mb-4 font-semibold">
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

      {/* Audited Evidence & Metadata Register Grid */}
      <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white border-b border-[#E7E2DA]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left: Assertion metadata & Education (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064E3B]/10 backdrop-blur-md border border-[#064E3B]/20 text-[#064E3B] text-[11px] font-mono font-medium rounded-full mb-4 shadow-[0_2px_8px_rgba(6,78,59,0.08)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#064E3B]" />
                <span>ASSERTION METADATA</span>
              </div>
              
              <div className="space-y-4 text-[13px]">
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[11px] font-mono text-[#78716C] uppercase">Registry Record</span>
                  <span className="font-mono text-[#1C1917] font-semibold">#{recordId}</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[11px] font-mono text-[#78716C] uppercase">Verification Date</span>
                  <span className="font-mono text-[#1C1917] text-[12px]">{verifiedDate.split('T')[0]}</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[11px] font-mono text-[#78716C] uppercase">Auditing Board</span>
                  <span className="text-[#1C1917] font-medium">Meritlane</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#78716C] uppercase">Artifacts Linked</span>
                  <span className="text-[#1C1917] font-mono font-medium">{totalProofs} Items</span>
                </div>
              </div>
            </div>

            {candidate.college && (
              <div className="p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064E3B]/10 backdrop-blur-md border border-[#064E3B]/20 text-[#064E3B] text-[11px] font-mono font-medium rounded-full mb-2 shadow-[0_2px_8px_rgba(6,78,59,0.08)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#064E3B]" />
                  <span>ACADEMIC RECORD</span>
                </div>
                <div className="text-[14px] font-serif text-[#1C1917] font-medium">{candidate.college}</div>
                <div className="text-[12px] text-[#78716C]">{candidate.branch}</div>
                <div className="text-[11px] font-mono text-[#78716C]">Class of {candidate.gradYear}</div>
              </div>
            )}

            {candidate.githubEvidence && (
              <div className="p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064E3B]/10 backdrop-blur-md border border-[#064E3B]/20 text-[#064E3B] text-[11px] font-mono font-medium rounded-full shadow-[0_2px_8px_rgba(6,78,59,0.08)]">
                  <Shield className="h-3 w-3 text-[#064E3B]" />
                  <span>GITHUB AUDIT</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white border border-[#E7E2DA] rounded">
                    <div className="text-[10px] font-mono text-[#78716C] uppercase mb-0.5">Repos</div>
                    <div className="text-[16px] font-serif text-[#1C1917] font-medium">{candidate.githubEvidence.repoCount}</div>
                  </div>
                  <div className="p-2.5 bg-white border border-[#E7E2DA] rounded">
                    <div className="text-[10px] font-mono text-[#78716C] uppercase mb-0.5">Commits</div>
                    <div className="text-[16px] font-serif text-[#1C1917] font-medium">~{candidate.githubEvidence.totalCommits}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#78716C] uppercase mb-2">Evaluated Languages</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {candidate.githubEvidence.topLanguages.map((lang: string) => (
                      <span key={lang} className="text-[11px] font-mono bg-white border border-[#E7E2DA] text-[#1C1917] px-2 py-0.5 rounded">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Center: Audited Proof Ledger (8 cols) */}
          <article className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#064E3B]/10 backdrop-blur-md border border-[#064E3B]/25 text-[#064E3B] text-[13px] font-serif font-medium rounded-full shadow-[0_2px_10px_rgba(6,78,59,0.1)]">
                <span className="h-2 w-2 rounded-full bg-[#064E3B]" />
                <span>Audited Evidence Register</span>
              </div>
              <span className="text-[11px] font-mono text-[#78716C]">{skills.length} Evaluated Claims</span>
            </div>
            
            <div className="space-y-6">
              {skills.map((skill: string, index: number) => {
                const projectEvidence = projects.find((p: any) => p.supportsClaim === skill) || null;
                const isVerified = candidate.verifiedSkills?.[skill]?.status === "verified";
                const verifiedAt = candidate.verifiedSkills?.[skill]?.verifiedAt;
                const verifiedDate = verifiedAt ? new Date(verifiedAt).toISOString().split('T')[0] : "";
                const score = candidate.verifiedSkills?.[skill]?.score;

                return (
                  <div key={index} className="p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-[#064E3B]" />
                        <h3 className="text-[18px] font-serif text-[#1C1917] font-medium">
                          {skill}
                        </h3>
                      </div>
                      <div>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#064E3B] text-white text-[11px] font-mono font-medium rounded shadow-xs">
                            ✓ VERIFIED {score ? `[${score}%]` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-white text-[#78716C] border border-[#E7E2DA] text-[11px] font-mono rounded">
                            SELF-DECLARED
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[13px] text-[#525252] font-sans leading-relaxed mb-4">
                      {isVerified 
                        ? `Demonstrated architectural competency and code correctness in timed proctored assessment on ${verifiedDate}.`
                        : "Candidate self-declared claim. Supported by linked technical repository evidence below."}
                    </p>
                    
                    {/* Primary Evidence Artifact */}
                    {projectEvidence && (
                      <div className="p-3.5 bg-white border border-[#E7E2DA] rounded">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <span className="text-[13px] font-sans font-medium text-[#1C1917]">{projectEvidence.title}</span>
                          {projectEvidence.repoUrl && (
                            <a 
                              href={projectEvidence.repoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] font-mono text-[#064E3B] hover:underline shrink-0 font-medium"
                            >
                              Inspect Repository ↗
                            </a>
                          )}
                        </div>
                        {projectEvidence.description && (
                          <p className="text-[12px] text-[#78716C] font-sans leading-relaxed">
                            {projectEvidence.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Standard of Technical Verification Box */}
            <div className="p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064E3B]/10 backdrop-blur-md border border-[#064E3B]/20 text-[#064E3B] text-[11px] font-mono font-medium rounded-full mb-3 shadow-[0_2px_8px_rgba(6,78,59,0.08)]">
                <Shield className="h-3 w-3 text-[#064E3B]" />
                <span>STANDARD OF TECHNICAL VERIFICATION</span>
              </div>
              <p className="text-[12.5px] text-[#525252] font-sans leading-relaxed">
                Meritlane verifies technical skill through evaluated challenge environments and code audits. This public record is maintained under cryptographic custody and represents validated evaluation marks on the date signed.
              </p>
            </div>
          </article>
        </div>
      </main>

    </div>
  );
}

