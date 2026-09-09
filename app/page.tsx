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

  if (authLoading || (user && profileLoading) || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <div className="h-6 w-6 border-2 border-[var(--color-outline)] border-t-[var(--color-foreground)] rounded-full animate-spin" />
      </div>
    );
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
          <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-[#78716C]">
            The Meritlane Register
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
            words={["Meritlane.", "Audited code.", "Verified talent.", "Cryptographic proof."]}
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
          Independent Technical Evaluation.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[16px] sm:text-[18px] text-[#525252] max-w-2xl mx-auto leading-[1.7] mb-10 font-sans"
        >
          Meritlane is an independent technical examination registry. We evaluate source code, administer proctored technical evaluations, and establish verifiable public proof of engineering competency—so hiring is grounded in demonstrable evidence.
        </motion.p>

        {/* Action Buttons: Crisp Rectangular Format */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Button href="/employer/dashboard" variant="primary" size="lg" className="rounded-none px-8">
            Access Verified Register
          </Button>
          <Button href="/signup" variant="outline" size="lg" className="rounded-none px-8">
            Begin Verification
          </Button>
        </motion.div>

        {/* Authentic Archival Register Extract */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto text-left border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[var(--color-border)] pb-4 mb-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Attestation Record Extract</div>
              <div className="text-[18px] font-serif text-[var(--color-foreground)] mt-0.5">ML-2026-B849 · Verified Software Engineer</div>
            </div>
            <div className="text-[11px] font-mono text-[var(--color-primary)] font-medium mt-2 sm:mt-0">
              AUDITED &amp; ATTESTED
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-sans mb-6">
            <div>
              <div className="text-[10px] font-mono text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Evaluated Discipline</div>
              <div className="font-medium text-[var(--color-foreground)]">Full-Stack &amp; Systems</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Examination Score</div>
              <div className="font-mono text-[var(--color-primary)] font-semibold">PASS (Threshold Met)</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Git Repository Audit</div>
              <div className="font-medium text-[#1C1917]">Verified 14 Repositories</div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 flex flex-wrap items-center justify-between text-xs text-[var(--color-muted-foreground)] font-mono gap-2">
            <span>Verified under Standard 2026.4</span>
            <span>Cryptographic Dossier Available for Inspection</span>
          </div>
        </motion.div>
      </section>

      {/* REGISTRY STANDARDS SECTION */}
      <section id="standards" className="py-20 sm:py-28 bg-[var(--color-background)] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-left mb-14"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-3">
              Institutional Evaluation Canon
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[var(--color-foreground)] tracking-tight leading-snug">
              Objective examination criteria for the modern engineering workforce.
            </h2>
          </motion.div>

          {/* Linear Canonical Protocols */}
          <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] bg-[var(--color-surface)]">
            {[
              {
                num: "01",
                title: "Supervised Technical Examination",
                detail: "Every candidate undergoes timed 45-minute programming challenges in isolated runtime sandboxes. Code is graded directly against hidden unit tests and edge-case suites, requiring all component thresholds to be met for verification."
              },
              {
                num: "02",
                title: "Repository & Commit Provenance",
                detail: "Candidate claims are substantiated against public and authenticated Git histories. Commit chronology, architectural complexity, and individual contributions are audited to confirm practical implementation ability."
              },
              {
                num: "03",
                title: "Monitored Session Integrity",
                detail: "Assessments enforce strict runtime containment with window blur detection, fullscreen validation, and anti-copy mechanisms. Infractions trigger automatic disqualifications and mandatory cooldown periods."
              },
              {
                num: "04",
                title: "Immutable Public Dossiers",
                detail: "Successful evaluations generate a permanent, public dossier record. Hiring teams inspect complete code submissions, test benchmarks, and verified skills directly—eliminating resume keyword ambiguity."
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

      {/* VERIFIED REGISTER PREVIEW & EMPLOYER ACCESS */}
      <section className="py-24 sm:py-32 bg-[var(--color-background)]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-10 text-left"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-2">
              Attestation Directory Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[var(--color-foreground)] tracking-tight mb-4">
              Verified Engineering Records
            </h2>
            <p className="text-sm text-[#525252] leading-relaxed max-w-2xl font-sans">
              Candidates who clear our proctored compiler evaluations and repository audits are entered into the Meritlane Register. Each record contains cryptographic proof of technical capability.
            </p>
          </motion.div>

          {/* Illustrative Dossier Record Cards */}
          <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)] mb-8">
            {[
              {
                ref: "ML-2026-B849",
                discipline: "Distributed Systems & Backend",
                meta: "Class of 2026 · Autonomous Code Audited",
                status: "VERIFIED · PASS",
                skills: ["Node.js", "Python", "Docker", "PostgreSQL", "System Architecture"]
              },
              {
                ref: "ML-2026-C192",
                discipline: "Frontend & Web Engineering",
                meta: "Class of 2025 · Runtime Evaluated",
                status: "VERIFIED · PASS",
                skills: ["React", "TypeScript", "Next.js", "Browser API", "State Engines"]
              },
              {
                ref: "ML-2026-A504",
                discipline: "Cloud Infrastructure & SRE",
                meta: "Class of 2026 · Scenario Evaluated",
                status: "VERIFIED · PASS",
                skills: ["AWS", "Kubernetes", "Linux", "CI/CD", "Security Protocols"]
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
                      Inspect Record →
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
                  Candidate Privacy & Confidentiality Shield
                </h4>
                <p className="text-xs text-[#525252] leading-relaxed max-w-xl font-sans">
                  To protect candidates currently in school or employment, personal identities and dossier inspection are restricted to authenticated, verified hiring teams.
                </p>
              </div>
            </div>

            <Link href="/employer/dashboard" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="md" className="rounded-none px-6 w-full text-xs font-mono uppercase tracking-wider">
                Access Talent Pool
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* INSTITUTIONAL COLOPHON & NOTICE */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-low)] py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-muted-foreground)] mb-3">
            Institutional Attestation
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] tracking-tight mb-4">
            The National Register of Evaluated Engineering Talent
          </h2>
          <p className="text-sm text-[#525252] leading-relaxed max-w-xl mx-auto mb-8 font-sans">
            Meritlane maintains an independent standard of competence for software engineers in India. Records are permanently cataloged and verifiable by authorized hiring organizations without commercial intermediaries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/employer/dashboard"
              className="px-6 py-2.5 bg-[var(--color-foreground)] text-[var(--color-background)] border border-[var(--color-foreground)] text-xs font-mono uppercase tracking-wider hover:bg-[#292524] transition-colors"
            >
              Open Employer Portal
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 border border-[var(--color-foreground)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-xs font-mono uppercase tracking-wider hover:bg-[var(--color-surface-dim)] transition-colors"
            >
              Begin Verification
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

