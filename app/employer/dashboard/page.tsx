"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Command, Settings, HelpCircle, FileText, Activity, ShieldCheck, CheckCircle2, FileCheck, Code, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const { user, loading, handleSignOut } = useAuth();
  const router = useRouter();
  const avatarUrl = user?.photoURL || "";

  if (loading) {
    return <div className="min-h-[100dvh] bg-[#121315] flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin"></div></div>;
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[#121315] text-[#e3e2e5] font-sans overflow-hidden flex-col lg:flex-row">
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-start justify-between px-6 pt-10 pb-6 border-b border-[#272a2f]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-1">Proof Review Desk</div>
          <h1 className="font-serif text-[28px] text-white leading-tight mb-1">Meritlane</h1>
        </div>
        <div className="h-10 w-10 rounded-full border border-[#444846] flex items-center justify-center shrink-0">
          {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover grayscale" /> : <Command className="h-5 w-5 text-[#8e928f]" />}
        </div>
      </header>

      {/* LEFT SIDEBAR */}
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
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] transition-colors group">
            <FileText className="mr-4 h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
            Evidence
          </a>
          <div className="flex items-center px-3 py-2.5 text-[13px] text-white bg-[#1b1c1e] rounded-sm border border-[#272a2f]">
            <Command className="mr-4 h-[18px] w-[18px]" />
            Provenance
          </div>
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] transition-colors group">
            <ShieldCheck className="mr-4 h-[18px] w-[18px] opacity-70 group-hover:opacity-100" />
            Verification
          </a>
        </nav>

        <div className="px-5 py-6">
          <button className="w-full text-left text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-[#8e928f] hover:text-[#c4c7c5] bg-[#1b1c1e] py-3 px-4 border border-[#272a2f] transition-colors rounded-sm">
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
      <main className="flex-1 flex flex-col min-w-0 bg-[#121315] pb-[70px] lg:pb-0">
        
        {/* TOP NAVBAR */}
        <header className="hidden lg:flex h-20 shrink-0 items-center justify-between px-10 border-b border-[#272a2f] bg-[#121315]">
          <div className="flex items-center gap-10">
            <div className="font-serif text-[24px] text-white">Meritlane</div>
            <nav className="flex items-center gap-10">
              <Link href="#" className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Dashboard</Link>
              <div className="text-[14px] text-white border-b border-white h-20 flex items-center">Workspaces</div>
              <Link href="#" className="text-[14px] text-[#8e928f] hover:text-white transition-colors">Archives</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6 text-[#8e928f]">
            <Bell className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <Command className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
            <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] flex items-center justify-center ml-2 overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" onClick={handleSignOut}>
              {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : <span className="font-mono text-[#8e928f]">A</span>}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          
          {/* COLUMN 1 & 2: PROOF REVIEW DESK */}
          <div className="flex-1 p-6 lg:p-10 xl:p-12 overflow-y-auto">
            
            <div className="mb-12">
              <h2 className="font-serif text-[40px] text-white mb-2 leading-tight">Proof Review Desk</h2>
              <div className="text-[14px] text-[#8e928f]">Inspecting Senior Systems Engineer Candidates.</div>
            </div>

            <div className="space-y-6">
              
              {/* Candidate 1 (Expanded) */}
              <div className="border border-[#272a2f] rounded-xl bg-[#121315] p-8 lg:p-10">
                
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-[#1b1c1e] border border-[#444846] flex items-center justify-center text-white font-serif text-[20px]">
                      ER
                    </div>
                    <div>
                      <div className="font-serif text-[28px] text-white leading-tight">E. Rostova</div>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-[#c4c7c5]" />
                        <span className="font-mono text-[10px] text-[#8e928f] uppercase tracking-wider">UID: 0x9f8b...3a21</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#c0c1ff] mb-1">Match Confidence</div>
                    <div className="text-[16px] text-white font-medium">94% Verified</div>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Skill 1 */}
                  <div>
                    <h3 className="font-serif text-[28px] text-white mb-6 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-white ring-4 ring-[#1b1c1e]" />
                      Rust Architecture
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-[#272a2f] bg-[#121315] p-6 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f]">Source: Github</span>
                          <Code className="h-4 w-4 text-[#8e928f]" />
                        </div>
                        <p className="text-[14px] text-white leading-relaxed mb-6">
                          Lead architect for high-throughput messaging queue. 100k+ TPS.
                        </p>
                        <div className="border-t border-[#272a2f] pt-4 flex gap-8">
                          <div>
                            <div className="text-[10px] font-mono text-[#444846]">Commits:</div>
                            <div className="text-[12px] font-mono text-[#8e928f]">4,210</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-[#444846]">Verified:</div>
                            <div className="text-[12px] font-mono text-[#8e928f]">2023-10</div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#272a2f] bg-[#121315] p-6 rounded-md">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f]">Source: Peer Assessment</span>
                          <Users className="h-4 w-4 text-[#8e928f]" />
                        </div>
                        <p className="font-serif text-[24px] text-white italic leading-snug mb-6">
                          "Exceptional grasp of memory safety and concurrency models."
                        </p>
                        <div className="border-t border-[#272a2f] pt-4 flex justify-between">
                          <div className="text-[10px] font-mono text-[#444846] max-w-[100px]">By: Senior Eng @ Stripe</div>
                          <div className="text-[10px] font-mono text-[#444846] max-w-[60px]">Weight: High</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill 2 */}
                  <div>
                    <h3 className="font-serif text-[28px] text-white mb-6 flex items-center gap-3">
                      <span className="h-2 w-2 border border-[#8e928f] bg-transparent ring-4 ring-[#1b1c1e]" />
                      Applied Cryptography
                    </h3>
                    
                    <div className="border border-[#272a2f] bg-[#121315] p-6 rounded-md">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f]">Source: Audit Report</span>
                        <FileCheck className="h-4 w-4 text-[#8e928f]" />
                      </div>
                      <p className="text-[14px] text-white leading-relaxed mb-6 max-w-2xl">
                        Implemented custom ZK-SNARK circuits for privacy layer. Passed Trail of Bits audit with 0 critical findings.
                      </p>
                      <div className="border-t border-[#272a2f] pt-4">
                        <a href="#" className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#444846] hover:text-white transition-colors flex items-center gap-2">
                          <Command className="h-3 w-3" /> View IPFS Record
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Candidate 2 (Collapsed) */}
              <div className="border border-[#272a2f] rounded-xl bg-[#121315] p-6 flex items-center justify-between cursor-pointer hover:border-[#444846] transition-colors">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-[#1b1c1e] border border-[#444846] flex items-center justify-center text-[#8e928f] font-serif text-[18px]">
                    JD
                  </div>
                  <div>
                    <div className="font-serif text-[18px] text-[#c4c7c5] leading-tight">J. Doe</div>
                    <div className="font-mono text-[10px] text-[#8e928f] mt-1">Pending verification</div>
                  </div>
                </div>
                <div className="text-[#8e928f]">
                  <Command className="h-5 w-5 opacity-50 rotate-180" />
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: DECISION DESK */}
          <div className="xl:w-[320px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#272a2f] bg-[#121315] p-10 overflow-y-auto">
            
            <div className="mb-12">
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#8e928f] mb-6">Requirement Coverage</h3>
              
              <div className="relative mb-3">
                <div className="h-px bg-[#444846] w-full relative">
                  {/* Ticks */}
                  <div className="absolute left-0 -top-1.5 h-3 w-px bg-white" />
                  <div className="absolute left-1/3 -top-1.5 h-3 w-px bg-[#8e928f]" />
                  <div className="absolute left-[95%] -top-1.5 h-3 w-px bg-[#272a2f]" />
                  
                  {/* Progress Line */}
                  <div className="absolute left-0 top-0 h-px bg-white w-2/3" />
                </div>
                <div className="flex justify-between text-[10px] font-mono mt-3">
                  <span className="text-white">Rust</span>
                  <span className="text-white">Crypto</span>
                  <span className="text-[#8e928f]">Go</span>
                </div>
              </div>

              <div className="text-right text-[12px] text-white">
                2/3 Verified
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-white text-[#121315] py-4 text-[13px] font-medium transition-colors hover:bg-[#e3e2e5]">
                Shortlist Candidate
              </button>
              
              <button className="w-full border border-[#272a2f] text-white py-4 text-[12px] flex items-center justify-center gap-2 hover:bg-[#1b1c1e] transition-colors">
                <FileText className="h-4 w-4 text-[#8e928f]" />
                Request More Proof
              </button>
            </div>

          </div>

        </div>
      </main>
      
    </div>
  );
}
