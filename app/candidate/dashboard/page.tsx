"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { FileCheck, Code, FolderOpen, ArrowRight, Activity } from "lucide-react";

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => setProfile(p))
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  const skills = profile?.skills || ["Python", "React", "Firebase"];

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#737373] border-t-[#0D0D0D] animate-spin rounded-full"></div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 h-full overflow-y-auto scrollbar-hide">
      
      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3 flex items-center gap-2">
          <FolderOpen className="h-3 w-3" /> Evidence Workspace
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[40px] text-[#0D0D0D] leading-tight mb-2">Build your proof.</h1>
            <div className="text-[14px] text-[#0D0D0D] font-sans">Provide the material that supports the claims made in your Identity.</div>
          </div>
          <button className="px-5 h-10 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] hover:text-[#FFFFFF] rounded-md text-[14px] font-sans font-medium transition-all font-bold">
            [+] Add evidence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Evidence Coverage */}
        <div className="space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#666666] mb-6">Evidence Coverage</h2>
          
          <div className="space-y-6">
            <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-5 rounded-lg">
              <div className="flex justify-between items-end mb-3">
                <div className="text-[14px] font-medium text-[#0D0D0D]">{skills[0] || "Python"}</div>
                <div className="text-[10px] font-mono text-[#666666]">0 ITEMS</div>
              </div>
              <div className="flex gap-1 mb-3">
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
              </div>
              <div className="text-[11px] text-[#666666] mb-3">No supporting evidence yet.</div>
            </div>

            <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-5 rounded-lg">
              <div className="flex justify-between items-end mb-3">
                <div className="text-[14px] font-medium text-[#0D0D0D]">{skills[1] || "React"}</div>
                <div className="text-[10px] font-mono text-[#15803D]">2 ITEMS</div>
              </div>
              <div className="flex gap-1 mb-3">
                <div className="h-2 flex-1 bg-[#15803D] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#15803D] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#E5E5E5] rounded-sm"></div>
              </div>
              <div className="text-[11px] text-[#15803D] mb-4">Evidence is sufficient for testing.</div>
              <button 
                onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skills[0] || 'Software Engineering')}`)}
                className="w-full flex items-center justify-center gap-2 text-[14px] font-sans font-medium border border-[#0D0D0D] text-[#FFFFFF] bg-[#0D0D0D] py-2 h-10 rounded-md hover:bg-[#222222] hover:text-[#FFFFFF] transition-all font-bold"
              >
                Start verification <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Objects */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#666666] mb-6">Linked Artifacts</h2>
          
          <div className="space-y-6">
            
            {/* Artifact 1 */}
            <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-6 rounded-lg group hover:border-[#D2D2D2] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-sans font-medium text-[#0D0D0D] mb-1">House Price Prediction Model</h3>
                  <div className="text-[12px] font-sans font-medium text-[#666666] flex items-center gap-2">
                    <FileCheck className="h-3.5 w-3.5" /> Project Repository
                  </div>
                </div>
                <div className="flex gap-3 text-[11px] font-sans font-medium text-[#666666]">
                  <button className="hover:text-[#0D0D0D] transition-colors">View</button>
                  <button className="hover:text-[#0D0D0D] transition-colors">Remove</button>
                </div>
              </div>

              {/* Proof Thread */}
              <div className="mt-6 border-t border-[#E5E5E5] pt-6">
                <div className="text-[10px] font-sans font-medium text-[#666666] mb-4">Supports Claim:</div>
                <div className="relative border-l border-[#E5E5E5] pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[18.5px] top-1.5 h-2 w-2 rounded-full bg-[#15803D]" />
                    <div className="text-[13px] font-medium text-[#0D0D0D]">Machine Learning Pipeline</div>
                    <div className="text-[11px] text-[#666666] mt-1">Status: Evidence Linked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Artifact 2 */}
            <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-6 rounded-lg group hover:border-[#D2D2D2] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-sans font-medium text-[#0D0D0D] mb-1">E-Commerce Frontend Architecture</h3>
                  <div className="text-[12px] font-sans font-medium text-[#666666] flex items-center gap-2">
                    <Code className="h-3.5 w-3.5" /> GitHub Commits
                  </div>
                </div>
                <div className="flex gap-3 text-[11px] font-sans font-medium text-[#666666]">
                  <button className="hover:text-[#0D0D0D] transition-colors">View</button>
                  <button className="hover:text-[#0D0D0D] transition-colors">Remove</button>
                </div>
              </div>

              {/* Proof Thread */}
              <div className="mt-6 border-t border-[#E5E5E5] pt-6">
                <div className="text-[10px] font-sans font-medium text-[#666666] mb-4">Supports Claim:</div>
                <div className="relative border-l border-[#E5E5E5] pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[18.5px] top-1.5 h-2 w-2 rounded-full bg-[#15803D]" />
                    <div className="text-[13px] font-medium text-[#0D0D0D]">{skills[1] || "React"}</div>
                    <div className="text-[11px] text-[#666666] mt-1">Status: Evidence Linked</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}


