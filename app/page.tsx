"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, ArrowRight, Database, Shield, Code, ChevronRight, Lock, 
  BrainCircuit, Globe, GitBranch, Terminal, ShieldCheck, ChevronDown, User, Server, Cpu, Search, Activity, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const fadeUp = {
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
    question: "How does the Just-In-Time (JIT) Assessment Engine work?",
    answer: "Our advanced AI engine dynamically generates 25 highly technical, non-trivial MCQs and 2 edge-case-heavy coding tasks for literally any skill on the fly. Whether you request 'React', 'Rust', or 'Solidity', the engine constructs a proctored assessment immediately."
  },
  {
    question: "How is cheating prevented during the assessment?",
    answer: "MeritLane uses strict proctoring techniques including tab-switching detection, copy-paste prevention, and isolated sandbox execution environments. Our ATS parsing also cross-references code styles."
  },
  {
    question: "Is MeritLane free for developers?",
    answer: "Yes, candidates can take assessments, verify their skills, and build their evidence dossier entirely for free. Employers pay to access the verified talent pool."
  },
  {
    question: "What makes MeritLane different from traditional hiring?",
    answer: "Instead of relying on self-reported resumes and keywords, MeritLane forces candidates to prove their ability via real code execution, verified Code history, and live projects."
  }
];

export default function HomePage() {
  const { user, role, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [hasCachedSession, setHasCachedSession] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
          <span className="h-px w-12 bg-[#1C1917]/20" />
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#78716C]">
            Meritlane
          </span>
          <span className="h-px w-12 bg-[#1C1917]/20" />
        </motion.div>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="w-full flex justify-center items-center mb-6 min-h-[2.2em] sm:min-h-[2.6em]"
        >
          <HandwritingText
            words={["Real code.", "Verified skills.", "Proof of work.", "Meritlane."]}
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
          Hire Software Engineers Based on Actual Ability.
        </motion.h1>

        <motion.p 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-[16px] sm:text-[18px] text-[#525252] max-w-2xl mx-auto leading-[1.7] mb-12 font-sans"
        >
          The traditional hiring pipeline is broken. Resumes are padded, degrees are proxies, and keyword-matching filters out genuine talent. Meritlane replaces the noise with standardized, proctored assessments and verifiable proof of work.
        </motion.p>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8 w-full sm:w-auto">
              Hire Verified Talent
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8 w-full sm:w-auto">
              Prove Your Skills
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-3xl border-t border-[#E5E5E5] pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          <div className="flex -space-x-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-[#F5F5F4] flex items-center justify-center z-${10-i} shadow-sm`}>
                <User className="w-4 h-4 text-[#A8A29E]" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1C1917]">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Built for the Next Generation of Engineers
            </div>
            <div className="text-[13px] text-[#78716C] mt-1">Evaluating talent based on cryptographically verified code.</div>
          </div>
        </motion.div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-24 bg-[#0A0A0A] text-white border-y border-[#333]">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#A8A29E] mb-4">
              The Status Quo
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif !text-white tracking-tight leading-snug">
              Resumes don't compile.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Noise over Signal",
                description: "Recruiters are overwhelmed by thousands of applications. Parsing PDFs for keywords inevitably filters out unconventional, high-capability talent."
              },
              {
                title: "Degrees != Skill",
                description: "A prestigious university name on a resume does not guarantee an engineer can write clean, production-ready code."
              },
              {
                title: "Wasted Engineering Hours",
                description: "Senior engineers spend hundreds of hours conducting technical interviews for candidates who lack fundamental competencies."
              }
            ].map((problem, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="p-8 bg-[#1C1917] border border-[#333] shadow-sm transition-colors hover:border-[#525252] cursor-default"
              >
                <h3 className="text-lg font-serif font-medium !text-white mb-3">{problem.title}</h3>
                <p className="text-sm !text-[#A8A29E] leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHAT IS MERITLANE */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center justify-center p-4 bg-[#1C1917] rounded-full mb-8">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1C1917] tracking-tight leading-snug max-w-4xl mx-auto mb-6">
              The Unified Ground Truth for Technical Talent.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#525252] max-w-3xl mx-auto leading-[1.8] font-sans">
              MeritLane is a dual-sided ecosystem designed to eliminate hiring friction. We provide candidates with an unforgeable, cryptographically secure <strong>Evidence Dossier</strong>, while providing employers with a zero-noise, pre-vetted talent pool where every profile is backed by executed code.
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
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#059669] mb-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Just-In-Time Generation
              </div>
              <h3 className="text-3xl font-serif text-[#1C1917] mb-6 leading-tight">Infinite scale. Any skill. Instant exams.</h3>
              <p className="text-[15px] text-[#525252] leading-[1.8] mb-6">
                Need to hire for an obscure framework? MeritLane's proprietary AI Assessment Engine generates high-fidelity, edge-case heavy coding tasks and deep multiple-choice questions for <strong>literally any technology</strong> on the fly.
              </p>
              <ul className="space-y-3 text-[14px] text-[#525252]">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#059669]" /> 25 deep technical MCQs generated in seconds.</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#059669]" /> 2 Algorithmic coding tasks with 45 hidden test cases.</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#059669]" /> Tests for memory management, concurrency & edge cases.</li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex-1 relative"
            >
              <div className="absolute -inset-4 bg-[#059669]/10 rounded-lg -z-10 transform rotate-3"></div>
              <div className="bg-[#1C1917] p-6 rounded shadow-xl border border-[#333] text-white font-mono text-[13px] leading-relaxed">
                <div className="flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
                  <Terminal className="w-4 h-4 text-[#10B981]" /> 
                  <span className="text-[#A8A29E]">engine/generate.ts</span>
                </div>
                <p className="text-[#10B981]">➜ Requesting: "Rust Concurrency"</p>
                <p className="text-[#D6D3D1] mt-2">[INFO] Initializing Gemini 2.5 Pro Model...</p>
                <p className="text-[#D6D3D1]">[INFO] Synthesizing 25 distractors...</p>
                <p className="text-[#D6D3D1]">[INFO] Building 45 hidden O(N) boundary tests...</p>
                <p className="text-[#10B981] mt-2">✔ Assessment locked and ready.</p>
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
                <GitBranch className="w-4 h-4" /> 360° Candidate Dossier
              </div>
              <h3 className="text-3xl font-serif text-[#1C1917] mb-6 leading-tight">Don't trust resumes. Trust data.</h3>
              <p className="text-[15px] text-[#525252] leading-[1.8] mb-6">
                A test score isn't enough. MeritLane aggregates real-world evidence. We securely connect to Code to index commit history, parse ATS semantic data, and showcase live deployed projects.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E5E5E5] rounded hover:border-[#2563EB]/40 transition-colors duration-300">
                  <Activity className="w-5 h-5 text-[#2563EB] mb-2" />
                  <div className="font-semibold text-[#1C1917] text-[14px]">ATS Analysis</div>
                  <div className="text-[12px] text-[#78716C]">Semantic resume scoring</div>
                </div>
                <div className="p-4 bg-white border border-[#E5E5E5] rounded hover:border-[#2563EB]/40 transition-colors duration-300">
                  <Code className="w-5 h-5 text-[#2563EB] mb-2" />
                  <div className="font-semibold text-[#1C1917] text-[14px]">Git Telemetry</div>
                  <div className="text-[12px] text-[#78716C]">Commit volume & stacks</div>
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
                      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#78716C]">Evidence Profile</div>
                      <div className="text-[18px] font-serif text-[#1C1917] mt-1">Preview Mode</div>
                    </div>
                    <div className="text-[11px] font-mono text-green-600 font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> VERIFIED
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-sans mb-4">
                    <div>
                      <div className="text-[10px] font-medium text-[#78716C] uppercase mb-1">Git Telemetry</div>
                      <div className="font-mono text-[#1C1917] font-semibold">Authenticated</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-[#78716C] uppercase mb-1">Status</div>
                      <div className="font-mono text-[#1C1917] font-semibold">Pre-vetted</div>
                    </div>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-4">
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
      <section className="py-24 bg-[#0A0A0A] text-white border-y border-[#333]">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#A8A29E] mb-4">
              Two Sides, One Platform
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-snug text-white">
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
                className="inline-flex items-center justify-center p-3 bg-[#1C1917] border border-[#333] mb-6 rounded-none cursor-pointer"
              >
                <Code className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif text-white mb-6">For Candidates</h3>
              <div className="space-y-8">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">1. Take the Assessment</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Select your primary domain and complete our timed, proctored coding challenge.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">2. Build Your Profile</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Connect your Code, detail education, and showcase real-world deployed projects.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">3. Get Discovered</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Once verified, your profile enters the talent pool. Employers search and reach out directly.</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Employers */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }} 
                transition={{ duration: 0.4 }} 
                className="inline-flex items-center justify-center p-3 bg-[#1C1917] border border-[#333] mb-6 rounded-none cursor-pointer"
              >
                <Database className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif text-white mb-6">For Employers</h3>
              <div className="space-y-8">
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">1. Search with Certainty</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Filter candidates not by keywords, but by actual verified skills. High signal, low noise.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">2. Review the Evidence</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Examine assessment scores, Code telemetry, and live code implementations.</p>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">3. Connect Directly</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Message candidates directly. Skip the technical screen and go straight to system design.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. THE STORY / WHO BUILT THIS */}
      <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#F5F5F4] to-transparent rounded-full opacity-50 -z-10 translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#78716C] mb-6">
              The Mission
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1C1917] tracking-tight mb-10 max-w-3xl mx-auto">
              Built by engineers, for engineers.
            </h2>
            
            <div className="max-w-2xl mx-auto text-left">
              <p className="text-[16px] text-[#525252] leading-[1.8] mb-6">
                The technical hiring loop is broken. We watched brilliant developers get auto-rejected by keyword-matching algorithms because they didn't have the right "pedigree", while companies wasted thousands of hours interviewing candidates who couldn't write a basic sorting algorithm.
              </p>
              
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6 rounded-lg my-10 relative">
                <div className="absolute -top-3 -left-3 text-4xl text-[#D6D3D1] font-serif">"</div>
                <p className="text-[18px] font-serif italic text-[#1C1917] leading-relaxed text-center px-4 relative z-10">
                  MeritLane was built on a single, uncompromising belief: Code speaks louder than keywords. We evaluate candidates exactly how they build software in the real world.
                </p>
              </div>

              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
                className="flex flex-col sm:flex-row items-center gap-8 mt-12 bg-white border border-[#E5E5E5] p-8 rounded-2xl shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent rounded-full opacity-40 -z-10 translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-[#1C1917] to-[#44403C] rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-300"></div>
                  <div className="text-white font-serif text-3xl sm:text-4xl z-10 drop-shadow-md">SB</div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full mb-3 border border-amber-200">
                    <Sparkles className="w-3 h-3" /> Founder Profile
                  </div>
                  <h4 className="text-[24px] font-serif font-bold text-[#1C1917] leading-tight">Saitrishank B</h4>
                  <div className="text-[15px] font-medium text-[#78716C] mb-4">Founder & Lead Engineer, MeritLane</div>
                  <div className="flex gap-4 justify-center sm:justify-start">
                    <a href="https://github.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] font-semibold text-[#1C1917] hover:text-[#2563EB] transition-colors p-2.5 px-4 bg-[#FAFAFA] rounded border border-[#E5E5E5] hover:border-[#2563EB]/30 hover:bg-blue-50">
                      <Code className="w-4 h-4" /> GitHub
                    </a>
                    <a href="mailto:saitrishankb9@gmail.com" className="flex items-center gap-2 text-[13px] font-semibold text-[#1C1917] hover:text-amber-600 transition-colors p-2.5 px-4 bg-[#FAFAFA] rounded border border-[#E5E5E5] hover:border-amber-600/30 hover:bg-amber-50">
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
            <h2 className="text-3xl font-serif text-[#1C1917] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#78716C] text-[15px]">Everything you need to know about the MeritLane standard.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="border border-[#E5E5E5] bg-white rounded-lg overflow-hidden transition-colors hover:border-[#D6D3D1]"
                >
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className="font-semibold text-[#1C1917] text-[15px]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[#A8A29E] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 text-[14px] text-[#525252] leading-relaxed border-t border-[#FAFAFA] pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-24 sm:py-32 bg-[#0A0A0A] text-center border-t border-[#333]">
        <div className="mx-auto max-w-3xl px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight mb-6 leading-tight !text-white"
          >
            Transition from filtering resumes to hiring engineers.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg !text-[#A8A29E] mb-10 max-w-xl mx-auto"
          >
            Whether you are building a team or looking for your next role, Meritlane provides the ground truth for engineering talent.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8 w-full sm:w-auto !bg-white !text-black hover:!bg-[#E5E5E5] !border-white">
                Start Hiring
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8 w-full sm:w-auto !border-white !text-white !bg-transparent hover:!bg-white hover:!text-black">
                Apply as Developer
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EXPANDED FOOTER */}
      <footer className="py-16 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <span className="text-[14px] font-medium tracking-[0.25em] uppercase text-[#1C1917] flex items-center gap-2">
              <Globe className="w-4 h-4" /> Meritlane
            </span>
            <p className="text-[13px] text-[#78716C] leading-relaxed max-w-xs">
              Technical verification for the modern web. We replace noise with signal through rigorous code assessment.
            </p>
          </div>
          
          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-[#1C1917] mb-4">Product</h4>
            <ul className="space-y-3 text-[13px] text-[#78716C]">
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">For Employers</a></li>
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">For Candidates</a></li>
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">Assessment Engine</a></li>
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-[#1C1917] mb-4">Company</h4>
            <ul className="space-y-3 text-[13px] text-[#78716C]">
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">About Us</a></li>
              <li><a href="https://Code.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="hover:text-[#1C1917] transition-colors">Our Creator</a></li>
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#1C1917] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-[#1C1917] mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://Code.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:text-[#1C1917] hover:border-[#1C1917] transition-colors">
                <Code className="w-4 h-4" />
              </a>
              <a href="mailto:saitrishankb9@gmail.com" className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[#525252] hover:text-[#1C1917] hover:border-[#1C1917] transition-colors">
                <User className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-6 text-[12px] text-[#A8A29E]">
              © {new Date().getFullYear()} Meritlane. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
