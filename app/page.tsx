"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck, Briefcase, ChevronRight, Layers, Activity, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, targetRole: "candidate" | "employer") => {
    e.preventDefault();
    logFunnelEvent("landing_cta_clicked", { role: targetRole });
    if (user && role) {
      router.push(role === "candidate" ? "/candidate/profile" : "/employer/dashboard");
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="flex flex-col bg-[var(--color-background)]">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-[#0A192F]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 border border-[#D4AF37]/50 bg-[#F0EAD6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A192F] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
              Verified Technical Hiring
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-serif font-black tracking-tight text-[#0A192F] sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.08]">
            Proof of skill beats <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>college pedigree.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#0A192F]/80 sm:text-lg">
            Meritlane helps engineering talent prove what they can build, so employers can evaluate real ability beyond college brand.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/candidate/profile"
              onClick={(e) => handleCtaClick(e, "candidate")}
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto bg-[#0A192F] text-white hover:bg-[#0A192F]/90 rounded-none border border-[#0A192F]" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Prove your skills
              </Button>
            </Link>
            <Link
              href="/employer/dashboard"
              onClick={(e) => handleCtaClick(e, "employer")}
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none border-[#0A192F] text-[#0A192F] hover:bg-[#F0EAD6]">
                Hire with proof
              </Button>
            </Link>
          </div>

          <div className="mx-auto mt-16 max-w-4xl border-4 border-[#0A192F] bg-white p-2 shadow-xl">
            <div className="overflow-hidden border border-[#0A192F]/20 relative aspect-[1200/630]">
              <Image 
                src="/images/verification-preview.jpg" 
                alt="Meritlane Candidate Profile Preview"
                fill
                priority
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM STATEMENT */}
      <section className="border-b border-zinc-200/70 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mx-auto max-w-3xl text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
            A resume tells you what someone claims.<br />Proof shows you what they can do.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Hiring teams default to prestigious college filters because traditional resumes are noisy. Meritlane replaces the pedigree filter with a verified track record, surfacing capable engineers who would otherwise be filtered out.
          </p>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-16 sm:py-24 border-b border-zinc-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">The Meritlane Model</h2>
            <p className="mt-2 text-base text-zinc-600">From unverified graduate to trusted engineering talent.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "01", title: "Build your proof", desc: "Submit your GitHub repositories and real-world projects as foundational evidence of your ability.", icon: Layers },
              { num: "02", title: "Verify your skills", desc: "Complete a standardized, securely monitored technical assessment to validate your competence.", icon: Cpu },
              { num: "03", title: "Get discovered", desc: "Employers evaluate your verified evidence directly, bypassing automated keyword resume screens.", icon: Briefcase },
              { num: "04", title: "Build a track record", desc: "Our long-term vision: your on-the-job hiring outcomes will continuously strengthen your verified signal.", icon: Activity },
            ].map((step, i) => (
              <div 
                key={i} 
                className="card-interactive flex flex-col rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-400 font-mono">{step.num}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <step.icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PROOF STACK */}
      <section className="border-b border-zinc-200/70 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">The Candidate Proof Stack</h2>
              <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                We combine multiple technical signals into a single, trusted professional record. Hiring managers can review a candidate&apos;s holistic engineering ability in seconds.
              </p>
              <div className="mt-8 space-y-3">
                {['Verified Technical Assessment', 'GitHub Activity & History', 'Production Project Portfolio', 'Core Engineering Skills'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-medium text-zinc-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-8 shadow-sm">
              <div className="space-y-6">
                <div className="border-b border-zinc-200/80 pb-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Verification Status</div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-semibold text-zinc-900">Skill Verified</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Verified Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'Backend Engineering', 'API Design'].map(skill => (
                      <span key={skill} className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-200/80">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Technical Audit</div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Automated code correctness and execution test suite passed (Score: 5/5).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: VALUE PROPOSITIONS */}
      <section className="py-16 sm:py-24 border-b border-zinc-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-950 p-8 sm:p-10 text-white shadow-md border border-zinc-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">Engineers</span>
                <h3 className="text-xl font-bold mt-2 text-white">For Candidates</h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  Make your ability visible. Show employers exactly what you can build, rather than relying on where you studied. Earn your verification and let your code speak for you.
                </p>
              </div>
              <Link
                href="/candidate/profile"
                onClick={(e) => handleCtaClick(e, "candidate")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Build your proof <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600">Recruiters</span>
                <h3 className="text-xl font-bold mt-2 text-zinc-900">For Employers</h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  Evaluate evidence before pedigree. Access an engineering talent pool that has already proven technical competence through standardized code assessments.
                </p>
              </div>
              <Link
                href="/employer/dashboard"
                onClick={(e) => handleCtaClick(e, "employer")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Hire with proof <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TRUST */}
      <section className="bg-white py-16 border-b border-zinc-200/60">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">What does &quot;Verified&quot; mean?</h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
            A &quot;Verified&quot; status means the candidate has successfully completed Meritlane&apos;s secure technical assessment for a specific engineering skill (e.g., Python). It is an objective credential demonstrating practical coding competence.
          </p>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="bg-zinc-50/80 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Your next hire should be based on what they can do.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/candidate/profile"
              onClick={(e) => handleCtaClick(e, "candidate")}
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="primary" className="w-full sm:w-auto">Build your proof</Button>
            </Link>
            <Link
              href="/employer/dashboard"
              onClick={(e) => handleCtaClick(e, "employer")}
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Find verified talent</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Meritlane
            </div>
            <nav className="flex gap-6 text-sm text-zinc-500">
              <Link href="/candidate/profile" className="hover:text-zinc-900 transition-colors">Candidates</Link>
              <Link href="/employer/dashboard" className="hover:text-zinc-900 transition-colors">Employers</Link>
              <span className="text-zinc-400">Privacy</span>
              <span className="text-zinc-400">Terms</span>
            </nav>
          </div>
          <div className="mt-8 text-center text-xs text-zinc-400 sm:text-left">
            &copy; {new Date().getFullYear()} Meritlane. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
