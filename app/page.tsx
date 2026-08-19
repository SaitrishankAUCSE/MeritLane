"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Building, Users, CheckCircle, Briefcase, ExternalLink, GraduationCap, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

  return (
    <div className="flex flex-col">
      <MeritlaneIntro />
      
      {/* HERO: Editorial Statement */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 tracking-tight leading-[1.05]">
            Proof of skill.<br/>
            <span className="text-zinc-400">Not just credentials.</span>
          </h1>
          <p className="mt-8 text-lg text-zinc-600 max-w-xl leading-relaxed">
            Meritlane is a technical talent verification institution. We audit code, validate engineering capabilities, and establish immutable proof of skill—so you can hire based on evidence, not pedigree.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/employer/dashboard">
              <Button size="lg" className="bg-zinc-900 text-white rounded-none px-8 py-6 text-base tracking-wide">
                Start Hiring Verified Talent
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="rounded-none border-zinc-300 px-8 py-6 text-base tracking-wide hover:bg-zinc-50">
                Get Verified as an Engineer
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Artifact (Illustrative) */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="absolute inset-0 bg-zinc-900/5 blur-3xl -z-10 rounded-full" />
          <div className="bg-white border border-zinc-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1">Official Record</div>
                <div className="text-xl font-bold text-zinc-900">Verified Technical Profile</div>
              </div>
              <Badge variant="verified">Verified</Badge>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Audited Stack</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-sm font-medium">React</span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-sm font-medium">TypeScript</span>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-sm font-medium">Go</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Signal Validation</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Technical Assessment Completed</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Project Architecture Verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>GitHub Activity Authenticated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THESIS SECTION */}
      <section className="border-t border-zinc-200 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-tight mb-8">
            Traditional hiring asks where you studied.
            <br />
            Meritlane asks what you can prove.
          </h2>
          <div className="w-16 h-1 bg-zinc-900 mx-auto"></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-zinc-200 py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            <div className="border-l border-zinc-200 pl-8 relative">
              <div className="text-5xl font-bold text-zinc-200 absolute -top-4 -left-6 bg-white px-2">01</div>
              <h3 className="text-xl font-bold text-zinc-900 mt-6 mb-4">Build your proof</h3>
              <p className="text-zinc-600 leading-relaxed">
                Connect your GitHub repositories, detail your architecture decisions, and document your technical contributions. Your work is the foundation.
              </p>
            </div>
            
            <div className="border-l border-zinc-200 pl-8 relative">
              <div className="text-5xl font-bold text-zinc-200 absolute -top-4 -left-6 bg-white px-2">02</div>
              <h3 className="text-xl font-bold text-zinc-900 mt-6 mb-4">Get verified</h3>
              <p className="text-zinc-600 leading-relaxed">
                Undergo rigorous technical assessments and code audits. We validate your claims, establishing an irrefutable baseline of your true capabilities.
              </p>
            </div>

            <div className="border-l border-zinc-200 pl-8 relative">
              <div className="text-5xl font-bold text-zinc-200 absolute -top-4 -left-6 bg-white px-2">03</div>
              <h3 className="text-xl font-bold text-zinc-900 mt-6 mb-4">Get discovered</h3>
              <p className="text-zinc-600 leading-relaxed">
                Share your verified public record or join the private talent pool where top employers actively seek out validated engineering excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EVIDENCE SECTION */}
      <section className="border-t border-zinc-200 py-24 sm:py-32 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-16 border-b border-zinc-200 pb-4">
            The Three Pillars of Proof
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-zinc-900 mb-6">Skills</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                We move beyond keyword matching. Demonstrated competencies are extracted from your repository history, issue resolutions, and specific code contributions, verifying you actually know what you list.
              </p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-zinc-900 mb-6">Assessments</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                Targeted technical challenges designed not for algorithmic hazing, but to confirm practical architectural reasoning, debugging capabilities, and systems-level problem solving.
              </p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-zinc-900 mb-6">Projects</h3>
              <p className="text-zinc-600 leading-relaxed flex-1">
                A repository is just code; we verify the context. We audit the live deployment, review the source control history, and validate the complexity of your independent architectural decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL CTA SECTION */}
      <section className="border-t border-zinc-200">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          
          {/* Employer */}
          <div className="p-16 lg:p-24 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">
                Stop screening resumes.<br/>Start reviewing proof.
              </h2>
              <p className="text-zinc-600 mb-10 text-lg leading-relaxed">
                Instantly discover candidates whose skills are already audited and verified. Reduce hiring risk and engineering interview hours by trusting the Meritlane standard.
              </p>
              <Link href="/employer/dashboard">
                <Button size="lg" className="bg-zinc-900 text-white rounded-none px-8 py-6 w-fit">
                  Post a Job <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Engineer */}
          <div className="p-16 lg:p-24 bg-zinc-50 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">
                Make your work easier to trust.
              </h2>
              <p className="text-zinc-600 mb-10 text-lg leading-relaxed">
                Stand out in a crowded market by providing irrefutable evidence of your capabilities. Share your official verification record with anyone.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-zinc-300 rounded-none px-8 py-6 w-fit bg-white hover:bg-zinc-50">
                  Begin Verification <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SEARCH & DIRECTORY */}
      <section className="border-t border-zinc-200 py-24 bg-white min-h-[600px]">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-6 tracking-tight">Explore verified talent</h2>
            
            <div className="flex flex-col md:flex-row gap-0 border border-zinc-300 bg-white">
              <div className="flex-1 flex items-center px-4 py-3">
                <Search className="h-5 w-5 text-zinc-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Job title, skills, or college name" 
                  className="w-full focus:outline-none text-zinc-900 placeholder:text-zinc-400 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button 
                size="lg" 
                className="w-full md:w-auto px-8 py-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none border-l border-zinc-900"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              {searchQuery ? `Search Results (${displayedCandidates.length})` : "Recently Verified Records"}
            </h3>
          </div>
          
          {loading ? (
            <div className="py-20 text-zinc-500 font-medium flex items-center gap-3">
              <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin"></div>
              Retrieving public records...
            </div>
          ) : displayedCandidates.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50 p-12 text-left">
              <h3 className="text-base font-semibold text-zinc-900">No verified records match your query</h3>
              <p className="mt-2 text-sm text-zinc-600">Try broadening your search terms or filtering by a different skill.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {displayedCandidates.map((c) => (
                <div key={c.id} className="border-b border-zinc-200 pb-8 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 border border-zinc-200 shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-zinc-900">{c.name || "Anonymous Candidate"}</h4>
                          <Badge variant="verified" size="sm">Verified</Badge>
                        </div>
                        <div className="text-sm text-zinc-600 mb-4">
                          {c.branch} • Class of {c.gradYear}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {c.skills?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-zinc-100 text-zinc-800 text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                          {c.skills?.length > 5 && (
                            <span className="text-xs text-zinc-500 px-2 py-1">+{c.skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <Link href={`/p/${c.uid || c.id}`}>
                        <Button variant="outline" size="sm" className="rounded-none border-zinc-300" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                          View Public Record
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
