"use client";

import React from "react";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";

export default function CandidateSupportPage() {
  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010]">
      {/* ── Flush Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-[10px] font-mono font-medium text-[#737373] mb-1.5 uppercase tracking-wider">
            <LifeBuoy className="h-3 w-3 text-[#101010]" />
            <span>Candidate Help Desk</span>
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-[-0.03em] text-[#101010] leading-tight">
            Support &amp; Help Center
          </h1>
          <p className="mt-0.5 text-[13px] text-[#737373] font-sans">
            Get assistance with code assessments, proof verifications, or account configurations.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-7 shadow-xs hover:border-black/[0.16] transition-all">
          <div className="h-10 w-10 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-[#101010] mb-2">Email Support</h2>
          <p className="text-xs text-black/60 mb-5 leading-relaxed">
            Direct assistance with assessment proctoring, skill verification inquiries, or dossier links.
          </p>
          <a
            href="mailto:support@meritlane.app"
            className="inline-flex items-center text-xs font-semibold text-[#101010] hover:underline"
          >
            support@meritlane.app →
          </a>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-7 shadow-xs hover:border-black/[0.16] transition-all">
          <div className="h-10 w-10 rounded-full bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] mb-4">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-[#101010] mb-2">Live Support Chat</h2>
          <p className="text-xs text-black/60 mb-5 leading-relaxed">
            Real-time proctoring help available Monday–Friday, 9am–5pm IST.
          </p>
          <span className="inline-block text-[11px] font-mono px-2.5 py-1 rounded-full border border-black/[0.08] bg-black/[0.04] text-black/50">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
