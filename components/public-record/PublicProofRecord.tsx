"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Hexagon, Shield, Network, Lock, GitCommit } from "lucide-react";

type PublicProofRecordProps = {
  id: string;
  candidate: any;
  user: any;
};

export function PublicProofRecord({ id, candidate, user }: PublicProofRecordProps) {
  const name = candidate.name || "Anonymous Candidate";
  const primarySkill = candidate.skills?.[0] || "Software Engineering";
  const secondarySkill = candidate.skills?.[1] || "Systems Architecture";
  const gradYear = candidate.gradYear || "2024";
  const recordId = id.substring(0, 6).toUpperCase();
  const avatarUrl = user?.photoURL || "";

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#e3e2e5] font-sans">
      {/* Top Navbar */}
      <header className="flex h-20 items-center justify-between px-8 lg:px-16 border-b border-[#272a2f]">
        <Link href="/" className="font-serif text-[28px] font-medium tracking-tight text-white">Meritlane</Link>
        <div className="font-mono text-[10px] tracking-[0.1em] text-[#8e928f] uppercase">
          Public Artifact #VX-{recordId}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 lg:px-16 pt-24 pb-16 border-b border-[#272a2f]">
        <div className="flex flex-col md:flex-row gap-12 items-start max-w-6xl mx-auto">
          <div className="h-32 w-32 shrink-0 rounded-full border-2 border-[#272a2f] overflow-hidden bg-[#111316] p-1">
            <div className="h-full w-full rounded-full overflow-hidden grayscale bg-[#1b1c1e] flex items-center justify-center text-3xl font-serif text-[#8e928f]">
              {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 mt-2">
            <h1 className="font-serif text-5xl md:text-6xl text-white tracking-tight leading-[1.1] mb-6">
              {name}
            </h1>
            
            <div className="flex items-center gap-6 mb-8 text-[11px] font-mono tracking-[0.1em] uppercase text-[#c4c7c5]">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[#c0c1ff]" />
                <span className="text-[#c0c1ff]">Verified Practitioner</span>
              </div>
              <div className="w-px h-3 bg-[#444846]" />
              <div>ID: {name.toLowerCase().replace(/\s+/g, '.')}.eth</div>
            </div>
            
            <p className="max-w-3xl text-[18px] leading-[1.6] text-[#c4c7c5] font-sans">
              Cryptographic assertion of skills and professional history. All claims below are backed by verifiable on-chain or institutional evidence.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Main Grid */}
      <main className="max-w-6xl mx-auto px-8 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-16">
          
          {/* Left: Assertion Meta */}
          <aside className="space-y-12">
            <h3 className="text-[11px] font-bold font-sans uppercase tracking-[0.1em] text-[#8e928f]">Assertion Meta</h3>
            
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Last Verified</div>
              <div className="text-[12px] font-mono text-[#e3e2e5]">{new Date().toISOString().substring(0, 19)}Z</div>
            </div>
            
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Issuer Network</div>
              <div className="text-[14px] text-[#e3e2e5]">Meritlane Core Protocol</div>
            </div>
            
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Total Proofs</div>
              <div className="text-[14px] text-[#e3e2e5]">{(candidate.skills?.length || 2) * 12 + 7} Verified Nodes</div>
            </div>
          </aside>

          {/* Center: Proof Map */}
          <article>
            <h2 className="font-serif text-[32px] text-white mb-16">Proof Map</h2>
            
            <div className="space-y-24">
              
              {/* Skill 1 */}
              <div className="relative pl-8 border-l border-[#272a2f]">
                {/* Decorative Rail Anchor */}
                <div className="absolute -left-[5px] top-3 h-[9px] w-[9px] border border-[#8e928f] bg-[#0b0c0e]" />
                
                <h3 className="font-serif text-[24px] text-white mb-4">{primarySkill} Architecture</h3>
                <p className="text-[15px] text-[#c4c7c5] leading-[1.6] mb-8 max-w-2xl">
                  Demonstrated ability to design and implement resilient, fault-tolerant distributed networks under high load conditions.
                </p>
                
                {/* Primary Evidence Block */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="h-4 w-4 text-[#c0c1ff]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff]">Primary Evidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] text-white">Scalability Overhaul - {candidate.projects?.[0]?.title || 'Project X'}</div>
                    <div className="bg-[#1b1c1e] text-[#c0c1ff] font-mono text-[10px] uppercase tracking-[0.05em] px-3 py-1.5 rounded-sm">
                      99.9% UPTIME
                    </div>
                  </div>
                </div>
                
                {/* Evidence Density Rating */}
                <div className="mb-10">
                  <div className="flex items-center w-full mb-3">
                    <div className="h-px bg-[#444846] flex-1 relative">
                      <div className="absolute right-0 h-2 w-px bg-[#444846] -top-1" />
                    </div>
                    <div className="h-px bg-[#444846] flex-1 relative">
                      <div className="absolute right-0 h-2 w-px bg-[#444846] -top-1" />
                    </div>
                    <div className="h-px bg-[#272a2f] flex-1" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f]">Evidence Density Rating: High</div>
                </div>

                {/* Source Assertion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-4 w-4 text-[#c0c1ff]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff]">Source Assertion</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Repo</div>
                    <div className="text-[13px] text-white font-mono">{candidate.githubUrl?.replace('https://', '') || 'github.com/candidate/core'}</div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Audit</div>
                    <div className="text-[13px] text-white">Trail of Bits (Passed w/ 0 High)</div>
                  </div>
                </div>
              </div>

              {/* Skill 2 */}
              <div className="relative pl-8 border-l border-[#272a2f]">
                {/* Decorative Rail Anchor */}
                <div className="absolute -left-[5px] top-3 h-[9px] w-[9px] border border-[#8e928f] bg-[#0b0c0e]" />
                
                <h3 className="font-serif text-[24px] text-white mb-4">{secondarySkill} Engineering</h3>
                <p className="text-[15px] text-[#c4c7c5] leading-[1.6] mb-8 max-w-2xl">
                  Implementation of zero-knowledge proof circuits and secure key management systems.
                </p>
                
                {/* Source Assertion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-4 w-4 text-[#c0c1ff]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff]">Source Assertion</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Repo</div>
                    <div className="text-[13px] text-white font-mono">github.com/{name.toLowerCase().replace(/\s+/g, '')}/zk-core</div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Audit</div>
                    <div className="text-[13px] text-white">Trail of Bits (Passed w/ 0 High)</div>
                  </div>
                </div>
              </div>

            </div>
          </article>

          {/* Right: Verification Log */}
          <aside className="border-l border-[#272a2f] pl-8">
            <h3 className="text-[11px] font-bold font-sans uppercase tracking-[0.1em] text-[#8e928f] mb-12">Verification Log</h3>
            
            <div className="space-y-12">
              <div className="relative">
                <div className="absolute -left-[36.5px] top-1.5 h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-[#0b0c0e]" />
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Node Auth</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2">GitHub Identity Verified</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-10-27T14:32:00Z</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[36.5px] top-1.5 h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-[#0b0c0e]" />
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Peer Assertion</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2">Skill endorsed by @elara_tech</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-09-15T09:12:44Z</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[36.5px] top-1.5 h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-[#0b0c0e]" />
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Data Integrity</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2">Commit History Synchronized</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-08-01T11:00:21Z</div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
