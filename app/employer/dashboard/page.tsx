"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Command, Settings, HelpCircle, FileText, Activity, ShieldCheck, CheckCircle2, FileCheck, Code, Users, Network, Fingerprint, LayoutDashboard, ChevronDown, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployerDashboardPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#737373] border-t-[#0D0D0D] animate-spin rounded-md"></div></div>;
  }

  return (
    <div className="flex h-full w-full flex-col xl:flex-row overflow-hidden">
      
      {/* COLUMN 1: DISCOVERY FEED */}
      <div className="flex-1 p-10 lg:p-14 lg:overflow-y-auto scrollbar-hide">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 border-b border-[#E5E5E5] pb-4 gap-4">
          <h1 className="font-serif text-[40px] text-[#0D0D0D] leading-tight mb-2">Proof Review Desk</h1>
          <p className="text-[15px] text-[#737373] font-sans">Inspecting Senior Systems Engineer Candidates.</p>
        </div>

        <div className="max-w-[800px] space-y-10">
          
          {/* Candidate 1 (Expanded) */}
          <div className="border border-[#E5E5E5] rounded-md bg-[#FAFAFA] p-10">
            
            <div className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-md bg-[#F3F3F1] border border-[#D2D2D2] flex items-center justify-center text-[#0D0D0D] font-serif text-[24px]">
                  ER
                </div>
                <div>
                  <div className="font-serif text-[28px] text-[#0D0D0D] leading-tight">E. Rostova</div>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#737373]" />
                    <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest">UID: 0x9f8b...3a21</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-[#0D0D0D] mb-2">Match Confidence</div>
                <div className="text-[18px] text-[#0D0D0D] font-sans">94% Verified</div>
              </div>
            </div>

            <div className="space-y-12">
              {/* Skill 1 */}
              <div>
                <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-6 flex items-center gap-4">
                  <span className="h-[6px] w-[6px] rounded-md bg-[#0D0D0D] shrink-0" />
                  Rust Architecture
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#0D0D0D]">Source: Github</span>
                      <span className="font-mono text-[12px] text-[#666666]">{"< >"}</span>
                    </div>
                    <p className="text-[14px] text-[#0D0D0D] leading-relaxed mb-8">
                      Lead architect for high-throughput messaging queue. 100k+ TPS.
                    </p>
                    <div className="border-t border-[#E5E5E5] pt-5 flex gap-10">
                      <div>
                        <div className="text-[10px] font-mono text-[#D2D2D2] mb-1">Commits:</div>
                        <div className="text-[12px] font-mono text-[#666666]">4,210</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#D2D2D2] mb-1">Verified:</div>
                        <div className="text-[12px] font-mono text-[#666666]">2023-10</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#0D0D0D]">Source: Peer Assessment</span>
                      <Users className="h-4 w-4 text-[#737373]" />
                    </div>
                    <p className="font-cormorant text-[26px] text-[#0D0D0D] italic leading-[1.3] mb-8">
                      "Exceptional grasp of memory safety and concurrency models."
                    </p>
                    <div className="border-t border-[#E5E5E5] pt-5 flex justify-between">
                      <div className="text-[10px] font-mono text-[#D2D2D2] max-w-[120px] leading-relaxed">By: Senior Eng @ Stripe</div>
                      <div className="text-[10px] font-mono text-[#D2D2D2] max-w-[60px] leading-relaxed">Weight: High</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill 2 */}
              <div>
                <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-6 flex items-center gap-4">
                  <span className="h-[5px] w-[5px] border border-[#0D0D0D] bg-transparent shrink-0" />
                  Applied Cryptography
                </h3>
                
                <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#0D0D0D]">Source: Audit Report</span>
                    <FileText className="h-4 w-4 text-[#737373]" />
                  </div>
                  <p className="text-[14px] text-[#0D0D0D] leading-relaxed mb-8 max-w-2xl">
                    Implemented custom ZK-SNARK circuits for privacy layer. Passed Trail of Bits audit with 0 critical findings.
                  </p>
                  <div className="border-t border-[#E5E5E5] pt-5">
                    <a href="#" className="text-[14px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors flex items-center gap-3">
                      <LinkIcon className="h-3.5 w-3.5" /> View IPFS record
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Candidate 2 (Collapsed) */}
          <div className="border border-[#E5E5E5] rounded-md bg-[#FAFAFA] p-7 flex items-center justify-between cursor-pointer hover:border-[#D2D2D2] transition-colors">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-md bg-[#F3F3F1] border border-[#D2D2D2] flex items-center justify-center text-[#737373] font-serif text-[22px]">
                JD
              </div>
              <div>
                <div className="font-sans text-[16px] text-[#0D0D0D] font-medium mb-1">J. Doe</div>
                <div className="font-mono text-[11px] text-[#666666]">Pending verification</div>
              </div>
            </div>
            <div className="text-[#737373]">
              <ChevronDown className="h-5 w-5 opacity-70" />
            </div>
          </div>

        </div>
      </div>

      {/* COLUMN 3: DECISION DESK */}
      <div className="xl:w-[360px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#E5E5E5] bg-[#FAFAFA] p-12 overflow-y-auto scrollbar-hide">
        
        <div className="mb-16">
          <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#666666] mb-8">Requirement Coverage</h3>
          
          <div className="relative mb-5">
            <div className="h-px bg-[#E5E5E5] w-full relative">
              {/* Ticks */}
              <div className="absolute left-0 -top-2 h-4 w-px bg-[#0D0D0D]" />
              <div className="absolute left-[45%] -top-2 h-4 w-px bg-[#0D0D0D]" />
              <div className="absolute left-[95%] -top-2 h-4 w-px bg-[#D2D2D2]" />
              
              {/* Progress Line */}
              <div className="absolute left-0 top-0 h-[2px] bg-[#0D0D0D] w-[45%]" />
            </div>
            <div className="flex justify-between text-[11px] font-mono mt-4">
              <span className="text-[#0D0D0D] font-medium">Rust</span>
              <span className="text-[#0D0D0D] font-medium pl-8">Crypto</span>
              <span className="text-[#737373]">Go</span>
            </div>
          </div>

          <div className="text-right text-[13px] text-[#0D0D0D] mt-8">
            2/3 Verified
          </div>
        </div>

        <div className="pt-10 border-t border-[#E5E5E5] space-y-4">
          <button disabled className="w-full bg-[#EAEAE7] text-[#A3A3A3] rounded-md py-2 h-10 px-6 text-[14px] font-sans font-medium cursor-not-allowed transition-colors" title="Coming soon">
            Coming Soon
          </button>
          <button disabled className="w-full bg-transparent border border-[#E5E5E5] text-[#A3A3A3] rounded-md py-2 h-10 px-6 text-[13px] font-sans cursor-not-allowed transition-colors flex items-center justify-center gap-3" title="Coming soon">
            <FileText className="h-4 w-4 opacity-50" /> Coming Soon
          </button>
        </div>

      </div>

    </div>
  );
}

