"use client";

import React, { useState } from "react";
import { HelpCircle, Mail, MessageSquare, ShieldCheck, FileCode, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FAQS = [
  {
    q: "How does MeritLane verify technical skills?",
    a: "Candidates undergo rigorous time-bound code assessments and project artifact evaluations. A candidate only appears in employer discovery if they pass objective automated test suites and architectural audits."
  },
  {
    q: "How do I invite a candidate to an interview?",
    a: "Click 'Message' on any candidate card or dossier. You can choose from pre-built interview request templates or write a custom note. The candidate receives the message directly in their verified inbox."
  },
  {
    q: "What do the assessment scores mean?",
    a: "Assessment scores reflect objective performance across data structures, system design, and framework-specific challenges. 100% indicates passing all unit tests and edge cases on their first attempt."
  },
  {
    q: "Can I manage our hiring pipeline on MeritLane?",
    a: "Yes! When you shortlist candidates, you can advance them through Shortlisted, Interviewing, Offer Extended, and Hired stages directly on the Shortlist page."
  }
];

export default function EmployerSupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setSubject("");
      setMessage("");
    }, 3000);
  };

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010]">
      {/* ── Flush Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-[10px] font-mono font-medium text-[#737373] mb-1.5 uppercase tracking-wider">
            <HelpCircle className="h-3 w-3 text-[#101010]" />
            <span>Employer Support Desk</span>
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#101010] tracking-[-0.03em] leading-tight">
            Employer Help &amp; Support
          </h1>
          <p className="mt-0.5 text-[13px] text-[#737373] font-sans">
            Assistance with candidate discovery, hiring pipelines, and verification standards.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Verification Standards Summary */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.08] text-[11px] font-medium text-black/70 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>The MeritLane Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] mb-2">
            Zero-pedigree, evidence-backed hiring.
          </h2>
          <p className="text-sm text-black/60 leading-relaxed max-w-2xl">
            MeritLane eliminates pedigree bias by requiring candidates to prove their capabilities through standardized proctored assessments and verified GitHub evidence. Every candidate in your feed has proven their competence.
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-[#101010]">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-xs space-y-2">
                <h3 className="text-sm font-semibold text-[#101010]">{faq.q}</h3>
                <p className="text-xs text-black/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Inquiry Form */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5 text-[#101010] font-semibold text-base">
            <Mail className="h-4 w-4 text-black/60" />
            <span>Contact Talent Partnerships Team</span>
          </div>
          <p className="text-xs text-black/60 mb-6">
            Need custom technical assessment design or dedicated cohort sourcing? Send us an inquiry below.
          </p>

          {sent ? (
            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-[#101010]">Inquiry Received</h4>
              <p className="text-xs text-black/60">
                Our talent partnership team will get back to you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#101010] block mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourcing full-stack engineering cohorts"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-black/[0.12] bg-[#F8F8F6] text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#101010] block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your hiring requirements, target tech stack, or platform question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-xl border border-black/[0.12] bg-[#F8F8F6] text-sm text-[#101010] focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="rounded-full bg-[#101010] text-white hover:bg-black text-xs px-6 py-2.5 shadow-xs">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Submit Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
