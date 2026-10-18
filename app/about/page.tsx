"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Award, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans theme-public">
      {/* Header bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-full.png" alt="Meritlane" className="h-5 w-auto" />
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 py-16 lg:px-8">
        {/* Hero */}
        <div className="mb-14 pb-8 border-b border-border text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4 border border-border px-3.5 py-1 rounded bg-surface">
            <Shield className="h-3.5 w-3.5" /> Independent Technical Register
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-foreground tracking-tight leading-[1.15] mb-6 font-normal">
            Replacing Resumes with Verifiable Engineering Proof.
          </h1>
          <p className="text-[17px] text-muted-foreground leading-relaxed font-sans">
            Meritlane was founded to solve a fundamental crisis in tech hiring: credentials and keyword-matched resumes no longer signal actual technical competence. We built the verified evaluation standard for engineers.
          </p>
        </div>

        {/* Narrative / Mission */}
        <div className="space-y-12">
          <section className="bg-surface p-8 sm:p-10 border border-border rounded-xl">
            <h2 className="font-serif text-2xl text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
              Millions of talented developers in India are locked out of elite opportunities simply because they attend tier-2 or tier-3 universities, or because automated applicant tracking systems (ATS) discard them before a human ever looks at their code.
            </p>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              At the same time, engineering leaders waste hundreds of hours screening candidates who pass behavioral interviews but struggle with basic algorithms, concurrency, and architecture. Meritlane bridges this gap through objective, proctored evaluations and cryptographic proof of work.
            </p>
          </section>

          {/* Pillars */}
          <section>
            <h2 className="font-serif text-2xl text-foreground mb-6 text-center">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface border border-border rounded-lg">
                <Target className="h-6 w-6 text-emerald-600 mb-3" />
                <h3 className="font-serif text-[17px] text-foreground font-semibold mb-2">Zero Proxies</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  We measure verified capability—not pedigree, college rank, or buzzwords. If your code compiles and passes hidden test suites, you belong.
                </p>
              </div>

              <div className="p-6 bg-surface border border-border rounded-lg">
                <Award className="h-6 w-6 text-blue-600 mb-3" />
                <h3 className="font-serif text-[17px] text-foreground font-semibold mb-2">Immutable Dossiers</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Every verified skill links to an unforgeable public record with execution traces, keystroke telemetry, and benchmark rankings.
                </p>
              </div>

              <div className="p-6 bg-surface border border-border rounded-lg">
                <Users className="h-6 w-6 text-amber-600 mb-3" />
                <h3 className="font-serif text-[17px] text-foreground font-semibold mb-2">Recruiter-Free Pipeline</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Hiring managers and founders connect directly with verified engineers based on hard data, skipping screening spam and ghosting.
                </p>
              </div>
            </div>
          </section>

          {/* Story / Location */}
          <section className="border-t border-border pt-10">
            <h2 className="font-serif text-2xl text-foreground mb-4">Origin &amp; Team</h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
              Meritlane is proudly designed and engineered in <strong>Visakhapatnam (Vizag), Andhra Pradesh</strong>. We are a team of systems developers, educators, and hiring infrastructure engineers dedicated to creating equal technical access across India.
            </p>
            <div className="p-5 bg-surface border border-border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold text-foreground">Have questions or want to partner with us?</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Reach out directly to our founding and institutional desk.</p>
              </div>
              <a
                href="mailto:saitrishankb9@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[13px] font-medium rounded hover:opacity-90 transition-opacity font-mono shrink-0"
              >
                saitrishankb9@gmail.com
              </a>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-foreground text-background p-8 sm:p-12 rounded-xl text-center space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">Join the Verified Standard</h2>
            <p className="text-muted-foreground text-[15px] max-w-xl mx-auto">
              Whether you are an engineer looking to prove your capabilities or a team seeking verified engineers, get started today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-black font-semibold text-[14px] px-6 py-2.5 rounded hover:bg-neutral-100 transition-colors"
              >
                Verify Your Skills
              </Link>
              <Link
                href="/employer/dashboard"
                className="inline-flex items-center justify-center border border-white/30 text-white font-medium text-[14px] px-6 py-2.5 rounded hover:bg-white/10 transition-colors"
              >
                Explore Talent Pool
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
