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

  const name = profile?.name || user?.displayName?.split(" ")[0] || "Engineer";
  const primarySkill = profile?.skills?.[0] || "Software Engineering";
  const status = profile?.verificationStatus || "draft";

  if (loading) {
    return <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-[#f4f4f2] animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0c0e] text-[#f4f4f2] font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e]">
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-[#272a2f]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#272a2f] bg-[#111316]">
              <Layers className="h-4 w-4 text-[#f4f4f2]" />
            </div>
            <div>
              <div className="font-serif text-lg font-medium tracking-tight leading-none text-white">Meritlane</div>
              <div className="font-mono text-[9px] tracking-widest text-[#8e928f] uppercase mt-1">System of Record</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-5 py-6">
          <button 
            onClick={() => router.push('/candidate/profile')}
            className="w-full border border-[#272a2f] py-2.5 text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-[#c4c7c5] hover:bg-[#111316] hover:text-white transition-colors"
          >
            [+] Add Evidence
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] hover:bg-[#111316] rounded-none transition-colors group">
            <Command className="mr-3 h-4 w-4 group-hover:text-white" />
            Identity
          </a>
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-white bg-[#111316] border-r-2 border-[#f4f4f2]">
            <FileText className="mr-3 h-4 w-4" />
            Evidence
          </a>
          <a href="#" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] hover:bg-[#111316] rounded-none transition-colors group">
            <Activity className="mr-3 h-4 w-4 group-hover:text-white" />
            Provenance
          </a>
          <a href="/candidate/assessment" className="flex items-center px-3 py-2.5 text-[13px] text-[#8e928f] hover:text-[#f4f4f2] hover:bg-[#111316] rounded-none transition-colors group">
            <ShieldCheck className="mr-3 h-4 w-4 group-hover:text-white" />
            Verification
          </a>
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-[#272a2f] space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-[12px] text-[#8e928f] hover:text-white transition-colors">
            <Settings className="mr-3 h-4 w-4" /> Settings
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-[12px] text-[#8e928f] hover:text-white transition-colors">
            <HelpCircle className="mr-3 h-4 w-4" /> Support
          </a>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0c0e]">
        
        {/* TOP NAVBAR */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[#272a2f] bg-[#0b0c0e]">
          <div className="flex items-center gap-10">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-white lg:hidden">Meritlane</h1>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-[13px] text-white border-b-2 border-white h-16 flex items-center font-medium">Dashboard</a>
              <a href="/candidate/profile" className="text-[13px] text-[#8e928f] hover:text-white transition-colors">Workspaces</a>
              <a href={`/p/${user?.uid}`} className="text-[13px] text-[#8e928f] hover:text-white transition-colors">Archives</a>
            </nav>
          </div>
          <div className="flex items-center gap-5 text-[#8e928f]">
            <Search className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
            <Bell className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
            <Command className="h-4 w-4 hover:text-white cursor-pointer transition-colors" />
            <div className="h-7 w-7 rounded-full bg-[#111316] border border-[#272a2f] flex items-center justify-center ml-2 overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" onClick={handleSignOut}>
              {user?.photoURL ? <img src={user.photoURL} alt="Profile" /> : name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* 3-COLUMN CONTENT */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          
          {/* COLUMN 1: QUEUE/STATS */}
          <div className="xl:w-[280px] shrink-0 border-b xl:border-b-0 xl:border-r border-[#272a2f] p-8 flex flex-col overflow-y-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-4">Queue</p>
            <h2 className="font-serif text-3xl font-medium text-white mb-12 leading-tight">Evidence<br/>Review<br/>Console</h2>
            
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between border-b border-[#272a2f] pb-3">
                <span className="text-[13px] text-[#c4c7c5]">Pending Review</span>
                <span className="font-mono text-xs text-white">{(profile?.skills?.length || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#272a2f] pb-3">
                <span className="text-[13px] text-[#c4c7c5]">Under Assessment</span>
                <span className="font-mono text-xs text-white">{status === "verified" ? "00" : "01"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#272a2f] pb-3">
                <span className="text-[13px] text-[#c4c7c5]">Verified Today</span>
                <span className="font-mono text-xs text-white">00</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: MAIN THREAD */}
          <div className="flex-1 p-8 xl:p-12 overflow-y-auto relative">
            
            {/* Thread Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="h-2 w-2 rounded-full border border-[#8e928f] shrink-0" />
              <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#8e928f]">Incoming Thread // {status === 'verified' ? 'Verified' : 'Pending'}</div>
              <div className="h-px bg-[#272a2f] flex-1 ml-4" />
            </div>

            {/* Evidence Box */}
            <div className="border border-[#272a2f] p-8 xl:p-12 relative group hover:border-[#8e928f]/50 transition-colors bg-[#0b0c0e]">
              <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#8e928f] mb-6">Candidate Claim</div>
              <h3 className="font-serif text-3xl sm:text-4xl text-white leading-tight mb-12 max-w-2xl">
                "{profile?.projects?.[0]?.description || `Architected ${primarySkill} systems with significant measurable impact`}"
              </h3>

              <div className="relative pl-6 border-l border-[#272a2f]">
                <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#8e928f] mb-6">Uploaded Evidence</div>
                
                <div className="space-y-4">
                  {/* Evidence Item 1 */}
                  <div className="bg-[#111316] border border-[#272a2f] p-5 flex items-center justify-between group-hover:bg-[#1a1c20] transition-colors cursor-pointer">
                    <div className="flex items-center gap-5">
                      <FileCheck className="h-5 w-5 text-[#8e928f]" />
                      <div>
                        <div className="text-[13px] text-white mb-1">Architecture_Review_Q3.pdf</div>
                        <div className="text-[10px] font-mono text-[#8e928f]">SHA-256: 8f4a...2b1c</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-[#8e928f] hover:text-white" />
                  </div>

                  {/* Evidence Item 2 */}
                  <div className="bg-[#111316] border border-[#272a2f] p-5 flex items-center justify-between group-hover:bg-[#1a1c20] transition-colors cursor-pointer" onClick={() => profile?.githubUrl && window.open(profile.githubUrl, '_blank')}>
                    <div className="flex items-center gap-5">
                      <Code className="h-5 w-5 text-[#8e928f]" />
                      <div>
                        <div className="text-[13px] text-white mb-1">{profile?.projects?.[0]?.repoUrl?.replace('https://', '') || 'github.com/acmecorp/core-services/pull/442'}</div>
                        <div className="text-[10px] font-mono text-[#8e928f]">Merged: {new Date().toISOString().substring(0, 19).replace('T', ' ')}Z</div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#8e928f] hover:text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Coverage Graph */}
            <div className="mt-16 pt-8 border-t border-[#272a2f] relative">
              <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#8e928f] absolute top-[-10px] bg-[#0b0c0e] pr-4">Proof Coverage</div>
              <div className="flex items-center w-full mt-4">
                <div className="h-px bg-white w-1/4 relative">
                  <div className="absolute right-0 h-3 w-px bg-white -top-1.5" />
                </div>
                <div className="h-px bg-[#272a2f] flex-1 relative">
                  <div className="absolute right-1/2 h-3 w-px bg-[#272a2f] -top-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: DECISION / HISTORY */}
          <div className="xl:w-[320px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#272a2f] bg-[#0b0c0e] p-8 overflow-y-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-8">Verification Decision</p>
            
            <div className="space-y-4 mb-10">
              <button 
                onClick={() => router.push('/candidate/assessment')}
                className="w-full bg-white text-black py-4 flex items-center justify-center gap-3 hover:bg-[#f4f4f2] transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[12px] font-mono font-bold tracking-[0.15em] uppercase">Verify Claim</span>
              </button>
              
              <button 
                onClick={() => router.push('/candidate/profile')}
                className="w-full border border-[#272a2f] text-white py-4 flex items-center justify-center gap-3 hover:bg-[#111316] transition-colors"
              >
                <FileText className="h-4 w-4 text-[#8e928f]" />
                <span className="text-[12px] font-mono tracking-[0.15em] uppercase text-[#c4c7c5]">Request Revision</span>
              </button>
            </div>

            <div className="border-t border-[#272a2f] pt-8 mb-12">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-4">Internal Notes</p>
              <textarea 
                placeholder="Add assessment notes..." 
                className="w-full bg-transparent border-none text-[13px] text-white placeholder-[#8e928f] resize-none focus:ring-0 focus:outline-none min-h-[100px]"
              />
              <div className="h-px w-full bg-[#272a2f] mt-4" />
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f] mb-6">Provenance History</p>
              <div className="relative pl-5 border-l border-[#272a2f] space-y-8">
                
                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-white ring-4 ring-[#0b0c0e]" />
                  <p className="text-[13px] text-white mb-1">Claim Submitted</p>
                  <p className="font-mono text-[10px] text-[#8e928f]">2023-10-27T08:14:22Z</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-[#272a2f] ring-4 ring-[#0b0c0e]" />
                  <p className="text-[13px] text-[#8e928f] mb-1">Automated Checks Passed</p>
                  <p className="font-mono text-[10px] text-[#8e928f]">2023-10-27T08:15:01Z</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}


