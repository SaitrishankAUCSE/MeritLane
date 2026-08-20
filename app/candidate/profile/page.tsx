"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, Check, Globe, ExternalLink, ShieldCheck, User, GraduationCap, Code2, Briefcase, FileCode2, LineChart, BadgeCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, saveCandidateProfile, ProjectEntry, VerificationStatus } from "@/lib/firebase/candidate";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import Link from "next/link";

// Fake interfaces for UI-only fields
interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "about", label: "Identity & About", icon: Globe },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Technical Skills", icon: Code2 },
  { id: "projects", label: "Projects", icon: FileCode2 },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "assessments", label: "Assessments", icon: LineChart },
  { id: "verification", label: "Verification", icon: BadgeCheck },
];

const ENGINEERING_BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biotechnology",
  "Artificial Intelligence and Data Science",
  "Cyber Security",
  "Robotics and Automation"
];

const PASSING_YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

export default function CandidateProfilePage() {
  const { user, role: userRole, loading: authLoading, profileLoading, userProfile } = useAuth();
  const router = useRouter();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState("overview");

  // Real Fields
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("draft");
  const [verificationReason, setVerificationReason] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [gradYear, setGradYear] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  
  // UI-only Fields (Prototype)
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [cgpa, setCgpa] = useState<string>("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);

  const [notification, setNotification] = useState<{type: "success" | "error", message: string} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!authLoading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole === "candidate") {
      fetchCandidateProfile(user.uid)
        .then((profile) => {
          if (profile) {
            setName(profile.name || "");
            setCollege(profile.college || "");
            setBranch(profile.branch || "");
            setGradYear(profile.gradYear || "");
            setGithubUrl(profile.githubUrl || "");
            setResumeUrl(profile.resumeUrl || "");
            setSkills(profile.skills || []);
            setProjects(profile.projects || []);
            setVerificationStatus(profile.verificationStatus || "draft");
            setVerificationReason(profile.verificationReason || null);
          }
        })
        .catch((error) => console.error("Error fetching profile:", error))
        .finally(() => setDataLoading(false));
    }
  }, [user, userRole, authLoading, profileLoading]);

  // Completion calculation
  const hasBasicInfo = !!(name && college);
  const hasSkills = !!(skills && skills.length > 0);
  const hasGithub = !!(githubUrl);
  const hasProjects = !!(projects && projects.length > 0);
  const hasSummary = !!(summary);
  const hasExperience = !!(experience && experience.length > 0);
  
  let completionScore = 0;
  if (hasBasicInfo) completionScore += 20;
  if (hasSkills) completionScore += 20;
  if (hasGithub) completionScore += 15;
  if (hasProjects) completionScore += 25;
  if (hasSummary) completionScore += 10;
  if (hasExperience) completionScore += 10;

  const handleSave = async (status: VerificationStatus) => {
    if (!user) return;
    setSaving(true);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: Could not connect to Firebase.")), 8000)
    );
    try {
      const savePromise = saveCandidateProfile(user.uid, {
        name,
        email: user.email || "",
        college,
        branch,
        gradYear,
        githubUrl,
        resumeUrl,
        skills,
        projects,
        verificationStatus: status,
      });
      await Promise.race([savePromise, timeoutPromise]);
      setVerificationStatus(status);
      if (status === "pending") {
        logFunnelEvent("profile_submitted", { projectCount: projects.length });
        setNotification({ type: "success", message: "Profile submitted for verification!" });
      } else {
        setNotification({ type: "success", message: "Profile saved successfully!" });
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      setNotification({ type: "error", message: error.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const fetchColleges = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    try {
      const response = await fetch(`/api/colleges?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.results || [];
    } catch (err) {
      return [];
    }
  };

  if (authLoading || (user && profileLoading) || dataLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] pb-24 pt-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const isLocked = verificationStatus === "verified";
  const assessmentCount = userProfile?.assessmentScores ? Object.keys(userProfile.assessmentScores).length : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fcfcfc] pb-24 pt-10">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white pointer-events-none" />

      {notification && (
        <div className={`fixed top-6 right-6 z-50 rounded-md px-4 py-3 shadow-lg border animate-in fade-in duration-150 ${
          notification.type === 'success' ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center text-xl font-bold text-zinc-400 border border-zinc-200 shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={name} className="h-full w-full rounded-full object-cover" />
              ) : (
                name ? name.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-zinc-900">{name || "Engineering Profile"}</h1>
                {verificationStatus === "verified" && (
                  <Badge variant="verified" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</Badge>
                )}
                {verificationStatus === "pending" && <Badge variant="pending">Under Review</Badge>}
                {verificationStatus === "changes_required" && <Badge variant="changes_required">Changes Required</Badge>}
              </div>
              <p className="text-sm text-zinc-500">
                {title || "Software Engineer"} {location && `• ${location}`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Completion</span>
              <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 transition-all" style={{ width: `${completionScore}%` }} />
              </div>
              <span className="text-xs font-bold text-zinc-900">{completionScore}%</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isLocked ? (
                <Button variant="outline" disabled className="w-full sm:w-auto">Profile Locked</Button>
              ) : verificationStatus === "pending" ? (
                <Button variant="primary" onClick={() => handleSave("pending")} loading={saving} className="w-full sm:w-auto">Update Profile</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleSave("draft")} loading={saving} className="flex-1 sm:flex-none">Save Draft</Button>
                  <Button variant="primary" onClick={() => handleSave("pending")} loading={saving} disabled={projects.length === 0} className="flex-1 sm:flex-none">Submit for Verification</Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {verificationStatus === "changes_required" && verificationReason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">Changes requested by Meritlane</h3>
              <p className="text-sm text-amber-900 mt-1">{verificationReason}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:w-56 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar sticky top-20">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap text-left ${
                      isActive 
                        ? "bg-zinc-100 text-zinc-900 font-semibold" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-zinc-900 mb-6">Profile Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Identity</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Name</span>
                          <span className="text-sm font-medium text-zinc-900">{name || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Email</span>
                          <span className="text-sm font-medium text-zinc-900">{user?.email || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Title</span>
                          <span className="text-sm font-medium text-zinc-900">{title || "—"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Verification State</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Profile Status</span>
                          <span className={`text-sm font-bold capitalize ${verificationStatus === 'verified' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                            {verificationStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-500">Verified Skills</span>
                          <span className="text-sm font-medium text-zinc-900">{assessmentCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Completion Checklist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 text-sm ${hasBasicInfo ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Basic Information
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${hasSummary ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Professional Summary
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${hasSkills ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Technical Skills
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${hasGithub ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> GitHub Connection
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${hasProjects ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Project Evidence
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${hasExperience ? 'text-emerald-700' : 'text-zinc-400'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Experience History
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* IDENTITY & ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader className="pb-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Identity &amp; About</h2>
                    <p className="text-sm text-zinc-500">Core personal and professional details.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Input
                        label="Full Legal Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ada Lovelace"
                        disabled={isLocked}
                      />
                      <Input
                        label="Professional Title (Not persisted)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        disabled={isLocked}
                      />
                      <Input
                        label="Location (Not persisted)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        disabled={isLocked}
                      />
                      <Input
                        label="GitHub URL"
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        disabled={isLocked}
                      />
                    </div>
                    <div>
                      <Textarea
                        label="Professional Summary (Not persisted)"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Tell employers what you build and what kind of engineering work you specialize in."
                        rows={4}
                        disabled={isLocked}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* EDUCATION TAB */}
            {activeTab === "education" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader className="pb-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Education Background</h2>
                    <p className="text-sm text-zinc-500">Verification evaluates code independently of institution pedigree.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">University / College</label>
                        <Autocomplete
                          value={college}
                          onChange={setCollege}
                          fetchOptions={fetchColleges}
                          placeholder="Search for your university..."
                          disabled={isLocked}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-700">Engineering Branch</label>
                        <select
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          disabled={isLocked}
                        >
                          <option value="">Select Branch</option>
                          {ENGINEERING_BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-zinc-700">Grad Year</label>
                          <select
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                            value={gradYear}
                            onChange={(e) => setGradYear(e.target.value)}
                            disabled={isLocked}
                          >
                            <option value="">Select Year</option>
                            {PASSING_YEARS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="CGPA (Not persisted)"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          placeholder="e.g. 3.8"
                          disabled={isLocked}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader className="pb-4 border-b border-zinc-100 flex flex-row items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900">Technical Skills</h2>
                      <p className="text-sm text-zinc-500">Your declared toolkit.</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Verified Skills Presentation (Read Only) */}
                    {userProfile?.assessmentScores && Object.keys(userProfile.assessmentScores).length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Verified by Assessment</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(userProfile.assessmentScores).map(skill => (
                            <div key={skill} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-md border border-emerald-200 text-sm font-medium">
                              {skill.replace('python_', 'Python (').replace('_', ' ')}{skill.startsWith('python_') ? ')' : ''}
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Declared Skills</h3>
                      <TagInput
                        tags={skills}
                        onChange={setSkills}
                        placeholder="Type a skill and press Enter..."
                        disabled={isLocked}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Project Evidence</h2>
                    <p className="text-sm text-zinc-500">Repositories used to verify your engineering capabilities.</p>
                  </div>
                  {!isLocked && (
                    <Button variant="outline" size="sm" onClick={() => {
                      setProjects([...projects, { id: `p-${Date.now()}`, title: "", repoUrl: "", liveUrl: "", description: "" }]);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                  )}
                </div>

                {projects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center bg-white">
                    <FileCode2 className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                    <h3 className="text-sm font-medium text-zinc-900">No projects added</h3>
                    <p className="mt-1 text-sm text-zinc-500 mb-4">Provide repositories of your best work.</p>
                    {!isLocked && (
                      <Button variant="outline" onClick={() => setProjects([...projects, { id: `p-${Date.now()}`, title: "", repoUrl: "", liveUrl: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Evidence
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {projects.map((project, index) => (
                      <Card key={project.id} className="border-zinc-200 shadow-sm relative overflow-hidden group bg-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-900 opacity-20"></div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Evidence #{index + 1}</h3>
                            {!isLocked && (
                              <button onClick={() => setProjects(projects.filter(p => p.id !== project.id))} className="text-zinc-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <Input
                              label="Project Name"
                              value={project.title}
                              onChange={(e) => {
                                const newP = [...projects];
                                newP[index].title = e.target.value;
                                setProjects(newP);
                              }}
                              placeholder="e.g. Distributed Key-Value Store"
                              disabled={isLocked}
                            />
                            <Input
                              label="Technologies (UI only)"
                              placeholder="e.g. Rust, Raft, gRPC"
                              disabled={isLocked}
                            />
                            <Input
                              label="Repository URL"
                              value={project.repoUrl}
                              onChange={(e) => {
                                const newP = [...projects];
                                newP[index].repoUrl = e.target.value;
                                setProjects(newP);
                              }}
                              placeholder="https://github.com/..."
                              disabled={isLocked}
                            />
                            <Input
                              label="Live Demo URL (Optional)"
                              value={project.liveUrl || ""}
                              onChange={(e) => {
                                const newP = [...projects];
                                newP[index].liveUrl = e.target.value;
                                setProjects(newP);
                              }}
                              placeholder="https://..."
                              disabled={isLocked}
                            />
                            <div className="sm:col-span-2">
                              <Textarea
                                label="Technical Summary"
                                value={project.description}
                                onChange={(e) => {
                                  const newP = [...projects];
                                  newP[index].description = e.target.value;
                                  setProjects(newP);
                                }}
                                placeholder="Explain the architecture, challenging problems solved, and technical decisions made."
                                rows={3}
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Professional Experience</h2>
                    <p className="text-sm text-zinc-500">Not currently persisted to backend.</p>
                  </div>
                  {!isLocked && (
                    <Button variant="outline" size="sm" onClick={() => {
                      setExperience([...experience, { id: `e-${Date.now()}`, role: "", company: "", startDate: "", endDate: "", description: "" }]);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Experience
                    </Button>
                  )}
                </div>
                
                {experience.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center bg-white">
                    <Briefcase className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                    <h3 className="text-sm font-medium text-zinc-900">No experience added</h3>
                    <p className="mt-1 text-sm text-zinc-500 mb-4">Add your professional work history.</p>
                    {!isLocked && (
                      <Button variant="outline" onClick={() => setExperience([...experience, { id: `e-${Date.now()}`, role: "", company: "", startDate: "", endDate: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Role
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {experience.map((exp, index) => (
                      <Card key={exp.id} className="border-zinc-200 shadow-sm bg-white">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Role #{index + 1}</h3>
                            {!isLocked && (
                              <button onClick={() => setExperience(experience.filter(e => e.id !== exp.id))} className="text-zinc-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <Input
                              label="Role / Title"
                              value={exp.role}
                              onChange={(e) => {
                                const newE = [...experience];
                                newE[index].role = e.target.value;
                                setExperience(newE);
                              }}
                              placeholder="e.g. Software Engineer"
                              disabled={isLocked}
                            />
                            <Input
                              label="Company"
                              value={exp.company}
                              onChange={(e) => {
                                const newE = [...experience];
                                newE[index].company = e.target.value;
                                setExperience(newE);
                              }}
                              placeholder="e.g. Acme Corp"
                              disabled={isLocked}
                            />
                            <Input
                              label="Start Date"
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => {
                                const newE = [...experience];
                                newE[index].startDate = e.target.value;
                                setExperience(newE);
                              }}
                              disabled={isLocked}
                            />
                            <Input
                              label="End Date"
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => {
                                const newE = [...experience];
                                newE[index].endDate = e.target.value;
                                setExperience(newE);
                              }}
                              placeholder="Leave empty if current"
                              disabled={isLocked}
                            />
                            <div className="sm:col-span-2">
                              <Textarea
                                label="Description"
                                value={exp.description}
                                onChange={(e) => {
                                  const newE = [...experience];
                                  newE[index].description = e.target.value;
                                  setExperience(newE);
                                }}
                                placeholder="Describe your responsibilities and impact."
                                rows={3}
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ASSESSMENTS TAB */}
            {activeTab === "assessments" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-zinc-200 shadow-sm bg-white">
                  <CardHeader className="pb-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Technical Assessments</h2>
                    <p className="text-sm text-zinc-500">Standardized verification of your engineering capabilities.</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {assessmentCount === 0 ? (
                      <div className="p-12 text-center">
                        <LineChart className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                        <h3 className="text-sm font-medium text-zinc-900">No assessments taken</h3>
                        <p className="mt-1 text-sm text-zinc-500 mb-4">Complete assessments to prove your skills.</p>
                        <Button variant="outline" onClick={() => router.push("/candidate/assessment")}>
                          View Available Assessments
                        </Button>
                      </div>
                    ) : (
                      <ul className="divide-y divide-zinc-100">
                        {Object.entries(userProfile?.assessmentScores || {}).map(([skill, score]) => (
                          <li key={skill} className="p-6 flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-zinc-900">
                                {skill.replace('python_', 'Python (Variant ').replace('_', ' ').toUpperCase() + (skill.startsWith('python_') ? ')' : '')}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="verified">Completed</Badge>
                                <span className="text-xs text-zinc-500">Proctored environment</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-xl font-bold text-zinc-900">{score as React.ReactNode} / 5</span>
                              <span className="text-xs text-zinc-500">Score</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VERIFICATION TAB */}
            {activeTab === "verification" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-zinc-200 shadow-sm bg-white">
                  <CardHeader className="pb-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Verification Record</h2>
                    <p className="text-sm text-zinc-500">Official audit trail of your Meritlane profile.</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Current Status</span>
                          <span className={`text-base font-bold capitalize ${verificationStatus === 'verified' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                            {verificationStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Last Updated</span>
                          <span className="text-base font-medium text-zinc-900">
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-zinc-100">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Evidence Audited</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded border border-zinc-100">
                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                              <User className="w-4 h-4 text-zinc-400" /> Identity Information
                            </div>
                            {hasBasicInfo ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-zinc-400">Missing</span>}
                          </div>
                          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded border border-zinc-100">
                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                              <LineChart className="w-4 h-4 text-zinc-400" /> Standardized Assessments
                            </div>
                            {assessmentCount > 0 ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-zinc-400">Missing</span>}
                          </div>
                          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded border border-zinc-100">
                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                              <FileCode2 className="w-4 h-4 text-zinc-400" /> Technical Projects
                            </div>
                            {hasProjects ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-zinc-400">Missing</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
