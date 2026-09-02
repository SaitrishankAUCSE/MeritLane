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
      
      {/* HERO: Centered Editorial Statement with Highlighted Handwriting Animation */}
      <section className="relative px-6 sm:px-12 md:px-16 lg:px-24 pt-28 pb-24 sm:pt-36 sm:pb-32 w-full max-w-[1400px] mx-auto flex flex-col items-center text-center border-b border-border/40">
        
        {/* Top Eyebrow Badge */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 shadow-xs"
        >
          <span className="h-2 w-2 rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[11.5px] font-mono font-medium tracking-wider uppercase">
            The Meritlane Standard • Technical Talent Registry
          </span>
        </motion.div>

        {/* HIGHLIGHTED CENTERPIECE: The Animated Handwriting Word */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp}
          className="w-full flex justify-center items-center mb-4 sm:mb-6 min-h-[1.4em]"
        >
          <HandwritingText
            words={["Meritlane.", "Proof of skill.", "Audited code.", "Verified talent.", "Not pedigree."]}
            height="1.35em"
            duration={1.4}
            delay={0.1}
            interval={3200}
            className="text-emerald-700 dark:text-emerald-500 font-normal"
          />
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-serif text-foreground tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6"
        >
          Proof of skill.<br/>
          <span className="text-[#78716C] font-normal italic">Not just credentials.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[17px] sm:text-[19px] lg:text-[20px] text-[#525252] max-w-2xl mx-auto leading-[1.65] mb-10"
        >
          Meritlane is a technical talent verification institution. We audit code, validate engineering capabilities, and establish verifiable proof of skill—so you can hire based on evidence, not pedigree.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4 mb-16 sm:mb-20"
        >
          <Link href="/employer/dashboard">
            <Button className="bg-[#15803D] text-[#FFFFFF] h-12 px-8 rounded-full text-[15px] font-medium font-sans hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.25)] transition-all border border-emerald-600/30">
              Start hiring verified talent
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="h-12 px-8 rounded-full text-[15px] font-medium font-sans border-border bg-surface hover:bg-surface-low text-foreground transition-all">
              Get verified as an engineer
            </Button>
          </Link>
        </motion.div>

        {/* Repositioned Artifact: Architectural Blueprint Showcase directly beneath hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-[#15803D] animate-pulse shadow-[0_0_8px_rgba(21,128,61,0.4)]" />
                <div>
                  <div className="text-[11px] font-mono tracking-widest text-[#737373] uppercase">Protocol 001.A • Live Verification Record</div>
                  <div className="text-[20px] sm:text-[22px] font-serif text-foreground">Verified Engineering Profile</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-mono font-medium self-start sm:self-auto">
                <CheckCircle className="h-3.5 w-3.5 text-[#15803D]" />
                <span>STATUS: AUDITED & SIGNED</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider mb-4 border-l-2 border-[#15803D] pl-3">
                  Audited Capability Stack
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { name: "React", level: "Senior / Audited" },
                    { name: "TypeScript", level: "Production Rigor" },
                    { name: "Go", level: "Concurrent Systems" },
                    { name: "PostgreSQL", level: "Optimized Schemas" }
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-2 px-3 py-1.5 bg-surface-low border border-border text-foreground text-[13px] font-sans font-medium rounded-md">
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-[11px] font-mono text-[#737373] uppercase tracking-wider mb-4 border-l-2 border-[#15803D] pl-3">
                  Signal Validation Log
                </div>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 bg-surface-low/60 rounded border border-border/60">
                    <span className="flex items-center gap-2.5 text-foreground">
                      <span className="text-[#15803D] font-bold">✓</span>
                      <span>Technical Assessment Completed</span>
                    </span>
                    <span className="text-emerald-700 font-medium">94% Index</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-low/60 rounded border border-border/60">
                    <span className="flex items-center gap-2.5 text-foreground">
                      <span className="text-[#15803D] font-bold">✓</span>
                      <span>Project Architecture Audited</span>
                    </span>
                    <span className="text-emerald-700 font-medium">Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface-low/60 rounded border border-border/60">
                    <span className="flex items-center gap-2.5 text-foreground">
                      <span className="text-[#15803D] font-bold">✓</span>
                      <span>Identity & Provenance Hash Stored</span>
                    </span>
                    <span className="text-muted-foreground text-[11px]">0x7f9a...88c2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* THESIS SECTION */}
      <section className="py-32 bg-surface-low border-b border-border/40">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mx-auto max-w-5xl px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground tracking-tight leading-tight mb-10">
            Traditional hiring asks where you studied.
            <br />
            <span className="text-muted-foreground italic">Meritlane asks what you can prove.</span>
          </h2>
          <div className="w-px h-16 bg-border mx-auto"></div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-16"
          >
            {[
              { num: "01", title: "Build your proof", desc: "Connect your repositories, detail architecture decisions, and document technical contributions. Your work is the foundation." },
              { num: "02", title: "Get verified", desc: "Undergo rigorous technical assessments and code audits. We validate claims, establishing an irrefutable baseline of capability." },
              { num: "03", title: "Get discovered", desc: "Share your verified public record or join the private talent pool where top employers actively seek out validated engineering excellence." }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="border-t border-border pt-8 relative group">
                <div className="text-[10px] font-mono text-muted-foreground mb-4">{step.num}</div>
                <h3 className="text-xl font-serif text-foreground mb-4">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
                <div className="absolute top-0 left-0 w-0 h-px bg-foreground transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EVIDENCE SECTION */}
      <section className="py-32 bg-surface border-y border-border/40">
        <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-16 flex items-center justify-between border-b border-border pb-6"
          >
            <h2 className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              The Three Pillars of Proof
            </h2>
            <div className="h-px w-24 bg-border hidden sm:block" />
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-3 gap-16"
          >
            {[
              { icon: Code, title: "Skills", desc: "We move beyond keyword matching. Demonstrated competencies are extracted from your repository history, issue resolutions, and specific code contributions." },
              { icon: Shield, title: "Assessments", desc: "Targeted technical challenges designed not for algorithmic hazing, but to confirm practical architectural reasoning and systems-level problem solving." },
              { icon: Database, title: "Projects", desc: "A repository is just code; we verify context. We audit the live deployment, review source control history, and validate the complexity of your independent architectural decisions." }
            ].map((pillar, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col">
                <pillar.icon className="h-6 w-6 text-foreground mb-6" strokeWidth={1.5} />
                <h3 className="text-xl font-serif text-foreground mb-4">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 max-w-[65ch]">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SEARCH & DIRECTORY */}
      <section className="py-32 bg-background min-h-[600px]">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-3xl font-serif text-foreground mb-8 tracking-tight">Explore verified talent</h2>
            
            <div className="flex flex-col md:flex-row gap-0 border border-border bg-surface shadow-sm focus-within:border-foreground transition-colors">
              <div className="flex-1 flex items-center px-6 py-4">
                <Search className="h-5 w-5 text-muted-foreground mr-4 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Query by title, skills, or college" 
                  className="w-full bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-lg font-mono text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button 
                className="w-full md:w-auto px-8 py-4 bg-foreground hover:bg-surface-high text-background border-l border-border font-medium text-sm transition-colors"
                onClick={handleSearch}
              >
                Execute Query
              </button>
            </div>
          </motion.div>
          
          <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
            <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">
              {searchQuery ? `Search Results [${displayedCandidates.length}]` : "Recently Verified Records"}
            </h3>
          </div>
          
          {loading ? (
            <div className="py-20 text-muted-foreground font-mono text-sm flex items-center gap-4">
              <div className="h-4 w-4 border border-outline border-t-foreground animate-spin"></div>
              Retrieving public records...
            </div>
          ) : displayedCandidates.length === 0 ? (
            <div className="border border-border bg-surface p-12 text-left">
              <h3 className="text-base font-serif text-foreground">No verified records match your query</h3>
              <p className="mt-2 text-sm text-muted-foreground font-mono">System suggests broadening search parameters.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {displayedCandidates.map((c) => (
                <motion.div key={c.id} variants={fadeUp} className="border border-border bg-surface p-6 hover:border-foreground/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                    <div className="flex gap-5">
                      <div className="h-14 w-14 bg-background flex items-center justify-center font-serif text-xl text-foreground border border-border shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-serif text-foreground">{c.name || "Anonymous Candidate"}</h4>
                          <span className="h-2 w-2 rounded-full bg-emerald-700" />
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mb-4">
                          {c.branch} • Class of {c.gradYear}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {c.skills?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 border border-border text-foreground text-[10px] font-mono uppercase tracking-wider">
                              {skill}
                            </span>
                          ))}
                          {c.skills?.length > 5 && (
                            <span className="text-[10px] font-mono text-muted-foreground px-2 py-1">+{c.skills.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <Link href={`/p/${c.id || (c as any).uid}`}>
                        <Button variant="outline" size="sm" className="rounded-none border-border hover:bg-background" rightIcon={<ChevronRight className="h-4 w-4" />}>
                          Inspect Record
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

      {/* DUAL CTA SECTION */}
      <section className="border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Employer */}
          <div className="p-16 lg:p-32 bg-surface flex flex-col justify-center hover:bg-surface-high transition-colors group cursor-pointer" onClick={() => router.push('/employer/dashboard')}>
            <div className="max-w-md mx-auto w-full">
              <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-6">For Employers</div>
              <h2 className="text-3xl lg:text-4xl font-serif text-foreground mb-6 tracking-tight">
                Stop screening resumes.<br/>Start reviewing proof.
              </h2>
              <p className="text-muted-foreground mb-10 text-sm leading-relaxed max-w-[65ch]">
                Instantly discover candidates whose skills are already audited and verified. Reduce hiring risk and engineering interview hours by trusting the Meritlane standard.
              </p>
              <div className="flex items-center text-sm font-medium text-foreground group-hover:translate-x-2 transition-transform">
                Initiate Hiring Protocol <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Engineer */}
          <div className="p-16 lg:p-32 bg-background flex flex-col justify-center hover:bg-surface-low transition-colors group cursor-pointer" onClick={() => router.push('/signup')}>
            <div className="max-w-md mx-auto w-full">
              <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-6">For Engineers</div>
              <h2 className="text-3xl lg:text-4xl font-serif text-foreground mb-6 tracking-tight">
                Make your work easier to trust.
              </h2>
              <p className="text-muted-foreground mb-10 text-sm leading-relaxed max-w-[65ch]">
                Stand out in a crowded market by providing irrefutable evidence of your capabilities. Share your official verification record with anyone.
              </p>
              <div className="flex items-center text-sm font-medium text-foreground group-hover:translate-x-2 transition-transform">
                Begin Verification <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

