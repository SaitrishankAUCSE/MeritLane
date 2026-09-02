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
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="p-4 sm:p-8 lg:p-12 max-w-[900px] w-full mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="border-b border-[#E5E5E5] pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-[26px] sm:text-[32px] font-bold text-[#0D0D0D] leading-tight">
                Employer Help & Support
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[#737373] font-sans">
                Assistance with candidate discovery, hiring pipelines, and verification standards.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Standards Summary */}
        <div className="bg-gradient-to-br from-white to-[#F9F9F8] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 text-[#15803D] font-mono text-[12px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" /> The MeritLane Standard
          </div>
          <h2 className="font-serif text-[24px] text-[#0D0D0D] mb-3">
            Zero-pedigree, evidence-backed hiring.
          </h2>
          <p className="text-[14px] text-[#525252] leading-relaxed max-w-2xl">
            MeritLane eliminates pedigree bias by requiring candidates from Tier-2 and Tier-3 institutions to prove their code capabilities through standardized assessments and verified GitHub evidence. Every candidate in your feed has proven their competence.
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="font-serif text-[22px] text-[#0D0D0D]">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#E5E5E5] p-5 rounded-2xl shadow-sm space-y-2">
                <h3 className="text-[14px] font-bold text-[#0D0D0D]">{faq.q}</h3>
                <p className="text-[13px] text-[#737373] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Inquiry Form */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[#0D0D0D] font-bold text-[16px]">
            <Mail className="h-4 w-4 text-[#737373]" /> Contact Talent Partnerships Team
          </div>
          <p className="text-[13px] text-[#737373] mb-6">
            Need custom technical assessment design or dedicated cohort sourcing? Send us an inquiry below.
          </p>

          {sent ? (
            <div className="p-8 border border-[#15803D]/20 bg-[#15803D]/5 rounded-xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#15803D] mx-auto" />
              <h4 className="font-serif text-[18px] text-[#0D0D0D]">Inquiry Received</h4>
              <p className="text-[13px] text-[#737373]">
                Our talent partnership team will get back to you within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourcing full-stack engineering cohorts"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#0D0D0D] block mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your hiring requirements, target tech stack, or platform question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#0D0D0D] focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] outline-none transition-all resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" leftIcon={<Send className="h-4 w-4" />}>
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
