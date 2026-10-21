"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ArrowRight, Shield, Code, ChevronRight, Lock, 
  Terminal, ShieldCheck, ChevronDown, User, Server, Cpu, Activity, 
  GitBranch, Check, Sparkles, Mail, Laptop, Play, FileCode, ExternalLink,
  Layers, Search, Globe, Flame, LockKeyhole
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const faqs = [
  {
    question: "How does MeritLane help freshers and new graduates get hired?",
    answer: "Most entry-level software postings mandate 1-3 years of prior commercial experience, creating a frustrating catch-22 for freshers. MeritLane replaces arbitrary experience requirements with standardized, proctored Proof of Work. When you score ≥ 75% on our assessments, employers see verifiable evidence that you write clean, production-ready code — allowing you to bypass automated resume filters and land interviews directly."
  },
  {
    question: "Does my college tier, degree branch, or GPA disqualify me?",
    answer: "No. Traditional campus recruitment disproportionately favors elite Tier-1 institutions, silently ignoring exceptional engineers from Tier-2, Tier-3, or regional colleges. MeritLane is strictly meritocratic: our testing sandboxes evaluate only your actual code execution, algorithmic problem-solving, and system correctness. A verified badge from MeritLane holds equal weight regardless of your college pedigree."
  },
  {
    question: "Is MeritLane free for freshers and candidates?",
    answer: "Yes, 100% free forever for candidates. You can create your profile, upload your resume, take proctored assessments, and earn verified credentials without paying any fees. Employers pay to discover and contact verified junior talent."
  },
  {
    question: "What happens after I verify my skills on MeritLane?",
    answer: "Your profile is immediately unlocked in the MeritLane Verified Talent Directory. Employers filter candidates by proven skill scores, review your actual code execution logs, and extend direct interview invitations without putting you through redundant introductory phone screens."
  }
];

const skillTracks = [
  { name: "SQL & Query Optimization", category: "Database Engineering", tests: 10, passRate: "28%", badge: "Top 5% Proven", difficulty: "Hard", color: "#3080FF" },
  { name: "Python Systems & Async", category: "Backend Engineering", tests: 12, passRate: "24%", badge: "Production Ready", difficulty: "Hard", color: "#22C55E" },
  { name: "React & Concurrent State", category: "Frontend Engineering", tests: 8, passRate: "31%", badge: "Top Tier", difficulty: "Medium", color: "#9333EA" },
  { name: "Algorithms & Complexity", category: "Core Computer Science", tests: 15, passRate: "19%", badge: "Algorithm Expert", difficulty: "Extreme", color: "#F58E3A" }
];

export default function HomePage() {
  const { user, role, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [hasCachedSession, setHasCachedSession] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"compiler" | "tests" | "proof" | "telemetry">("compiler");
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSubmittedEmail, setContactSubmittedEmail] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasToken = Object.keys(localStorage).some(k => k.startsWith("firebase:authUser"));
      const hasCookie = document.cookie.includes("ml_session=1");
      if (hasToken || hasCookie) {
        setHasCachedSession(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !profileLoading && user) {
      if (role === "employer") {
        router.replace("/employer/dashboard");
      } else if (role === "candidate") {
        router.replace("/candidate/dashboard");
      } else if (role === "admin" || user.email?.toLowerCase() === "saitrishankb9@gmail.com") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, role, authLoading, profileLoading, router]);

  if (user || (authLoading && hasCachedSession)) {
    return <MeritlaneLoader level="page" />;
  }

  return (
    <div className="flex flex-col theme-public bg-[#F8F8F6] min-h-screen w-full font-sans text-[#101010] antialiased selection:bg-[#3080FF]/15 selection:text-[#101010]">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Strict Devin.ai Layout, Typography & Colors)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-6 sm:px-8 md:px-12 max-w-[1440px] mx-auto w-full">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-start sm:justify-center mb-8">
          <Link 
            href="/how-verification-works"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white text-[13px] text-[#71717A] hover:text-[#101010] hover:border-black/[0.16] transition-all shadow-xs"
          >
            <span className="font-medium text-[#101010]">MeritLane 2.0</span>
            <span className="w-1 h-1 rounded-full bg-black/[0.2]" />
            <span>Autonomous Skill Verification for Technical Talent</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#101010] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Hero Headlines */}
        <div className="max-w-4xl mx-auto sm:text-center space-y-6">
          <h1 className="text-[44px] sm:text-[62px] lg:text-[76px] font-semibold tracking-[-0.035em] leading-[1.04] text-[#101010]">
            Meet MeritLane, your team&apos;s verified technical hiring platform
          </h1>
          <p className="text-[18px] sm:text-[20px] text-[#71717A] max-w-2xl sm:mx-auto leading-[1.48] font-normal">
            MeritLane evaluates engineering talent in isolated compiler sandboxes, runs 10/10 test cases in real runtime environments, and delivers tamper-proof skill proofs that skip ATS black holes straight to direct interviews.
          </p>

          {/* Devin.ai Action Pills */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-3">
            <Link 
              href="/signup" 
              className="h-[44px] px-6 rounded-full bg-[#101010] text-white hover:opacity-85 text-[15px] font-medium transition-all shadow-xs inline-flex items-center justify-center gap-2 select-none"
            >
              Get started — Free for Freshers
            </Link>
            <Link 
              href="/employer/dashboard" 
              className="h-[44px] px-6 rounded-full border border-black/[0.14] text-[#101010] bg-transparent hover:bg-black/[0.04] text-[15px] font-medium transition-all inline-flex items-center justify-center gap-2 select-none"
            >
              For Companies: Hire Verified
            </Link>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. THE DEVIN PRODUCT CANVAS (Interactive App Window Showcase)
            ───────────────────────────────────────────────────────────── */}
        <div className="mt-14 sm:mt-20 max-w-6xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl border border-black/[0.1] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
            
            {/* Window Title Bar */}
            <div className="h-11 px-4 sm:px-6 bg-[#FBFBFA] border-b border-black/[0.06] flex items-center justify-between text-[13px] text-[#71717A]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
                <span className="hidden sm:inline-block ml-3 font-mono text-[12px] text-[#71717A]">
                  meritlane/proctored-sandbox/eval-2026
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#22C55E]/10 text-[#00A558]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A558] animate-pulse" />
                  Live Proctor Active
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-[#71717A] bg-black/[0.04] px-2 py-0.5 rounded">
                  SHA-256: 7a9c81..e4
                </span>
              </div>
            </div>

            {/* Window Content: 2-Pane Devin Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
              
              {/* Left Column: Devin-Style Sessions Pane */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-black/[0.06] bg-[#FAFAF8] p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  {/* New Session Button */}
                  <div className="mb-5">
                    <Link
                      href="/signup"
                      className="w-full h-9 rounded-full bg-white border border-black/[0.08] hover:border-black/[0.16] hover:bg-[#F4F4F2] text-[#101010] text-[13px] font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <span>+ New Assessment Session</span>
                    </Link>
                  </div>

                  {/* Section Label */}
                  <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#71717A] mb-3 px-1">
                    Verified Skill Tracks
                  </div>

                  {/* Track Cards */}
                  <div className="space-y-1.5">
                    {skillTracks.map((track, i) => (
                      <button
                        key={track.name}
                        onClick={() => setSelectedTrackIndex(i)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between cursor-pointer ${
                          selectedTrackIndex === i 
                            ? "bg-white border border-black/[0.1] shadow-xs" 
                            : "hover:bg-black/[0.03] text-[#71717A] hover:text-[#101010]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: track.color }} 
                            />
                            <div className="text-[13px] font-medium text-[#101010]">
                              {track.name}
                            </div>
                          </div>
                          <div className="text-[11px] text-[#71717A] pl-4">
                            {track.category} · {track.tests} hidden tests
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#00A558] font-medium shrink-0 pt-0.5">
                          {track.passRate}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Verified Profile Pill */}
                <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#101010] text-white flex items-center justify-center text-[11px] font-semibold">
                      SB
                    </div>
                    <div>
                      <div className="font-medium text-[#101010]">Saitrishank B</div>
                      <div className="text-[11px] text-[#71717A] font-mono">Rank: Top 3% · Verified</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-[#00A558]" />
                </div>
              </div>

              {/* Right Column: Devin Interactive Work Pane */}
              <div className="lg:col-span-8 flex flex-col bg-white">
                
                {/* Work Tabs */}
                <div className="h-11 border-b border-black/[0.06] px-4 flex items-center gap-2 bg-[#FBFBFA]">
                  {[
                    { id: "compiler", label: "Compiler Sandbox", icon: Terminal },
                    { id: "tests", label: "Hidden Test Suites (10/10)", icon: CheckCircle2 },
                    { id: "proof", label: "Cryptographic Proof", icon: Shield },
                    { id: "telemetry", label: "Git Telemetry", icon: GitBranch }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`h-8 px-3 rounded-full text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive 
                            ? "bg-white text-[#101010] border border-black/[0.08] shadow-xs" 
                            : "text-[#71717A] hover:text-[#101010] hover:bg-black/[0.03]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Tab Surface */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  {activeTab === "compiler" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/[0.05] text-[#101010] font-medium">
                            {skillTracks[selectedTrackIndex].name}
                          </span>
                          <span className="text-[12px] text-[#71717A]">Node.js v20 isolated worker sandbox</span>
                        </div>
                        <span className="text-[12px] font-mono text-[#00A558] font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> All Checks Passed
                        </span>
                      </div>

                      {/* Devin-style Dark Code Terminal Block */}
                      <div className="bg-[#141414] rounded-xl p-4 font-mono text-[12.5px] text-[#D4D4D4] leading-relaxed shadow-inner overflow-x-auto">
                        <div className="text-[#737373] pb-2 border-b border-white/[0.08] mb-3 flex items-center justify-between text-[11px]">
                          <span>$ meritlane-jit-compiler --target={skillTracks[selectedTrackIndex].name.toLowerCase().replace(/\s+/g, '-')}</span>
                          <span className="text-[#3080FF]">v2.4.0</span>
                        </div>
                        <p className="text-[#737373]">[00:00.012] JIT Sandbox container initialized (cgroups isolated)</p>
                        <p className="text-[#737373]">[00:00.048] Parsing Abstract Syntax Tree (AST) validation: passed</p>
                        <p className="text-[#22C55E]">✔ Test Case 1: Functional Correctness (Standard Input) · 0.2ms</p>
                        <p className="text-[#22C55E]">✔ Test Case 2: Boundary & Extreme Values · 0.4ms</p>
                        <p className="text-[#22C55E]">✔ Test Case 3: Memory Allocations under 32MB limit · 1.1ms</p>
                        <p className="text-[#22C55E]">✔ Test Case 4: Asynchronous Concurrency & Deadlock Defense · 0.9ms</p>
                        <p className="text-[#3080FF] mt-2">→ Executed 10 of 10 test suites successfully. Zero memory leaks.</p>
                        <p className="text-[#E5E5E5] mt-1 font-semibold">✔ Verification Score: 96 / 100 (Top 4th Percentile)</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "tests" && (
                    <div className="space-y-3">
                      <div className="text-[13px] text-[#71717A] mb-2">
                        Real-world test runner validating non-trivial edge cases:
                      </div>
                      {[
                        { title: "Query Plan Optimization & Cost Indexing", time: "0.4ms", status: "PASSED" },
                        { title: "Idempotency on Concurrent Connections", time: "1.1ms", status: "PASSED" },
                        { title: "SQL Injection & AST Tamper Prevention", time: "0.2ms", status: "PASSED" },
                        { title: "High-Throughput Pagination Cursor Limits", time: "0.6ms", status: "PASSED" },
                        { title: "Deterministic Hash Verification", time: "0.3ms", status: "PASSED" }
                      ].map((tc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-black/[0.06] bg-[#FAFAF8] text-[13px]">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#00A558]" />
                            <span className="font-medium text-[#101010]">{tc.title}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[12px]">
                            <span className="text-[#71717A]">{tc.time}</span>
                            <span className="text-[#00A558] font-medium bg-[#00A558]/10 px-2 py-0.5 rounded">{tc.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "proof" && (
                    <div className="p-6 rounded-2xl border border-black/[0.08] bg-[#FBFBFA] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#00A558]" />
                          <span className="text-[14px] font-semibold text-[#101010]">MeritLane Proof of Work Ledger</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#71717A] bg-black/[0.05] px-2.5 py-1 rounded-full">
                          Proof #ML-VF-8921
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12px]">
                        <div className="p-3 bg-white rounded-lg border border-black/[0.06]">
                          <div className="text-[#71717A] mb-1">Authentic Score</div>
                          <div className="font-mono text-[16px] font-semibold text-[#101010]">96%</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-black/[0.06]">
                          <div className="text-[#71717A] mb-1">Anti-Cheat Proctor</div>
                          <div className="font-medium text-[14px] text-[#00A558]">Verified Clean</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-black/[0.06] col-span-2 sm:col-span-1">
                          <div className="text-[#71717A] mb-1">ATS Direct Status</div>
                          <div className="font-medium text-[14px] text-[#3080FF]">Interview Ready</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-[#71717A] break-all bg-white p-3 rounded-lg border border-black/[0.06]">
                        SIG: 8f42b36e92c01991a457df74288bf2e5c8db993132e4d29a5676e624c4e20791
                      </div>
                    </div>
                  )}

                  {activeTab === "telemetry" && (
                    <div className="space-y-3">
                      <div className="text-[13px] text-[#71717A]">
                        Live integration with GitHub commits and code repositories:
                      </div>
                      <div className="p-4 rounded-xl border border-black/[0.08] bg-[#FAFAF8] space-y-2.5 text-[13px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium text-[#101010]">
                            <GitBranch className="w-4 h-4 text-[#3080FF]" />
                            <span>github.com/SaitrishankAUCSE/MeritLane</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#71717A]">342 commits</span>
                        </div>
                        <div className="text-[12px] text-[#71717A]">
                          Autonomous AST audit: Zero AI copy-paste flags, authentic commit frequency, verified author GPG key signature.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Devin-style Interactive Input / Prompt Bar at bottom */}
                  <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
                    <div className="flex-1 h-10 px-4 rounded-full border border-black/[0.08] bg-[#FBFBFA] text-[13px] text-[#71717A] flex items-center justify-between">
                      <span className="truncate">Evaluate SQL query optimizations, test edge cases, or verify talent...</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/[0.06] text-[#101010] font-medium shrink-0 ml-2">
                        JIT-Runner v2
                      </span>
                    </div>
                    <Link
                      href="/signup"
                      className="h-10 px-5 rounded-full bg-[#101010] text-white hover:opacity-85 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                    >
                      <span>Run Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. LOGO MARQUEE (Grayscale Company Badges from Devin.ai)
            ───────────────────────────────────────────────────────────── */}
        <div className="mt-20 pt-12 border-t border-black/[0.06] max-w-6xl mx-auto">
          <div className="text-center text-[12px] font-medium uppercase tracking-[0.2em] text-[#71717A] mb-8">
            Engineering Teams Discovering Proven Talent on MeritLane
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
            {["Modal", "Gamma", "Citi", "Reducto", "Mercor", "Mercedes-Benz", "Vercel", "Stripe"].map((company) => (
              <span key={company} className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-[#101010]">
                {company}
              </span>
            ))}
          </div>
        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. THE DEVIN BENTO FEATURE GRID (2-Column & 3-Column Bento Cards)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 md:px-12 max-w-[1440px] mx-auto w-full">
        <div className="max-w-4xl mx-auto sm:text-center space-y-4 mb-16">
          <div className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#3080FF]">
            The MeritLane Standard
          </div>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[54px] font-semibold tracking-[-0.03em] leading-[1.08] text-[#101010]">
            From problem to direct interview, MeritLane gets real talent hired.
          </h2>
          <p className="text-[17px] sm:text-[19px] text-[#71717A] max-w-2xl sm:mx-auto leading-relaxed">
            Stop sending 500 resumes into automated ATS filters. Prove your true engineering capability in real compilers and skip straight to hiring managers.
          </p>
        </div>

        {/* 2-Column High-Impact Bento Cards (Direct from Devin.ai) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
          
          {/* Card 1: Sandbox & Compiler */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-black/[0.16] transition-all">
            {/* Visual Top Area */}
            <div className="h-60 rounded-2xl bg-[#F8F8F6] border border-black/[0.06] p-5 mb-8 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#3080FF]" />
                  <span>runtime/compiler-worker.ts</span>
                </div>
                <span className="text-[#00A558] font-medium">10/10 PASS</span>
              </div>
              <div className="space-y-2 font-mono text-[12px]">
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] flex items-center justify-between">
                  <span className="text-[#101010]">test_memory_leak_defense</span>
                  <span className="text-[#00A558]">PASSED (0.3ms)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] flex items-center justify-between">
                  <span className="text-[#101010]">test_concurrent_race_condition</span>
                  <span className="text-[#00A558]">PASSED (0.7ms)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] flex items-center justify-between">
                  <span className="text-[#101010]">test_boundary_condition_matrix</span>
                  <span className="text-[#00A558]">PASSED (0.2ms)</span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#71717A] flex items-center justify-between pt-1">
                <span>AST isolation: 100% jailed</span>
                <span className="text-[#3080FF]">Zero trivia questions</span>
              </div>
            </div>

            {/* Content Bottom Area */}
            <div>
              <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.025em] text-[#101010] mb-3">
                Evaluates end to end on real compilers
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#71717A] leading-[1.6]">
                Forget multiple-choice trivia and whiteboard puzzles. MeritLane spins up isolated language sandboxes for Python, SQL, TypeScript, and Go. Every submission is compiled, executed, and benchmarked against rigorous hidden test suites.
              </p>
            </div>
          </div>

          {/* Card 2: Cryptographic Proof & ATS Bypass */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-black/[0.16] transition-all">
            {/* Visual Top Area */}
            <div className="h-60 rounded-2xl bg-[#141414] border border-white/[0.08] p-5 mb-8 flex flex-col justify-between text-white overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
                <div className="flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>authority_ledger.proof</span>
                </div>
                <span className="text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded">AUTHENTIC</span>
              </div>
              <div className="space-y-2 text-[12px] font-mono">
                <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#737373]">VERIFICATION SCORE</div>
                    <div className="text-[18px] font-semibold text-[#22C55E]">96% · Top Tier</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#737373]">DIRECT ACCESS</div>
                    <div className="text-[14px] text-white font-medium">ATS Bypassed</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.04] text-[11px] text-[#A3A3A3] truncate">
                  SHA256: 3c5e881fa24...bc8849e0129f
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#737373] flex items-center justify-between">
                <span>Tamper-proof digital seal</span>
                <span className="text-[#22C55E]">Verified by MeritLane</span>
              </div>
            </div>

            {/* Content Bottom Area */}
            <div>
              <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.025em] text-[#101010] mb-3">
                Cryptographic proofs that skip ATS black holes
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#71717A] leading-[1.6]">
                When you pass our standardized benchmarks, you receive an unforgeable digital Proof of Work. Verified scores are promoted directly into company hiring directories, granting you direct technical interviews without automated screening rejections.
              </p>
            </div>
          </div>

        </div>

        {/* 3-Column Secondary Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <div className="rounded-3xl border border-black/[0.08] bg-white p-7 shadow-xs hover:border-black/[0.16] transition-all space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F4F2] flex items-center justify-center text-[#101010]">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <h4 className="text-[18px] font-semibold tracking-tight text-[#101010]">
              Anti-Cheat AI Proctoring
            </h4>
            <p className="text-[14px] text-[#71717A] leading-[1.6]">
              Real-time tab focus tracking, clipboard anomaly monitors, and AST sandbox isolation guarantee 100% authentic human submissions.
            </p>
          </div>

          <div className="rounded-3xl border border-black/[0.08] bg-white p-7 shadow-xs hover:border-black/[0.16] transition-all space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F4F2] flex items-center justify-center text-[#101010]">
              <GitBranch className="w-5 h-5" />
            </div>
            <h4 className="text-[18px] font-semibold tracking-tight text-[#101010]">
              GitHub Telemetry Sync
            </h4>
            <p className="text-[14px] text-[#71717A] leading-[1.6]">
              Sync your real git commits, repository velocity, and pull requests into your comprehensive engineering dossier.
            </p>
          </div>

          <div className="rounded-3xl border border-black/[0.08] bg-white p-7 shadow-xs hover:border-black/[0.16] transition-all space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F4F2] flex items-center justify-center text-[#101010]">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-[18px] font-semibold tracking-tight text-[#101010]">
              Direct Talent Directory
            </h4>
            <p className="text-[14px] text-[#71717A] leading-[1.6]">
              Top companies search candidates filtered strictly by real execution percentiles rather than college brand names or GPA.
            </p>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. ENTERPRISE SECURITY SECTION (Devin.ai Exact Fine-Grained Controls)
          ───────────────────────────────────────────────────────────── */}
      <section id="standards" className="py-20 sm:py-28 px-6 sm:px-8 md:px-12 bg-white border-y border-black/[0.06] w-full">
        <div className="max-w-6xl mx-auto">
          
          <div className="max-w-3xl mb-14 space-y-4">
            <div className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#00A558]">
              Standardized Trust
            </div>
            <h2 className="text-[34px] sm:text-[46px] font-semibold tracking-[-0.03em] leading-tight text-[#101010]">
              Enterprise proctoring with fine-grained controls
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#71717A] leading-relaxed">
              Every assessment is executed inside a hardened virtualization environment designed to prevent LLM copy-paste, unauthorized assistance, and credential forgery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Jailed Sandbox Execution", desc: "Code runs in isolated ephemeral micro-VM containers with no access to system hosts or local networks." },
              { title: "Keystroke Entropy Checks", desc: "Analyzes typing cadence to detect instant paste dumps and synthetic automated inputs." },
              { title: "Dual Monitor & Blur Locks", desc: "Monitors window focus blur, devtools inspection, and multi-display peripheral anomalies." },
              { title: "SHA-256 Authority Ledger", desc: "Every badge is cryptographically sealed with an immutable hash verifiable by third parties." }
            ].map((sec, i) => (
              <div key={i} className="p-6 rounded-2xl border border-black/[0.06] bg-[#FAFAF8] space-y-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#101010] text-[12px] font-mono font-semibold">
                  0{i + 1}
                </div>
                <h4 className="text-[16px] font-semibold text-[#101010] tracking-tight">{sec.title}</h4>
                <p className="text-[13.5px] text-[#71717A] leading-[1.6]">{sec.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. FOUNDER & MISSION SECTION (Devin.ai Human Polish)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 md:px-12 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] text-[12px] font-medium text-[#101010]">
              <Sparkles className="w-3.5 h-3.5 text-[#3080FF]" />
              <span>The MeritLane Mission</span>
            </div>
            <h3 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.03em] text-[#101010]">
              Code speaks louder than pedigree.
            </h3>
          </div>

          <blockquote className="text-[18px] sm:text-[21px] text-[#101010] font-normal leading-relaxed border-l-2 border-[#101010] pl-6 italic">
            &ldquo;The entry-level hiring loop is fundamentally broken. We watched brilliant freshers from non-elite colleges get filtered out by resume scanners, while job postings demanded impossible 2+ years of experience. MeritLane exists to level the playing field: if you can write working code, you deserve direct interviews.&rdquo;
          </blockquote>

          <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#101010] text-white flex items-center justify-center font-bold text-[14px]">
                SB
              </div>
              <div>
                <div className="font-semibold text-[15px] text-[#101010]">Saitrishank B</div>
                <div className="text-[13px] text-[#71717A]">Founder & Lead Engineer, MeritLane</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/SaitrishankAUCSE" 
                target="_blank" 
                rel="noreferrer"
                className="h-9 px-4 rounded-full border border-black/[0.12] text-[#101010] hover:bg-black/[0.04] text-[13px] font-medium inline-flex items-center gap-1.5 transition-all"
              >
                <Code className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a 
                href="mailto:saitrishankb9@gmail.com"
                className="h-9 px-4 rounded-full bg-[#101010] text-white hover:opacity-85 text-[13px] font-medium inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          7. FAQ ACCORDION (Devin.ai Minimalist Accordion)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 md:px-12 max-w-4xl mx-auto w-full">
        <div className="sm:text-center mb-12 space-y-3">
          <h2 className="text-[32px] sm:text-[42px] font-semibold tracking-[-0.03em] text-[#101010]">
            Frequently asked questions
          </h2>
          <p className="text-[16px] text-[#71717A]">
            Everything you need to know about our proctored benchmarks and proof of work.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div 
                key={i}
                className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-[16px] font-medium text-[#101010] tracking-tight">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-[#71717A] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-[14.5px] text-[#71717A] leading-[1.7] border-t border-black/[0.04] pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Form Box (Devin.ai Styling) */}
        <div className="mt-16 rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-10 shadow-xs">
          <div className="mb-6 space-y-2">
            <h3 className="text-[22px] font-semibold text-[#101010] tracking-tight">Have a question for our team?</h3>
            <p className="text-[14px] text-[#71717A]">Drop us a note and we will reply within 24 hours.</p>
          </div>

          {contactStatus === "success" ? (
            <div className="p-6 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#00A558] mx-auto" />
              <div className="font-semibold text-[#101010] text-[16px]">Message Delivered</div>
              <p className="text-[13.5px] text-[#71717A]">
                Thank you! We will get back to you at <strong>{contactSubmittedEmail}</strong> shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setContactStatus("loading");
                setContactError(null);
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = String(formData.get("name") || "").trim();
                const email = String(formData.get("email") || "").trim();
                const message = String(formData.get("message") || "").trim();

                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(data.error || "Failed to submit message.");
                  setContactSubmittedEmail(email);
                  setContactStatus("success");
                  form.reset();
                } catch (err: any) {
                  setContactStatus("error");
                  setContactError(err.message || "Failed to deliver message.");
                }
              }}
              className="space-y-4 font-sans"
            >
              {contactError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-[12.5px] border border-red-200">
                  {contactError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-xl border border-black/[0.1] bg-[#FAFAF8] text-[14px] text-[#101010] placeholder:text-[#71717A] focus:outline-none focus:border-[#101010] transition-colors"
                />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  className="w-full h-11 px-4 rounded-xl border border-black/[0.1] bg-[#FAFAF8] text-[14px] text-[#101010] placeholder:text-[#71717A] focus:outline-none focus:border-[#101010] transition-colors"
                />
              </div>
              <textarea
                required
                name="message"
                rows={3}
                placeholder="How can we help you?"
                className="w-full p-4 rounded-xl border border-black/[0.1] bg-[#FAFAF8] text-[14px] text-[#101010] placeholder:text-[#71717A] focus:outline-none focus:border-[#101010] transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={contactStatus === "loading"}
                className="h-11 px-6 rounded-full bg-[#101010] text-white hover:opacity-85 text-[14px] font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {contactStatus === "loading" ? "Delivering..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          8. FINAL CALL TO ACTION (Devin.ai Signature Finish)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-8 md:px-12 bg-white border-t border-black/[0.08] text-center w-full">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-[36px] sm:text-[50px] lg:text-[58px] font-semibold tracking-[-0.035em] leading-[1.05] text-[#101010]">
            Stop sending resumes into the dark. Start proving what you can build.
          </h2>
          <p className="text-[17px] sm:text-[19px] text-[#71717A] max-w-xl mx-auto leading-relaxed">
            Join thousands of ambitious freshers and early engineers using MeritLane to bypass ATS keyword filters and get evaluated on pure proof of work.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="h-[44px] px-7 rounded-full bg-[#101010] text-white hover:opacity-85 text-[15px] font-medium transition-all shadow-xs inline-flex items-center justify-center gap-2 select-none"
            >
              Prove your skills — Free for Freshers
            </Link>
            <Link
              href="/employer/dashboard"
              className="h-[44px] px-7 rounded-full border border-black/[0.14] text-[#101010] bg-transparent hover:bg-black/[0.04] text-[15px] font-medium transition-all inline-flex items-center justify-center gap-2 select-none"
            >
              For Companies: Hire Verified
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
