import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Meritlane",
  description: "Privacy Policy and data governance standards for the Meritlane platform.",
};

export default function PrivacyPolicyPage() {
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
        <div className="mb-10 pb-6 border-b border-border">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#16A34A] mb-3">
            <Shield className="h-3.5 w-3.5" /> Institutional Data Governance
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground font-mono text-[12px]">Effective Date: October 2026 · Meritlane Technologies Pvt. Ltd.</p>
        </div>

        <div className="prose prose-zinc max-w-none text-[15px] leading-relaxed text-foreground space-y-8">
          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">1. Commitment to Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Meritlane Technologies Pvt. Ltd. (&quot;Meritlane&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates an independent engineering evaluation register and skill verification ecosystem. We are committed to safeguarding candidate data and employer communications with cryptographic rigor, confidentiality, and transparency.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect information strictly necessary to authenticate technical identity and deliver verified proof-of-work:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Candidate Identity &amp; Academic Data:</strong> Full name, university, degree, branch, cohort year, and uploaded technical resumes.</li>
              <li><strong className="text-foreground">Assessment &amp; Evaluation Traces:</strong> Keystroke cadence, proctored code executions, test-suite runs, integrity flags, and final verified scores.</li>
              <li><strong className="text-foreground">External Technical Evidence:</strong> Connected GitHub repositories, commit velocity, and external project URLs provided by candidates.</li>
              <li><strong className="text-foreground">Employer Information:</strong> Corporate email, organization name, hiring requirements, and recruiter correspondence.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">3. How Your Information is Utilized</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Issuing authenticated public proof dossiers (<code className="text-[13px] bg-surface-dim px-1.5 py-0.5 rounded font-mono">/p/[id]</code>) verifying candidate skills.</li>
              <li>Enabling eligible partner employers to discover and shortlist verified candidates without recruiter spam.</li>
              <li>Continuous calibration of benchmark evaluation datasets and anti-plagiarism algorithms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">4. Data Protection &amp; Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              All credentials and evaluation records are encrypted in transit via TLS 1.3 and at rest using AES-256 in Cloud Firestore. Candidates maintain the perpetual right to download their complete audit history or trigger irrevocable account deletion via their Settings console.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground font-semibold mb-3">5. Inquiries &amp; Privacy Officer Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, rights requests, or feedback regarding data governance, please contact our administrative team directly:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-surface border border-border">
              <p className="text-[14px] text-foreground font-medium">Meritlane Technologies Pvt. Ltd.</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Data Protection Officer: <a href="mailto:saitrishankb9@gmail.com" className="text-foreground font-mono underline hover:text-muted-foreground">saitrishankb9@gmail.com</a>
              </p>
              <p className="text-[13px] text-muted-foreground">Visakhapatnam (Vizag), Andhra Pradesh, India</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
