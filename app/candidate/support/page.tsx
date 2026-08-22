"use client";

import React from "react";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";

export default function CandidateSupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 h-full overflow-y-auto scrollbar-hide">
      <div className="border-b border-[#E5E5E5] pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0D0D0D] sm:text-3xl">
          Support & Help Center
        </h1>
        <p className="mt-1.5 text-sm text-[#737373]">
          Get help with verification, account issues, or general inquiries.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl p-6 transition-colors hover:border-[#D2D2D2]">
          <Mail className="h-6 w-6 text-[#0D0D0D] mb-4" />
          <h2 className="text-base font-bold text-[#0D0D0D] mb-2">Email Support</h2>
          <p className="text-sm text-[#737373] mb-4">
            For complex verification issues or account recovery.
          </p>
          <a href="mailto:support@meritlane.app" className="text-sm font-medium text-[#0D0D0D] hover:text-[#0D0D0D] transition-colors">
            support@meritlane.app →
          </a>
        </div>

        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl p-6 transition-colors hover:border-[#D2D2D2]">
          <MessageSquare className="h-6 w-6 text-[#15803D] mb-4" />
          <h2 className="text-base font-bold text-[#0D0D0D] mb-2">Live Chat</h2>
          <p className="text-sm text-[#737373] mb-4">
            Available Monday-Friday, 9am-5pm PST.
          </p>
          <button className="text-sm font-medium text-[#0D0D0D] hover:text-[#15803D] transition-colors">
            Start Chat →
          </button>
        </div>
      </div>
    </div>
  );
}
