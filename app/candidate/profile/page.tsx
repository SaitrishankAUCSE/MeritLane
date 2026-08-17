"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, Loader2, Check, Globe, FileCode2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, saveCandidateProfile, ProjectEntry, VerificationStatus } from "@/lib/firebase/candidate";
import { logFunnelEvent } from "@/lib/analytics/logEvent";

export default function CandidateProfilePage() {
  const { user, role: userRole, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [notification, setNotification] = useState<{type: "success" | "error", message: string} | null>(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        .catch((error) => {
          console.error("Error fetching profile:", error);
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [user, userRole, authLoading, profileLoading]);

  const addProject = () => {
    const newProject: ProjectEntry = {
      id: `p-${Date.now()}`,
      title: "",
      repoUrl: "",
      liveUrl: "",
      description: "",
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = <K extends keyof ProjectEntry>(
    id: string,
    field: K,
    value: ProjectEntry[K]
  ) => {
    setProjects((prev) =>
      prev.map((p: ProjectEntry) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p: ProjectEntry) => p.id !== id));
  };

  const handleSave = async (status: VerificationStatus) => {
    if (!user) return;
    setSaving(true);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: Could not connect to Firebase. Check your network or disable Adblockers.")), 8000)
    );

    try {
      const savePromise = saveCandidateProfile(user.uid, {
        name,
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
        setShowSuccessModal(true);
      } else if (status === "draft") {
        logFunnelEvent("profile_draft_saved", { projectCount: projects.length });
        setNotification({ type: "success", message: "Profile saved as draft!" });
      } else {
        setNotification({ type: "success", message: "Profile updated successfully!" });
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setNotification({ type: "error", message: error.message || "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (user && profileLoading) || dataLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium text-zinc-500">Loading your profile...</p>
      </div>
    );
  }

  const renderStatusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return <Badge variant="verified">Verified</Badge>;
      case "pending":
        return <Badge variant="pending">Verification Pending</Badge>;
      case "changes_required":
        return <Badge variant="changes_required">Needs Changes</Badge>;
      case "rejected":
        return <Badge variant="rejected">Not Verified</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-10">
      {notification && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl px-4 py-3 shadow-lg border animate-in fade-in duration-150 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col justify-between gap-6 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Candidate Profile
              </h1>
              {renderStatusBadge()}
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">
              Complete your profile and submit production project repositories for verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {verificationStatus === "draft" || verificationStatus === "changes_required" || verificationStatus === "rejected" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave("draft")}
                  loading={saving}
                >
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSave("pending")}
                  loading={saving}
                  disabled={projects.length === 0}
                >
                  Submit for Verification
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleSave(verificationStatus)}
                loading={saving}
              >
                Update Profile
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Alert for Changes Required */}
        {verificationStatus === "changes_required" && verificationReason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-700" />
              <h3 className="text-sm font-semibold text-amber-950">Feedback from Meritlane Reviewer</h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-mono">
              {verificationReason}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Academic & Identity */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-zinc-900">Academic &amp; Identity</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Verification evaluates code independently of institution pedigree.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                />
                <Input
                  label="College / Institute"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Government Engineering College"
                />
                <Input
                  label="Engineering Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                />
                <Input
                  label="Graduation Year"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Skills & Links */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-zinc-900">Skills &amp; Profiles</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Public links for audit and skill tags for recruiter discovery.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="GitHub Profile URL"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                  <Input
                    label="Resume URL (Optional)"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    helperText="Optional — codebase verification is the primary signal."
                  />
                </div>

                <TagInput
                  label="Technical Skills"
                  tags={skills}
                  onChange={setSkills}
                  placeholder="Add skill (e.g. PostgreSQL, Python, Docker)..."
                  helperText="Press Enter or comma to add."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Verified Projects */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-zinc-900">Verified Project Submissions</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                    Primary Signal
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">Your repositories are what employers and reviewers evaluate.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addProject} leftIcon={<Plus className="h-4 w-4" />}>
                Add Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-zinc-900">No projects submitted yet</h3>
                    <p className="mx-auto mt-1.5 max-w-md text-xs text-zinc-500 leading-relaxed">
                      Meritlane operates on proof of skill. Attach at least one production-grade project repository to qualify for verification.
                    </p>
                    <Button variant="primary" size="sm" onClick={addProject} className="mt-5" leftIcon={<Plus className="h-4 w-4" />}>
                      Add First Project
                    </Button>
                  </div>
                ) : (
                  projects.map((project: ProjectEntry, index: number) => (
                    <div key={project.id} className="rounded-xl border border-zinc-200/90 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-zinc-900">Project #{index + 1}</span>
                          <Badge variant="locked" size="sm">Audit Pending</Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProject(project.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Remove Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input
                          label="Project Title"
                          value={project.title}
                          onChange={(e) => updateProject(project.id, "title", e.target.value)}
                          placeholder="e.g. Distributed Key-Value Store"
                        />
                        <Input
                          label="GitHub Repository URL"
                          value={project.repoUrl}
                          onChange={(e) => updateProject(project.id, "repoUrl", e.target.value)}
                          placeholder="https://github.com/user/repo"
                        />
                      </div>

                      <div className="mt-5">
                        <Input
                          label="Live Demo URL (Optional)"
                          value={project.liveUrl}
                          onChange={(e) => updateProject(project.id, "liveUrl", e.target.value)}
                          placeholder="https://demo.example.com"
                        />
                      </div>

                      <div className="mt-5">
                        <Textarea
                          label="Architecture & Implementation Summary"
                          rows={4}
                          value={project.description}
                          onChange={(e) => updateProject(project.id, "description", e.target.value)}
                          placeholder="Describe architectural choices, concurrency handling, database optimizations, or benchmark results..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 mb-5">
              <Check className="h-6 w-6" aria-hidden="true" />
            </div>
            
            <div className="text-center">
              <h3 id="modal-title" className="text-lg font-bold text-zinc-900">
                Profile submitted
              </h3>
              <p id="modal-description" className="mt-3 text-sm leading-relaxed text-zinc-600">
                Your profile has been successfully submitted to Meritlane for verification. We&apos;ll review your information and update your verification status once the review is complete.
              </p>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                variant="primary" 
                className="w-full sm:w-auto px-8"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/candidate/dashboard");
                }}
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
