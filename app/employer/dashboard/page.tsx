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
  MessageSquare,
  ArrowUpDown,
  Code2,
  Layers,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COMMON_SKILLS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { ContextGuide } from "@/components/ui/ContextGuide";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { MessageModal } from "@/components/employer/MessageModal";
import { CandidateAvatar } from "@/components/ui/CandidateAvatar";

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

  // Advanced Filter States
  const [minScore, setMinScore] = useState<number>(0);
  const [requireLiveProject, setRequireLiveProject] = useState<boolean>(false);
  const [requireGithub, setRequireGithub] = useState<boolean>(false);
  const [minCommits, setMinCommits] = useState<number>(0);
  const [matchMode, setMatchMode] = useState<"any" | "all">("any");
  const [gradYearFilter, setGradYearFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Messaging state
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

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
          minScore,
          requireLiveProject,
          requireGithub,
          minCommits,
          matchMode,
          gradYear: gradYearFilter,
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
  }, [
    user,
    searchQuery,
    selectedSkills,
    minScore,
    requireLiveProject,
    requireGithub,
    minCommits,
    matchMode,
    gradYearFilter,
  ]);

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

  if (loading && !user) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (errorMsg) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 bg-[#FAFAFA]">
        <ErrorState
          title="Unable to load candidates"
          description={errorMsg}
          onRetry={fetchCandidates}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#FAFAFA]">
      <div className="flex-1 p-4 sm:p-8 md:p-10 lg:p-14 overflow-y-auto scrollbar-hide">
        {/* Context Guide */}
        <div className="max-w-[1000px] mx-auto">
          <ContextGuide
            storageKey="employer_dashboard"
            title="Discovery Engine"
            steps={[
              { title: "Filter & Search", isCompleted: true },
              { title: "Review Evidence", isCompleted: false },
              { title: "Shortlist & Message", isCompleted: Object.values(shortlisted).some((v) => v) },
            ]}
          />
        </div>

        {/* Hero Header & Institutional Telemetry */}
        <div className="max-w-[1000px] mx-auto mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium font-bold uppercase tracking-[0.1em] text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-1 rounded">
                Institutional Talent Registry
              </span>
              <span className="text-[12px] text-[#737373] font-mono">
                · Monitored Assessment Directory
              </span>
            </div>
            <Link href="/employer/jobs">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded text-[#1C1917] transition-colors shadow-2xs">
                <Briefcase className="h-3.5 w-3.5 text-[#064E3B]" />
                <span>MANAGE JOBS & APPLICANTS</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
          <h1 className="text-[26px] sm:text-[34px] lg:text-[38px] font-bold uppercase tracking-[0.06em] text-[#0D0D0D] leading-tight mb-6">
            FIND PEOPLE WHOSE SKILLS ARE PROVEN.
          </h1>

          {/* Institutional Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-white border border-[#E5E5E5] p-4 rounded shadow-xs">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-wide text-[#737373] mb-1">
                Verified Engineers
              </div>
              <div className="text-[26px] font-serif text-[#0D0D0D] font-normal leading-none">
                {candidates.length}
              </div>
              <div className="text-[11px] text-[#737373] mt-1">Evaluated practitioners in pool</div>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-white border border-[#E5E5E5] p-4 rounded shadow-xs">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-wide text-[#064E3B] mb-1">
                High Scorers (≥85%)
              </div>
              <div className="text-[26px] font-serif text-[#064E3B] font-normal leading-none">
                {candidates.filter(c => Object.values(c.verifiedSkills || {}).some((v: any) => (v.score || 0) >= 85)).length}
              </div>
              <div className="text-[11px] text-[#737373] mt-1">Distinction level evaluations</div>
            </motion.div>

            <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-white border border-[#E5E5E5] p-4 rounded shadow-xs">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-wide text-[#737373] mb-1">
                Audited Projects
              </div>
              <div className="text-[26px] font-serif text-[#0D0D0D] font-normal leading-none">
                {candidates.reduce((acc, c) => acc + (c.projects?.length || 0), 0)}
              </div>
              <div className="text-[11px] text-[#737373] mt-1">Linked code repositories</div>
            </motion.div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-8 bg-white border border-[#E5E5E5] p-4 sm:p-6 rounded shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 sm:space-y-5">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-[#78716C] pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates by name, skills, role, or Candidate ID (e.g. ML-73977F0B)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchCandidates();
                }}
                className="w-full h-12 pl-11 pr-10 bg-[#FAF8F5] border border-[#E7E2DA] focus:border-[#064E3B] focus:bg-white text-[14px] font-sans text-[#1C1917] placeholder:text-[#A8A29E] rounded transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-[#78716C] hover:text-[#1C1917] p-1 rounded transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Active Filter Indicators */}
            {(selectedSkills.length > 0 || searchQuery.trim()) && (
              <div className="flex items-center gap-2 flex-wrap text-[12px] pt-1">
                <span className="text-[#78716C] font-mono text-[10px] uppercase tracking-wider font-semibold">Active:</span>
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917] text-[12px] font-mono">
                    Keyword: &ldquo;{searchQuery}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-[#B42318] text-[#78716C] ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1C1917] text-white text-[12px] font-mono shadow-2xs"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => toggleSkillFilter(sk)}
                      className="hover:text-red-300 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSkills([]);
                  }}
                  className="text-[11px] font-sans text-[#78716C] hover:text-[#B42318] hover:underline transition-colors ml-1 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Skill Filter Chips */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#737373] uppercase tracking-wider mr-1">
                <Filter className="h-3.5 w-3.5" /> Filter by Skill:
              </div>
              {COMMON_SKILLS.slice(0, 14).map((skill) => {
                const isActive = selectedSkills.includes(skill);
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={skill}
                    type="button"
                    onClick={() => toggleSkillFilter(skill)}
                    className={
                      "px-3.5 py-1.5 rounded text-[12px] font-medium transition-colors duration-150 border " +
                      (isActive
                        ? "bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-sm"
                        : "bg-[#FAFAFA] text-[#737373] border-[#E5E5E5] hover:bg-white hover:border-[#D2D2D2]")
                    }
                  >
                    {skill}
                  </motion.button>
                );
              })}
              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSkills([])}
                  className="px-2.5 py-1 text-[12px] text-[#737373] hover:text-[#0D0D0D] underline decoration-[#D2D2D2] underline-offset-4"
                >
                  Clear skills
                </button>
              )}
            </div>

            {/* Advanced Filters Toggle & Drawer */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0D0D0D] hover:text-[#737373] transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />
                  {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Search Filters"}
                  {(minScore > 0 || requireLiveProject || requireGithub || minCommits > 0 || matchMode === "all" || gradYearFilter !== "all") && (
                    <span className="h-2 w-2 rounded-full bg-[#15803D]" />
                  )}
                </button>

                {(minScore > 0 || requireLiveProject || requireGithub || minCommits > 0 || matchMode === "all" || gradYearFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinScore(0);
                      setRequireLiveProject(false);
                      setRequireGithub(false);
                      setMinCommits(0);
                      setMatchMode("any");
                      setGradYearFilter("all");
                    }}
                    className="text-[12px] text-[#B42318] hover:underline"
                  >
                    Reset advanced filters
                  </button>
                )}
              </div>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 rounded bg-[#FAFAFA] border border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px]">
                  {/* Verified Score Threshold */}
                  <div>
                    <label className="block font-semibold text-[#0D0D0D] mb-1.5">
                      Minimum Verified Score
                    </label>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full bg-white border border-[#E5E5E5] rounded px-2.5 py-1.5 text-[#0D0D0D] outline-none"
                    >
                      <option value={0}>Any Score</option>
                      <option value={80}>Verified (Passed)</option>
                      <option value={90}>Top Tier (≥ 90%)</option>
                    </select>
                  </div>

                  {/* Evidence Artifacts */}
                  <div>
                    <label className="block font-semibold text-[#0D0D0D] mb-1.5">
                      Required Evidence
                    </label>
                    <div className="space-y-1.5 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireLiveProject}
                          onChange={(e) => setRequireLiveProject(e.target.checked)}
                          className="rounded border-[#E5E5E5] text-[#0D0D0D] focus:ring-0"
                        />
                        <span>Has Live Deployed App</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireGithub}
                          onChange={(e) => setRequireGithub(e.target.checked)}
                          className="rounded border-[#E5E5E5] text-[#0D0D0D] focus:ring-0"
                        />
                        <span>GitHub Account Linked</span>
                      </label>
                    </div>
                  </div>

                  {/* GitHub Activity & Matching */}
                  <div>
                    <label className="block font-semibold text-[#0D0D0D] mb-1.5">
                      GitHub Activity &amp; Mode
                    </label>
                    <select
                      value={minCommits}
                      onChange={(e) => setMinCommits(Number(e.target.value))}
                      className="w-full bg-white border border-[#E5E5E5] rounded px-2.5 py-1.5 text-[#0D0D0D] outline-none mb-2"
                    >
                      <option value={0}>Any Commit History</option>
                      <option value={25}>≥ 25 Total Commits</option>
                      <option value={50}>≥ 50 Total Commits</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatchMode(matchMode === "any" ? "all" : "any")}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                          matchMode === "all"
                            ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                            : "bg-white text-[#737373] border-[#E5E5E5]"
                        }`}
                      >
                        {matchMode === "all" ? "Must Match ALL Skills" : "Match ANY Selected Skill"}
                      </button>
                    </div>
                  </div>

                  {/* Graduation Cohort */}
                  <div>
                    <label className="block font-semibold text-[#0D0D0D] mb-1.5">
                      Graduation Year
                    </label>
                    <select
                      value={gradYearFilter}
                      onChange={(e) => setGradYearFilter(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] rounded px-2.5 py-1.5 text-[#0D0D0D] outline-none"
                    >
                      <option value="all">All Cohorts</option>
                      <option value="2024">2024 Graduates</option>
                      <option value="2025">2025 Graduates</option>
                      <option value="2026">2026+ Graduates</option>
                    </select>
                  </div>
                </div>
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
            <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E7E2DA] rounded shadow-2xs">
              <div className="h-7 w-7 border-2 border-[#E7E2DA] border-t-[#064E3B] rounded-full animate-spin" />
              <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-[0.16em]">
                Querying verified practitioner ledger…
              </div>
            </div>
          ) : sortedCandidates.length === 0 ? (
            <div className="border border-[#E5E5E5] border-dashed rounded bg-white p-16 text-center shadow-sm">
              <h2 className="text-[20px] font-serif text-[#0D0D0D] mb-3">No verified candidates found</h2>
              <p className="text-[14px] text-[#737373] mb-6 max-w-md mx-auto">
                No candidates match your current search query or skill filters. Try broadening your criteria or reset all filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkills([]);
                  setMinScore(0);
                  setRequireLiveProject(false);
                  setRequireGithub(false);
                  setMinCommits(0);
                  setMatchMode("any");
                  setGradYearFilter("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <motion.div layout className="space-y-6">
              <AnimatePresence>
                {sortedCandidates.map((c) => {
                  const isShortlisted = shortlisted[c.uid] || false;
                  const verifiedSkillsList = Object.keys(c.verifiedSkills || {}).filter(
                    (k) => c.verifiedSkills[k].status === "verified"
                  );
                  const totalSkills = c.totalSkillsCount || c.skills?.length || (verifiedSkillsList.length > 0 ? verifiedSkillsList.length * 2 : 1);
                  const verifiedCount = c.qualifiedSkillsCount ?? verifiedSkillsList.length;
                  const verificationPct = typeof c.skillVerificationPct === "number" 
                    ? c.skillVerificationPct 
                    : (totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 50);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      whileHover={{ y: -4, scale: 1.005, boxShadow: "0 12px 40px -10px rgba(0,0,0,0.08)" }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      key={c.uid}
                      className="group border border-[#E5E5E5] rounded bg-white p-4 sm:p-6 md:p-8 transition-colors duration-150 hover:border-[#1C1917]/20"
                    >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
                      {/* Candidate Identity & Evidence */}
                      <div className="flex items-start gap-4 sm:gap-6">
                        <CandidateAvatar
                          avatarUrl={c.avatarUrl}
                          name={c.name}
                          size="lg"
                          isEligibleForJob={totalSkills > 0 && verifiedCount === totalSkills}
                          badgePreference="auto"
                          showBadge={true}
                        />
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-serif text-[26px] text-[#0D0D0D] leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span className="text-[11px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20">
                              {c.candidateKey || (c.id ? `ML-${c.id.slice(0, 8).toUpperCase()}` : "CANDIDATE")}
                            </span>
                            <span className="text-[11px] font-medium font-bold uppercase tracking-[0.1em] text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-sm">
                              Verified Practitioner
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                              <span>{verificationPct}% Skills Verified</span>
                              <span className="text-[#047857] font-normal text-[10px]">
                                ({verifiedCount}/{totalSkills} passed ≥75%)
                              </span>
                            </div>
                          </div>

                          {/* Target Roles & Location preview if available */}
                          {((c.targetRoles && c.targetRoles.length > 0) || c.workPreference) && (
                            <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] font-mono text-[#064E3B]">
                              {c.targetRoles?.slice(0, 2).map((role: string) => (
                                <span key={role} className="bg-[#FAF8F5] border border-[#E7E2DA] px-2 py-0.5 rounded text-[#1C1917]">
                                  {role}
                                </span>
                              ))}
                              {c.workPreference && (
                                <span className="text-[#78716C]">· {c.workPreference}</span>
                              )}
                              {c.availability && (
                                <span className="text-[#059669]">· {c.availability}</span>
                              )}
                            </div>
                          )}

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
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D] text-[12px] font-medium"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {skill}
                                    {skillObj?.score && (
                                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded text-[#15803D] font-bold border border-[#15803D]/30">
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

                          {/* Evidence Strip: GitHub & ATS signals */}
                          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-[11px] font-mono text-[#737373]">
                            {c.githubEvidence && (
                              <div className="flex items-center gap-1.5 bg-[#F5F5F4] px-2.5 py-1 rounded-md text-[#44403C]">
                                <Code2 className="h-3.5 w-3.5 text-[#1C1917]" />
                                <span>{c.githubEvidence.totalCommits || 0} commits</span>
                                <span>· {c.githubEvidence.repoCount || 0} repos</span>
                                {c.githubEvidence.topLanguages?.length > 0 && (
                                  <span className="text-[#78716C]">
                                    ({c.githubEvidence.topLanguages.slice(0, 2).join(", ")})
                                  </span>
                                )}
                              </div>
                            )}

                            {typeof c.atsScore === "number" && (
                              <div className="flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-md text-[#166534]">
                                <span>ATS: {c.atsScore}/100</span>
                                {c.atsRating && <span className="font-bold">({c.atsRating})</span>}
                              </div>
                            )}

                            {c.projects?.some((p: any) => p.liveUrl) && (
                              <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded-md text-[#1C1917]">
                                <ExternalLink className="h-3 w-3" />
                                <span>Live Demo Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        <div className="text-left md:text-right mb-1">
                          <div className="flex items-center md:justify-end gap-1.5">
                            <span className="text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded">
                              {verificationPct}% Verified
                            </span>
                            <span className="text-[13px] text-[#0D0D0D] font-medium">
                              {verifiedCount}/{totalSkills} skills (≥75%)
                            </span>
                          </div>
                          <div className="w-32 bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden mt-1.5 md:ml-auto">
                            <div
                              className="bg-[#059669] h-full rounded-full transition-all duration-150"
                              style={{ width: `${Math.min(100, Math.max(5, verificationPct))}%` }}
                            />
                          </div>
                          <div className="text-[12px] text-[#737373] mt-1">
                            {c.projects?.length || 0} evidence project{c.projects?.length === 1 ? "" : "s"}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">

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
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
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
