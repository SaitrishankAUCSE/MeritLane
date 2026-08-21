"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Search, Bell, Command, Settings, HelpCircle, FileText, Activity, ShieldCheck, Layers, Shield } from "lucide-react";
import Link from "next/link";

export default function CandidateProfilePage() {
  const { user, loading, handleSignOut } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => setProfile(p))
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin"></div></div>;
  }

  const name = profile?.name || user?.displayName?.split(" ")[0] || "Alex Vance";
  const roleTitle = profile?.skills?.[0] ? `${profile.skills[0]} Engineer` : "Systems Architect";
  const primaryDomain = profile?.skills?.[0] || "Distributed Systems";
  const avatarUrl = user?.photoURL || "";

  return (
    <div className="flex h-[100dvh] w-full bg-[#121315] text-[#e3e2e5] font-sans overflow-hidden flex-col lg:flex-row">
      
      {/* MOBILE HEADER (Only on small screens) */}
      <header className="lg:hidden flex items-start justify-between px-6 pt-10 pb-6 border-b border-[#272a2f]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-1">Subject Identity</div>
          <h1 className="font-serif text-[28px] text-white leading-tight mb-1">{name}</h1>
          <div className="text-[13px] text-[#c0c1ff]">{primaryDomain} / {roleTitle}</div>
        </div>
        <div className="h-10 w-10 rounded-full border border-[#444846] flex items-center justify-center shrink-0">
          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover grayscale" /> : <Command className="h-5 w-5 text-[#8e928f]" />}
        </div>
      </header>

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#272a2f] bg-[#121315]">
        <div className="flex h-20 items-center px-6 border-b border-[#272a2f]">
          <div>
            <div className="font-serif text-[22px] font-medium tracking-tight leading-none text-white mb-1">Meritlane</div>
            <div className="font-mono text-[9px] tracking-[0.15em] text-[#8e928f] uppercase">System of Record</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] transition-colors group">
            <Activity className="mr-4 h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
            Identity
          </a>
          <div className="flex items-center px-3 py-2.5 text-[13px] text-white bg-[#1b1c1e] rounded-none border border-[#272a2f]">
            <FileText className="mr-4 h-[18px] w-[18px]" />
            Evidence
          </div>
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] transition-colors group">
            <Command className="mr-4 h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
            Provenance
          </a>
          <a href="/candidate/assessment" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] transition-colors group">
            <ShieldCheck className="mr-4 h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
            Verification
          </a>
        </nav>

        <div className="px-5 py-6">
          <button className="w-full text-left text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-white hover:text-[#c4c7c5] transition-colors">
            [+] Add Evidence
          </button>
        </div>

        <div className="p-4 border-t border-[#272a2f] space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-[13px] text-[#8e928f] hover:text-white transition-colors">
            <Settings className="mr-4 h-[18px] w-[18px]" /> Settings
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-[13px] text-[#8e928f] hover:text-white transition-colors">
            <HelpCircle className="mr-4 h-[18px] w-[18px]" /> Support
          </a>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121315] pb-[70px] lg:pb-0 overflow-y-auto lg:overflow-hidden">
        
        {/* TOP NAVBAR (Desktop) */}
        <header className="hidden lg:flex h-20 shrink-0 items-center justify-between px-10 border-b border-[#272a2f] bg-[#121315]">
          <div className="flex items-center gap-10">
            <nav className="flex items-center gap-10">
              <Link href="/candidate/dashboard" className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Dashboard</Link>
              <div className="text-[14px] text-white border-b border-white h-20 flex items-center">Workspaces</div>
              <Link href={`/p/${user?.uid}`} className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Archives</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6 text-[#8e928f]">
            <Bell className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <Command className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] flex items-center justify-center ml-2 overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" onClick={handleSignOut}>
              {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* 3-COLUMN CONTENT (Desktop uses flex, Mobile just flows) */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          
          {/* COLUMN 1: IDENTITY (Hidden on mobile, since it's in the mobile header) */}
          <div className="hidden xl:flex w-[280px] shrink-0 p-10 flex-col overflow-y-auto">
            <div className="h-[72px] w-[72px] rounded-full border border-[#444846] bg-[#1b1c1e] mb-6 overflow-hidden flex items-center justify-center p-0.5">
               <div className="h-full w-full rounded-full overflow-hidden grayscale bg-[#292a2c]">
                 {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" /> : <span className="font-serif text-2xl text-[#8e928f]">{name.charAt(0)}</span>}
               </div>
            </div>

            <h2 className="font-serif text-[28px] text-white leading-tight mb-1">{name}</h2>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-10">{roleTitle}</div>
            
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-1">Primary Domain</div>
                <div className="text-[13px] text-white">{primaryDomain}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-1">Verified Since</div>
                <div className="text-[13px] font-mono text-white">2021.11.04</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-1">Trust Score</div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-[#c0c1ff]" />
                  <span className="text-[13px] font-mono text-white">0.984</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: PROOF THREADS */}
          <div className="flex-1 lg:border-l lg:border-[#272a2f] p-6 lg:p-10 xl:p-12 lg:overflow-y-auto">
            
            <div className="hidden lg:flex items-center justify-between mb-12">
              <h2 className="text-[16px] font-medium text-white">Proof Threads</h2>
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">Active Assessment</div>
            </div>

            <div className="relative border-l border-[#272a2f] pl-6 lg:pl-8 space-y-12 lg:space-y-16">
              
              {/* Thread 1 */}
              <div className="relative">
                <div className="absolute -left-[29px] lg:-left-[37px] top-1.5 h-2.5 w-2.5 lg:h-[9px] lg:w-[9px] rounded-full bg-white ring-4 ring-[#121315]" />
                
                <div className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Core Competency</div>
                <h3 className="font-serif text-[24px] lg:text-[32px] text-white leading-[1.2] mb-6 lg:mb-8 max-w-2xl">
                  {profile?.skills?.[0] || "Python"} Architecture
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[12px] font-mono text-[#e3e2e5]">
                    <div className="w-8 h-px bg-[#272a2f]" />
                    Source: HackerRank Assessment
                  </div>
                  
                  <div className="mt-4 border border-[#272a2f] p-5 lg:p-6 bg-[#1b1c1e] rounded-none flex items-center justify-between">
                    <div>
                      <div className="text-[14px] text-white mb-1">Advanced Algorithms</div>
                      <div className="text-[10px] font-mono text-[#8e928f] uppercase">ID: HR-8842-PY</div>
                    </div>
                    <div className="font-serif text-[24px] text-white">94%</div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[#c0c1ff]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-[12px] font-mono uppercase tracking-wide">Verified by Meritlane</span>
                  </div>
                </div>
              </div>

              {/* Thread 2 */}
              <div className="relative">
                <div className="absolute -left-[29px] lg:-left-[37px] top-1.5 h-2.5 w-2.5 lg:h-[9px] lg:w-[9px] border-2 border-white bg-transparent ring-4 ring-[#121315] rounded-none" />
                
                <div className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#c0c1ff] mb-2">Practical Application</div>
                <h3 className="font-serif text-[24px] lg:text-[32px] text-white leading-[1.2] mb-6 lg:mb-8 max-w-2xl">
                  Distributed Systems
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[12px] font-mono text-[#e3e2e5]">
                    <div className="w-8 h-px bg-[#272a2f]" />
                    Source: GitHub Commits
                  </div>
                  
                  <div className="mt-4 border border-[#272a2f] p-5 lg:p-6 bg-[#121315] rounded-none">
                    <p className="text-[14px] text-[#c4c7c5] leading-relaxed mb-4">
                      Implemented Paxos consensus algorithm for internal key-value store. Handled network partitions and node failures gracefully.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1b1c1e] text-[#e3e2e5] font-mono text-[10px] px-2 py-1 rounded-none">Golang</span>
                      <span className="bg-[#1b1c1e] text-[#e3e2e5] font-mono text-[10px] px-2 py-1 rounded-none">gRPC</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[#8e928f]">
                    <Command className="h-4 w-4" />
                    <span className="text-[12px] font-mono uppercase tracking-wide">Under Review</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#c0c1ff] hover:text-white transition-colors">
                  + Append Evidence
                </button>
              </div>

            </div>
          </div>

          {/* COLUMN 3: META-DATA (Hidden on mobile) */}
          <div className="hidden xl:block w-[320px] shrink-0 border-l border-[#272a2f] bg-[#121315] p-10 overflow-y-auto">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-6">Evidence Meta-Data</h3>
            
            <div className="space-y-12">
              <div>
                <div className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-2">Cryptographic Hash</div>
                <div className="font-mono text-[11px] text-white break-all">0x7F8B9C2A...D4E1F0A2</div>
              </div>

              <div>
                <div className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-6">Temporal Anchors</div>
                
                <div className="relative border-l border-[#272a2f] pl-4 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-[#c0c1ff] ring-4 ring-[#121315]" />
                    <div className="font-mono text-[11px] text-white mb-1">2023.10.12 14:32 UT</div>
                    <div className="text-[12px] text-[#8e928f]">Source committed</div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full border border-[#8e928f] bg-[#121315] ring-4 ring-[#121315]" />
                    <div className="font-mono text-[11px] text-[#8e928f] mb-1">2023.10.15 09:00 UT</div>
                    <div className="text-[12px] text-[#8e928f]">System ingested</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-[#272a2f]">
                <a href="#" className="text-[13px] font-medium text-white hover:text-[#c0c1ff] transition-colors">
                  View Raw Artifact
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Only visible on small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-[#0b0c0e] border-t border-[#272a2f] flex items-center justify-around z-50">
        <div className="flex flex-col items-center justify-center text-[#c0c1ff]">
          <Layers className="h-5 w-5 mb-1" />
          <span className="text-[11px] font-medium">Canvas</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#8e928f]">
          <Search className="h-5 w-5 mb-1" />
          <span className="text-[11px] font-medium">Explore</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#8e928f]">
          <Command className="h-5 w-5 mb-1" />
          <span className="text-[11px] font-medium">Archive</span>
        </div>
      </nav>
      
    </div>
  );
}
