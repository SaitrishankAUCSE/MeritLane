"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Database, Shield, Code, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getPlatformStats } from "@/lib/firebase/home";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion } from "framer-motion";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function HomePage() {
  const { user, role, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ registeredCandidates: 0, activeEmployers: 0, verifiedProfiles: 0 });

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

  useEffect(() => {
    async function loadStats() {
      try {
        const fetchedStats = await getPlatformStats();
        setStats(fetchedStats);
      } catch (err) {
        console.error("Failed to load platform stats:", err);
      }
    }
    if (!user) {
      loadStats();
    }
  }, [user]);

  if ((user && profileLoading) || user) {
    return <MeritlaneLoader level="page" />;
  }

  return (
    <div className="flex flex-col theme-public bg-background min-h-screen w-full font-sans text-foreground">
      
      {/* HERO: Editorial Statement with Prominent Handwriting Centerpiece */}
      <section className="relative px-6 sm:px-12 md:px-16 lg:px-24 pt-20 pb-20 sm:pt-28 sm:pb-24 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
        
        {/* Editorial Eyebrow */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="h-px w-12 bg-[#1C1917]/20" />
          <span className="text-[11px] font-medium font-medium tracking-[0.25em] uppercase text-[#78716C]">
            Meritlane
          </span>
          <span className="h-px w-12 bg-[#1C1917]/20" />
        </motion.div>

        {/* Centerpiece: Handwriting Signature */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp}
          className="w-full flex justify-center items-center mb-4 sm:mb-6 min-h-[2.2em] sm:min-h-[2.6em]"
        >
          <HandwritingText
            words={["Meritlane.", "Real code.", "Verified skills.", "Proof of work."]}
            height="2.2em"
            duration={1.5}
            delay={0.1}
            interval={3200}
            strokeWidth={2.0}
            className="text-[var(--color-primary)] font-normal"
          />
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[44px] sm:text-[58px] md:text-[70px] lg:text-[78px] font-serif text-[var(--color-foreground)] tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6 font-normal"
        >
          Hire Developers Based on Real Skills.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[16px] sm:text-[18px] text-[#525252] max-w-2xl mx-auto leading-[1.7] mb-10 font-sans"
        >
          Meritlane helps students and developers prove what they can build. Take practical coding tests, connect your projects, and share a verified profile with hiring teams.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8">
            Browse Candidates
          </Button>
          <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8">
            Get Verified
          </Button>
        </motion.div>

        {/* Sample Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto text-left border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[var(--color-border)] pb-4 mb-6">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Sample Verified Profile</div>
              <div className="text-[18px] font-serif text-[var(--color-foreground)] mt-0.5">ML-2026-B849 · Verified Software Engineer</div>
            </div>
            <div className="text-[11px] font-mono text-[var(--color-primary)] font-medium mt-2 sm:mt-0">
              VERIFIED DEVELOPER
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-sans mb-6">
            <div>
              <div className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Focus Area</div>
              <div className="font-medium text-[var(--color-foreground)]">Full-Stack &amp; Systems</div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Skill Test Score</div>
              <div className="font-mono text-[var(--color-primary)] font-semibold">Passed (88%)</div>
            </div>
            <div>
              <div className="text-[10px] font-medium text-[#78716C] uppercase tracking-wider mb-1">GitHub Activity</div>
              <div className="font-medium text-[#1C1917]">Active Code History</div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 flex flex-wrap items-center justify-between text-xs text-[var(--color-muted-foreground)] font-mono gap-2">
            <span>Verified on Meritlane</span>
            <span>Public proof and projects ready to view</span>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="standards" className="py-20 sm:py-28 bg-[var(--color-background)] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-left mb-14"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-3">
              How It Works
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[var(--color-foreground)] tracking-tight leading-snug">
              Clear proof of technical skills for the modern tech workforce.
            </h2>
          </motion.div>

          {/* Protocols */}
          <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] bg-[var(--color-surface)]">
            {[
              {
                num: "01",
                title: "Practical Coding Tests",
                detail: "Candidates take timed 45-minute programming challenges in an online code editor. Code is tested against automated unit tests and test suites."
              },
              {
                num: "02",
                title: "GitHub & Project Proof",
                detail: "Connect your GitHub account and showcase real projects. Recruiters can view your code, commit history, and live applications directly."
              },
              {
                num: "03",
                title: "Fair, Timed Environment",
                detail: "Tests run in a fullscreen monitored browser window with copy-paste protections to ensure fair and honest results for everyone."
              },
              {
                num: "04",
                title: "Shareable Verified Profile",
                detail: "Passing a test earns a verified badge on your public profile link. Add it to your resume or LinkedIn to stand out to employers."
              }
            ].map((protocol) => (
              <div key={protocol.num} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                <span className="font-mono text-xs font-semibold text-[#78716C] shrink-0 pt-1">
                  [{protocol.num}]
                </span>
                <div>
                  <h3 className="text-[17px] font-serif font-medium text-[#1C1917] mb-2">
                    {protocol.title}
                  </h3>
                  <p className="text-[14px] text-[#525252] leading-relaxed font-sans max-w-2xl">
                    {protocol.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFIED TALENT PREVIEW & EMPLOYER ACCESS */}
      <section className="py-24 sm:py-32 bg-[var(--color-background)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10 text-left"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-2">
              Verified Talent
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[var(--color-foreground)] tracking-tight mb-4">
              Explore Verified Profiles
            </h2>
            <p className="text-sm text-[#525252] leading-relaxed max-w-2xl font-sans">
              Developers who pass coding challenges and attach real projects earn verified badges. View sample profiles below:
            </p>
          </motion.div>

          {/* Cards */}
          <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)] mb-8">
            {[
              {
                ref: "ML-2026-B849",
                discipline: "Distributed Systems & Backend",
                meta: "Class of 2026 · Code Tested",
                status: "VERIFIED · PASS",
                skills: ["Node.js", "Python", "Docker", "PostgreSQL", "System Architecture"]
              },
              {
                ref: "ML-2026-C192",
                discipline: "Frontend & Web Engineering",
                meta: "Class of 2025 · Code Tested",
                status: "VERIFIED · PASS",
                skills: ["React", "TypeScript", "Next.js", "Browser API", "State Management"]
              },
              {
                ref: "ML-2026-A504",
                discipline: "Cloud Infrastructure & DevOps",
                meta: "Class of 2026 · Code Tested",
                status: "VERIFIED · PASS",
                skills: ["AWS", "Kubernetes", "Linux", "CI/CD", "Docker"]
              }
            ].map((dossier) => (
              <div key={dossier.ref} className="p-5 sm:p-6 bg-[var(--color-surface)] hover:bg-[var(--color-surface-dim)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-[var(--color-foreground)]">{dossier.ref}</span>
                    <span className="text-[10px] font-mono text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-1.5 py-0.5 border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] font-medium">
                      {dossier.status}
                    </span>
                  </div>
                  <div className="text-xs font-serif text-[var(--color-foreground)] mb-1 font-medium">{dossier.discipline}</div>
                  <div className="text-[11px] font-mono text-[var(--color-muted-foreground)] mb-3">{dossier.meta}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-foreground)] text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <Link href="/employer/dashboard">
                    <Button variant="outline" size="sm" className="rounded-none border-[#E7E2DA] hover:border-[#1C1917] text-xs font-mono">
                      View Profile →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy & Secure Access Callout */}
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-dim)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div>
                <h4 className="text-sm font-serif font-medium text-[var(--color-foreground)] mb-1">
                  Candidate Privacy First
                </h4>
                <p className="text-xs text-[#525252] leading-relaxed max-w-xl font-sans">
                  We protect student and developer privacy. Full profiles and direct messaging are only accessible by verified hiring teams.
                </p>
              </div>
            </div>

            <Link href="/employer/dashboard" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="md" className="rounded-none px-6 w-full text-xs font-sans font-semibold uppercase tracking-wide">
                Browse Talent
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-low)] py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-3">
            Get Started
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] tracking-tight mb-4">
            A Fair, Skill-First Way to Get Hired
          </h2>
          <p className="text-sm text-[#525252] leading-relaxed max-w-xl mx-auto mb-8 font-sans">
            Meritlane gives every software engineer an equal opportunity to stand out through verified coding tests and real-world projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/employer/dashboard"
              className="px-6 py-2.5 bg-[var(--color-foreground)] text-[var(--color-background)] border border-[var(--color-foreground)] text-xs font-sans font-semibold uppercase tracking-wide hover:bg-[#292524] transition-colors"
            >
              For Employers
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 border border-[var(--color-foreground)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-xs font-sans font-semibold uppercase tracking-wide hover:bg-[var(--color-surface-dim)] transition-colors"
            >
              For Candidates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

