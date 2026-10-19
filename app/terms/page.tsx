import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Meritlane",
  description: "Terms of Service and examination integrity standards for Meritlane.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans theme-public">
      <main className="w-full max-w-4xl mx-auto px-6 py-12 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground">Terms of Service</span>
          </Link>
        </div>
        <div className="mb-10 pb-6 border-b border-border">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3">
            <FileCheck className="h-3.5 w-3.5" /> Platform Governance
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted-foreground font-mono text-[12px]">Last updated: October 2026 · Meritlane Technologies Pvt. Ltd.</p>
        </div>

        <div className="prose prose-zinc max-w-none text-[15px] leading-relaxed text-foreground space-y-8">
          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing, browsing, or utilizing the Meritlane platform (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these terms, you must not use or access our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">2. Description of the Platform</h2>
            <p className="text-muted-foreground leading-relaxed">
              Meritlane operates an independent technical evaluation standard and project-based examination registry for software engineering talent in India. We administer proctored assessments, verify technical proficiencies, generate cryptographic proof dossiers, and facilitate direct hiring between verified candidates and participating organizations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">3. Assessment Integrity &amp; Candidate Obligations</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To preserve the integrity of our verified benchmarks, every candidate covenants:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>All assessment solutions, algorithms, and responses must represent your sole, unaided original technical work.</li>
              <li>Use of unauthorized external assistance, automated solvers, or proxy test-takers triggers immediate assessment invalidation and mandatory cooldown enforcement.</li>
              <li>Candidates agree that submitted source code may be parsed, statically analyzed, and permanently mirrored within tamper-resistant proof records.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">4. Employer Terms &amp; Fair Outreach</h2>
            <p className="text-muted-foreground leading-relaxed">
              Employers granted access to the Meritlane Talent Discovery Register agree to utilize candidate records solely for legitimate recruitment purposes. Unsolicited marketing, candidate profile redistribution, or harassment is strictly prohibited and results in immediate account revocation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">5. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Candidates retain ownership of their proprietary code solutions. By submitting work on Meritlane, you grant the platform a worldwide, non-exclusive license to execute, test, and render said code for evaluation and verified proof generation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">6. Legal Jurisdiction &amp; Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of India. For disputes or formal legal inquiries, contact:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-surface border border-border">
              <p className="text-[14px] text-foreground font-medium">Meritlane Legal &amp; Institutional Affairs</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Official Contact: <a href="mailto:saitrishankb9@gmail.com" className="text-foreground font-mono underline hover:text-muted-foreground">saitrishankb9@gmail.com</a>
              </p>
              <p className="text-[13px] text-muted-foreground">Visakhapatnam (Vizag), Andhra Pradesh, India</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
