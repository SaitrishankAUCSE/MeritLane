"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Building, Users, CheckCircle, ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  return (
    <div className="flex flex-col bg-white">
      {/* HERO: Functional Search-First */}
      <section className="bg-[#1a56db] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Find Verified Engineering Talent</h1>
          
          <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-md shadow-sm">
            <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-slate-200 px-3 py-2">
              <Search className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, skills, or college name" 
                className="w-full focus:outline-none text-slate-900 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="City, state, or remote" 
                className="w-full focus:outline-none text-slate-900 placeholder:text-slate-500"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="w-full md:w-auto px-8 py-3 bg-[#0d3b9e] hover:bg-[#0a2f7e] text-white rounded-md">
              Search Candidates
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="font-semibold text-white">Popular:</span>
            <span className="cursor-pointer hover:underline">Full Stack Developer</span>
            <span className="cursor-pointer hover:underline">React.js</span>
            <span className="cursor-pointer hover:underline">Backend Engineer</span>
            <span className="cursor-pointer hover:underline">Go</span>
          </div>
        </div>
      </section>

      {/* TRUST BAR: Pure Statistics */}
      <section className="border-b border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-8 px-4 text-center sm:justify-between sm:gap-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">4,285</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Registered Candidates</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">1,942</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Verified Profiles</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[#1a56db]" />
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">318</div>
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Active Employers</div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTORY: Main Content */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recently Verified Candidates</h2>
            <Link href="#" className="text-sm font-semibold text-[#1a56db] hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} interactive>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                        C{i}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                          Candidate #{8492 + i}
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        </h3>
                        <p className="text-sm text-slate-600">Full Stack Engineer (2 YOE)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-slate-400" /> Available Immediately</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /> Remote / Bangalore</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">React</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Node.js</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">PostgreSQL</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
