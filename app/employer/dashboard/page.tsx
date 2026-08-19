"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, Briefcase, Trash2, CheckCircle2, Bookmark, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchEmployerProfile, saveEmployerProfile, JobPosting, toggleShortlist } from "@/lib/firebase/employer";
import { canonicalizeSkill } from "@/lib/skills";
import { CandidateProofModal } from "@/components/employer/CandidateProofModal";

export default function EmployerDashboardPage() {
  const { user, role: userRole, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"discover" | "shortlisted" | "post-role">("discover");
  const [dataLoading, setDataLoading] = useState(true);

  const [roles, setRoles] = useState<JobPosting[]>([]);
  const [shortlistedUids, setShortlistedUids] = useState<string[]>([]);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = React.useMemo(() => roles.find(r => r.id === selectedRoleId) || null, [roles, selectedRoleId]);
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Form states
  const [roleTitle, setRoleTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Early Career (0-2 Yrs)");
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole === "employer") {
      fetchEmployerProfile(user.uid)
        .then((profile) => {
          if (profile && profile.roles && profile.roles.length > 0) {
            setRoles(profile.roles);
            setShortlistedUids(profile.shortlistedCandidates || []);
            setActiveTab("discover");
            setSelectedRoleId(profile.roles[0].id); // Select first role by default
          } else {
            setActiveTab("post-role"); // Default to post-role if they have none
          }
        })
        .catch(console.error)
        .finally(() => {
          setDataLoading(false);
        });
    } else if (!authLoading && !profileLoading && userRole !== "employer") {
      setDataLoading(false);
    }
  }, [user, userRole, authLoading, profileLoading]);

  useEffect(() => {
    async function loadCandidates() {
      if (!user) return;
      if (activeTab === "discover" && !selectedRoleId) return;
      
      setFetchingCandidates(true);
      try {
        const token = await user.getIdToken();
        const endpoint = activeTab === "shortlisted" ? "/api/employer/shortlisted" : "/api/employer/discover";
        const bodyPayload = activeTab === "discover" ? { roleId: selectedRoleId } : {};
        
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(bodyPayload)
        });
        
        if (res.ok) {
          const data = await res.json();
          setCandidates(data.candidates || []);
        } else {
          console.error("Failed to load candidates", await res.text());
        }
      } catch (err) {
        console.error("API error", err);
      } finally {
        setFetchingCandidates(false);
      }
    }
    
    if (activeTab === "discover" || activeTab === "shortlisted") {
      loadCandidates();
    }
  }, [selectedRoleId, user, activeTab]);

  if (authLoading || (user && profileLoading) || dataLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center flex-col space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#1a56db]"></div>
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  const handlePostRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim() || !user) return;

    setSaving(true);
    
    // Clean and deduplicate skills using canonical forms
    const cleanedSkills: string[] = [];
    const seenCanonical = new Set<string>();
    
    for (const raw of skillsNeeded) {
      if (!raw.trim()) continue;
      const canonical = canonicalizeSkill(raw);
      if (!seenCanonical.has(canonical)) {
        seenCanonical.add(canonical);
        cleanedSkills.push(raw.trim()); // preserve display case
      }
    }

    const newRole: JobPosting = {
      id: `role-${Date.now()}`,
      title: roleTitle.trim(),
      department: department?.trim() || "Engineering",
      skills: cleanedSkills,
      experienceLevel,
      status: "active",
    };

    const updatedRoles = [newRole, ...roles];

    try {
      await saveEmployerProfile(user.uid, { roles: updatedRoles });
      setRoles(updatedRoles);
      setSelectedRoleId(newRole.id);
      
      setRoleTitle("");
      setDepartment("");
      setSkillsNeeded([]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setActiveTab("discover");
      }, 1200);
    } catch (err) {
      console.error("Failed to save role:", err);
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updatedRoles = roles.filter(r => r.id !== id);
    try {
      await saveEmployerProfile(user.uid, { roles: updatedRoles });
      setRoles(updatedRoles);
      if (selectedRoleId === id) {
        setSelectedRoleId(updatedRoles[0]?.id || null);
      }
      if (updatedRoles.length === 0) {
        setActiveTab("post-role");
      }
    } catch (err) {
      console.error("Failed to remove role:", err);
    }
  };

  const handleShortlist = async (candidateUid: string) => {
    if (!user) return;
    try {
      const updated = await toggleShortlist(user.uid, candidateUid, shortlistedUids);
      const isNowRemoved = shortlistedUids.includes(candidateUid) && !updated.includes(candidateUid);
      setShortlistedUids(updated);
      
      if (activeTab === "shortlisted") {
        setCandidates(prev => prev.filter(c => c.uid !== candidateUid));
        if (isNowRemoved) {
          setSuccessToast("Candidate removed from shortlist");
        }
      } else {
        if (isNowRemoved) {
          setSuccessToast("Candidate removed from shortlist");
        } else {
          setSuccessToast("Candidate shortlisted");
        }
      }
    } catch (err) {
      console.error("Failed to toggle shortlist", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-10">
      <CandidateProofModal 
        isOpen={!!selectedCandidate} 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Discover Verified Talent
              </h1>
              <Badge variant="verified">Sponsor</Badge>
            </div>
            <p className="mt-1.5 text-sm text-slate-600">
              Post roles and access verified candidate portfolios through signal-based pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "post-role" && roles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => setActiveTab("discover")}
              >
                Back to Dashboard
              </Button>
            )}
            <Button 
              variant={activeTab === "post-role" ? "primary" : "outline"} 
              size="sm" 
              leftIcon={<Plus className="h-4 w-4" />} 
              onClick={() => setActiveTab("post-role")}
            >
              Post Role
            </Button>
          </div>
        </div>

        {/* Talent Workspace Navigation */}
        {roles.length > 0 && activeTab !== "post-role" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("discover")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "discover"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Discover</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shortlisted")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "shortlisted"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${activeTab === "shortlisted" ? "fill-current" : ""}`} />
                <span>Shortlisted</span>
                {shortlistedUids.length > 0 && (
                  <span
                    className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                      activeTab === "shortlisted"
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {shortlistedUids.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "discover" && selectedRole && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>Active Role:</span>
                <span className="font-semibold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                  {selectedRole.title}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Discover View (Role-Centric) */}
        {activeTab === "discover" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-up">
            {/* Left Sidebar: Roles List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">
                Active Roles ({roles.length})
              </h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRoleId(role.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedRoleId(role.id);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                      selectedRoleId === role.id 
                        ? "bg-white border-[#1a56db] shadow-sm ring-1 ring-[#1a56db]/10" 
                        : "bg-transparent border-slate-200 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900 truncate pr-2">{role.title}</span>
                      <div 
                        onClick={(e) => removeRole(role.id, e)}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        title="Delete Role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2 truncate">{role.department}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600 uppercase">
                          {skill}
                        </span>
                      ))}
                      {role.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                          +{role.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Area: Discovery Candidates */}
            <div className="lg:col-span-3 space-y-6">
              {fetchingCandidates ? (
                <div className="space-y-4 animate-fade-up">
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <ShieldCheck className="h-6 w-6 text-indigo-500/60" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900">Finding verified talent for this role…</p>
                      <p className="text-xs text-slate-500 mt-1">Reviewing verified skills and project evidence.</p>
                    </div>
                  </div>
                  
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-40 rounded bg-slate-200 animate-shimmer"></div>
                            <div className="h-5 w-20 rounded-full bg-slate-200 animate-shimmer"></div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-4 w-28 rounded bg-slate-200 animate-shimmer"></div>
                            <div className="h-4 w-16 rounded bg-slate-200 animate-shimmer"></div>
                            <div className="h-4 w-20 rounded bg-slate-200 animate-shimmer"></div>
                          </div>
                          <div className="space-y-2 pt-2">
                            <div className="h-3 w-24 rounded bg-slate-200 animate-shimmer"></div>
                            <div className="flex gap-2">
                              <div className="h-6 w-16 rounded-md bg-slate-200 animate-shimmer"></div>
                              <div className="h-6 w-20 rounded-md bg-slate-200 animate-shimmer"></div>
                              <div className="h-6 w-14 rounded-md bg-slate-200 animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                        <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-slate-100 sm:pl-6">
                          <div className="rounded-lg p-3 space-y-3 border border-slate-100">
                            <div className="flex justify-between">
                              <div className="h-3 w-32 rounded bg-slate-200 animate-shimmer"></div>
                              <div className="h-4 w-8 rounded bg-slate-200 animate-shimmer"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-full rounded bg-slate-200 animate-shimmer"></div>
                              <div className="h-3 w-5/6 rounded bg-slate-200 animate-shimmer"></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 pt-2">
                            <div className="h-8 w-full rounded-md bg-slate-200 animate-shimmer"></div>
                            <div className="h-8 w-full rounded-md bg-slate-200 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidates.length > 0 ? (
                <div className="animate-fade-up space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Matches for "{selectedRole?.title}"
                    </h3>
                    <span className="text-sm font-medium text-slate-500">{candidates.length} verified candidate(s)</span>
                  </div>
                  
                  <div className="space-y-4">
                    {candidates.map((candidate) => {
                      const isShortlisted = shortlistedUids.includes(candidate.uid);
                      return (
                        <div key={candidate.uid} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            
                            {/* Candidate Summary */}
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-bold text-slate-900">{candidate.name}</h4>
                                <Badge variant="verified" className="flex items-center gap-1 text-xs">
                                  <ShieldCheck className="h-3 w-3" /> Verified
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-600">
                                <span>{candidate.college || "N/A"}</span>
                                <span>•</span>
                                <span>{candidate.branch || "N/A"}</span>
                                <span>•</span>
                                <span>Class of {candidate.gradYear || "N/A"}</span>
                              </div>

                              <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Relevant Skills</span>
                                <div className="flex flex-wrap gap-2">
                                  {(candidate.matchedSkills || []).map((skill: string) => (
                                    <span key={skill} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                  {(!candidate.matchedSkills || candidate.matchedSkills.length === 0) && (
                                    <span className="text-xs text-slate-500 italic">No exact skill matches</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Evidence & Action Sidebar */}
                            <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-slate-100 sm:pl-6">
                              <div className="bg-emerald-50/50 rounded-lg p-3 space-y-2 border border-emerald-100/50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Why this candidate matches</span>
                                  {candidate.totalRequiredSkillCount > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/50 px-1.5 py-0.5 rounded w-fit">
                                      {candidate.matchedRequiredSkillCount} of {candidate.totalRequiredSkillCount} required skills
                                    </span>
                                  )}
                                </div>
                                <ul className="space-y-1.5">
                                  {candidate.matchReasons.map((reason: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-xs text-emerald-700 leading-tight">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setSelectedCandidate(candidate)}
                                >
                                  View Proof
                                </Button>
                                <Button 
                                  variant={isShortlisted ? "secondary" : "outline"} 
                                  size="sm" 
                                  className={`w-full ${isShortlisted ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-200' : ''}`}
                                  leftIcon={<Bookmark className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />}
                                  onClick={() => handleShortlist(candidate.uid)}
                                >
                                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                                </Button>
                              </div>
                            </div>
                            
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<ShieldCheck className="h-6 w-6 text-slate-700" />}
                  title="No verified candidates match this role yet."
                  description="Candidates will appear here automatically as they complete Meritlane verification and match your required skills."
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Shortlisted View (Candidate-Centric Workspace — NO Active Roles sidebar) */}
        {activeTab === "shortlisted" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-2">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Shortlisted Candidates
                  </h3>
                  {!fetchingCandidates && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                      {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Candidates you've saved for consideration across all roles.
                </p>
              </div>
            </div>

            {fetchingCandidates ? (
              <div className="space-y-4 animate-fade-up">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-40 rounded bg-slate-200 animate-shimmer"></div>
                          <div className="h-5 w-20 rounded-full bg-slate-200 animate-shimmer"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-28 rounded bg-slate-200 animate-shimmer"></div>
                          <div className="h-4 w-16 rounded bg-slate-200 animate-shimmer"></div>
                          <div className="h-4 w-20 rounded bg-slate-200 animate-shimmer"></div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="h-3 w-24 rounded bg-slate-200 animate-shimmer"></div>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 rounded-md bg-slate-200 animate-shimmer"></div>
                            <div className="h-6 w-20 rounded-md bg-slate-200 animate-shimmer"></div>
                            <div className="h-6 w-14 rounded-md bg-slate-200 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-slate-100 sm:pl-6">
                        <div className="rounded-lg p-3 space-y-3 border border-slate-100">
                          <div className="flex justify-between">
                            <div className="h-3 w-32 rounded bg-slate-200 animate-shimmer"></div>
                            <div className="h-4 w-8 rounded bg-slate-200 animate-shimmer"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-slate-200 animate-shimmer"></div>
                            <div className="h-3 w-5/6 rounded bg-slate-200 animate-shimmer"></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="h-8 w-full rounded-md bg-slate-200 animate-shimmer"></div>
                          <div className="h-8 w-full rounded-md bg-slate-200 animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : candidates.length > 0 ? (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.uid} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      
                      {/* Candidate Summary */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-slate-900">{candidate.name}</h4>
                          <Badge variant="verified" className="flex items-center gap-1 text-xs">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-600">
                          <span>{candidate.college || "N/A"}</span>
                          <span>•</span>
                          <span>{candidate.branch || "N/A"}</span>
                          <span>•</span>
                          <span>Class of {candidate.gradYear || "N/A"}</span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                            Verified Skills
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(candidate.skills || candidate.matchedSkills || []).map((skill: string) => (
                              <span key={skill} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                            {(!candidate.skills || candidate.skills.length === 0) && (
                              <span className="text-xs text-slate-500 italic">No skills listed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Evidence & Action Sidebar */}
                      <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-slate-100 sm:pl-6">
                        <div className="bg-slate-50/80 rounded-lg p-3 space-y-2 border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                            Verified Evidence & Signals
                          </span>
                          <ul className="space-y-1.5">
                            {(candidate.matchReasons && candidate.matchReasons.length > 0 
                              ? candidate.matchReasons 
                              : ["Verified talent profile evidence"]
                            ).map((reason: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 leading-tight">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            View Proof
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleShortlist(candidate.uid)}
                          >
                            Remove from Shortlist
                          </Button>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Bookmark className="h-6 w-6 text-slate-700" />}
                title="No candidates shortlisted yet"
                description="Candidates you save from the verified talent pipeline will appear here."
                action={
                  <Button variant="primary" onClick={() => setActiveTab("discover")}>
                    Discover Verified Talent
                  </Button>
                }
              />
            )}
          </div>
        )}

        {/* Tab 3: Post Role View */}
        {activeTab === "post-role" && (
          <div className="animate-fade-up">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <h2 className="text-lg font-bold text-slate-900">Define a new role</h2>
                <p className="text-sm text-slate-600 mt-1">Specify technical requirements to instantly discover verified candidates.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostRole} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="roleTitle" className="block text-sm font-semibold text-slate-900">
                        Role Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="roleTitle"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="department" className="block text-sm font-semibold text-slate-900">
                        Department
                      </label>
                      <Input
                        id="department"
                        placeholder="e.g. Engineering, Platform"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-900">
                      Experience Level
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Early Career (0-2 Yrs)", "Mid-Level (3-5 Yrs)", "Senior (5+ Yrs)"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setExperienceLevel(level)}
                          disabled={saving}
                          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                            experienceLevel === level
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-900">
                      Required Skills
                    </label>
                    <p className="text-xs text-slate-500 mb-2">We use these skills to instantly match you with verified candidates.</p>
                    <TagInput
                      tags={skillsNeeded}
                      onChange={setSkillsNeeded}
                      placeholder="Type a skill and press Enter..."
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {formSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Role posted successfully!</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-slate-400" /> Matches against verified proof instantly.
                      </p>
                    )}
                    
                    <Button type="submit" variant="primary" disabled={!roleTitle.trim() || saving}>
                      {saving ? "Posting..." : "Post Role & Discover"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
