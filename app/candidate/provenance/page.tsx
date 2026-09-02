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
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
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
      {/* Page Header: Archival Dossier */}
      <div className="mb-10 border-b border-[#E7E2DA] pb-7">
        <div className="text-[12px] font-mono tracking-[0.15em] text-[#78716C] uppercase mb-2">
          Public Audit Dossier Preview
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
          <div>
            <h1 className="font-serif text-[34px] sm:text-[42px] text-[#1C1917] leading-[1.1] mb-2 font-normal">
              Provenance Record
            </h1>
            <p className="text-[14px] text-[#525252] font-sans max-w-2xl leading-relaxed">
              Official public proof record showing verified credentials, linked repositories, and assessment logs.
            </p>
          </div>
          {user && (
            <div className="flex gap-4 w-full sm:w-auto shrink-0">
              <Link href={`/p/${user.uid}`} target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" className="gap-2 w-full sm:w-auto justify-center rounded text-[13px] border-[#E7E2DA] hover:bg-[#F8F6F3]">
                  <ExternalLink className="h-3.5 w-3.5 text-[#064E3B]" /> Open Public Record ↗
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#78716C]">
          <p className="text-[13px] font-mono">Compiling public proof record...</p>
        </div>
      ) : !candidate ? (
        <div className="border border-dashed border-[#E7E2DA] p-16 text-center bg-white">
          <p className="text-[16px] font-serif text-[#1C1917] mb-2">Profile not initialized</p>
          <p className="text-[13px] text-[#78716C] mb-6">Complete your identity details to generate your provenance record.</p>
          <Link href="/candidate/profile">
            <Button className="bg-[#064E3B] text-white rounded">Complete Identity</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-[#E7E2DA] bg-white p-6 md:p-10 shadow-xs">
          <PublicProofRecord id={user?.uid || ""} candidate={candidate} user={userDoc} hideHeader={true} />
        </div>
      )}
    </div>
  );
}
