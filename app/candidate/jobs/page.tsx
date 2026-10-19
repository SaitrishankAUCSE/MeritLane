"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, ArrowRight, ShieldCheck, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Job } from "@/lib/firebase/jobs";
import { COMMON_SKILLS } from "@/lib/constants";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
export default function CandidateJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [employmentType, setEmploymentType] = useState("all");
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [feedMode, setFeedMode] = useState<"all" | "matched">("all");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedSkill.trim()) params.set("skill", selectedSkill.trim());
      if (workMode !== "all") params.set("workMode", workMode);
      if (employmentType !== "all") params.set("employmentType", employmentType);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error(err);
      setError("Unable to retrieve open opportunities. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSkill, workMode, employmentType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadJobs]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [profileData, token] = await Promise.all([
          fetchCandidateProfile(user.uid),
          user.getIdToken(),
        ]);
        if (profileData) setCandidateProfile(profileData);

        const res = await fetch("/api/candidate/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApplicationsCount(data.applications?.length || 0);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);

  // Extract all candidate skills (declared + verified)
  const candidateSkills = useMemo(() => {
    if (!candidateProfile) return [];
    const declared: string[] = Array.isArray(candidateProfile.skills) ? candidateProfile.skills : [];
    const verified: string[] = Object.keys(candidateProfile.verifiedSkills || {}).filter(
      (k) => candidateProfile.verifiedSkills[k]?.status === "verified"
    );
    return Array.from(new Set([...declared, ...verified].map((s) => s.trim().toLowerCase())));
  }, [candidateProfile]);

  // Compute skill match statistics for any job
  const getJobMatchStats = useCallback(
    (job: Job) => {
      if (candidateSkills.length === 0 || !job.requiredSkills || job.requiredSkills.length === 0) {
        return { matchCount: 0, totalRequired: job.requiredSkills?.length || 0, percent: 0, matchedSkills: [] };
      }
      const matched = job.requiredSkills.filter((sk) =>
        candidateSkills.some(
          (cs) =>
            cs === sk.trim().toLowerCase() ||
            cs.includes(sk.trim().toLowerCase()) ||
            sk.trim().toLowerCase().includes(cs)
        )
      );
      const total = job.requiredSkills.length || 1;
      const percent = Math.round((matched.length / total) * 100);
      return {
        matchCount: matched.length,
        totalRequired: job.requiredSkills.length,
        percent,
        matchedSkills: matched,
      };
    },
    [candidateSkills]
  );

  // Count of matched roles
  const matchedJobsCount = useMemo(() => {
    if (candidateSkills.length === 0) return 0;
    return jobs.filter((j) => getJobMatchStats(j).matchCount > 0).length;
  }, [jobs, candidateSkills, getJobMatchStats]);

  // Filtered jobs according to feed mode
  const displayedJobs = useMemo(() => {
    if (feedMode === "matched") {
      return jobs
        .map((job) => ({ job, stats: getJobMatchStats(job) }))
        .filter(({ stats }) => stats.matchCount > 0)
        .sort((a, b) => b.stats.percent - a.stats.percent)
        .map(({ job }) => job);
    }
    return jobs;
  }, [jobs, feedMode, getJobMatchStats]);

  return (
    <div className="w-full min-h-full bg-transparent pb-24">
      {/* ── Header Strip ── */}
      <div className="border-b border-border bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Job Board · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-foreground font-semibold tracking-tight leading-tight">
              Job Openings
            </h1>
            <p className="text-[13px] text-muted-foreground font-sans mt-1">
              Find open engineering roles from companies looking for verified skills and real project experience.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Active Jobs</div>
              <div className="text-[24px] font-semibold text-emerald-900">{jobs.length}</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Skill Matches</div>
              <div className="text-[24px] font-semibold text-emerald-900">{matchedJobsCount}</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Applied</div>
              <div className="text-[24px] font-semibold text-foreground">{applicationsCount}</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="hidden sm:block">
              <Link href="/candidate/applications">
                <button className="flex items-center gap-2 px-4 py-2 border border-border bg-surface hover:bg-white text-foreground text-[12px] font-sans font-semibold uppercase tracking-wide rounded transition-colors shadow-2xs">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Applications</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ── Match Switch Segmented Control ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="inline-flex p-1 bg-border rounded border border-border self-start">
            <button
              type="button"
              onClick={() => setFeedMode("all")}
              className={`px-5 py-2 rounded text-[12px] font-mono font-semibold transition-all ${
                feedMode === "all"
                  ? "bg-foreground text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Jobs ({jobs.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedMode("matched")}
              className={`flex items-center gap-2 px-5 py-2 rounded text-[12px] font-mono font-semibold transition-all ${
                feedMode === "matched"
                  ? "bg-emerald-900 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Matched to My Skills ({matchedJobsCount})</span>
            </button>
          </div>

          {feedMode === "matched" && (
            <div className="text-[12px] font-mono text-emerald-900 flex items-center gap-2 bg-emerald-900/10 px-3.5 py-1.5 rounded border border-emerald-900/20">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Jobs matching skills found in your profile</span>
            </div>
          )}
        </div>

        {/* Search & Filter Matrix */}
        <div className="border border-border bg-white p-5 rounded shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job title, company, or skill…"
                className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded text-[13px] text-foreground placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            {/* Work Mode */}
            <div>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                aria-label="Filter by work mode"
                className="w-full h-11 px-4 bg-surface border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="all">All Work Locations</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-Site</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                aria-label="Filter by employment type"
                className="w-full h-11 px-4 bg-surface border border-border rounded text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="all">All Job Types</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Search Input, Work Mode, and Employment Type remain without the extra quick filters row */}
        </div>

        {/* ── Results Feed ── */}
        {loading ? (
          <div className="border border-border bg-white p-16 text-center rounded">
            <MeritlaneLoader level="section" text="Loading jobs…" />
          </div>
        ) : error ? (
          <div className="border border-danger/20 bg-danger/10 p-8 text-center rounded">
            <p className="text-[14px] text-danger mb-4">{error}</p>
            <button
              onClick={loadJobs}
              className="px-4 py-2 bg-foreground text-white text-[12px] font-mono font-semibold rounded hover:bg-emerald-900 transition-colors"
            >
              RETRY
            </button>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-semibold text-foreground mb-2 tracking-tight">
              {feedMode === "matched" ? "No skill-matched jobs found" : "No matching jobs found"}
            </h2>
            <p className="text-[13px] text-muted-foreground font-sans max-w-md mx-auto mb-6">
              {feedMode === "matched"
                ? candidateSkills.length === 0
                  ? "Your profile has no skills added yet. Add skills to your profile to see matched jobs."
                  : "None of the currently open roles match the skills on your profile. Try viewing all jobs or take more skill tests."
                : "There are currently no job postings matching your selected filters. Try searching for different keywords or resetting filters."}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {feedMode === "matched" ? (
                <>
                  <button
                    onClick={() => setFeedMode("all")}
                    className="px-5 py-2.5 bg-foreground hover:bg-emerald-900 text-white text-[11px] font-medium font-semibold rounded transition-colors tracking-wider uppercase"
                  >
                    View All Jobs
                  </button>
                  <Link href="/candidate/verification">
                    <button className="px-5 py-2.5 border border-border bg-surface hover:bg-white text-foreground text-[11px] font-medium font-semibold rounded transition-colors tracking-wider uppercase">
                      Take Skill Test
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSkill("");
                    setWorkMode("all");
                    setEmploymentType("all");
                  }}
                  className="px-5 py-2.5 bg-foreground hover:bg-emerald-900 text-white text-[11px] font-medium font-semibold rounded transition-colors tracking-wider uppercase"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
              <span>
                {feedMode === "matched" ? "MATCHED JOBS" : "OPEN JOBS"}: {displayedJobs.length}
              </span>
              <span>MERITLANE JOBS</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {displayedJobs.map((job) => {
                const stats = getJobMatchStats(job);
                return (
                  <div
                    key={job.id}
                    className="border border-border bg-white p-6 sm:p-7 rounded hover:border-foreground transition-all shadow-xs group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-medium font-semibold uppercase tracking-[0.14em] text-emerald-900 bg-emerald-900/10 px-2.5 py-0.5 rounded border border-emerald-900/20">
                            {job.workMode.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground bg-surface px-2.5 py-0.5 rounded border border-border">
                            {job.employmentType.replace("-", " ").toUpperCase()}
                          </span>
                          {job.salaryRange && (
                            <span className="text-[11px] font-mono text-foreground font-semibold bg-surface px-2.5 py-0.5 rounded border border-border">
                              {job.salaryRange}
                            </span>
                          )}

                          {/* Skill Match Indicator */}
                          {stats.matchCount > 0 && (
                            <span className="text-[10px] font-medium font-bold uppercase tracking-[0.12em] text-emerald-900 bg-emerald-900/10 px-2.5 py-0.5 rounded border border-emerald-900/25 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{stats.percent}% Match ({stats.matchCount}/{stats.totalRequired} skills)</span>
                            </span>
                          )}
                        </div>

                        <h2 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground group-hover:text-emerald-900 transition-colors">
                          {job.title}
                        </h2>

                        <div className="flex items-center gap-4 text-[13px] text-muted-foreground flex-wrap font-sans">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {job.location}
                          </span>
                        </div>

                        <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                          {job.description}
                        </p>

                        {/* Required Skills with Match Highlights */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          {job.requiredSkills.map((sk) => {
                            const isMatched = candidateSkills.some(
                              (cs) =>
                                cs === sk.trim().toLowerCase() ||
                                cs.includes(sk.trim().toLowerCase()) ||
                                sk.trim().toLowerCase().includes(cs)
                            );
                            return (
                              <span
                                key={sk}
                                className={`text-[10px] font-mono px-2.5 py-0.5 rounded border transition-colors ${
                                  isMatched
                                    ? "bg-emerald-900/10 text-emerald-900 border-emerald-900/30 font-semibold"
                                    : "bg-surface text-muted-foreground border-border"
                                }`}
                              >
                                {isMatched ? "✓ " : ""}{sk}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                        <Link href={`/candidate/jobs/${job.id}`}>
                          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground group-hover:bg-emerald-900 text-white text-[12px] font-medium font-semibold tracking-wider uppercase rounded transition-colors shadow-2xs">
                            <span>REVIEW & APPLY</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
