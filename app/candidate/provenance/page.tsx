"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ContextGuide } from "@/components/ui/ContextGuide";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";

export default function ProvenancePage() {
  const { user, loading } = useAuth();
  const [candidate, setCandidate] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setFetching(true);
      try {
        const [cProfile, uSnap] = await Promise.all([
          fetchCandidateProfile(user.uid),
          getDoc(doc(db, "users", user.uid))
        ]);
        
        if (cProfile) setCandidate(cProfile);
        if (uSnap.exists()) setUserDoc(uSnap.data());
      } catch (err) {
        console.error("Error fetching provenance data:", err);
      } finally {
        setFetching(false);
      }
    }
    
    if (!loading && user) {
      loadData();
    }
  }, [user, loading]);

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
            <p className="text-[14px] text-[#737373] font-sans">
              Live preview of your cryptographic engineering proof.
            </p>
          </div>
          {user && (
            <div className="flex gap-4">
              <Link href={`/p/${user.uid}`} target="_blank">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Open Public URL
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
          <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
          <p className="text-[13px] font-sans">Compiling public proof record...</p>
        </div>
      ) : !candidate ? (
        <div className="border border-dashed border-[#D2D2D2] p-16 rounded-2xl text-center bg-white">
          <p className="text-[15px] font-serif text-[#0D0D0D] mb-3">Profile not initialized</p>
          <p className="text-[13px] text-[#737373] mb-6">Complete your identity details to generate your provenance record.</p>
          <Link href="/candidate/profile">
            <Button>Complete Identity</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-[#E5E5E5] bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <PublicProofRecord id={user?.uid || ""} candidate={candidate} user={userDoc} hideHeader={true} />
        </div>
      )}
    </div>
  );
}
