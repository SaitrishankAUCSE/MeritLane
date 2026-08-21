"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Search, Bell, Command, Settings, HelpCircle, FileText, Activity, ShieldCheck, CheckCircle2, ChevronRight, Download, ExternalLink, Menu, FileCheck, Layers, Code } from "lucide-react";

export default function CandidateDashboardPage() {
  const { user, loading, userProfile, handleSignOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => setProfile(p))
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const name = profile?.name || user?.displayName?.split(" ")[0] || "User";
  const avatarUrl = user?.photoURL || "";

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  return (
    <div className="flex h-full w-full flex-col xl:flex-row overflow-hidden">
      
      {/* COLUMN 1: CANDIDATE INTRO */}
      <div className="hidden xl:flex w-[320px] shrink-0 pt-16 px-10 flex-col overflow-y-auto">
        <h2 className="font-serif text-[36px] text-white leading-tight mb-2">Welcome,<br/>{name}</h2>
        <div className="text-[12px] font-sans text-[#8e928f] mb-12">System synchronization active.</div>
        
        <div className="space-y-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#444846] mb-2">Verification Status</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-white" />
              <span className="text-[14px] text-white font-medium">Verified Account</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#444846] mb-2">Evidence Count</div>
            <div className="text-[18px] font-mono text-white">12 Records</div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: RECENT EVIDENCE */}
      <div className="flex-1 p-10 lg:p-14 lg:overflow-y-auto border-l border-[#272a2f]">
        
        <div className="flex items-center justify-between mb-12 border-b border-[#272a2f] pb-4">
          <h2 className="text-[18px] font-serif text-white font-medium">Recent Evidence</h2>
          <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-[#8e928f]">All Records</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item 1 */}
          <div className="border border-[#272a2f] bg-[#111316] p-8 hover:border-[#444846] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-6">
              <FileCheck className="h-5 w-5 text-[#8e928f] group-hover:text-white transition-colors" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#444846]">Valid</span>
            </div>
            <h3 className="text-[16px] font-serif text-white mb-2">Systems Architecture Doc</h3>
            <p className="text-[13px] text-[#8e928f] line-clamp-2">Detailed technical specification for distributed messaging queue.</p>
          </div>
          
          {/* Item 2 */}
          <div className="border border-[#272a2f] bg-[#111316] p-8 hover:border-[#444846] transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-6">
              <Code className="h-5 w-5 text-[#8e928f] group-hover:text-white transition-colors" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#444846]">Valid</span>
            </div>
            <h3 className="text-[16px] font-serif text-white mb-2">GitHub Contributions</h3>
            <p className="text-[13px] text-[#8e928f] line-clamp-2">Verified commits across 3 primary repositories.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
