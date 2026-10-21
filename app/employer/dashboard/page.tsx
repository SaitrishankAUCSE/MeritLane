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
  Trophy,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COMMON_SKILLS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSkills, minScore, requireLiveProject, requireGithub, minCommits, matchMode, gradYearFilter, sortBy]);

  // Messaging state
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setFetching((prev) => candidates.length === 0);
    try {
      const token = await user.getIdToken();
      
      const [res, shortlistRes] = await Promise.all([
        fetch("/api/employer/discover", {
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
        }),
        fetch("/api/employer/shortlist", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to fetch candidates");
        setFetching(false);
        return;
      }

      const data = await res.json();
      setCandidates(data.candidates || []);

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
    candidates.length
  ]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
        return;
      }
      const timeoutId = setTimeout(() => {
        fetchCandidates();
      }, 150);

      // Periodic background sync every 30 seconds to preserve network bandwidth and responsiveness
      const intervalId = setInterval(() => {
        fetchCandidates();
      }, 30000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, [loading, user, router, fetchCandidates]);

  const toggleShortlist = async (candidateId: string) => {
    const isCurrentlyShortlisted = shortlisted[candidateId];

    setShortlisted((prev) => ({
      ...prev,
      [candidateId]: !isCurrentlyShortlisted,
    }));

    try {
      const token = await user?.getIdToken();
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
      const aCount = a.qualifiedSkillsCount ?? Object.keys(a.verifiedSkills || {}).length;
      const bCount = b.qualifiedSkillsCount ?? Object.keys(b.verifiedSkills || {}).length;
      return bCount - aCount;
    }
    if (sortBy === "projects") {
      return (b.projects?.length || 0) - (a.projects?.length || 0);
    }
    // Default: match count, then verified skills, then total skills
    if ((b.matchedRequiredSkillCount || 0) !== (a.matchedRequiredSkillCount || 0)) {
      return (b.matchedRequiredSkillCount || 0) - (a.matchedRequiredSkillCount || 0);
    }
    if ((b.qualifiedSkillsCount || 0) !== (a.qualifiedSkillsCount || 0)) {
      return (b.qualifiedSkillsCount || 0) - (a.qualifiedSkillsCount || 0);
    }
    return (b.skills?.length || 0) - (a.skills?.length || 0);
  });
  
  const paginatedCandidates = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCandidates, currentPage]);

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
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent text-[#101010] font-sans">
      <div className="flex-1 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 overflow-y-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto w-full">

        {/* Hero Header */}
        <div className="w-full mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium tracking-wider text-[#71717A] uppercase">
                Employer Discovery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-meritlane-welcome"))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium rounded-full text-[#101010] transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                title="Learn how MeritLane works"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#71717A]" />
                <span>How it works</span>
              </button>
              <Link href="/employer/jobs">
                <button className="flex items-center gap-2 px-4 py-1.5 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-xs font-medium rounded-full text-[#101010] transition-colors shadow-xs cursor-pointer active:scale-[0.98]">
                  <Briefcase className="h-3.5 w-3.5 text-[#71717A]" />
                  <span>Manage Jobs &amp; Applicants</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.035em] text-[#101010] leading-tight mb-2">
            Find engineers with verified proof of work.
          </h1>
          <p className="text-[14px] text-[#71717A]">
            Discover technical candidates who passed objective, monitored code evaluations.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="w-full">
          <div className="mb-8 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 sm:space-y-5">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-[#71717A] pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates by name, skills, role, or Candidate ID (e.g. ML-73977F0B)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchCandidates();
                }}
                className="w-full h-11 pl-11 pr-10 bg-[#FAFAF9] focus:bg-white border border-black/[0.12] focus:border-[#101010] text-[13px] text-[#101010] placeholder:text-[#A1A1AA] rounded-xl transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-[#71717A] hover:text-[#101010] p-1 rounded-md transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Active Filter Indicators */}
            {(selectedSkills.length > 0 || searchQuery.trim()) && (
              <div className="flex items-center gap-2 flex-wrap text-[12px] pt-1">
                <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold">Active:</span>
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface border border-border text-foreground text-[12px] font-mono">
                    Keyword: &ldquo;{searchQuery}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-danger text-muted-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-foreground text-white text-[12px] font-mono shadow-2xs"
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
                  className="text-[11px] font-sans text-muted-foreground hover:text-danger hover:underline transition-colors ml-1 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Skill Filter Chips */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground uppercase tracking-wider mr-1">
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
                        ? "bg-foreground text-white border-foreground shadow-sm"
                        : "bg-[#FAFAFA] text-muted-foreground border-border hover:bg-white hover:border-[#D2D2D2]")
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
                  className="px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground underline decoration-[#D2D2D2] underline-offset-4"
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
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground hover:text-muted-foreground transition-colors"
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
                    className="text-[12px] text-danger hover:underline"
                  >
                    Reset advanced filters
                  </button>
                )}
              </div>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 rounded bg-[#FAFAFA] border border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px]">
                  {/* Verified Score Threshold */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Minimum Verified Score
                    </label>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-foreground outline-none"
                    >
                      <option value={0}>Any Score</option>
                      <option value={80}>Verified (Passed)</option>
                      <option value={90}>Top Tier (≥ 90%)</option>
                    </select>
                  </div>

                  {/* Evidence Artifacts */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Required Evidence
                    </label>
                    <div className="space-y-1.5 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireLiveProject}
                          onChange={(e) => setRequireLiveProject(e.target.checked)}
                          className="rounded border-border text-foreground focus:ring-0"
                        />
                        <span>Has Live Deployed App</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireGithub}
                          onChange={(e) => setRequireGithub(e.target.checked)}
                          className="rounded border-border text-foreground focus:ring-0"
                        />
                        <span>GitHub Account Linked</span>
                      </label>
                    </div>
                  </div>

                  {/* GitHub Activity & Matching */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      GitHub Activity &amp; Mode
                    </label>
                    <select
                      value={minCommits}
                      onChange={(e) => setMinCommits(Number(e.target.value))}
                      className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-foreground outline-none mb-2"
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
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-muted-foreground border-border"
                        }`}
                      >
                        {matchMode === "all" ? "Must Match ALL Skills" : "Match ANY Selected Skill"}
                      </button>
                    </div>
                  </div>

                  {/* Graduation Cohort */}
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">
                      Graduation Year
                    </label>
                    <select
                      value={gradYearFilter}
                      onChange={(e) => setGradYearFilter(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-foreground outline-none"
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
            <div className="flex items-center justify-between pt-3 border-t border-border text-[13px] text-muted-foreground">
              <div>
                Showing <span className="font-semibold text-foreground">{sortedCandidates.length}</span> candidate{sortedCandidates.length === 1 ? "" : "s"}
                {selectedSkills.length > 0 && (
                  <span className="text-muted-foreground ml-1">
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
                  className="text-[12px] bg-[#FAFAFA] border border-border rounded-md px-2 py-1 text-foreground outline-none cursor-pointer"
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
            <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white border border-black/[0.08] rounded-2xl shadow-xs">
              <div className="h-7 w-7 border-2 border-black/[0.08] border-t-[#101010] rounded-full animate-spin" />
              <div className="text-[12px] font-mono text-[#737373] uppercase tracking-[0.16em]">
                Querying verified practitioner ledger…
              </div>
            </div>
          ) : sortedCandidates.length === 0 ? (
            <div className="border border-black/[0.08] border-dashed rounded-2xl bg-white p-16 text-center shadow-xs">
              <h2 className="text-[20px] font-bold tracking-tight text-[#101010] mb-3">No candidates found</h2>
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
                {paginatedCandidates.map((c: any) => {
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
                      className="group border border-black/[0.08] rounded-2xl bg-white p-6 sm:p-7 transition-all duration-150 hover:border-black/[0.2] shadow-xs"
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
                            <h3 className="text-[20px] font-semibold text-[#101010] tracking-tight leading-tight">
                              {c.name || "Anonymous Candidate"}
                            </h3>
                            <span className="text-xs font-mono font-medium text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                              {c.candidateKey || (c.id ? `ML-${c.id.slice(0, 8).toUpperCase()}` : "CANDIDATE")}
                            </span>
                            <span className="text-xs font-medium text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                              Verified Practitioner
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-[#101010] text-xs font-medium">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{verificationPct}% Verified</span>
                              <span className="text-[#737373] font-normal text-[11px]">
                                ({verifiedCount}/{totalSkills} passed ≥75%)
                              </span>
                            </div>
                          </div>

                          {/* Target Roles & Location preview if available */}
                          {((c.targetRoles && c.targetRoles.length > 0) || c.workPreference) && (
                            <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] font-mono text-[#737373]">
                              {c.targetRoles?.slice(0, 2).map((role: string) => (
                                <span key={role} className="bg-black/[0.04] border border-black/[0.08] px-2 py-0.5 rounded-full text-[#101010]">
                                  {role}
                                </span>
                              ))}
                              {c.workPreference && (
                                <span className="text-[#737373]">· {c.workPreference}</span>
                              )}
                              {c.availability && (
                                <span className="text-[#101010]">· {c.availability}</span>
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
                                const isGold = skillObj?.badge === "gold_honors" || skillObj?.track === "advanced";
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[12px] font-medium ${
                                      isGold
                                        ? "border-amber-300 bg-amber-50 text-amber-800"
                                        : "border-[#15803D]/20 bg-[#15803D]/5 text-[#15803D]"
                                    }`}
                                  >
                                    {isGold ? (
                                      <Trophy className="h-3.5 w-3.5 text-amber-700" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                    {skill}
                                    {isGold && (
                                      <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-200/60 text-amber-900 px-1 rounded">
                                        Gold
                                      </span>
                                    )}
                                    {skillObj?.score && (
                                      <span className={`text-[10px] font-mono bg-white px-1.5 py-0.2 rounded font-bold border ${
                                        isGold ? "text-amber-800 border-amber-300" : "text-[#15803D] border-[#15803D]/30"
                                      }`}>
                                        {skillObj.score}%
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-3 text-[13px] text-muted-foreground italic">
                              Claimed skills under assessment verification.
                            </div>
                          )}

                          {/* Evidence Strip: GitHub & ATS signals */}
                          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-[11px] font-mono text-muted-foreground">
                            {c.githubEvidence && (
                              <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md text-[#44403C]">
                                <Code2 className="h-3.5 w-3.5 text-foreground" />
                                <span>{c.githubEvidence.totalCommits || 0} commits</span>
                                <span>· {c.githubEvidence.repoCount || 0} repos</span>
                                {c.githubEvidence.topLanguages?.length > 0 && (
                                  <span className="text-muted-foreground">
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
                              <div className="flex items-center gap-1 bg-surface border border-border px-2.5 py-1 rounded-md text-foreground">
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
                            <span className="text-[11px] font-mono font-bold text-[#101010] bg-black/[0.04] border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                              {verificationPct}% Verified
                            </span>
                            <span className="text-[13px] text-[#101010] font-medium">
                              {verifiedCount}/{totalSkills} skills (≥75%)
                            </span>
                          </div>
                          <div className="w-32 bg-black/[0.08] h-1.5 rounded-full overflow-hidden mt-1.5 md:ml-auto">
                            <div
                              className="bg-[#101010] h-full rounded-full transition-all duration-150"
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
                            className="gap-1.5 text-[12px] border-border text-foreground hover:bg-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            Message
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 text-[12px] ${
                              isShortlisted
                                ? "bg-[#FAFAFA] border-[#D2D2D2] text-foreground"
                                : "border-border text-foreground"
                            }`}
                            onClick={() => toggleShortlist(c.uid)}
                          >
                            {isShortlisted ? (
                              <><BookmarkCheck className="h-3.5 w-3.5 text-[#15803D]" /> Shortlisted</>
                            ) : (
                              <><Bookmark className="h-3.5 w-3.5 text-muted-foreground" /> Shortlist</>
                            )}
                          </Button>

                          <Link href={`/employer/candidate/${c.uid}`}>
                            <Button size="sm" className="gap-1.5 text-[12px] bg-foreground hover:bg-[#404040]">
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

          {/* Pagination Controls */}
          {sortedCandidates.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-8 pb-4">
              <span className="text-xs text-muted-foreground font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedCandidates.length)} of {sortedCandidates.length} candidates
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="bg-white border-border text-foreground text-[12px] h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * ITEMS_PER_PAGE >= sortedCandidates.length}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="bg-white border-border text-foreground text-[12px] h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
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
