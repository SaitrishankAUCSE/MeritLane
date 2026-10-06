"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Database, Shield, Code, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion } from "framer-motion";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function HomePage() {
  const { user, role, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [hasCachedSession, setHasCachedSession] = useState(false);

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
    <div className="flex flex-col theme-public bg-background min-h-screen w-full font-sans text-foreground">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 sm:px-12 md:px-16 lg:px-24 pt-24 pb-20 sm:pt-32 sm:pb-24 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8 w-full sm:w-auto">
              Hire Verified Talent
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8 w-full sm:w-auto">
              Prove Your Skills
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-24 bg-[#F5F5F4] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-4">
              The Status Quo
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[var(--color-foreground)] tracking-tight leading-snug">
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
                whileHover={{ y: -8, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.2, delay: i * 0.1 }}
                className="p-8 bg-white border border-[var(--color-border)] shadow-sm transition-colors hover:border-[#1C1917]/20 cursor-default"
              >
                <h3 className="text-lg font-serif font-medium text-[#1C1917] mb-3">{problem.title}</h3>
                <p className="text-sm text-[#525252] leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE APPROACH */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 text-center"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-4">
              Our Methodology
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[var(--color-foreground)] tracking-tight leading-snug max-w-3xl mx-auto">
              A standardized benchmark for technical competency.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-serif text-[var(--color-foreground)] mb-4">Proctored, Practical Engineering</h3>
              <p className="text-[15px] text-[#525252] leading-[1.8] mb-6">
                Meritlane doesn't rely on self-reported skills. We evaluate candidates through rigorous, time-boxed coding assessments.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-world programming tasks, not just algorithmic puzzles.",
                  "Strict proctoring prevents tab-switching, copy-pasting, and AI assistance.",
                  "Automated unit testing against hidden edge cases.",
                  "Code is executed securely in an isolated, standardized sandbox."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <span className="text-[14px] text-[#525252]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
              className="relative group cursor-default"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute -inset-4 bg-[#F5F5F4] rounded-lg -z-10 transform rotate-2 transition-transform duration-500 group-hover:rotate-4 group-hover:scale-105"></div>
                <div className="border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Sample Verified Profile</div>
                    <div className="text-[18px] font-serif text-[var(--color-foreground)] mt-1">ML-2026-B849</div>
                  </div>
                  <div className="text-[11px] font-mono text-green-600 font-medium mt-2 sm:mt-0 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> VERIFIED
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm font-sans mb-6">
                  <div>
                    <div className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Domain</div>
                    <div className="font-medium text-[var(--color-foreground)]">Full-Stack Development</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Assessment</div>
                    <div className="font-mono text-[var(--color-primary)] font-semibold">Passed (100%)</div>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3">Capabilities</div>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Node.js", "TypeScript", "System Design"].map(skill => (
                      <Badge key={skill} variant="neutral" className="font-mono text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-[var(--color-foreground)] text-white border-t border-[#333]">
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
            {/* Divider line for desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#333] transform -translate-x-1/2"></div>

            {/* Candidates */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2 }}>
              <motion.div 
                whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }} 
                transition={{ duration: 0.2 }} 
                className="inline-flex items-center justify-center p-3 bg-[#1C1917] border border-[#333] mb-6 rounded-none cursor-pointer"
              >
                <Code className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif text-white mb-6">For Candidates</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">1. Take the Assessment</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Select your primary domain and complete our timed, proctored coding challenge to prove your technical competence.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">2. Build Your Profile</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Connect your GitHub, detail your educational background, and showcase real-world projects that back up your code.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">3. Get Discovered</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Once verified, your profile enters our talent pool. Employers search directly for verified developers and reach out.</p>
                </div>
              </div>
            </motion.div>

            {/* Employers */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.2 }}>
              <motion.div 
                whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }} 
                transition={{ duration: 0.2 }} 
                className="inline-flex items-center justify-center p-3 bg-[#1C1917] border border-[#333] mb-6 rounded-none cursor-pointer"
              >
                <Database className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-serif text-white mb-6">For Employers</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">1. Search with Certainty</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Filter candidates not by keywords, but by actual verified skills. Every profile you see has passed our rigorous technical bar.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">2. Review the Evidence</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Examine their assessment scores, dive into their GitHub repositories, and review the code they wrote in their projects.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#D6D3D1] mb-2 uppercase tracking-wide">3. Connect Directly</h4>
                  <p className="text-[15px] text-[#A8A29E] leading-relaxed">Message candidates directly through the platform. Skip the technical phone screen and go straight to cultural fit and systems design.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-24 sm:py-32 bg-[#F8F6F3] text-center border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-3xl px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight mb-6 leading-tight text-[var(--color-foreground)]"
          >
            Transition from filtering resumes to hiring engineers.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.1 }}
            className="text-lg text-[#525252] mb-10 max-w-xl mx-auto"
          >
            Whether you are building a team or looking for your next role, Meritlane provides the ground truth for engineering talent.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8 w-full sm:w-auto">
                Start Hiring
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8 w-full sm:w-auto">
                Apply as Developer
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="py-12 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#1C1917]">
            Meritlane
          </span>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            © {new Date().getFullYear()} Meritlane. Technical verification for the modern web.
          </p>
        </div>
      </footer>
    </div>
  );
}
