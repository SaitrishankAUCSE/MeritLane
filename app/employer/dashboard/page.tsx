"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  CheckCircle2,
  ExternalLink,
  Search,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Filter,
  Sparkles,
  MessageSquare,
  ArrowUpDown,
  Code2,
  Layers,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COMMON_SKILLS } from "@/lib/constants";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { ContextGuide } from "@/components/ui/ContextGuide";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MessageModal } from "@/components/employer/MessageModal";

export default function EmployerDashboardPage() {
  const { user, loading } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"match" | "skills" | "projects">("match");

  // Messaging state
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  // AI Briefs cache & active card
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [activeAiCard, setActiveAiCard] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/employer/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          searchQuery,
          skills: selectedSkills,
        }),
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
        headers: { Authorization: "Bearer " + token },
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
      const timeoutId = setTimeout(() => {
        fetchCandidates();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, user, router, fetchCandidates]);

  const toggleShortlist = async (candidateId: string) => {
    const isCurrentlyShortlisted = shortlisted[candidateId];

    setShortlisted((prev) => ({
      ...prev,
      [candidateId]: !isCurrentlyShortlisted,
    }));

    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/shortlist", {
        method: isCurrentlyShortlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) {
        setShortlisted((prev) => ({
          ...prev,
          [candidateId]: isCurrentlyShortlisted,
        }));
      }
    } catch {
      setShortlisted((prev) => ({
        ...prev,
        [candidateId]: isCurrentlyShortlisted,
      }));
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleAiSummary = async (candidateId: string) => {
    if (activeAiCard === candidateId) {
      setActiveAiCard(null);
      return;
    }
    setActiveAiCard(candidateId);
    if (aiSummaries[candidateId]) return;

    setLoadingAi((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const token = await user?.getIdToken(true);
      const res = await fetch("/api/employer/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaries((prev) => ({ ...prev, [candidateId]: data.summary || "Summary generated." }));
      } else {
        setAiSummaries((prev) => ({ ...prev, [candidateId]: "Unable to generate summary." }));
      }
    } catch {
      setAiSummaries((prev) => ({ ...prev, [candidateId]: "Failed to contact AI service." }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  // Sorting
  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === "skills") {
      const aCount = Object.keys(a.verifiedSkills || {}).length;
      const bCount = Object.keys(b.verifiedSkills || {}).length;
      return bCount - aCount;
    }
    if (sortBy === "projects") {
      return (b.projects?.length || 0) - (a.projects?.length || 0);
    }
    // Default: match count
    return (b.matchedRequiredSkillCount || 0) - (a.matchedRequiredSkillCount || 0);
  });

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
        {/* Context Guide */}
        <div className="max-w-[1000px] mx-auto">
          <ContextGuide
            storageKey="employer_dashboard"
            title="Discovery Engine"
            description="Unlike traditional job boards, MeritLane only shows candidates who have passed rigorous technical assessments. If a candidate appears here, their skills are objectively verified."
            steps={[
              { title: "Filter & Search", description: "Filter by verified technical domains or search for specific traits.", isCompleted: true },
              { title: "Review Evidence", description: "Click a candidate to view their complete dossier and proof.", isCompleted: false },
              { title: "Shortlist & Message", description: "Save interesting candidates and reach out directly.", isCompleted: Object.values(shortlisted).some((v) => v) },
            ]}
          />
        </div>

        {/* Hero Header */}
        <div className="max-w-[1000px] mx-auto mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-[#15803D] bg-[#15803D]/10 px-2.5 py-1 rounded-full">
              Verified Talent Hub
            </span>
            <span className="text-[12px] text-[#737373] font-sans">
              · Powered by OpenRouter AI Analysis
            </span>
          </div>
          <h1 className="font-serif text-[42px] text-[#0D0D0D] leading-tight mb-2">
            Find people whose skills are proven.
          </h1>
          <p className="text-[16px] text-[#737373] font-sans">
            Inspect technical candidates backed by verified assessments, project evidence, and AI hiring briefs.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-8 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
              <Input
                placeholder="Search candidates by name, college, technology, or repository keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchCandidates();
                }}
                className="pl-12 h-14 bg-[#FAFAFA] border-[#E5E5E5] text-[15px] focus-visible:ring-1 focus-visible:ring-[#0D0D0D] rounded-xl"
              />
            </div>

            {/* Skill Filter Chips */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#737373] uppercase tracking-wider mr-1">
                <Filter className="h-3.5 w-3.5" /> Filter by Skill:
              </div>
              {COMMON_SKILLS.slice(0, 14).map((skill) => {
                const isActive = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkillFilter(skill)}
                    className={
                      "px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border " +
                      (isActive
                        ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-sm"
                        : "bg-[#FAFAFA] text-[#737373] border-[#E5E5E5] hover:bg-white hover:border-[#D2D2D2]")
                    }
                  >
                    {skill}
                  </button>
                );
              })}
              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSkills([])}
                  className="px-2.5 py-1 text-[12px] text-[#737373] hover:text-[#0D0D0D] underline decoration-[#D2D2D2] underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Sort & Count Row */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] text-[13px] text-[#737373]">
              <div>
                Showing <span className="font-semibold text-[#0D0D0D]">{sortedCandidates.length}</span> verified candidate{sortedCandidates.length === 1 ? "" : "s"}
                {selectedSkills.length > 0 && (
                  <span className="text-[#737373] ml-1">
                    matching {selectedSkills.join(", ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-[12px]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="text-[12px] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md px-2 py-1 text-[#0D0D0D] outline-none cursor-pointer"
                >
                  <option value="match">Best Match</option>
                  <option value="skills">Most Verified Skills</option>
                  <option value="projects">Most Evidence Projects</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
              <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
              <p className="text-[13px] font-sans">Loading verified talent...</p>
            </div>
          ) : sortedCandidates.length === 0 ? (
            <div className="border border-[#E5E5E5] border-dashed rounded-2xl bg-white p-16 text-center shadow-sm">
              <h2 className="text-[20px] font-serif text-[#0D0D0D] mb-3">No verified candidates found</h2>
              <p className="text-[14px] text-[#737373] mb-6 max-w-md mx-auto">
                No candidates match your current search query or skill filters. Try broadening your criteria or reset all filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkills([]);
                  fetchCandidates();
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCandidates.map((c) => {
                const isShortlisted = shortlisted[c.uid] || false;
                const verifiedSkillsList = Object.keys(c.verifiedSkills || {}).filter(
                  (k) => c.verifiedSkills[k].status === "verified"
                );

                return (
                  <div
                    key={c.uid}
                    className="group border border-[#E5E5E5] rounded-2xl bg-white p-6 md:p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Candidate Identity & Evidence */}
                      <div className="flex items-start gap-6">
                        <div className="h-16 w-16 shrink-0 rounded-2xl bg-[#F3F3F1] border border-[#E5E5E5] flex items-center justify-center text-[#0D0D0D] font-serif text-[26px]">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-serif text-[26px] text-[#0D0D0D] leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-sm">
                              Verified Practitioner
                            </span>
                          </div>

                          {(c.college || c.branch) && (
                            <p className="text-[14px] text-[#737373] mt-1 mb-4 flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 opacity-70" />
                              {c.branch}
                              {c.branch && c.college ? " · " : ""}
                              {c.college} {c.gradYear ? `(${c.gradYear.toString().slice(-2)})` : ""}
                            </p>
                          )}

                          {/* Verified Skills Badges */}
                          {verifiedSkillsList.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {verifiedSkillsList.map((skill, idx) => {
                                const skillObj = c.verifiedSkills[skill];
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D] text-[12px] font-medium"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {skill}
                                    {skillObj?.score && (
                                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded-full text-[#15803D] font-bold border border-[#15803D]/30">
                                        {skillObj.score}%
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-3 text-[13px] text-[#737373] italic">
                              Claimed skills under assessment verification.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        <div className="text-left md:text-right mb-1">
                          <div className="text-[13px] text-[#737373] font-medium">
                            {verifiedSkillsList.length} verified skill{verifiedSkillsList.length === 1 ? "" : "s"}
                          </div>
                          <div className="text-[13px] text-[#737373]">
                            {c.projects?.length || 0} evidence project{c.projects?.length === 1 ? "" : "s"}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAiSummary(c.uid)}
                            className="gap-1.5 text-[12px] bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-300"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                            {activeAiCard === c.uid ? "Hide AI Brief" : "AI Brief"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessagingTarget({ id: c.uid, name: c.name || "Candidate" })}
                            className="gap-1.5 text-[12px] border-[#E5E5E5] text-[#0D0D0D] hover:bg-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#737373]" />
                            Message
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 text-[12px] ${
                              isShortlisted
                                ? "bg-[#FAFAFA] border-[#D2D2D2] text-[#0D0D0D]"
                                : "border-[#E5E5E5] text-[#0D0D0D]"
                            }`}
                            onClick={() => toggleShortlist(c.uid)}
                          >
                            {isShortlisted ? (
                              <><BookmarkCheck className="h-3.5 w-3.5 text-[#15803D]" /> Shortlisted</>
                            ) : (
                              <><Bookmark className="h-3.5 w-3.5 text-[#737373]" /> Shortlist</>
                            )}
                          </Button>

                          <Link href={`/employer/candidate/${c.uid}`}>
                            <Button size="sm" className="gap-1.5 text-[12px] bg-[#0D0D0D] hover:bg-[#404040]">
                              View Dossier <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Expandable AI Recruiter Brief */}
                    {activeAiCard === c.uid && (
                      <div className="mt-6 pt-5 border-t border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-xl p-5 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-indigo-950 font-semibold text-[13px]">
                            <Sparkles className="h-4 w-4 text-indigo-600" /> AI Candidate Evaluation Brief
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                            Model: Gemini 2.0 Flash
                          </span>
                        </div>
                        {loadingAi[c.uid] ? (
                          <div className="py-4 flex items-center gap-3 text-indigo-600">
                            <div className="h-4 w-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                            <span className="text-[13px] text-zinc-500 font-sans">
                              Synthesizing verified engineering evidence and code claims...
                            </span>
                          </div>
                        ) : (
                          <p className="text-[13px] text-zinc-700 leading-relaxed font-sans">
                            {aiSummaries[c.uid] || "Summary unavailable."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {messagingTarget && (
        <MessageModal
          isOpen={true}
          onClose={() => setMessagingTarget(null)}
          recipientId={messagingTarget.id}
          recipientName={messagingTarget.name}
        />
      )}
    </div>
  );
}
