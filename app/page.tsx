"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Building, Users, CheckCircle, Briefcase, ExternalLink, GraduationCap, Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPlatformStats, getVerifiedCandidates } from "@/lib/firebase/home";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { MeritlaneIntro } from "@/components/landing/MeritlaneIntro";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ registeredCandidates: 0, activeEmployers: 0, verifiedProfiles: 0 });
  const [candidates, setCandidates] = useState<(CandidateProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedCandidates, setDisplayedCandidates] = useState<(CandidateProfile & { id: string })[]>([]);

  useEffect(() => {
    async function loadData() {
      const [fetchedStats, fetchedCandidates] = await Promise.all([
        getPlatformStats(),
        getVerifiedCandidates()
      ]);
      setStats(fetchedStats);
      setCandidates(fetchedCandidates);
      setDisplayedCandidates(fetchedCandidates);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDisplayedCandidates(candidates);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = candidates.filter(c => {
      const hasSkill = c.skills?.some(skill => skill.toLowerCase().includes(query));
      const hasTitle = c.branch?.toLowerCase().includes(query) || c.college?.toLowerCase().includes(query);
      return hasSkill || hasTitle;
    });
    
    setDisplayedCandidates(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const setFilterAndSearch = (filter: string) => {
    setSearchQuery(filter);
    const query = filter.toLowerCase().trim();
    const filtered = candidates.filter(c => {
      const hasSkill = c.skills?.some(skill => skill.toLowerCase().includes(query));
      const hasTitle = c.branch?.toLowerCase().includes(query) || c.college?.toLowerCase().includes(query);
      return hasSkill || hasTitle;
    });
    setDisplayedCandidates(filtered);
  };

  return (
    <div className="flex flex-col bg-white">
      <MeritlaneIntro />
      {/* HERO: Functional Search-First */}
      <section className="bg-[#1a56db] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Find Verified Engineering Talent</h1>
          
          <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-md shadow-sm">
            <div className="flex-1 flex items-center px-3 py-2">
              <Search className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, skills, or college name" 
                className="w-full focus:outline-none text-slate-900 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button 
              size="lg" 
              className="w-full md:w-auto px-8 py-3 bg-[#0d3b9e] hover:bg-[#0a2f7e] text-white rounded-md"
              onClick={handleSearch}
            >
              Search Candidates
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="font-semibold text-white">Popular:</span>
            <span className="cursor-pointer hover:underline" onClick={() => setFilterAndSearch("Full Stack Developer")}>Full Stack Developer</span>
            <span className="cursor-pointer hover:underline" onClick={() => setFilterAndSearch("React")}>React</span>
            <span className="cursor-pointer hover:underline" onClick={() => setFilterAndSearch("Backend Engineer")}>Backend Engineer</span>
            <span className="cursor-pointer hover:underline" onClick={() => setFilterAndSearch("Go")}>Go</span>
          </div>
        </div>
      </section>

      {/* TRUST BAR: Pure Statistics */}
      <section className="border-b border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-8 px-4 text-center sm:justify-between sm:gap-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">{loading ? "..." : stats.registeredCandidates}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Registered Candidates</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">{loading ? "..." : stats.verifiedProfiles}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Verified Profiles</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[#1a56db]" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">{loading ? "..." : stats.activeEmployers}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Active Employers</div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTORY: Main Content */}
      <section className="py-12 bg-white min-h-[400px]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {searchQuery ? `Search Results (${displayedCandidates.length})` : "Recently Verified Candidates"}
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              Loading candidates...
            </div>
          ) : displayedCandidates.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h3 className="text-sm font-semibold text-slate-900">No verified candidates match this search yet</h3>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedCandidates.map((c) => (
                <Card key={c.id} interactive className="hover:border-slate-300">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                            {c.name || "Anonymous Candidate"}
                            <Badge variant="verified" size="sm">Verified</Badge>
                          </h3>
                          <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                            {c.branch} • Class of {c.gradYear}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        {c.githubUrl && (
                          <a href={c.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" leftIcon={<Code2 className="h-3.5 w-3.5" />}>GitHub Profile</Button>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {c.skills?.length > 0 ? c.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                            {skill}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-400">No skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    {c.projects && c.projects.length > 0 && (
                      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Projects</div>
                        <div className="flex flex-col gap-2">
                          {c.projects.map((proj) => (
                            <div key={proj.id} className="text-sm border border-slate-100 rounded p-2.5 bg-slate-50">
                              <div className="font-semibold text-slate-900 flex justify-between">
                                {proj.title}
                                <div className="flex gap-3">
                                  {proj.repoUrl && (
                                    <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[#1a56db] hover:underline flex items-center gap-1 text-xs">
                                      <Code2 className="h-3.5 w-3.5" /> Source
                                    </a>
                                  )}
                                  {proj.liveUrl && (
                                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[#1a56db] hover:underline flex items-center gap-1 text-xs">
                                      <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="text-slate-600 text-xs mt-1 line-clamp-2">{proj.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Are you an employer?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Meritlane verifies technical skills through rigorous assessments and GitHub audits. Stop filtering by college, start filtering by proof.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/employer/dashboard">
              <Button size="md" className="bg-[#1a56db] text-white">Post a Job (Free)</Button>
            </Link>
            <Link href="/signup">
              <Button size="md" variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
