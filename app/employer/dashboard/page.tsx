"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { CheckCircle2, ExternalLink, Search, Bookmark, BookmarkCheck, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const COMMON_SKILLS = ["React", "Python", "Django", "JavaScript", "TypeScript", "Next.js", "Node.js", "SQL"];

export default function EmployerDashboardPage() {
  const { user, loading } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/employer/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          searchQuery,
          skills: selectedSkills
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to fetch candidates");
        setFetching(false);
        return;
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
      
      const shortlistRes = await fetch("/api/employer/shortlist", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (shortlistRes.ok) {
        const shortlistData = await shortlistRes.json();
        const shortlistMap: Record<string, boolean> = {};
        (shortlistData.shortlistedCandidates || []).forEach((id: string) => {
          shortlistMap[id] = true;
        });
        setShortlisted(shortlistMap);
      }
      
      setFetching(false);
    } catch (e) {
      console.error(e);
      setErrorMsg("Internal system error");
      setFetching(false);
    }
  }, [user, searchQuery, selectedSkills]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      fetchCandidates();
    }
  }, [loading, user, router, fetchCandidates]);

  const toggleShortlist = async (candidateId: string) => {
    const isCurrentlyShortlisted = shortlisted[candidateId];
    
    setShortlisted(prev => ({
      ...prev,
      [candidateId]: !isCurrentlyShortlisted
    }));

    try {
      const token = await getIdToken(auth.currentUser!, true);
      const res = await fetch("/api/employer/shortlist", {
        method: isCurrentlyShortlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ candidateId })
      });

      if (!res.ok) {
        setShortlisted(prev => ({
          ...prev,
          [candidateId]: isCurrentlyShortlisted
        }));
      }
    } catch (e) {
      setShortlisted(prev => ({
        ...prev,
        [candidateId]: isCurrentlyShortlisted
      }));
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };
  
  if (loading) {
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA]">
      <div className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto scrollbar-hide">
        
        <div className="max-w-[1000px] mx-auto mb-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-[#15803D] mb-3">Discover Verified Talent</p>
          <h1 className="font-serif text-[42px] text-[#0D0D0D] leading-tight mb-2">Find people whose skills are proven.</h1>
          <p className="text-[16px] text-[#737373] font-sans">Discover technical candidates backed by verified assessments, real evidence, and public proof.</p>
        </div>

        <div className="max-w-[1000px] mx-auto">
          <div className="mb-10 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
              <Input
                placeholder="Search candidates, projects, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") fetchCandidates(); }}
                className="pl-12 h-14 bg-[#FAFAFA] border-[#E5E5E5] text-[15px] focus-visible:ring-1 focus-visible:ring-[#0D0D0D] rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#737373] uppercase tracking-wider mr-2">
                <Filter className="h-4 w-4" /> Filter by Verified Skill:
              </div>
              {COMMON_SKILLS.map(skill => {
                const isActive = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={"px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border " + (
                      isActive 
                        ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-md" 
                        : "bg-[#FAFAFA] text-[#737373] border-[#E5E5E5] hover:bg-white hover:border-[#D2D2D2]"
                    )}
                  >
                    {skill}
                  </button>
                );
              })}
              {selectedSkills.length > 0 && (
                <button 
                  onClick={() => setSelectedSkills([])}
                  className="px-3 py-2 text-[12px] text-[#737373] hover:text-[#0D0D0D] underline decoration-[#D2D2D2] underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
              <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
              <p className="text-[13px] font-sans">Loading verified talent...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="border border-[#E5E5E5] border-dashed rounded-2xl bg-transparent p-16 text-center">
              <h2 className="text-[20px] font-serif text-[#0D0D0D] mb-3">No verified candidates found</h2>
              <p className="text-[14px] text-[#737373] mb-6">No verified candidates match your current search or skill filters.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedSkills([]); fetchCandidates(); }}>Clear all filters</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {candidates.map((c) => {
                const isShortlisted = shortlisted[c.uid] || false;
                const verifiedSkillsList = Object.keys(c.verifiedSkills || {}).filter(k => c.verifiedSkills[k].status === "verified");
                
                return (
                  <div key={c.uid} className="group border border-[#E5E5E5] rounded-2xl bg-white p-6 md:p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      
                      <div className="flex items-start gap-6">
                        <div className="h-16 w-16 shrink-0 rounded-2xl bg-[#F3F3F1] border border-[#E5E5E5] flex items-center justify-center text-[#0D0D0D] font-serif text-[26px]">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="font-serif text-[26px] text-[#0D0D0D] leading-tight">{c.name || "Anonymous Candidate"}</div>
                          <div className="flex items-center gap-2 mt-1 mb-4">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-sm">Verified Practitioner</span>
                          </div>
                          
                          {(c.college || c.branch) && (
                            <p className="text-[14px] text-[#737373] mb-5">
                              {c.branch}{c.branch && c.college ? " - " : ""}{c.college} {c.gradYear ? "(" + c.gradYear.toString().slice(-2) + ")" : ""}
                            </p>
                          )}
                          
                          {verifiedSkillsList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {verifiedSkillsList.map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D] text-[12px] font-medium">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {skill}
                                </div>
                              ))}
                            </div>
                          )}
                          {verifiedSkillsList.length === 0 && (
                            <div className="mt-4 text-[13px] text-[#737373] italic">No specific skills cryptographically verified yet.</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0 mt-4 md:mt-0">
                        <div className="text-left md:text-right mb-2">
                          <div className="text-[13px] text-[#737373]">{Object.keys(c.verifiedSkills || {}).length} verified claims</div>
                          <div className="text-[13px] text-[#737373]">{c.projects?.length || 0} evidence nodes</div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            className={"justify-center gap-2 transition-all " + (isShortlisted ? "bg-[#FAFAFA] border-[#D2D2D2] text-[#0D0D0D]" : "")}
                            onClick={() => toggleShortlist(c.uid)}
                          >
                            {isShortlisted ? (
                              <><BookmarkCheck className="h-4 w-4" /> Shortlisted</>
                            ) : (
                              <><Bookmark className="h-4 w-4" /> Shortlist</>
                            )}
                          </Button>
                          <Link href={"/employer/candidate/" + c.uid}>
                            <Button className="w-full justify-center gap-2 bg-[#0D0D0D] hover:bg-[#404040]">
                              View dossier <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

