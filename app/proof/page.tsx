import React from "react";
import { User, CheckCircle2, FileText, Code, Clock } from "lucide-react";
import Link from "next/link";

export default function ProofCanvasPage() {
  return (
    <div className="min-h-screen bg-surface text-foreground font-sans selection:bg-emerald-900 selection:text-white">
      {/* Top Nav */}
      <header className="flex h-[72px] sm:h-[80px] items-center justify-between px-6 sm:px-12 border-b border-border bg-white">
        <Link href="/" className="font-sans text-[22px] sm:text-[24px] font-semibold tracking-tight text-foreground flex items-center gap-2">
          <img src="/logo-m.png" alt="Meritlane" className="h-6 w-auto" />
          <span>Meritlane</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/employer/dashboard" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Candidate Directory
          </Link>
          <Link href="/signup" className="text-[13px] font-medium text-emerald-900 hover:text-emerald-950 transition-colors">
            Get Evaluated
          </Link>
        </nav>

        <Link href="/login" className="h-9 px-4 rounded border border-border flex items-center justify-center text-[12px] font-medium text-foreground hover:bg-surface transition-all cursor-pointer bg-white">
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-10 sm:py-14 flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        {/* Left Column */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-8">
          <div className="p-6 bg-white border border-border rounded">
            <h1 className="font-sans text-[32px] font-semibold tracking-tight text-foreground mb-2">Elena Rostova</h1>
            <div className="text-[13px] text-muted-foreground font-sans mb-4">Senior Systems Engineer</div>
            <div className="border-t border-border pt-3 text-[12px] font-mono text-muted-foreground">
              Record: #ER-9042
            </div>
          </div>

          <div className="p-6 bg-white border border-border rounded">
            <h2 className="text-[11px] font-sans font-medium uppercase tracking-wide text-muted-foreground mb-4">Evaluated Competencies</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-[13px] font-medium text-foreground">Distributed Systems</span>
                <span className="text-[11px] font-mono font-medium text-emerald-900 bg-emerald-900/10 px-2 py-0.5 rounded">Verified [94%]</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-[13px] font-medium text-foreground">Rust</span>
                <span className="text-[11px] font-mono font-medium text-emerald-900 bg-emerald-900/10 px-2 py-0.5 rounded">Verified [88%]</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] font-medium text-foreground">High-Throughput IO</span>
                <span className="text-[11px] font-mono font-medium text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded">Claimed</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-border rounded">
            <h2 className="text-[11px] font-sans font-medium uppercase tracking-wide text-muted-foreground mb-4">Technical Repositories</h2>
            <div className="space-y-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center text-[13px] text-emerald-900 hover:underline gap-2">
                <Code className="h-4 w-4 shrink-0" />
                <span>github.com/erostova</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Timeline */}
        <div className="flex-1 space-y-8">
          <div className="p-6 sm:p-8 bg-white border border-border rounded">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-semibold text-emerald-900 bg-emerald-900/10 px-2.5 py-1 rounded border border-emerald-900/20">
                ✓ AUDITED PROJECT ARTIFACT
              </span>
              <span className="text-[12px] font-mono text-muted-foreground">2023 – Present</span>
            </div>

            <h3 className="text-[22px] font-sans font-semibold text-foreground mb-3">
              Project: Aegis Distributed Storage Engine
            </h3>

            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              Designed and implemented a distributed log storage engine reducing replication latency by 40%. Authored technical architecture specs and led a team of 5 engineers through production rollout.
            </p>

            <div className="p-4 bg-surface border border-border rounded flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-900" />
                <span className="text-[12px] font-sans font-medium text-emerald-900">Code correctness &amp; architecture audited</span>
              </div>
              <span className="text-[12px] font-mono text-muted-foreground">Evaluator: Meritlane Board</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white border border-border rounded">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono font-semibold text-emerald-900 bg-emerald-900/10 px-2.5 py-1 rounded border border-emerald-900/20">
                ✓ AUDITED PROJECT ARTIFACT
              </span>
              <span className="text-[12px] font-mono text-muted-foreground">2021 – 2023</span>
            </div>

            <h3 className="text-[22px] font-sans font-semibold text-foreground mb-3">
              Core Infrastructure V2
            </h3>

            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              Migrated legacy monolithic architecture to highly available microservices using Rust. Improved system throughput by 3x.
            </p>

            <div className="p-4 bg-surface border border-border rounded flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-900" />
                <span className="text-[12px] font-sans font-medium text-emerald-900">Benchmarked performance verified</span>
              </div>
              <span className="text-[12px] font-mono text-muted-foreground">Evaluator: Meritlane Board</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
