"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function CandidateProvenancePage() {
  const { user, loading } = useAuth();
  const [candidate, setCandidate] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const cSnap = await getDoc(doc(db, "candidates", user.uid));
        const uSnap = await getDoc(doc(db, "users", user.uid));
        
        if (cSnap.exists()) setCandidate(cSnap.data());
        if (uSnap.exists()) setUserDoc(uSnap.data());
      } catch (err) {
        console.error("Error fetching provenance data:", err);
      } finally {
        setFetching(false);
      }
    }
    
    if (!loading) {
      loadData();
    }
  }, [user, loading]);

  if (loading || fetching) {
    return <MeritlaneLoader level="page" text="Fetching Record" />;
  }

  if (!candidate) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#FAFAFA] text-[#666666] font-mono text-[11px] uppercase tracking-widest">
        Profile not initialized.
      </div>
    );
  }

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
      <ContextGuide 
        storageKey="candidate_provenance"
        title="Public Proof Record"
        description="This is how employers and the public view your verified claims. It updates automatically as you pass assessments."
        steps={[
          { title: "Review", description: "This is a live preview of your public record.", isCompleted: true },
          { title: "Share", description: "Use your public link in job applications.", isCompleted: false },
          { title: "Discover", description: "Employers can discover this profile if you have passed assessments.", isCompleted: Object.values((candidate as any)?.verifiedSkills || {}).some((v: any) => v.status === "verified") }
        ]}
      />
      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3">
          Output Layer
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[40px] sm:text-[48px] text-[#0D0D0D] leading-tight mb-2">Provenance Record</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/p/${user!.uid}`);
                alert("Public link copied to clipboard!");
              }}
              className="px-5 py-2 border border-[#D2D2D2] text-[#737373] hover:text-[#0D0D0D] hover:border-[#0D0D0D] rounded-md text-[14px] font-sans font-medium transition-all"
            >
              Copy link
            </button>
            <a href={`/p/${user!.uid}`} target="_blank" rel="noreferrer" className="px-5 py-2 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] hover:text-[#FFFFFF] rounded-md text-[14px] font-sans font-medium transition-all">
              View public record
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none opacity-90 border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm bg-[#FFFFFF]">
        <PublicProofRecord id={user!.uid} candidate={candidate} user={userDoc || {}} hideHeader={true} />
      </div>
    </div>
  );
}

