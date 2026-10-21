"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Award, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#101010] font-sans pb-24">
      <main className="w-full max-w-4xl mx-auto px-6 py-12 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-black/60 hover:text-[#101010] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
            <span className="text-black/30">/</span>
            <span className="text-[#101010]">About</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-14 pb-10 border-b border-black/[0.08] text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#101010] mb-4 border border-black/[0.08] px-3.5 py-1 rounded-full bg-black/[0.04]">
            <Shield className="h-3.5 w-3.5" /> Independent Technical Register
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#101010] leading-tight mb-5">
            Replacing resumes with verifiable engineering proof.
          </h1>
          <p className="text-base text-black/60 leading-relaxed font-sans max-w-2xl mx-auto">
            MeritLane was founded to solve a fundamental crisis in tech hiring: credentials and keyword-matched resumes no longer signal actual technical competence. We built the verified evaluation standard for engineers.
          </p>
        </div>

        {/* Narrative / Mission */}
        <div className="space-y-10">
          <section className="bg-white p-8 sm:p-10 border border-black/[0.08] rounded-2xl shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] mb-3">Our Mission</h2>
            <p className="text-black/70 text-sm leading-relaxed mb-4">
              Millions of talented developers in India are locked out of elite opportunities simply because they attend tier-2 or tier-3 universities, or because automated applicant tracking systems (ATS) discard them before an engineering team ever reviews their code.
            </p>
            <p className="text-black/70 text-sm leading-relaxed">
              At the same time, engineering leaders waste hundreds of hours screening candidates who pass behavioral interviews but struggle with basic algorithms, concurrency, and architecture. MeritLane bridges this gap through objective, proctored evaluations and cryptographic proof of work.
            </p>
          </section>

          {/* Pillars */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] mb-6 text-center">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-white border border-black/[0.08] rounded-2xl shadow-xs">
                <div className="h-10 w-10 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] mb-4">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#101010] mb-2">Zero Proxies</h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  We measure verified capability—not pedigree, college rank, or buzzwords. If your code compiles and passes test suites, you belong.
                </p>
              </div>

              <div className="p-6 bg-white border border-black/[0.08] rounded-2xl shadow-xs">
                <div className="h-10 w-10 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#101010] mb-2">Immutable Dossiers</h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  Every verified skill links to an unforgeable public record with execution traces, keystroke telemetry, and benchmark rankings.
                </p>
              </div>

              <div className="p-6 bg-white border border-black/[0.08] rounded-2xl shadow-xs">
                <div className="h-10 w-10 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#101010] mb-2">Recruiter-Free Pipeline</h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  Hiring managers and founders connect directly with verified engineers based on hard data, skipping screening spam and ghosting.
                </p>
              </div>
            </div>
          </section>

          {/* Story / Location */}
          <section className="border-t border-black/[0.08] pt-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] mb-3">Origin &amp; Team</h2>
            <p className="text-black/70 text-sm leading-relaxed mb-6">
              MeritLane is proudly designed and engineered in <strong>Visakhapatnam (Vizag), Andhra Pradesh</strong>. We are a team of systems developers, educators, and hiring infrastructure engineers dedicated to creating equal technical access across India.
            </p>
            <div className="p-6 bg-white border border-black/[0.08] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#101010]">Have questions or want to partner with us?</p>
                <p className="text-xs text-black/60 mt-0.5">Reach out directly to our founding and institutional desk.</p>
              </div>
              <a
                href="mailto:saitrishankb9@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#101010] text-white text-xs font-medium rounded-full hover:bg-black transition-colors font-mono shrink-0 shadow-xs"
              >
                saitrishankb9@gmail.com
              </a>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-[#101010] text-white p-8 sm:p-12 rounded-2xl text-center space-y-6 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Join the Verified Standard</h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
              Whether you are an engineer looking to prove your capabilities or a team seeking verified engineers, get started today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-[#101010] font-semibold text-xs px-6 py-2.5 rounded-full hover:bg-neutral-100 transition-colors shadow-xs"
              >
                Verify Your Skills
              </Link>
              <Link
                href="/employer/dashboard"
                className="inline-flex items-center justify-center border border-white/20 text-white font-medium text-xs px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors"
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
