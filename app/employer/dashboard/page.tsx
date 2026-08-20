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
import { ProofSignal } from "@/components/ui/ProofSignal";
import { ProofCoverage } from "@/components/proof/ProofThread";

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-zinc-900"></div>
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
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
    <div className="min-h-[calc(100vh-64px)] pb-24 pt-12">
      <CandidateProofModal 
        isOpen={!!selectedCandidate} 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Discover Verified Talent
              </h1>
              <Badge variant="verified">Sponsor</Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border mb-6 mt-2">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("discover")}
                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === "discover"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border"
                }`}
              >
                Discover
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shortlisted")}
                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === "shortlisted"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border"
                }`}
              >
                Shortlisted
                {shortlistedUids.length > 0 && (
                  <span
                    className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                      activeTab === "shortlisted"
                        ? "bg-surface-low text-foreground"
                        : "bg-surface-low text-muted-foreground"
                    }`}
                  >
                    {shortlistedUids.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "discover" && selectedRole && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground pb-3">
                <span>Active Role:</span>
                <span className="font-semibold text-foreground">
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
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider px-1">
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
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 ${
                      selectedRoleId === role.id 
                        ? "bg-surface border-foreground shadow-sm ring-1 ring-foreground/10" 
                        : "bg-transparent border-border hover:bg-surface-low"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-foreground truncate pr-2">{role.title}</span>
                      <div 
                        onClick={(e) => removeRole(role.id, e)}
                        className="text-outline hover:text-red-500 transition-colors shrink-0"
                        title="Delete Role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2 truncate">{role.department}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-surface-low rounded text-[10px] font-medium text-muted-foreground uppercase">
                          {skill}
                        </span>
                      ))}
                      {role.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-surface-low rounded text-[10px] font-medium text-muted-foreground">
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
                    <ShieldCheck className="h-6 w-6 text-muted-foreground/60" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Finding verified talent for this role…</p>
                      <p className="text-xs text-muted-foreground mt-1">Reviewing verified skills and project evidence.</p>
                    </div>
                  </div>
                  
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-40 rounded bg-surface-high animate-shimmer"></div>
                            <div className="h-5 w-20 rounded-full bg-surface-high animate-shimmer"></div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-4 w-28 rounded bg-surface-high animate-shimmer"></div>
                            <div className="h-4 w-16 rounded bg-surface-high animate-shimmer"></div>
                            <div className="h-4 w-20 rounded bg-surface-high animate-shimmer"></div>
                          </div>
                          <div className="space-y-2 pt-2">
                            <div className="h-3 w-24 rounded bg-surface-high animate-shimmer"></div>
                            <div className="flex gap-2">
                              <div className="h-6 w-16 rounded-md bg-surface-high animate-shimmer"></div>
                              <div className="h-6 w-20 rounded-md bg-surface-high animate-shimmer"></div>
                              <div className="h-6 w-14 rounded-md bg-surface-high animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                        <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-border sm:pl-6">
                          <div className="rounded-lg p-3 space-y-3 border border-border">
                            <div className="flex justify-between">
                              <div className="h-3 w-32 rounded bg-surface-high animate-shimmer"></div>
                              <div className="h-4 w-8 rounded bg-surface-high animate-shimmer"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-full rounded bg-surface-high animate-shimmer"></div>
                              <div className="h-3 w-5/6 rounded bg-surface-high animate-shimmer"></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 pt-2">
                            <div className="h-8 w-full rounded-md bg-surface-high animate-shimmer"></div>
                            <div className="h-8 w-full rounded-md bg-surface-high animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidates.length > 0 ? (
                <div className="animate-fade-up space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-base font-bold text-foreground">
                      Matches for "{selectedRole?.title}"
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">{candidates.length} verified candidate(s)</span>
                  </div>
                  
                  <div className="space-y-4">
                    {candidates.map((candidate) => {
                      const isShortlisted = shortlistedUids.includes(candidate.uid);
                      return (
                        <div key={candidate.uid} className="bg-surface border border-border p-6 hover:border-border transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            
                            {/* Candidate Identity */}
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl font-black tracking-tight text-foreground">{candidate.name}</h4>
                                <ProofSignal type="verified" label="Verified" className="bg-success/10 px-2 py-0.5" />
                              </div>
                              
                              <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <span>{candidate.college || "N/A"}</span>
                                <span>•</span>
                                <span>{candidate.branch || "N/A"}</span>
                                <span>•</span>
                                <span>Class of {candidate.gradYear || "N/A"}</span>
                              </div>

                              {/* Proof Signals (Instead of just skills) */}
                              <div className="pt-2 space-y-2">
                                <span className="text-[10px] font-bold text-outline uppercase tracking-widest border-b border-border pb-1 flex w-full">Verified Stack</span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {(candidate.matchedSkills || []).map((skill: string) => (
                                    <div key={skill} className="bg-surface-low border border-border px-2.5 py-1 flex items-center gap-2 rounded-sm">
                                      <span className="text-xs font-bold text-foreground">{skill}</span>
                                      <div className="w-px h-3 bg-zinc-300"></div>
                                      <ProofSignal type="assessed" label="Verified" />
                                    </div>
                                  ))}
                                  {(!candidate.matchedSkills || candidate.matchedSkills.length === 0) && (
                                    <span className="text-xs text-muted-foreground italic">No exact skill matches</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Evidence & Action Sidebar */}
                            <div className="sm:w-64 shrink-0 flex flex-col space-y-5 border-l-2 border-border sm:pl-6">
                              <div>
                                <div className="flex items-end gap-2 mb-3">
                                  <span className="text-2xl font-black text-foreground leading-none">{candidate.matchedRequiredSkillCount || 0}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-0.5">/ {candidate.totalRequiredSkillCount || 0} Required Skills</span>
                                </div>
                                <div className="mb-4 w-full">
                                  <ProofCoverage 
                                    points={candidate.totalRequiredSkillCount || 1} 
                                    filled={candidate.matchedRequiredSkillCount || 0} 
                                  />
                                </div>
                                <ul className="space-y-1.5 relative pl-2 border-l border-border ml-1">
                                  {candidate.matchReasons.slice(0, 3).map((reason: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-muted-foreground leading-tight">
                                      <div className="absolute -left-[3px] mt-1 h-1 w-1 rounded-full bg-zinc-400" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  className="w-full bg-foreground hover:opacity-90"
                                  onClick={() => setSelectedCandidate(candidate)}
                                >
                                  Review Dossier
                                </Button>
                                <Button 
                                  variant={isShortlisted ? "secondary" : "outline"} 
                                  size="sm" 
                                  className="w-full"
                                  leftIcon={<Bookmark className={`h-3.5 w-3.5 ${isShortlisted ? 'fill-zinc-900' : ''}`} />}
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
                  icon={<ShieldCheck className="h-6 w-6 text-muted-foreground" />}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Shortlisted Candidates
                  </h3>
                  {!fetchingCandidates && (
                    <span className="text-xs font-bold text-muted-foreground bg-surface-high px-2.5 py-0.5 rounded-full">
                      {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidates you've saved for consideration across all roles.
                </p>
              </div>
            </div>

            {fetchingCandidates ? (
              <div className="space-y-4 animate-fade-up">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-40 rounded bg-surface-high animate-shimmer"></div>
                          <div className="h-5 w-20 rounded-full bg-surface-high animate-shimmer"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-28 rounded bg-surface-high animate-shimmer"></div>
                          <div className="h-4 w-16 rounded bg-surface-high animate-shimmer"></div>
                          <div className="h-4 w-20 rounded bg-surface-high animate-shimmer"></div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <div className="h-3 w-24 rounded bg-surface-high animate-shimmer"></div>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 rounded-md bg-surface-high animate-shimmer"></div>
                            <div className="h-6 w-20 rounded-md bg-surface-high animate-shimmer"></div>
                            <div className="h-6 w-14 rounded-md bg-surface-high animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sm:w-64 shrink-0 flex flex-col space-y-4 border-l border-border sm:pl-6">
                        <div className="rounded-lg p-3 space-y-3 border border-border">
                          <div className="flex justify-between">
                            <div className="h-3 w-32 rounded bg-surface-high animate-shimmer"></div>
                            <div className="h-4 w-8 rounded bg-surface-high animate-shimmer"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-surface-high animate-shimmer"></div>
                            <div className="h-3 w-5/6 rounded bg-surface-high animate-shimmer"></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="h-8 w-full rounded-md bg-surface-high animate-shimmer"></div>
                          <div className="h-8 w-full rounded-md bg-surface-high animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : candidates.length > 0 ? (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.uid} className="bg-surface border border-border p-6 hover:border-border transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      
                      {/* Candidate Identity */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black tracking-tight text-foreground">{candidate.name}</h4>
                          <ProofSignal type="verified" label="Verified" className="bg-success/10 px-2 py-0.5" />
                        </div>
                        
                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>{candidate.college || "N/A"}</span>
                          <span>•</span>
                          <span>{candidate.branch || "N/A"}</span>
                          <span>•</span>
                          <span>Class of {candidate.gradYear || "N/A"}</span>
                        </div>

                        <div className="pt-2 space-y-2">
                          <span className="text-[10px] font-bold text-outline uppercase tracking-widest border-b border-border pb-1 flex w-full">Verified Stack</span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {(candidate.skills || candidate.matchedSkills || []).slice(0, 5).map((skill: string) => (
                              <div key={skill} className="bg-surface-low border border-border px-2.5 py-1 flex items-center gap-2 rounded-sm">
                                <span className="text-xs font-bold text-foreground">{skill}</span>
                                <div className="w-px h-3 bg-zinc-300"></div>
                                <ProofSignal type="assessed" label="Verified" />
                              </div>
                            ))}
                            {(!candidate.skills || candidate.skills.length === 0) && (
                              <span className="text-xs text-muted-foreground italic">No exact skill matches</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Evidence & Action Sidebar */}
                      <div className="sm:w-64 shrink-0 flex flex-col space-y-5 border-l-2 border-border sm:pl-6">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">Verified Evidence & Signals</span>
                          <ul className="space-y-1.5 relative pl-2 border-l border-border ml-1">
                            {(candidate.matchReasons && candidate.matchReasons.length > 0 
                              ? candidate.matchReasons.slice(0, 3) 
                              : ["Verified talent profile evidence"]
                            ).map((reason: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-muted-foreground leading-tight">
                                <div className="absolute -left-[3px] mt-1 h-1 w-1 rounded-full bg-zinc-400" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-2 border-t border-border">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-full bg-foreground hover:opacity-90"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            Review Dossier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/40 transition-colors"
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
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
                icon={<Bookmark className="h-6 w-6 text-muted-foreground" />}
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
                <h2 className="text-lg font-bold text-foreground">Define a new role</h2>
                <p className="text-sm text-muted-foreground mt-1">Specify technical requirements to instantly discover verified candidates.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostRole} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="roleTitle" className="block text-sm font-semibold text-foreground">
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
                      <label htmlFor="department" className="block text-sm font-semibold text-foreground">
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
                    <label className="block text-sm font-semibold text-foreground">
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
                              ? "bg-foreground text-white shadow-sm"
                              : "bg-surface text-muted-foreground border border-border hover:border-border hover:bg-surface-low"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground">
                      Required Skills
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">We use these skills to instantly match you with verified candidates.</p>
                    <TagInput
                      tags={skillsNeeded}
                      onChange={setSkillsNeeded}
                      placeholder="Type a skill and press Enter..."
                    />
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    {formSuccess ? (
                      <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1.5 rounded-md">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Role posted successfully!</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-outline" /> Matches against verified proof instantly.
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
          <div className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>{successToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
