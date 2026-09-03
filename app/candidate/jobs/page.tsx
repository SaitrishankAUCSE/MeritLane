"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, ArrowRight, ShieldCheck, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Job } from "@/lib/firebase/jobs";
import { COMMON_SKILLS } from "@/lib/constants";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";

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
          user.getIdToken(true),
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
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">
      {/* ── Institutional Registry Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Verified Opportunity Registry · Meritlane Career System
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-[#1C1917] font-semibold tracking-tight leading-tight">
              Engineering Opportunities
            </h1>
            <p className="text-[13px] text-[#78716C] font-sans mt-1 max-w-xl">
              Verified employer openings evaluating technical evidence, proctored code evaluations, and validated skill dossiers.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Active Roles</div>
              <div className="text-[24px] font-semibold text-[#064E3B]">{jobs.length}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Profile Matches</div>
              <div className="text-[24px] font-semibold text-[#064E3B]">{matchedJobsCount}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA] hidden sm:block" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Dispatched</div>
              <div className="text-[24px] font-semibold text-[#1C1917]">{applicationsCount}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA] hidden sm:block" />
            <div className="hidden sm:block">
              <Link href="/candidate/applications">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[#1C1917] text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-2xs">
                  <FileText className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>My Applications</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 space-y-6">
        
        {/* ── Match Switch Segmented Control ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2DA] pb-4">
          <div className="inline-flex p-1 bg-[#F5F1EB] rounded-full border border-[#E7E2DA] self-start">
            <button
              type="button"
              onClick={() => setFeedMode("all")}
              className={`px-5 py-2 rounded-full text-[12px] font-mono font-semibold transition-all ${
                feedMode === "all"
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              All Opportunities ({jobs.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedMode("matched")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-mono font-semibold transition-all ${
                feedMode === "matched"
                  ? "bg-[#064E3B] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Matched to My Skills ({matchedJobsCount})</span>
            </button>
          </div>

          {feedMode === "matched" && (
            <div className="text-[12px] font-mono text-[#064E3B] flex items-center gap-2 bg-[#064E3B]/10 px-3.5 py-1.5 rounded-full border border-[#064E3B]/20">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Ranked by highest capability overlap with your dossier</span>
            </div>
          )}
        </div>

        {/* Search & Filter Matrix */}
        <div className="border border-[#E7E2DA] bg-white p-5 rounded-2xl shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search role title, company, or capability…"
                className="w-full h-11 pl-10 pr-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-full text-[13px] text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>

            {/* Work Mode */}
            <div>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                aria-label="Filter by work mode"
                className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-full text-[13px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              >
                <option value="all">All Work Environments</option>
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
                className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-full text-[13px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              >
                <option value="all">All Role Types</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Quick Skill Filters */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F5F1EB]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] mr-1">
              Top Capabilities:
            </span>
            {COMMON_SKILLS.slice(0, 8).map((skill) => {
              const active = selectedSkill.toLowerCase() === skill.toLowerCase();
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(active ? "" : skill)}
                  className={`text-[11px] font-mono px-3 py-1 rounded-full transition-colors border ${
                    active
                      ? "bg-[#064E3B] text-white border-[#064E3B]"
                      : "bg-[#FAF8F5] text-[#78716C] border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill("")}
                className="text-[11px] font-mono text-[#B42318] underline hover:text-[#7A1810] ml-2"
              >
                Clear Skill Filter
              </button>
            )}
          </div>
        </div>

        {/* ── Results Feed ── */}
        {loading ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center rounded-2xl">
            <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
              Querying verified registry opportunities…
            </div>
          </div>
        ) : error ? (
          <div className="border border-[#B42318]/20 bg-[#FEF2F2] p-8 text-center rounded-2xl">
            <p className="text-[14px] text-[#B42318] mb-4">{error}</p>
            <button
              onClick={loadJobs}
              className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-mono font-semibold rounded-full hover:bg-[#064E3B] transition-colors"
            >
              RETRY QUERY
            </button>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-semibold text-[#1C1917] mb-2 tracking-tight">
              {feedMode === "matched" ? "No skill-matched roles found" : "No matching roles found"}
            </h2>
            <p className="text-[13px] text-[#78716C] font-sans max-w-md mx-auto mb-6">
              {feedMode === "matched"
                ? candidateSkills.length === 0
                  ? "Your profile has no declared or verified skills yet. Add your skills in your profile or pass an assessment to see personalized matches."
                  : "None of the currently active roles match your declared or verified technical capabilities. Try switching to 'All Opportunities' or explore assessments to verify additional skills."
                : "There are currently no active job postings matching your selected filters. Try broadening your search or resetting capability filters."}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {feedMode === "matched" ? (
                <>
                  <button
                    onClick={() => setFeedMode("all")}
                    className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold rounded-full transition-colors tracking-wider uppercase"
                  >
                    View All Opportunities
                  </button>
                  <Link href="/candidate/verification">
                    <button className="px-5 py-2.5 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[#1C1917] text-[11px] font-mono font-semibold rounded-full transition-colors tracking-wider uppercase">
                      Take Skill Assessment
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
                  className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold rounded-full transition-colors tracking-wider uppercase"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C] uppercase tracking-wider px-2">
              <span>
                {feedMode === "matched" ? "MATCHED OPPORTUNITIES" : "ACTIVE OPPORTUNITIES"}: {displayedJobs.length}
              </span>
              <span>VERIFIED HIRING REGISTRY</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {displayedJobs.map((job) => {
                const stats = getJobMatchStats(job);
                return (
                  <div
                    key={job.id}
                    className="border border-[#E7E2DA] bg-white p-6 sm:p-7 rounded-2xl hover:border-[#1C1917] transition-all shadow-xs group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded-full border border-[#064E3B]/20">
                            {job.workMode.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E7E2DA]">
                            {job.employmentType.replace("-", " ").toUpperCase()}
                          </span>
                          {job.salaryRange && (
                            <span className="text-[11px] font-mono text-[#1C1917] font-semibold bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E7E2DA]">
                              {job.salaryRange}
                            </span>
                          )}

                          {/* Skill Match Indicator */}
                          {stats.matchCount > 0 && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded-full border border-[#064E3B]/25 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{stats.percent}% Match ({stats.matchCount}/{stats.totalRequired} skills)</span>
                            </span>
                          )}
                        </div>

                        <h2 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#1C1917] group-hover:text-[#064E3B] transition-colors">
                          {job.title}
                        </h2>

                        <div className="flex items-center gap-4 text-[13px] text-[#78716C] flex-wrap font-sans">
                          <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                            <Building2 className="h-4 w-4 text-[#78716C]" />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#78716C]" />
                            {job.location}
                          </span>
                        </div>

                        <p className="text-[13px] text-[#525252] line-clamp-2 leading-relaxed pt-1">
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
                                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-colors ${
                                  isMatched
                                    ? "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30 font-semibold"
                                    : "bg-[#FAF8F5] text-[#78716C] border-[#E7E2DA]"
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
                          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] group-hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold tracking-wider uppercase rounded-full transition-colors shadow-2xs">
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
