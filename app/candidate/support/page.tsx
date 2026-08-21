"use client";

import React from "react";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";

export default function CandidateSupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 h-full overflow-y-auto scrollbar-hide">
      <div className="border-b border-[#272a2f] pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Support & Help Center
        </h1>
        <p className="mt-1.5 text-sm text-[#8e928f]">
          Get help with verification, account issues, or general inquiries.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-[#272a2f] bg-[#111316] rounded-xl p-6 transition-colors hover:border-[#444846]">
          <Mail className="h-6 w-6 text-[#9b8afb] mb-4" />
          <h2 className="text-base font-bold text-white mb-2">Email Support</h2>
          <p className="text-sm text-[#8e928f] mb-4">
            For complex verification issues or account recovery.
          </p>
          <a href="mailto:support@meritlane.app" className="text-sm font-medium text-white hover:text-[#9b8afb] transition-colors">
            support@meritlane.app →
          </a>
        </div>

        <div className="border border-[#272a2f] bg-[#111316] rounded-xl p-6 transition-colors hover:border-[#444846]">
          <MessageSquare className="h-6 w-6 text-[#4ade80] mb-4" />
          <h2 className="text-base font-bold text-white mb-2">Live Chat</h2>
          <p className="text-sm text-[#8e928f] mb-4">
            Available Monday-Friday, 9am-5pm PST.
          </p>
          <button className="text-sm font-medium text-white hover:text-[#4ade80] transition-colors">
            Start Chat →
          </button>
        </div>
      </div>
    </div>
  );
}
