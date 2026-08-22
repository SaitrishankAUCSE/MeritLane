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
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 h-full overflow-y-auto scrollbar-hide">
      
      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-3 flex items-center gap-2">
          <FolderOpen className="h-3 w-3" /> Evidence Workspace
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#272a2f] pb-6">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[40px] text-white leading-tight mb-2">Build your proof.</h1>
            <div className="text-[14px] text-[#e3e2e5] font-sans">Provide the material that supports the claims made in your Identity.</div>
          </div>
          <button className="px-5 h-10 border border-white bg-white text-black hover:bg-black hover:text-white rounded-md text-[14px] font-sans font-medium transition-all font-bold">
            [+] Add evidence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Evidence Coverage */}
        <div className="space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-6">Evidence Coverage</h2>
          
          <div className="space-y-6">
            <div className="border border-[#272a2f] bg-[#111316] p-5 rounded-lg">
              <div className="flex justify-between items-end mb-3">
                <div className="text-[14px] font-medium text-white">{skills[0] || "Python"}</div>
                <div className="text-[10px] font-mono text-[#8e928f]">0 ITEMS</div>
              </div>
              <div className="flex gap-1 mb-3">
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
              </div>
              <div className="text-[11px] text-[#8e928f] mb-3">No supporting evidence yet.</div>
            </div>

            <div className="border border-[#272a2f] bg-[#111316] p-5 rounded-lg">
              <div className="flex justify-between items-end mb-3">
                <div className="text-[14px] font-medium text-white">{skills[1] || "React"}</div>
                <div className="text-[10px] font-mono text-[#a8a2ff]">2 ITEMS</div>
              </div>
              <div className="flex gap-1 mb-3">
                <div className="h-2 flex-1 bg-[#a8a2ff] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#a8a2ff] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
                <div className="h-2 flex-1 bg-[#272a2f] rounded-sm"></div>
              </div>
              <div className="text-[11px] text-[#a8a2ff] mb-4">Evidence is sufficient for testing.</div>
              <button 
                onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skills[0] || 'Software Engineering')}`)}
                className="w-full flex items-center justify-center gap-2 text-[14px] font-sans font-medium border border-white text-black bg-white py-2 h-10 rounded-md hover:bg-black hover:text-white transition-all font-bold"
              >
                Start verification <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Objects */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-[12px] font-mono uppercase tracking-[0.1em] text-[#8e928f] mb-6">Linked Artifacts</h2>
          
          <div className="space-y-6">
            
            {/* Artifact 1 */}
            <div className="border border-[#272a2f] bg-[#111316] p-6 rounded-lg group hover:border-[#444846] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-serif text-white mb-1">House Price Prediction Model</h3>
                  <div className="text-[12px] font-sans font-medium text-[#8e928f] flex items-center gap-2">
                    <FileCheck className="h-3.5 w-3.5" /> Project Repository
                  </div>
                </div>
                <div className="flex gap-3 text-[11px] font-sans font-medium text-[#8e928f]">
                  <button className="hover:text-white transition-colors">View</button>
                  <button className="hover:text-white transition-colors">Remove</button>
                </div>
              </div>

              {/* Proof Thread */}
              <div className="mt-6 border-t border-[#272a2f] pt-6">
                <div className="text-[10px] font-sans font-medium text-[#8e928f] mb-4">Supports Claim:</div>
                <div className="relative border-l border-[#272a2f] pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[18.5px] top-1.5 h-2 w-2 rounded-full bg-[#a8a2ff]" />
                    <div className="text-[13px] font-medium text-white">Machine Learning Pipeline</div>
                    <div className="text-[11px] text-[#8e928f] mt-1">Status: Evidence Linked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Artifact 2 */}
            <div className="border border-[#272a2f] bg-[#111316] p-6 rounded-lg group hover:border-[#444846] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-serif text-white mb-1">E-Commerce Frontend Architecture</h3>
                  <div className="text-[12px] font-sans font-medium text-[#8e928f] flex items-center gap-2">
                    <Code className="h-3.5 w-3.5" /> GitHub Commits
                  </div>
                </div>
                <div className="flex gap-3 text-[11px] font-sans font-medium text-[#8e928f]">
                  <button className="hover:text-white transition-colors">View</button>
                  <button className="hover:text-white transition-colors">Remove</button>
                </div>
              </div>

              {/* Proof Thread */}
              <div className="mt-6 border-t border-[#272a2f] pt-6">
                <div className="text-[10px] font-sans font-medium text-[#8e928f] mb-4">Supports Claim:</div>
                <div className="relative border-l border-[#272a2f] pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[18.5px] top-1.5 h-2 w-2 rounded-full bg-[#a8a2ff]" />
                    <div className="text-[13px] font-medium text-white">{skills[1] || "React"}</div>
                    <div className="text-[11px] text-[#8e928f] mt-1">Status: Evidence Linked</div>
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

