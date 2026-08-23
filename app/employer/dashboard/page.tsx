"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function EmployerDashboardPage() {
  const { user, loading } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      const fetchCandidates = async () => {
        try {
          const token = await getIdToken(auth.currentUser!, true);
          const res = await fetch("/api/employer/discover", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({})
          });

          if (!res.ok) {
            const data = await res.json();
            setErrorMsg(data.error || "Failed to fetch candidates");
            setFetching(false);
            return;
          }

          const data = await res.json();
          setCandidates(data.candidates || []);
          setFetching(false);
        } catch (e) {
          console.error(e);
          setErrorMsg("Internal system error");
          setFetching(false);
        }
      };

      fetchCandidates();
    }
  }, [loading, user, router]);
  
  if (loading || fetching) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (errorMsg) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#FAFAFA]">
        <div className="border border-[#E5E5E5] p-10 bg-white rounded-md max-w-md w-full">
          <h2 className="text-[20px] font-serif text-[#B42318] mb-4">Access Denied</h2>
          <p className="text-[14px] text-[#737373]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col xl:flex-row overflow-hidden bg-[#FAFAFA]">
      
      {/* COLUMN 1: DISCOVERY FEED */}
      <div className="flex-1 p-10 lg:p-14 lg:overflow-y-auto scrollbar-hide">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 border-b border-[#E5E5E5] pb-4 gap-4">
          <h1 className="font-serif text-[40px] text-[#0D0D0D] leading-tight mb-2">Proof Review Desk</h1>
          <p className="text-[15px] text-[#737373] font-sans">Inspecting Verified Talent.</p>
        </div>

        <div className="max-w-[800px] space-y-10">
          
          {candidates.length === 0 ? (
            <div className="border border-[#E5E5E5] rounded-md bg-[#FFFFFF] p-10 text-center">
              <h2 className="text-[20px] font-serif text-[#0D0D0D] mb-4">No verified candidates found</h2>
              <p className="text-[14px] text-[#737373]">No verified candidates match your current criteria.</p>
            </div>
          ) : (
            candidates.map((c, i) => (
              <div key={c.uid} className="border border-[#E5E5E5] rounded-md bg-[#FAFAFA] p-10">
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-md bg-[#F3F3F1] border border-[#D2D2D2] flex items-center justify-center text-[#0D0D0D] font-serif text-[24px]">
                      {c.name ? c.name.charAt(0) : "C"}
                    </div>
                    <div>
                      <div className="font-serif text-[28px] text-[#0D0D0D] leading-tight">{c.name || "Anonymous Candidate"}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D]" />
                        <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest">UID: {c.uid.substring(0, 8)}...</span>
                        <Link href={`/p/${c.uid}`} className="ml-2 font-sans text-[12px] text-[#737373] hover:text-[#0D0D0D] flex items-center gap-1 transition-colors">
                          <ExternalLink className="h-3 w-3" /> View Public Record
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-[#0D0D0D] mb-2">Match Confidence</div>
                    <div className="text-[18px] text-[#0D0D0D] font-sans">Verified</div>
                  </div>
                </div>

                <div className="space-y-12">
                  {(c.skills || []).map((skill: string, idx: number) => {
                    const isVerified = c.assessmentScores && Object.keys(c.assessmentScores).some(k => k.toLowerCase().includes(skill.toLowerCase()));
                    const relatedProjects = (c.projects || []).filter((p: any) => 
                      (p.title && p.title.toLowerCase().includes(skill.toLowerCase())) || 
                      (p.description && p.description.toLowerCase().includes(skill.toLowerCase()))
                    );

                    return (
                      <div key={idx}>
                        <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-6 flex items-center gap-4">
                          <span className={`h-[6px] w-[6px] rounded-md shrink-0 ${isVerified ? "bg-[#15803D]" : "bg-[#D2D2D2]"}`} />
                          {skill}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {isVerified && (
                            <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md">
                              <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#15803D]">Source: Meritlane Assessment</span>
                                <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                              </div>
                              <p className="text-[14px] text-[#0D0D0D] leading-relaxed mb-8">
                                Candidate successfully passed rigorous automated testing and integrity checks for this technical skill.
                              </p>
                            </div>
                          )}

                          {relatedProjects.length > 0 ? relatedProjects.map((p: any, pIdx: number) => (
                            <div key={pIdx} className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md">
                              <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#0D0D0D]">Source: Project Evidence</span>
                                <FileText className="h-4 w-4 text-[#737373]" />
                              </div>
                              <p className="text-[14px] text-[#0D0D0D] font-medium leading-relaxed mb-2">
                                {p.title}
                              </p>
                              <p className="text-[13px] text-[#737373] leading-relaxed mb-8">
                                {p.description}
                              </p>
                              {p.linkUrl && (
                                <div className="border-t border-[#E5E5E5] pt-5">
                                  <a href={p.linkUrl} target="_blank" rel="noopener noreferrer" className="text-[14px] font-sans font-medium text-[#0D0D0D] hover:text-[#737373] flex items-center gap-3 transition-colors">
                                    <LinkIcon className="h-3.5 w-3.5" /> View Evidence
                                  </a>
                                </div>
                              )}
                            </div>
                          )) : (
                            !isVerified && (
                              <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-7 rounded-md text-center flex flex-col justify-center">
                                <p className="text-[13px] text-[#737373] italic">Claimed skill pending verification</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}