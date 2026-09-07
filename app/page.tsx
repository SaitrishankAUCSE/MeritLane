"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, ArrowRight, Database, Shield, Code, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getPlatformStats, getVerifiedCandidates } from "@/lib/firebase/home";
import { CandidateProfile } from "@/lib/firebase/candidate";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ registeredCandidates: 0, activeEmployers: 0, verifiedProfiles: 0 });
  const [candidates, setCandidates] = useState<(CandidateProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedCandidates, setDisplayedCandidates] = useState<(CandidateProfile & { id: string })[]>([]);

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
    async function loadData() {
      try {
        const [fetchedStats, fetchedCandidates] = await Promise.all([
          getPlatformStats(),
          getVerifiedCandidates()
        ]);
        setStats(fetchedStats);
        setCandidates(fetchedCandidates);
        setDisplayedCandidates(fetchedCandidates);
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!user) {
      loadData();
    }
  }, [user]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDisplayedCandidates(candidates);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const filtered = candidates.filter(c => {
      const hasSkill = c.skills?.some(skill => skill.toLowerCase().includes(query));
      const hasTitle = c.branch?.toLowerCase().includes(query) || c.college?.toLowerCase().includes(query);
      return hasSkill || hasTitle;
    });
    setDisplayedCandidates(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (authLoading || (user && profileLoading) || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin" />
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
            words={["Meritlane.", "Proof of skill.", "Audited code.", "Verified talent.", "Not pedigree."]}
            height="2.2em"
            duration={1.5}
            delay={0.1}
            interval={3200}
            strokeWidth={2.0}
            className="text-[#064E3B] font-normal"
          />
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[44px] sm:text-[58px] md:text-[70px] lg:text-[78px] font-serif text-[#1C1917] tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6 font-normal"
        >
          Proof of skill.<br/>
          <span className="text-[#78716C] italic">Not pedigree.</span>
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
            Candidate Examination
          </Button>
        </motion.div>

        {/* Authentic Archival Register Extract */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto text-left border border-[#E7E2DA] bg-white p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E7E2DA] pb-4 mb-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#78716C]">Attestation Record Extract</div>
              <div className="text-[18px] font-serif text-[#1C1917] mt-0.5">ML-2026-B849 · Verified Software Engineer</div>
            </div>
            <div className="text-[11px] font-mono text-[#064E3B] font-medium mt-2 sm:mt-0">
              AUDITED &amp; ATTESTED
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-sans mb-6">
            <div>
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Evaluated Discipline</div>
              <div className="font-medium text-[#1C1917]">Full-Stack &amp; Systems</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Examination Score</div>
              <div className="font-mono text-[#064E3B] font-semibold">94% (Threshold: 80%)</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Git Repository Audit</div>
              <div className="font-medium text-[#1C1917]">Verified 14 Repositories</div>
            </div>
          </div>

          <div className="border-t border-[#E7E2DA] pt-4 flex flex-wrap items-center justify-between text-xs text-[#78716C] font-mono gap-2">
            <span>Verified under Standard 2026.4</span>
            <span>Cryptographic Dossier Available for Inspection</span>
          </div>
        </motion.div>
      </section>

      {/* REGISTRY STANDARDS SECTION (Replacing SaaS Comparison Matrix) */}
      <section id="standards" className="py-20 sm:py-28 bg-[#FAF8F5] border-y border-[#E7E2DA]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-left mb-14"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#78716C] mb-3">
              Institutional Evaluation Canon
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1C1917] tracking-tight leading-snug">
              Objective examination criteria for the modern engineering workforce.
            </h2>
          </motion.div>

          {/* Linear Canonical Protocols */}
          <div className="divide-y divide-[#E7E2DA] border-y border-[#E7E2DA] bg-white">
            {[
              {
                num: "01",
                title: "Supervised Technical Examination",
                detail: "Every candidate undergoes timed 45-minute programming challenges in isolated runtime sandboxes. Code is graded directly against hidden unit tests and edge-case suites, requiring an 80% composite mark for verification."
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

      {/* SEARCH & PUBLIC DIRECTORY */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#78716C] mb-2">
              Public Register
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1C1917] tracking-tight mb-8">
              Verified Engineering Records
            </h2>
            
            <div className="flex flex-col sm:flex-row border border-[#1C1917] bg-white">
              <div className="flex-1 flex items-center px-4 py-3">
                <Search className="h-4 w-4 text-[#78716C] mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by skill, discipline, or institution..." 
                  className="w-full bg-transparent focus:outline-none text-[#1C1917] placeholder:text-[#A8A29E] text-sm font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button 
                className="px-6 py-3 bg-[#1C1917] text-white hover:bg-[#292524] text-xs font-mono uppercase tracking-wider transition-colors shrink-0"
                onClick={handleSearch}
              >
                Search Register
              </button>
            </div>
          </motion.div>
          
          <div className="flex justify-between items-center mb-6 border-b border-[#E7E2DA] pb-3">
            <h3 className="text-[11px] font-mono tracking-wider text-[#78716C] uppercase">
              {searchQuery ? `Matching Records [${displayedCandidates.length}]` : "Recently Verified Candidates"}
            </h3>
          </div>
          
          {loading ? (
            <div className="py-16 text-[#78716C] font-mono text-xs flex items-center gap-3">
              <div className="h-3.5 w-3.5 border border-[#1C1917] border-t-transparent animate-spin"></div>
              Accessing public register records...
            </div>
          ) : displayedCandidates.length === 0 ? (
            <div className="border border-[#E7E2DA] bg-[#FAF8F5] p-10 text-left">
              <h3 className="text-sm font-serif text-[#1C1917]">No verified records found</h3>
              <p className="mt-1 text-xs text-[#78716C] font-mono">No registered candidates match the current search query.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="divide-y divide-[#E7E2DA] border border-[#E7E2DA]"
            >
              {displayedCandidates.map((c) => (
                <motion.div key={c.id} variants={fadeUp} className="p-5 sm:p-6 bg-white hover:bg-[#FAF8F5] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center font-serif text-base text-[#1C1917] shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-serif font-medium text-[#1C1917]">{c.name || "Candidate Record"}</h4>
                          <span className="text-[10px] font-mono text-[#064E3B] bg-[#064E3B]/10 px-1.5 py-0.5 border border-[#064E3B]/20">Verified</span>
                        </div>
                        <div className="text-xs font-mono text-[#78716C] mb-3">
                          {c.branch || "Engineering"} {c.gradYear ? `· Class of ${c.gradYear}` : ""} {c.college ? `· ${c.college}` : ""}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 border border-[#E7E2DA] text-[#1C1917] text-[10px] font-mono">
                              {skill}
                            </span>
                          ))}
                          {c.skills?.length > 5 && (
                            <span className="text-[10px] font-mono text-[#78716C] px-1.5 py-0.5">+{c.skills.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 self-start sm:self-center">
                      <Link href={`/p/${c.id || (c as any).uid}`}>
                        <Button variant="outline" size="sm" className="rounded-none border-[#E7E2DA] hover:border-[#1C1917] text-xs">
                          Inspect Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* INSTITUTIONAL COLOPHON & NOTICE (Replacing Dual SaaS CTA) */}
      <section className="border-t border-[#E7E2DA] bg-[#FAF8F5] py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#78716C] mb-3">
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
              className="px-6 py-2.5 bg-[#1C1917] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#292524] transition-colors"
            >
              Open Employer Portal
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 border border-[#1C1917] bg-white text-[#1C1917] text-xs font-mono uppercase tracking-wider hover:bg-[#F8F6F3] transition-colors"
            >
              Register for Evaluation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

