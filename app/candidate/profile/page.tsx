"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ShieldCheck, BarChart } from "lucide-react";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => setProfile(p))
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  const name = profile?.name || user?.displayName?.split(" ")[0] || "Alex Vance";
  const avatarUrl = user?.photoURL || "";
  const roleTitle = profile?.title || "SYSTEMS ARCHITECT";
  const primaryDomain = profile?.skills?.[0] || "Distributed Systems";

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  return (
    <div className="flex h-full w-full flex-col xl:flex-row overflow-hidden">
      
      {/* COLUMN 1: IDENTITY */}
      <div className="hidden xl:flex w-[280px] shrink-0 pt-16 px-10 flex-col overflow-y-auto">
        <div className="h-[80px] w-[80px] rounded-full border border-[#444846] bg-[#111316] mb-8 overflow-hidden flex items-center justify-center">
           <div className="h-full w-full rounded-full overflow-hidden grayscale">
             {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover opacity-80" /> : <span className="font-serif text-2xl text-[#8e928f]">{name.charAt(0)}</span>}
           </div>
        </div>

        <h2 className="font-serif text-[28px] text-white leading-tight mb-2">{name}</h2>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-12">{roleTitle}</div>
        
        <div className="space-y-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-2">Primary Domain</div>
            <div className="text-[14px] text-[#e3e2e5] font-sans">{primaryDomain}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-2">Verified Since</div>
            <div className="text-[13px] font-mono text-[#e3e2e5] font-bold">2021.11.04</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-2">Trust Score</div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a8a2ff]" />
              <span className="text-[13px] font-mono text-[#e3e2e5] font-bold">0.984</span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: PROOF THREADS */}
      <div className="flex-1 p-10 lg:p-16 lg:overflow-y-auto border-l border-[#272a2f]">
        
        <div className="hidden lg:flex items-center justify-between mb-16 border-b border-[#272a2f] pb-4">
          <h2 className="text-[18px] font-serif text-white font-medium">Proof Threads</h2>
          <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Active Assessment</div>
        </div>

        <div className="relative border-l border-[#272a2f] pl-10 space-y-24">
          
          {/* Thread 1 */}
          <div className="relative">
            <div className="absolute -left-[44px] top-1.5 h-2 w-2 rounded-full bg-white" />
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#a8a2ff] mb-4">Claim</div>
            <h3 className="font-serif text-[32px] text-white leading-[1.2] mb-6 max-w-2xl">
              Architected Paxos-based consensus protocol for distributed state management.
            </h3>

            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-2">Source</div>
              <div className="flex items-center gap-3 text-[13px] font-mono text-white font-medium mb-6">
                <span>{"< >"}</span>
                GitHub Repository (Private Auth)
              </div>
              
              <div className="border border-[#272a2f] p-6 bg-[#111316] rounded-none">
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-4">Evidence Excerpt</div>
                <pre className="font-mono text-[12px] text-[#c4c7c5] leading-relaxed whitespace-pre-wrap">
{`commit 8f3a9b21c...
Author: Alex Vance
Date:   Tue Oct 12 14:32:01 2023 -0400

    feat(consensus): implement multi-paxos learner pha

    Resolves distributed lock contention under high pa
    load by batching accept responses.`}
                </pre>
              </div>
            </div>
          </div>

          {/* Thread 2 */}
          <div className="relative">
            <div className="absolute -left-[44px] top-1.5 h-2 w-2 border border-white bg-transparent rounded-none" />
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-4">Claim</div>
            <h3 className="font-serif text-[32px] text-[#8e928f] leading-[1.2] mb-6 max-w-2xl">
              Reduced global latency by 45% through predictive edge caching.
            </h3>

            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-2">Source</div>
              <div className="flex items-center gap-3 text-[13px] font-mono text-[#8e928f] mb-8">
                <BarChart className="h-4 w-4" />
                Datadog APM Export
              </div>
              
              <div className="text-[14px] font-serif italic text-[#8e928f]">
                Awaiting temporal verification from third-party auditor.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* COLUMN 3: META-DATA */}
      <div className="hidden xl:block w-[340px] shrink-0 border-l border-[#272a2f] bg-[#0b0c0e] p-12 overflow-y-auto">
        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-8">Evidence Meta-Data</h3>
        
        <div className="space-y-12">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-3">Cryptographic Hash</div>
            <div className="font-mono text-[12px] text-white break-all">0x7F8B9C2A...D4E1F0A2</div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-6">Temporal Anchors</div>
            
            <div className="relative border-l border-[#272a2f] pl-6 space-y-6">
              <div className="relative">
                <div className="absolute -left-[28.5px] top-1.5 h-[5px] w-[5px] rounded-full bg-[#a8a2ff]" />
                <div className="font-mono text-[12px] text-white font-medium mb-1">2023.10.12 14:32 UT</div>
                <div className="text-[13px] text-[#c4c7c5]">Source committed</div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[28.5px] top-1.5 h-[5px] w-[5px] rounded-full border border-[#8e928f] bg-[#0b0c0e]" />
                <div className="font-mono text-[12px] text-[#8e928f] mb-1">2023.10.15 09:00 UT</div>
                <div className="text-[13px] text-[#8e928f]">System ingested</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#272a2f]">
            <a href="#" className="text-[14px] font-sans font-medium text-white hover:text-[#a8a2ff] transition-colors">
              View Raw Artifact
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
