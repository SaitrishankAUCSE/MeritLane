import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MeritLane",
  description: "Terms of Service and examination integrity standards for MeritLane.",
};

export default function TermsOfServicePage() {
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
            <span className="text-[#101010]">Terms of Service</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-black/[0.08] pb-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#101010] mb-3 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.08]">
              <FileCheck className="h-3.5 w-3.5" /> Platform Governance
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#101010] mb-2">Terms of Service</h1>
            <p className="text-black/50 font-mono text-xs">Last updated: October 2026 · MeritLane Technologies Pvt. Ltd.</p>
          </div>

          <div className="text-sm leading-relaxed text-black/80 space-y-7">
            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">1. Agreement to Terms</h2>
              <p className="text-black/70 leading-relaxed">
                By accessing, browsing, or utilizing the MeritLane platform (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these terms, you must not use or access our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">2. Description of the Platform</h2>
              <p className="text-black/70 leading-relaxed">
                MeritLane operates an independent technical evaluation standard and project-based examination registry for software engineering talent. We administer proctored assessments, verify technical proficiencies, generate cryptographic proof dossiers, and facilitate direct hiring between verified candidates and participating organizations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">3. Assessment Integrity &amp; Candidate Obligations</h2>
              <p className="text-black/70 leading-relaxed mb-3">
                To preserve the integrity of our verified benchmarks, every candidate covenants:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-black/70">
                <li>All assessment solutions, algorithms, and responses must represent your sole, unaided original technical work.</li>
                <li>Use of unauthorized external assistance, automated solvers, or proxy test-takers triggers immediate assessment invalidation and mandatory cooldown enforcement.</li>
                <li>Candidates agree that submitted source code may be parsed, statically analyzed, and permanently mirrored within tamper-resistant proof records.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">4. Employer Terms &amp; Fair Outreach</h2>
              <p className="text-black/70 leading-relaxed">
                Employers granted access to the MeritLane Talent Discovery Register agree to utilize candidate records solely for legitimate recruitment purposes. Unsolicited marketing, candidate profile redistribution, or harassment is strictly prohibited and results in immediate account revocation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">5. Intellectual Property Rights</h2>
              <p className="text-black/70 leading-relaxed">
                Candidates retain ownership of their proprietary code solutions. By submitting work on MeritLane, you grant the platform a worldwide, non-exclusive license to execute, test, and render said code for evaluation and verified proof generation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">6. Legal Jurisdiction &amp; Support</h2>
              <p className="text-black/70 leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of India. For disputes or formal legal inquiries, contact:
              </p>
              <div className="mt-4 p-5 rounded-xl bg-[#F8F8F6] border border-black/[0.08]">
                <p className="text-sm text-[#101010] font-semibold">MeritLane Legal &amp; Institutional Affairs</p>
                <p className="text-xs text-black/60 mt-1">
                  Official Contact: <a href="mailto:saitrishankb9@gmail.com" className="text-[#101010] font-mono underline">saitrishankb9@gmail.com</a>
                </p>
                <p className="text-xs text-black/60">Visakhapatnam (Vizag), Andhra Pradesh, India</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
