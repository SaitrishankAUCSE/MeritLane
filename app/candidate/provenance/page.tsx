"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

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
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0b0c0e]">
        <div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0b0c0e] text-[#8e928f] font-mono text-[11px] uppercase tracking-widest">
        Profile not initialized.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0c0e] overflow-hidden">
      
      {/* Provenance Header */}
      <div className="shrink-0 px-10 py-10 border-b border-[#272a2f] flex justify-between items-end">
        <div>
          <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-3">
            Output Layer
          </div>
          <h1 className="font-serif text-[32px] text-white leading-tight">Provenance Record</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 border border-[#444846] text-[#8e928f] hover:text-white hover:border-white rounded-md text-[14px] font-sans font-medium transition-all">
            Copy public link
          </button>
          <a href={`/p/${user!.uid}`} target="_blank" rel="noreferrer" className="px-5 py-2 border border-white bg-white text-black hover:bg-black hover:text-white rounded-md text-[14px] font-sans font-medium transition-all">
            View public record
          </a>
        </div>
      </div>

      {/* Public Record Preview container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="pointer-events-none opacity-90 scale-[0.98] origin-top max-w-[1400px] mx-auto mt-10 border border-[#272a2f] rounded-2xl overflow-hidden shadow-2xl">
          <PublicProofRecord id={user!.uid} candidate={candidate} user={userDoc || {}} hideHeader={true} />
        </div>
      </div>

    </div>
  );
}

