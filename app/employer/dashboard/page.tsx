"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Command, Settings, HelpCircle, FileText, Activity, ShieldCheck, CheckCircle2, FileCheck, Code, Users, Network, Fingerprint, LayoutDashboard, ChevronDown, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const { user, loading, handleSignOut } = useAuth();
  const router = useRouter();
  const avatarUrl = user?.photoURL || "";

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#0b0c0e] flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans overflow-hidden flex-col lg:flex-row">
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-start justify-between px-6 pt-10 pb-6 border-b border-[#272a2f]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-1">Proof Review Desk</div>
          <h1 className="font-serif text-[28px] text-white leading-tight mb-1">Meritlane</h1>
        </div>
        <div className="h-10 w-10 rounded-full border border-[#444846] flex items-center justify-center shrink-0 overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover grayscale" /> : <Command className="h-5 w-5 text-[#8e928f]" />}
        </div>
      </header>

      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e]">
        <div className="flex h-24 items-center px-8">
          <div>
            <div className="font-serif text-[26px] font-medium tracking-tight text-white mb-1">Meritlane</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#8e928f] uppercase">System of Record</div>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-3 text-[14px] font-sans text-[#8e928f] hover:text-[#f4f4f2] transition-colors">
            <Fingerprint className="mr-4 h-[18px] w-[18px] opacity-70" />
            Identity
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-[14px] font-sans text-[#8e928f] hover:text-[#f4f4f2] transition-colors">
            <LayoutDashboard className="mr-4 h-[18px] w-[18px] opacity-70" />
            Evidence
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-[14px] font-sans text-white bg-[#1b1c1e] rounded-lg border border-[#272a2f]">
            <Network className="mr-4 h-[18px] w-[18px]" />
            Provenance
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-[14px] font-sans text-[#8e928f] hover:text-[#f4f4f2] transition-colors">
            <ShieldCheck className="mr-4 h-[18px] w-[18px] opacity-70" />
            Verification
          </a>
        </nav>

        <div className="px-6 py-6 border-t border-[#272a2f]">
          <button className="flex items-center justify-center gap-2 w-full bg-[#1b1c1e] border border-[#272a2f] rounded-lg py-3 text-[#e3e2e5] hover:text-white transition-colors mb-6">
            <span className="font-mono text-[11px] text-white font-bold">[+]</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add Evidence</span>
          </button>
          
          <div className="space-y-4">
            <a href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
              <Settings className="mr-4 h-[18px] w-[18px] opacity-70" /> Settings
            </a>
            <a href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
              <HelpCircle className="mr-4 h-[18px] w-[18px] opacity-70" /> Support
            </a>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0c0e] pb-[70px] lg:pb-0">
        
        {/* TOP NAVBAR */}
        <header className="hidden lg:flex h-20 shrink-0 items-center justify-between px-12 border-b border-[#272a2f] bg-[#0b0c0e]">
          <div className="flex items-center gap-12 w-full justify-center lg:justify-start lg:pl-12">
            <nav className="flex items-center gap-12 ml-10">
              <Link href="#" className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Dashboard</Link>
              <div className="text-[14px] text-white border-b-2 border-white h-20 flex items-center pt-[2px]">Workspaces</div>
              <Link href="#" className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Archives</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6 text-[#8e928f] pr-4">
            <Bell className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <Network className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] flex items-center justify-center overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" onClick={handleSignOut}>
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <Command className="h-4 w-4" />}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          
          {/* COLUMN 1: FEED */}
          <div className="flex-1 p-10 lg:p-14 lg:overflow-y-auto">
            
            <div className="mb-14">
              <h1 className="font-serif text-[40px] text-white leading-tight mb-2">Proof Review Desk</h1>
              <p className="text-[15px] text-[#c4c7c5] font-sans">Inspecting Senior Systems Engineer Candidates.</p>
            </div>

            <div className="max-w-[800px] space-y-10">
              
              {/* Candidate 1 (Expanded) */}
              <div className="border border-[#272a2f] rounded-2xl bg-[#0b0c0e] p-10">
                
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-[#1b1c1e] border border-[#444846] flex items-center justify-center text-white font-serif text-[24px]">
                      ER
                    </div>
                    <div>
                      <div className="font-serif text-[28px] text-white leading-tight">E. Rostova</div>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#c4c7c5]" />
                        <span className="font-mono text-[10px] text-[#8e928f] uppercase tracking-widest">UID: 0x9f8b...3a21</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white mb-2">Match Confidence</div>
                    <div className="text-[18px] text-white font-sans">94% Verified</div>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Skill 1 */}
                  <div>
                    <h3 className="font-serif text-[28px] text-white mb-6 flex items-center gap-4">
                      <span className="h-[6px] w-[6px] rounded-full bg-white shrink-0" />
                      Rust Architecture
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="border border-[#272a2f] bg-[#111316] p-7 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-white">Source: Github</span>
                          <span className="font-mono text-[12px] text-[#8e928f]">{"< >"}</span>
                        </div>
                        <p className="text-[14px] text-[#e3e2e5] leading-relaxed mb-8">
                          Lead architect for high-throughput messaging queue. 100k+ TPS.
                        </p>
                        <div className="border-t border-[#272a2f] pt-5 flex gap-10">
                          <div>
                            <div className="text-[10px] font-mono text-[#444846] mb-1">Commits:</div>
                            <div className="text-[12px] font-mono text-[#8e928f]">4,210</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-[#444846] mb-1">Verified:</div>
                            <div className="text-[12px] font-mono text-[#8e928f]">2023-10</div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#272a2f] bg-[#111316] p-7 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-white">Source: Peer Assessment</span>
                          <Users className="h-4 w-4 text-[#8e928f]" />
                        </div>
                        <p className="font-serif text-[26px] text-white italic leading-[1.3] mb-8">
                          "Exceptional grasp of memory safety and concurrency models."
                        </p>
                        <div className="border-t border-[#272a2f] pt-5 flex justify-between">
                          <div className="text-[10px] font-mono text-[#444846] max-w-[120px] leading-relaxed">By: Senior Eng @ Stripe</div>
                          <div className="text-[10px] font-mono text-[#444846] max-w-[60px] leading-relaxed">Weight: High</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill 2 */}
                  <div>
                    <h3 className="font-serif text-[28px] text-white mb-6 flex items-center gap-4">
                      <span className="h-[5px] w-[5px] border border-white bg-transparent shrink-0" />
                      Applied Cryptography
                    </h3>
                    
                    <div className="border border-[#272a2f] bg-[#111316] p-7 rounded-xl">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-white">Source: Audit Report</span>
                        <FileText className="h-4 w-4 text-[#8e928f]" />
                      </div>
                      <p className="text-[14px] text-[#e3e2e5] leading-relaxed mb-8 max-w-2xl">
                        Implemented custom ZK-SNARK circuits for privacy layer. Passed Trail of Bits audit with 0 critical findings.
                      </p>
                      <div className="border-t border-[#272a2f] pt-5">
                        <a href="#" className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] hover:text-white transition-colors flex items-center gap-3">
                          <LinkIcon className="h-3.5 w-3.5" /> View IPFS Record
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Candidate 2 (Collapsed) */}
              <div className="border border-[#272a2f] rounded-2xl bg-[#0b0c0e] p-7 flex items-center justify-between cursor-pointer hover:border-[#444846] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-full bg-[#1b1c1e] border border-[#444846] flex items-center justify-center text-[#8e928f] font-serif text-[22px]">
                    JD
                  </div>
                  <div>
                    <div className="font-sans text-[16px] text-[#e3e2e5] font-medium mb-1">J. Doe</div>
                    <div className="font-mono text-[11px] text-[#8e928f]">Pending verification</div>
                  </div>
                </div>
                <div className="text-[#8e928f]">
                  <ChevronDown className="h-5 w-5 opacity-70" />
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: DECISION DESK */}
          <div className="xl:w-[360px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#272a2f] bg-[#0b0c0e] p-12 overflow-y-auto">
            
            <div className="mb-16">
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-8">Requirement Coverage</h3>
              
              <div className="relative mb-5">
                <div className="h-px bg-[#272a2f] w-full relative">
                  {/* Ticks */}
                  <div className="absolute left-0 -top-2 h-4 w-px bg-white" />
                  <div className="absolute left-[45%] -top-2 h-4 w-px bg-white" />
                  <div className="absolute left-[95%] -top-2 h-4 w-px bg-[#444846]" />
                  
                  {/* Progress Line */}
                  <div className="absolute left-0 top-0 h-[2px] bg-white w-[45%]" />
                </div>
                <div className="flex justify-between text-[11px] font-mono mt-4">
                  <span className="text-white font-medium">Rust</span>
                  <span className="text-white font-medium pl-8">Crypto</span>
                  <span className="text-[#8e928f]">Go</span>
                </div>
              </div>

              <div className="text-right text-[13px] text-[#e3e2e5] mt-8">
                2/3 Verified
              </div>
            </div>

            <div className="pt-10 border-t border-[#272a2f] space-y-4">
              <button className="w-full bg-white text-black rounded-lg py-4 px-6 text-[14px] font-sans font-medium hover:bg-[#e3e2e5] transition-colors">
                Shortlist Candidate
              </button>
              <button className="w-full bg-transparent border border-[#272a2f] text-white rounded-lg py-4 px-6 text-[13px] font-sans hover:bg-[#1b1c1e] transition-colors flex items-center justify-center gap-3">
                <FileText className="h-4 w-4" /> Request More Proof
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
