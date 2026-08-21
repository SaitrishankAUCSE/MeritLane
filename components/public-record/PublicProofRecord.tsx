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
      <header className="flex h-[72px] items-center justify-between px-8 lg:px-16 border-b border-[#1b1c1e] bg-[#0b0c0e]">
        <Link href="/" className="font-serif text-[26px] font-medium tracking-tight text-white">Meritlane</Link>
        <div className="font-mono text-[10px] tracking-[0.1em] text-[#8e928f] uppercase">
          Public Artifact
        </div>
      </header>

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
            
            <div className="flex items-center gap-4 mb-6 text-[11px] font-mono tracking-[0.1em] uppercase">
              <div className="flex items-center gap-2 text-[#c4c7c5]">
                <CheckCircle2 className="h-[14px] w-[14px] text-[#c0c1ff]" />
                <span>Verified Practitioner</span>
              </div>
              <div className="w-px h-3 bg-[#272a2f]" />
              <div className="text-[#8e928f] lowercase tracking-normal font-mono text-[12px]">ID: {name.toLowerCase().replace(/\s+/g, '.')}.eth</div>
            </div>
            
            <p className="max-w-2xl text-[15px] leading-[1.6] text-[#c4c7c5] font-sans">
              Cryptographic assertion of skills and professional history. All claims below are backed by verifiable on-chain or institutional evidence.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Main Grid */}
      <main className="max-w-[1200px] mx-auto px-8 lg:px-16 py-20 bg-[#0b0c0e]">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-16 lg:gap-24">
          
          {/* Left: Assertion Meta */}
          <aside className="space-y-10">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-8">Assertion Meta</h3>
            
            <div className="space-y-2">
              <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Last Verified</div>
              <div className="text-[13px] text-white font-mono">2023-10-27T14:32:00Z</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Issuer Network</div>
              <div className="text-[13px] text-[#c4c7c5]">Meritlane Core Protocol</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Total Proofs</div>
              <div className="text-[13px] text-[#c4c7c5]">47 Verified Nodes</div>
            </div>
          </aside>

          {/* Center: Proof Map */}
          <article>
            <h2 className="font-serif text-[36px] text-white mb-12">Proof Map</h2>
            
            <div className="space-y-24">
              
              {/* Skill 1 */}
              <div className="relative">
                {/* Purple Square Mark */}
                <div className="absolute -left-6 top-3 h-1.5 w-1.5 bg-[#c0c1ff]" />
                
                <h3 className="font-serif text-[28px] text-white mb-4 leading-[1.2]">
                  Distributed Systems<br />Architecture
                </h3>
                <p className="text-[14px] text-[#c4c7c5] leading-[1.6] mb-8 max-w-[500px]">
                  Demonstrated ability to design and implement resilient, fault-tolerant distributed networks under high load conditions.
                </p>
                
                {/* Primary Evidence Block */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="h-[14px] w-[14px] text-[#c0c1ff]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff]">Primary Evidence</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#272a2f] pb-4">
                    <div className="text-[15px] text-white font-medium">Scalability Overhaul - {candidate.projects?.[0]?.title || 'Project X'}</div>
                    <div className="bg-[#1b1c1e] text-[#c0c1ff] font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-none border border-[#272a2f]">
                      99.9% UPTIME
                    </div>
                  </div>
                </div>
                
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
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#8e928f]">Evidence Density Rating: High</div>
                </div>
              </div>

              {/* Skill 2 */}
              <div className="relative">
                {/* Purple Square Mark */}
                <div className="absolute -left-6 top-3 h-1.5 w-1.5 bg-[#c0c1ff]" />
                
                <h3 className="font-serif text-[28px] text-white mb-4 leading-[1.2]">
                  Cryptographic Engineering
                </h3>
                <p className="text-[14px] text-[#c4c7c5] leading-[1.6] mb-8 max-w-[500px]">
                  Implementation of zero-knowledge proof circuits and secure key management systems.
                </p>
                
                {/* Source Assertion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="h-[14px] w-[14px] text-[#c0c1ff]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff]">Source Assertion</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#8e928f]">Repo</div>
                    <div className="text-[13px] text-white font-mono">github.com/{name.toLowerCase().replace(/\s+/g, '')}/zk-core</div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-baseline">
                    <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#8e928f]">Audit</div>
                    <div className="text-[13px] text-[#e3e2e5]">Trail of Bits (Passed w/ 0 High)</div>
                  </div>
                </div>
              </div>

            </div>
          </article>

          {/* Right: Verification Log */}
          <aside className="pl-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-12">Verification Log</h3>
            
            <div className="space-y-10">
              <div className="relative">
                <div className="absolute -left-[20px] top-[6px] h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-transparent" />
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Node Auth</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2 font-medium">GitHub Identity Verified</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-10-27T14:32:00Z</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[20px] top-[6px] h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-transparent" />
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Peer Assertion</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2 font-medium">Skill endorsed by @elara_tech</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-09-15T09:12:44Z</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[20px] top-[6px] h-1.5 w-1.5 rounded-full border border-[#c0c1ff] bg-transparent" />
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Data Integrity</div>
                <div className="text-[13px] text-[#e3e2e5] mb-2 font-medium">Commit History Synchronized</div>
                <div className="font-mono text-[9px] text-[#8e928f]">2023-08-01T11:00:21Z</div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
