import React from "react";
import { User, CheckCircle2, FileText, Code, Clock } from "lucide-react";
import Link from "next/link";

export default function ProofCanvasPage() {
  return (
    <div className="min-h-screen bg-[#111214] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#0D0D0D]">
      {/* Top Nav */}
      <header className="flex h-[100px] items-center justify-between px-12 border-b border-[#E5E5E5]/50">
        <div className="font-serif text-[32px] font-medium tracking-tight text-[#0D0D0D]">
          Meritlane
        </div>
        
        <nav className="flex items-center gap-14 mr-20">
          <div className="flex flex-col relative group cursor-pointer">
            <span className="text-[13px] font-medium text-[#0D0D0D] leading-tight">Proof</span>
            <span className="text-[13px] font-medium text-[#0D0D0D] leading-tight">Canvas</span>
            <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#0D0D0D]" />
          </div>
          <span className="text-[14px] text-[#737373]/50 cursor-not-allowed" title="Coming soon">Discovery</span>
          <span className="text-[14px] text-[#737373]/50 cursor-not-allowed" title="Coming soon">Archives</span>
        </nav>

        <div className="h-9 w-9 rounded-full border border-[#D2D2D2] flex items-center justify-center text-[#737373] hover:text-[#0D0D0D] hover:border-[#0D0D0D] transition-all cursor-pointer bg-[#F3F3F1]">
          <User className="h-4 w-4" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-12 py-16 flex gap-24">
        
        {/* Left Column (Sticky-ish) */}
        <div className="w-[320px] shrink-0">
          <div className="mb-14">
            <h1 className="font-serif text-[52px] leading-none mb-6">Elena Rostova</h1>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">ID:</div>
                <div className="font-mono text-[13px] text-[#0D0D0D]">0x7F...3B9A</div>
              </div>
              <div className="w-px h-8 bg-[#E5E5E5]" />
              <div className="w-[140px]">
                <div className="text-[13px] text-[#737373] font-medium leading-snug">Senior Systems<br/>Engineer</div>
              </div>
            </div>
          </div>

          <div className="mb-14">
            <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#666666] mb-6">Core Competencies</h2>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5]">
                <span className="text-[15px] font-medium">Distributed Systems</span>
                <span className="font-mono text-[12px] text-[#15803D]">L4</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5]">
                <span className="text-[15px] font-medium">Rust</span>
                <span className="font-mono text-[12px] text-[#15803D]">L3</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5]">
                <span className="text-[15px] font-medium">Cryptography</span>
                <span className="font-mono text-[12px] text-[#A16207]">L2</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#666666] mb-6">Artifacts</h2>
            <div className="space-y-0">
              <div className="flex items-center py-4 border-b border-[#E5E5E5]">
                <FileText className="h-4 w-4 text-[#737373] mr-4" />
                <span className="font-mono text-[13px] text-[#737373]">thesis_final.pdf</span>
              </div>
              <div className="flex items-center py-4 border-b border-[#E5E5E5]">
                <Code className="h-4 w-4 text-[#737373] mr-4" />
                <span className="font-mono text-[13px] text-[#737373]">github.com/erostova</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Timeline) */}
        <div className="flex-1 relative pb-32">
          {/* Top Button */}
          <div className="absolute right-0 top-0">
            <button className="border border-[#D2D2D2] hover:bg-[#F3F3F1] text-[#0D0D0D] hover:text-[#0D0D0D] px-5 py-2.5 text-[10px] font-sans font-bold uppercase tracking-[0.15em] transition-colors rounded-sm flex items-center gap-2">
              <span className="font-mono text-[12px] font-medium">[+]</span> VERIFY OBJECT
            </button>
          </div>

          <div className="pt-24 pl-8">
            
            {/* Timeline Item 1 */}
            <div className="relative mb-24">
              {/* Vertical line passing through */}
              <div className="absolute -left-[33px] top-3 bottom-[-96px] w-[2px] bg-[#E5E5E5]" />
              {/* Timeline Dot */}
              <div className="absolute -left-[36px] top-1.5 h-2 w-2 rounded-full bg-[#15803D]" />

              <div className="flex items-center gap-4 mb-4">
                <div className="text-[11px] font-mono text-[#0D0D0D] tracking-widest uppercase">2023 -<br/>Present</div>
                <div className="w-1.5 h-1.5 bg-[#D2D2D2]" />
                <div className="text-[11px] font-sans font-bold text-[#0D0D0D] tracking-[0.15em] uppercase">Lead<br/>Architect</div>
              </div>

              <h3 className="font-serif text-[38px] text-[#0D0D0D] leading-tight mb-5">
                Project: Aegis Consensus Protocol
              </h3>

              <p className="text-[15px] text-[#737373] leading-relaxed max-w-2xl mb-8">
                Designed and implemented a zero-knowledge proof based consensus mechanism reducing latency by 40%. Authored primary whitepaper and led a team of 5 engineers through deployment.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#666666]">Claims:</span>
                <span className="text-[14px] font-medium text-[#0D0D0D]">Distributed Systems</span>
                <span className="text-[14px] font-medium text-[#0D0D0D] ml-4">Cryptography</span>
              </div>

              {/* Verification Block */}
              <div className="border-t border-[#E5E5E5] pt-5 flex items-start gap-12">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  <span className="font-mono text-[12px] text-[#15803D]">Verified</span>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#666666] mb-1">Hash:</div>
                  <div className="font-mono text-[13px] text-[#0D0D0D]">0x9A...2F11</div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#666666] mb-1">Validator:</div>
                  <div className="font-mono text-[13px] text-[#0D0D0D]">Meritlane<br/>Protocol</div>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[36px] top-1.5 h-2 w-2 rounded-full bg-[#A16207]" />

              <div className="flex items-center gap-4 mb-4">
                <div className="text-[11px] font-mono text-[#0D0D0D] tracking-widest uppercase">2021 -<br/>2023</div>
                <div className="w-1.5 h-1.5 bg-[#D2D2D2]" />
                <div className="text-[11px] font-sans font-bold text-[#0D0D0D] tracking-[0.15em] uppercase">Senior<br/>Engineer</div>
              </div>

              <h3 className="font-serif text-[38px] text-[#0D0D0D] leading-tight mb-5">
                Core Infrastructure V2
              </h3>

              <p className="text-[15px] text-[#737373] leading-relaxed max-w-2xl mb-8">
                Migrated legacy monolithic architecture to highly available microservices using Rust. Improved system throughput by 3x.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#666666]">Claims:</span>
                <span className="text-[14px] font-medium text-[#0D0D0D]">Rust</span>
              </div>

              {/* Verification Block */}
              <div className="border-t border-[#E5E5E5] pt-5 flex items-start gap-12">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#A16207]" />
                  <span className="font-mono text-[12px] text-[#A16207]">Under<br/>Review</span>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#666666] mb-1">Hash:</div>
                  <div className="font-mono text-[13px] text-[#0D0D0D]">0x3C...8B90</div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#666666] mb-1">Validator:</div>
                  <div className="font-mono text-[13px] text-[#0D0D0D]">Peer<br/>Network</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
