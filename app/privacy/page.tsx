import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MeritLane",
  description: "Privacy Policy and data governance standards for the MeritLane platform.",
};

export default function PrivacyPolicyPage() {
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
            <span className="text-[#101010]">Privacy Policy</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-black/[0.08] pb-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#101010] mb-3 px-3 py-1 rounded-lg bg-black/[0.04] border border-black/[0.08]">
              <Shield className="h-3.5 w-3.5 text-emerald-600" /> Institutional Data Governance
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#101010] mb-2">Privacy Policy</h1>
            <p className="text-black/50 font-mono text-xs">Effective Date: October 2026 · MeritLane Technologies Pvt. Ltd.</p>
          </div>

          <div className="text-sm leading-relaxed text-black/80 space-y-7">
            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">1. Commitment to Privacy</h2>
              <p className="text-black/70 leading-relaxed">
                MeritLane Technologies Pvt. Ltd. (&quot;MeritLane&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates an independent engineering evaluation register and skill verification ecosystem. We are committed to safeguarding candidate data and employer communications with cryptographic rigor, confidentiality, and transparency.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">2. Information We Collect</h2>
              <p className="text-black/70 leading-relaxed mb-3">
                We collect information strictly necessary to authenticate technical identity and deliver verified proof-of-work:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-black/70">
                <li><strong className="text-[#101010]">Candidate Identity &amp; Academic Data:</strong> Full name, university, degree, branch, cohort year, and uploaded technical resumes.</li>
                <li><strong className="text-[#101010]">Assessment &amp; Evaluation Traces:</strong> Keystroke cadence, proctored code executions, test-suite runs, integrity flags, and final verified scores.</li>
                <li><strong className="text-[#101010]">External Technical Evidence:</strong> Connected GitHub repositories, commit velocity, and external project URLs provided by candidates.</li>
                <li><strong className="text-[#101010]">Employer Information:</strong> Corporate email, organization name, hiring requirements, and recruiter correspondence.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">3. How Your Information is Utilized</h2>
              <ul className="list-disc pl-6 space-y-2 text-black/70">
                <li>Issuing authenticated public proof dossiers (<code className="text-xs bg-black/[0.04] border border-black/[0.08] px-2 py-0.5 rounded-full font-mono">/p/[id]</code>) verifying candidate skills.</li>
                <li>Enabling eligible partner employers to discover and shortlist verified candidates without recruiter spam.</li>
                <li>Continuous calibration of benchmark evaluation datasets and anti-plagiarism algorithms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">4. Data Protection &amp; Retention</h2>
              <p className="text-black/70 leading-relaxed">
                All credentials and evaluation records are encrypted in transit via TLS 1.3 and at rest using AES-256 in Cloud Firestore. Candidates maintain the perpetual right to download their complete audit history or trigger irrevocable account deletion via their Settings console.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#101010] mb-2">5. Inquiries &amp; Privacy Officer Contact</h2>
              <p className="text-black/70 leading-relaxed">
                If you have any questions, rights requests, or feedback regarding data governance, please contact our administrative team directly:
              </p>
              <div className="mt-4 p-5 rounded-xl bg-[#F8F8F6] border border-black/[0.08]">
                <p className="text-sm text-[#101010] font-semibold">MeritLane Technologies Pvt. Ltd.</p>
                <p className="text-xs text-black/60 mt-1">
                  Data Protection Officer: <a href="mailto:saitrishankb9@gmail.com" className="text-[#101010] font-mono underline">saitrishankb9@gmail.com</a>
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
