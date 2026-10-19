"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, ArrowRight, Database, Shield, Code, ChevronRight, Lock, 
  BrainCircuit, Globe, GitBranch, Terminal, ShieldCheck, ChevronDown, User, Server, Cpu, Search, Activity, Briefcase, Sparkles, Mail
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

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

export default function HomePage() {
  const { user, role, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [hasCachedSession, setHasCachedSession] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
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
    <div className="flex flex-col theme-public bg-background min-h-screen w-full font-sans text-foreground overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 sm:px-12 md:px-16 lg:px-24 pt-24 pb-16 sm:pt-32 sm:pb-20 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="h-px w-12 bg-foreground/20" />
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted-foreground" suppressHydrationWarning>
            EQUAL OPPORTUNITY FOR FRESH GRADUATES &amp; EARLY TALENT
          </span>
          <span className="h-px w-12 bg-foreground/20" />
        </motion.div>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="w-full flex justify-center items-center mb-6 min-h-[2.2em] sm:min-h-[2.6em]"
        >
          <HandwritingText
            words={["No '0-2 years' experience loops.", "No Tier-1 college bias.", "Pure proof of work.", "Meritlane."]}
            height="2.2em"
            duration={1.5}
            delay={0.1}
            interval={3200}
            strokeWidth={2.0}
            className="text-[var(--color-primary)] font-normal"
          />
        </motion.div>

        <motion.h1 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-[44px] sm:text-[58px] md:text-[70px] lg:text-[78px] font-serif text-[var(--color-foreground)] tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6 font-normal"
        >
          Break Into Tech on Pure Engineering Ability.
        </motion.h1>

        <motion.p 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-[16px] sm:text-[18px] text-muted-foreground max-w-2xl mx-auto leading-[1.7] mb-12 font-sans"
        >
          Tired of sending hundreds of resumes into ATS black holes or being rejected for entry-level roles requiring 2+ years of experience? MeritLane levels the playing field for ambitious freshers through standardized, cheat-proof coding assessments — turning your actual ability into verified proof that lands real interviews.
        </motion.p>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button href="/signup" variant="primary" size="lg" className="px-8 w-full sm:w-auto">
              Prove Your Skills — Free for Freshers →
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button href="/employer/dashboard" variant="outline" size="lg" className="px-8 w-full sm:w-auto">
              For Companies: Hire Verified Freshers
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-3xl border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          <div className="flex -space-x-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-surface flex items-center justify-center z-${10-i} shadow-sm`}>
                <User className="w-4 h-4 text-muted-foreground/70" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              Built for Ambitious Freshers &amp; Early-Career Engineers
            </div>
            <div className="text-[13px] text-muted-foreground mt-1">Leveling the playing field for graduates from every college and background.</div>
          </div>
        </motion.div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-24 bg-foreground text-white border-y border-[#333]">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] mb-4" style={{ color: "#E7E2DA" }}>
              The Entry-Level Hiring Crisis
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-snug" style={{ color: "#FFFFFF" }}>
              The Entry-Level Hiring Paradox.
            </h2>
            <p className="mt-4 text-sm max-w-2xl mx-auto text-neutral-300">
              Why thousands of capable junior developers are trapped in application limbo — and how MeritLane solves it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "The '0-2 Years' Trap",
                description: "Entry-level job boards mandate 2+ years of prior commercial experience. Freshers are trapped in a systemic catch-22: you can't get experience without a job, and can't get a job without experience."
              },
              {
                title: "The College Pedigree Filter",
                description: "Automated resume scrapers silently auto-reject exceptional problem solvers simply because they didn't graduate from an elite Tier-1 brand. Real engineering ability comes from everywhere."
              },
              {
                title: "The 500-Application Black Hole",
                description: "Applying on generic job portals feels like shouting into the void. Resumes get discarded by keyword filters before an actual engineering manager ever looks at your code."
              }
            ].map((problem, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="p-8 bg-foreground border border-[#333] shadow-sm transition-colors hover:border-muted-foreground cursor-default"
              >
                <h3 className="text-lg font-serif font-medium mb-3" style={{ color: "#FFFFFF" }}>{problem.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#D1D5DB" }}>{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHAT IS MERITLANE (EXAMINATION STANDARD) */}
      <section id="standards" className="py-24 sm:py-32 bg-white scroll-mt-12">
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center justify-center p-4 bg-foreground rounded-full mb-8">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight leading-snug max-w-4xl mx-auto mb-6">
              Your Direct Bridge From Campus to Career.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-muted-foreground max-w-3xl mx-auto leading-[1.8] font-sans">
              MeritLane was created to end the entry-level hiring gridlock. We provide aspiring software engineers with an unforgeable <strong>Evidence Dossier</strong> backed by live executed code, while giving tech employers a zero-noise directory of pre-vetted freshers ready to contribute on Day 1.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURE DEEP DIVE */}
      <section className="py-24 bg-[#FAFAFA] border-y border-[var(--color-border)] overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 lg:px-12 space-y-32">
          
          {/* Feature 1: JIT Engine */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-800 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Proctored Engineering Evaluations
              </div>
              <h3 className="text-3xl font-serif text-foreground mb-6 leading-tight">Prove True Capability in Real-World Compilers.</h3>
              <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">
                Forget multiple-choice trivia and biased whiteboard quizzes. MeritLane's live coding environments run your solutions against production test suites, boundary conditions, and performance limits — letting your raw problem-solving capability speak directly to engineering managers.
              </p>
              <ul className="space-y-3 text-[14px] text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-800" /> 26+ programming tracks with real language compilers.</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-800" /> Algorithmic challenges with rigorous hidden test cases.</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-800" /> Anti-cheat proctoring guaranteeing trusted results for employers.</li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex-1 relative"
            >
              <div className="absolute -inset-4 bg-emerald-600/10 rounded-lg -z-10 transform rotate-3"></div>
              <div className="bg-foreground p-6 rounded shadow-xl border border-[#333] text-white font-mono text-[13px] leading-relaxed">
                <div className="flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
                  <Terminal className="w-4 h-4 text-[#10B981]" /> 
                  <span className="text-muted-foreground/70">meritlane/proctor-eval.ts</span>
                </div>
                <p className="text-[#10B981]">➜ Candidate Assessment: "Data Structures &amp; Algorithms"</p>
                <p className="text-border mt-2">[RUN] Initializing isolated compiler sandbox...</p>
                <p className="text-border">[TEST] Passing hidden test suites: 10/10 passed</p>
                <p className="text-border">[METRICS] Execution time: 1.2ms · Zero memory leaks</p>
                <p className="text-[#10B981] mt-2">✔ Score: 94% · Official Verified Badge Awarded.</p>
              </div>
            </motion.div>
          </div>

          {/* Feature 2: Holistic Evidence */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#2563EB] mb-4 flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> The Early-Career Proof Dossier
              </div>
              <h3 className="text-3xl font-serif text-foreground mb-6 leading-tight">Showcase What You Can Build, Not Who You Know.</h3>
              <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">
                When you don't have 3 years of corporate pedigree, you need undeniable proof. MeritLane aggregates your proctored assessment scores, GitHub commit telemetry, and live deployed projects into a single verified credential that top engineering teams trust.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-border rounded hover:border-[#2563EB]/40 transition-colors duration-300">
                  <Activity className="w-5 h-5 text-[#2563EB] mb-2" />
                  <div className="font-semibold text-foreground text-[14px]">ATS Immunity</div>
                  <div className="text-[12px] text-muted-foreground">Pre-verified skill scores</div>
                </div>
                <div className="p-4 bg-white border border-border rounded hover:border-[#2563EB]/40 transition-colors duration-300">
                  <Code className="w-5 h-5 text-[#2563EB] mb-2" />
                  <div className="font-semibold text-foreground text-[14px]">Git Telemetry</div>
                  <div className="text-[12px] text-muted-foreground">Authentic commit history</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex-1 relative group cursor-default"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <div className="absolute -inset-4 bg-[#DBEAFE] rounded-lg -z-10 transform -rotate-2 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"></div>
                <div className="border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Evidence Profile</div>
                      <div className="text-[18px] font-serif text-foreground mt-1">Preview Mode</div>
                    </div>
                    <div className="text-[11px] font-mono text-green-600 font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> VERIFIED
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-sans mb-4">
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Git Telemetry</div>
                      <div className="font-mono text-foreground font-semibold">Authenticated</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Status</div>
                      <div className="font-mono text-foreground font-semibold">Pre-vetted</div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex gap-2">
                      <Badge variant="neutral" className="text-[10px]">React (98%)</Badge>
                      <Badge variant="neutral" className="text-[10px]">Node (92%)</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-24 bg-foreground text-white border-y border-[#333]">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] mb-4" style={{ color: "#E7E2DA" }}>
              Two Sides, One Platform
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-snug" style={{ color: "#FFFFFF" }}>
              How Meritlane Operates.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#333] transform -translate-x-1/2"></div>
            
            {/* Candidates */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }} 
                transition={{ duration: 0.4 }} 
                className="inline-flex items-center justify-center p-3 bg-foreground border border-[#444] mb-6 rounded-2xl cursor-pointer"
              >
                <Code className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif mb-6" style={{ color: "#FFFFFF" }}>For Freshers &amp; Early Talent</h3>
              <div className="space-y-8">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>1. Build Your Evidence Profile</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Upload your resume, connect your GitHub, and showcase the projects you built — no past corporate job title required.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>2. Take Proctored Coding Tests</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Prove your algorithmic depth and domain skills in our real-time browser sandbox. Score ≥ 75% to earn verified status.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>3. Skip Keyword Filters &amp; Get Hired</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Your verified profile is promoted directly to hiring teams actively looking for capable junior engineers.</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Employers */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }} 
                transition={{ duration: 0.4 }} 
                className="inline-flex items-center justify-center p-3 bg-foreground border border-[#444] mb-6 rounded-2xl cursor-pointer"
              >
                <Database className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif mb-6" style={{ color: "#FFFFFF" }}>For Tech Employers</h3>
              <div className="space-y-8">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>1. Discover Pre-Vetted Junior Talent</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Filter by real code execution benchmarks instead of resume keywords or college brand names.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>2. Inspect Real Telemetry</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Review hidden test case scores, code clarity, and commit history before the first interview.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium mb-2 uppercase tracking-wide" style={{ color: "#F3F4F6" }}>3. Hire Day-1 Ready Engineers</h4>
                  <p className="text-[15px] leading-relaxed" style={{ color: "#D1D5DB" }}>Skip introductory screening loops and conduct final architectural discussions directly with proven freshers.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. THE STORY / WHO BUILT THIS */}
      <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-surface to-transparent rounded-full opacity-50 -z-10 translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground mb-6">
              The Mission
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-foreground tracking-tight mb-10 max-w-3xl mx-auto">
              Democratizing Technical Hiring for Fresh Talent.
            </h2>
            
            <div className="max-w-2xl mx-auto text-left">
              <p className="text-[16px] text-muted-foreground leading-[1.8] mb-6">
                The entry-level hiring loop is fundamentally broken. We watched brilliant freshers from non-elite colleges get automatically filtered out by keyword scanners, while job postings demanded impossible experience for entry-level roles. MeritLane exists to level the playing field: if you have the technical discipline to write working code, you deserve a genuine career opportunity.
              </p>
              
              <div className="bg-[#FAFAFA] border border-border p-6 rounded-lg my-10 relative">
                <div className="absolute -top-3 -left-3 text-4xl text-border font-serif">"</div>
                <p className="text-[18px] font-serif italic text-foreground leading-relaxed text-center px-4 relative z-10">
                  MeritLane was built on a single, uncompromising belief: Code speaks louder than pedigree. We evaluate freshers exactly how software is built in the real world — through executed proof of work.
                </p>
              </div>

              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
                className="flex flex-col sm:flex-row items-center gap-8 mt-12 bg-white border border-border p-8 rounded-2xl shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent rounded-full opacity-40 -z-10 translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-foreground to-[#44403C] rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-300"></div>
                  <div className="text-white font-serif text-3xl sm:text-4xl z-10 drop-shadow-md">SB</div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full mb-3 border border-amber-200">
                    <Sparkles className="w-3 h-3" /> Founder Profile
                  </div>
                  <h4 className="text-[24px] font-serif font-bold text-foreground leading-tight">Saitrishank B</h4>
                  <div className="text-[15px] font-medium text-muted-foreground mb-4">Founder & Lead Engineer, MeritLane</div>
                  <div className="flex gap-4 justify-center sm:justify-start">
                    <a href="https://github.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] font-semibold text-foreground hover:text-[#2563EB] transition-colors p-2.5 px-4 bg-[#FAFAFA] rounded border border-border hover:border-[#2563EB]/30 hover:bg-blue-50">
                      <Code className="w-4 h-4" /> GitHub
                    </a>
                    <a href="mailto:saitrishankb9@gmail.com" className="flex items-center gap-2 text-[13px] font-semibold text-foreground hover:text-amber-600 transition-colors p-2.5 px-4 bg-[#FAFAFA] rounded border border-border hover:border-amber-600/30 hover:bg-amber-50">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-[#FAFAFA] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-serif text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-[15px]">Everything you need to know about the MeritLane standard.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="border border-border bg-white rounded-lg overflow-hidden transition-colors hover:border-border"
                >
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-semibold text-foreground text-[15px]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 text-[14px] text-muted-foreground leading-relaxed border-t border-[#FAFAFA] pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mt-24 max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-border shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full opacity-40 -z-10 translate-x-1/3 -translate-y-1/3 blur-xl"></div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-[#FAFAFA] rounded-full border border-border mb-4">
                <Mail className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-2">Have a specific query?</h3>
              <p className="text-muted-foreground text-[14px]">Send us a message and we'll get back to you within 24 hours.</p>
            </div>
            {contactStatus === "success" ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center p-3.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif text-foreground font-semibold">Message Delivered</h4>
                <p className="text-muted-foreground text-[15px] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out! Your message has been saved to the administrative inbox. We will get back to you at <strong>{contactSubmittedEmail}</strong> within 24 hours.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContactStatus("idle");
                      setContactError(null);
                    }}
                    className="inline-flex items-center text-[13px] font-semibold text-foreground hover:text-emerald-600 transition-colors underline underline-offset-4"
                  >
                    Send another message &rarr;
                  </button>
                </div>
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

                    if (!res.ok) {
                      throw new Error(data.error || "Failed to submit message. Please try again.");
                    }

                    setContactSubmittedEmail(email);
                    setContactStatus("success");
                    form.reset();
                  } catch (err: any) {
                    setContactStatus("error");
                    setContactError(err.message || "Failed to deliver message. Please try again.");
                  }
                }}
                className="space-y-5 relative z-10"
              >
                {contactError && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs text-left">
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="name" className="text-[12px] font-bold tracking-wide uppercase text-muted-foreground">Full Name</label>
                    <input required id="name" name="name" type="text" className="w-full px-4 py-2.5 text-[14px] bg-[#FAFAFA] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all" placeholder="Enter your name" disabled={contactStatus === "loading"} />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="email" className="text-[12px] font-bold tracking-wide uppercase text-muted-foreground">Email Address</label>
                    <input required id="email" name="email" type="email" className="w-full px-4 py-2.5 text-[14px] bg-[#FAFAFA] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all" placeholder="Enter your email" disabled={contactStatus === "loading"} />
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <label htmlFor="message" className="text-[12px] font-bold tracking-wide uppercase text-muted-foreground">Your Message</label>
                  <textarea required id="message" name="message" rows={4} className="w-full px-4 py-3 text-[14px] bg-[#FAFAFA] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all resize-none" placeholder="How can we help you?" disabled={contactStatus === "loading"}></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={contactStatus === "loading"}
                  className="w-full bg-foreground text-white font-semibold py-3 rounded-md text-[14px] hover:bg-[#333] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {contactStatus === "loading" ? "Delivering Message..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-24 sm:py-32 bg-foreground text-center border-t border-[#333]">
        <div className="mx-auto max-w-3xl px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight mb-6 leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            Stop sending resumes into the dark. Start proving what you can build.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "#D1D5DB" }}
          >
            Join ambitious freshers and early-career engineers using MeritLane to bypass ATS keyword filters and get evaluated on verified proof of work.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/signup" variant="primary" size="lg" className="px-8 w-full sm:w-auto !bg-white !text-black hover:!bg-border !border-white">
                Prove Your Skills — Free for Freshers →
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/employer/dashboard" variant="outline" size="lg" className="px-8 w-full sm:w-auto !border-white !text-white !bg-transparent hover:!bg-white hover:!text-black">
                For Companies: Hire Verified Freshers
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
