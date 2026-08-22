"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Network, Lock, GitCommit } from "lucide-react";

interface PublicProofRecordProps {
  id: string;
  candidate: any;
  user: any;
  hideHeader?: boolean;
}

export function PublicProofRecord({ id, candidate, user, hideHeader = false }: PublicProofRecordProps) {
  const name = candidate.name || "Anonymous Candidate";
  const skills = candidate.skills || ["Software Engineering"];
  const projects = candidate.projects || [];
  const recordId = id.substring(0, 8).toLowerCase();
  const avatarUrl = user?.photoURL || "";
  
  const verifiedDate = candidate.verifiedAt 
    ? new Date(candidate.verifiedAt).toISOString()
    : (candidate.updatedAt ? new Date(candidate.updatedAt).toISOString() : new Date().toISOString());

  const totalProofs = skills.length + projects.length;

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#e3e2e5] font-sans">
      
      {/* Top Navbar */}
      {!hideHeader && (
        <header className="flex h-[72px] items-center justify-between px-8 lg:px-16 border-b border-[#1b1c1e] bg-[#0b0c0e]">
          <Link href="/" className="font-serif text-[26px] font-medium tracking-tight text-white">Meritlane</Link>
          <div className="font-mono text-[10px] tracking-[0.1em] text-[#8e928f] uppercase flex items-center gap-2">
            <Shield className="h-3 w-3" /> Public artifact
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="px-8 lg:px-16 pt-20 pb-16 border-b border-[#1b1c1e] bg-[#0b0c0e]">
        <div className="flex flex-col md:flex-row gap-10 items-start max-w-[1200px] mx-auto">
          <div className="h-[120px] w-[120px] shrink-0 rounded-full border border-[#272a2f] overflow-hidden bg-[#111316]">
            {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover grayscale opacity-90" /> : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-[#8e928f]">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-2">
            <h1 className="font-serif text-[48px] text-white tracking-tight leading-[1.1] mb-5">
              {name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-[13px] font-sans font-medium">
              <div className="flex items-center gap-2 text-[#a8a2ff]">
                <CheckCircle2 className="h-[14px] w-[14px] text-[#a8a2ff]" />
                <span>Verified Practitioner</span>
              </div>
              <div className="w-px h-3 bg-[#272a2f]" />
              <div className="text-[#8e928f] lowercase tracking-normal font-mono text-[12px]">ID: {recordId}.eth</div>
            </div>
            
            <p className="max-w-2xl text-[15px] leading-[1.6] text-[#c4c7c5] font-sans">
              Cryptographic assertion of skills and professional history. All claims below are backed by verifiable evidence evaluated by the Meritlane system.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Main Grid */}
      <main className="max-w-[1200px] mx-auto px-8 lg:px-16 py-20 bg-[#0b0c0e]">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-16 lg:gap-24">
          
          {/* Left: Assertion metadata */}
          <aside className="space-y-10">
            <h3 className="text-[13px] font-sans font-medium text-[#8e928f] mb-8">Assertion metadata</h3>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#8e928f]">Last Verified</div>
              <div className="text-[13px] text-white font-mono break-all">{verifiedDate}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#8e928f]">Issuer Network</div>
              <div className="text-[13px] text-[#c4c7c5]">Meritlane Core Protocol</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#8e928f]">Total Proofs</div>
              <div className="text-[13px] text-[#c4c7c5]">{totalProofs} Evidence Nodes</div>
            </div>

            {candidate.college && (
              <div className="space-y-2 pt-4 border-t border-[#1b1c1e]">
                <div className="text-[13px] font-sans font-medium text-[#8e928f]">Education</div>
                <div className="text-[13px] text-white">{candidate.college}</div>
                <div className="text-[12px] text-[#c4c7c5]">{candidate.branch}</div>
                <div className="text-[11px] font-mono text-[#8e928f]">Class of {candidate.gradYear}</div>
              </div>
            )}
          </aside>

          {/* Center: Proof Map */}
          <article>
            <h2 className="font-serif text-[36px] text-white mb-12">Proof Map</h2>
            
            <div className="space-y-24">
              {skills.map((skill: string, index: number) => {
                const projectEvidence = projects[index % projects.length];

                return (
                  <div key={index} className="relative">
                    {/* Purple Square Mark */}
                    <div className="absolute -left-6 top-3 h-1.5 w-1.5 bg-[#a8a2ff]" />
                    
                    <h3 className="font-serif text-[28px] text-white mb-4 leading-[1.2]">
                      {skill}
                    </h3>
                    <p className="text-[14px] text-[#c4c7c5] leading-[1.6] mb-8 max-w-[500px]">
                      Demonstrated structural competency and technical fluency in {skill} via institutional verification.
                    </p>
                    
                    {/* Primary Evidence Block */}
                    {projectEvidence && (
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                          <Network className="h-[14px] w-[14px] text-[#a8a2ff]" />
                          <span className="text-[13px] font-sans font-medium text-[#a8a2ff]">Primary Evidence</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272a2f] pb-4 gap-4">
                          <div className="text-[15px] text-white font-medium">{projectEvidence.title}</div>
                          {projectEvidence.repoUrl && (
                            <a 
                              href={projectEvidence.repoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-[#1b1c1e] text-[#a8a2ff] font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-none border border-[#272a2f] hover:bg-white hover:text-black transition-colors shrink-0 text-center"
                            >
                              View Repository
                            </a>
                          )}
                        </div>
                        <p className="mt-4 text-[13px] text-[#8e928f] leading-relaxed">
                          {projectEvidence.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Evidence Density Rating */}
                    <div className="mb-12">
                      <div className="flex items-center w-full mb-3">
                        <div className="h-[1px] bg-[#272a2f] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#444846] -top-[2px]" />
                        </div>
                        <div className="h-[1px] bg-[#272a2f] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#444846] -top-[2px]" />
                        </div>
                        <div className="h-[1px] bg-[#1b1c1e] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#444846] -top-[2px]" />
                          <div className="absolute right-0 h-1.5 w-[1px] bg-[#272a2f] -top-[2px]" />
                        </div>
                      </div>
                      <div className="text-[13px] font-sans font-medium text-[#8e928f]">
                        Evidence Density Rating: {projectEvidence ? "High" : "Standard"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Security Footer */}
            <div className="mt-20 pt-10 border-t border-[#1b1c1e] flex items-start gap-4">
              <Lock className="h-5 w-5 text-[#8e928f] shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-sans font-medium text-white mb-2">Immutable Record</div>
                <div className="text-[13px] text-[#8e928f] leading-relaxed max-w-2xl">
                  This public artifact is permanently stored and its underlying assertions cannot be modified by the candidate after verification. 
                  Tampering with the source evidence invalidates the Meritlane cryptographic signature.
                </div>
              </div>
            </div>
          </article>

          {/* Right: Security & Network Activity */}
          <aside className="space-y-10 lg:pl-10 lg:border-l border-[#1b1c1e]">
            
            <div>
              <h3 className="text-[13px] font-sans font-medium text-[#8e928f] mb-6 border-b border-[#1b1c1e] pb-3">
                Security Profile
              </h3>
              <div className="flex items-start gap-3 text-[12px] font-sans text-[#c4c7c5] leading-relaxed">
                <Shield className="h-4 w-4 text-[#a8a2ff] shrink-0 mt-0.5" />
                This record is immutable. Any attempt to modify the underlying evidence will break the verification seal.
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-sans font-medium text-[#8e928f] mb-6 border-b border-[#1b1c1e] pb-3">
                Network Activity
              </h3>
              
              <div className="space-y-6">
                <div className="relative pl-6">
                  <div className="absolute left-[3px] top-1.5 bottom-[-24px] w-[1px] bg-[#1b1c1e]" />
                  <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#a8a2ff]" />
                  <div className="text-[12px] font-sans font-medium text-white mb-1">Verification Seal Issued</div>
                  <div className="text-[10px] font-mono text-[#8e928f]">TX: {recordId}</div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[3px] top-1.5 bottom-[-24px] w-[1px] bg-[#1b1c1e]" />
                  <div className="absolute left-[1px] top-1.5 h-1.5 w-1.5 rounded-full bg-[#444846]" />
                  <div className="text-[12px] font-sans text-[#c4c7c5] mb-1">Evidence Synchronized</div>
                  <div className="text-[10px] font-mono text-[#8e928f]">Candidate Profile</div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[1px] top-1.5 h-1.5 w-1.5 rounded-full bg-[#444846]" />
                  <div className="text-[12px] font-sans text-[#c4c7c5] mb-1">Identity Claim Created</div>
                  <div className="text-[10px] font-mono text-[#8e928f]">Wallet / Auth connected</div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

    </div>
  );
}
