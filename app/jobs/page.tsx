"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, ArrowRight, Filter, Clock, Sparkles } from "lucide-react";
import { Job } from "@/lib/firebase/jobs";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { COMMON_SKILLS } from "@/lib/constants";

export default function JobsDirectoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [employmentType, setEmploymentType] = useState("all");

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

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1.5">
            Verified Opportunities · Meritlane Talent Registry
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-bold uppercase tracking-[0.06em] text-[#1C1917] leading-tight">
            ENGINEERING ROLES
          </h1>
          <p className="text-[14px] text-[#78716C] font-sans mt-2 max-w-2xl leading-relaxed">
            Direct opportunities from verified employers evaluating engineering proof, monitored code assessments, and practical technical dossiers.
          </p>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {/* Search & Filters Ledger */}
        <div className="border border-[#E7E2DA] bg-white p-5 rounded-2xl shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search role, skills, company, or keyword…"
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

          {/* Quick Skill Filter Pills */}
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
        ) : jobs.length === 0 ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center rounded-2xl">
            <Briefcase className="h-10 w-10 text-[#C8BFB0] mx-auto mb-4" />
            <h2 className="text-[18px] font-bold uppercase tracking-[0.06em] text-[#1C1917] mb-2">
              NO MATCHING ROLES FOUND
            </h2>
            <p className="text-[13px] text-[#78716C] font-sans max-w-md mx-auto mb-6">
              There are currently no active job postings matching your selected filters. Try broadening your keyword search or clearing capability filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSkill("");
                setWorkMode("all");
                setEmploymentType("all");
              }}
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold rounded-full transition-colors tracking-wider"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C] uppercase tracking-wider px-2">
              <span>ACTIVE OPPORTUNITIES: {jobs.length}</span>
              <span>PROOF-BASED HIRING</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
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
                          <span className="text-[11px] font-mono text-[#1C1917] font-semibold">
                            {job.salaryRange}
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

                      {/* Required Skills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {job.requiredSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-mono bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA] px-2.5 py-0.5 rounded-full"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                      <Link href={`/jobs/${job.id}`}>
                        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] group-hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold tracking-wider uppercase rounded-full transition-colors shadow-2xs">
                          <span>REVIEW & APPLY</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
