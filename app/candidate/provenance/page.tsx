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

  // To simulate the public profile, we render PublicProofRecord.
  // We wrap it in a container that allows scrolling, since the layout handles its own overflow.
  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide bg-[#0b0c0e]">
      <PublicProofRecord id={user!.uid} candidate={candidate} user={userDoc || {}} hideHeader={true} />
    </div>
  );
}
