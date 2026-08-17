"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, FileCode2, Globe, Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, ProjectEntry, saveCandidateProfile, VerificationStatus } from "@/lib/firebase/candidate";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { useRouter } from "next/navigation";

type FormErrors = Record<string, string>;

function isUrl(value: string) {
  try { return Boolean(value) && new URL(value).protocol === "https:"; } catch { return false; }
}

export default function CandidateProfilePage() {
  const { user, role: userRole, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("draft");
  const [verificationReason, setVerificationReason] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && userRole === "candidate") {
      fetchCandidateProfile(user.uid).then((profile) => {
        if (profile) {
          setName(profile.name || ""); setCollege(profile.college || ""); setBranch(profile.branch || "");
          setGradYear(profile.gradYear || ""); setGithubUrl(profile.githubUrl || ""); setResumeUrl(profile.resumeUrl || "");
          setSkills(profile.skills || []); setProjects(profile.projects || []);
          setVerificationStatus(profile.verificationStatus || "draft"); setVerificationReason(profile.verificationReason || null);
        }
      }).catch(() => setNotification({ type: "error", message: "Could not load your profile." })).finally(() => setDataLoading(false));
    }
  }, [user, userRole, authLoading, profileLoading]);

  const addProject = () => setProjects((prev) => [...prev, { id: `p-${Date.now()}`, title: "", repoUrl: "", liveUrl: "", description: "" }]);
  const updateProject = <K extends keyof ProjectEntry>(id: string, field: K, value: ProjectEntry[K]) => {
    setProjects((prev) => prev.map((project) => project.id === id ? { ...project, [field]: value } : project));
    setErrors((prev) => { const next = { ...prev }; delete next[`project-${id}-${field}`]; return next; });
  };
  const removeProject = (id: string) => setProjects((prev) => prev.filter((project) => project.id !== id));

  const validate = (forSubmission: boolean) => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!college.trim()) next.college = "Enter your college or institute.";
    if (!branch.trim()) next.branch = "Enter your engineering branch.";
    if (!gradYear.trim()) next.gradYear = "Enter your graduation year.";
    if (!githubUrl.trim()) next.githubUrl = "A GitHub profile is required.";
    else if (!isUrl(githubUrl)) next.githubUrl = "Use a secure URL beginning with https://.";
    if (resumeUrl && !isUrl(resumeUrl)) next.resumeUrl = "Use a secure URL beginning with https://.";
    if (forSubmission && projects.length === 0) next.projects = "Add at least one project before submitting.";
    projects.forEach((project) => {
      if (!project.title.trim()) next[`project-${project.id}-title`] = "Add a project title.";
      if (!project.repoUrl.trim()) next[`project-${project.id}-repoUrl`] = "Add the repository URL.";
      else if (!isUrl(project.repoUrl)) next[`project-${project.id}-repoUrl`] = "Use a secure URL beginning with https://.";
      if (!project.description.trim()) next[`project-${project.id}-description`] = "Describe the architecture and implementation.";
      if (project.liveUrl && !isUrl(project.liveUrl)) next[`project-${project.id}-liveUrl`] = "Use a secure URL beginning with https://.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (status: VerificationStatus) => {
    const submitting = status === "pending";
    if (!user || (!validate(submitting) && submitting)) return;
    if (!user) return;
    setSaving(true);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Could not connect to Meritlane. Check your network and try again.")), 8000));
    try {
      await Promise.race([saveCandidateProfile(user.uid, { name, college, branch, gradYear, githubUrl, resumeUrl, skills, projects, verificationStatus: status }), timeoutPromise]);
      setVerificationStatus(status);
      if (status === "pending") { logFunnelEvent("profile_submitted", { projectCount: projects.length }); setShowSuccessModal(true); }
      else { logFunnelEvent("profile_draft_saved", { projectCount: projects.length }); setNotification({ type: "success", message: status === "draft" ? "Profile saved as draft." : "Profile updated successfully." }); }
    } catch (error: any) { setNotification({ type: "error", message: error.message || "Failed to save profile. Please try again." }); }
    finally { setSaving(false); }
  };

  if (authLoading || (user && profileLoading) || dataLoading) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3"><Loader2 className="size-8 animate-spin text-zinc-400" /><p className="text-sm font-medium text-zinc-500">Loading your profile...</p></div>;

  const statusBadge = verificationStatus === "verified" ? <Badge variant="verified">Verified</Badge> : verificationStatus === "pending" ? <Badge variant="pending">Verification Pending</Badge> : verificationStatus === "changes_required" ? <Badge variant="changes_required">Needs Changes</Badge> : verificationStatus === "rejected" ? <Badge variant="rejected">Not Verified</Badge> : <Badge variant="neutral">Draft</Badge>;
  const editable = verificationStatus === "draft" || verificationStatus === "changes_required" || verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-8 sm:pt-10">
      {notification && <div role="status" className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 shadow-lg sm:right-6 sm:top-6 ${notification.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}><p className="text-sm font-medium">{notification.message}</p></div>}
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Candidate Profile</h1>{statusBadge}</div><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">Your profile is the professional record employers use to understand your work and verification history.</p></div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">{editable ? <><Button variant="outline" onClick={() => handleSave("draft")} loading={saving}>Save Draft</Button><Button variant="primary" onClick={() => handleSave("pending")} loading={saving}>Submit for Verification</Button></> : <Button variant="primary" onClick={() => handleSave(verificationStatus)} loading={saving}>Update Profile</Button>}</div>
        </header>

        {verificationStatus === "changes_required" && verificationReason && <div className="rounded-lg border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2"><AlertCircle className="size-4 text-amber-700" /><h2 className="text-sm font-semibold text-amber-950">Feedback from Meritlane Reviewer</h2></div><p className="mt-2 text-sm leading-6 text-amber-900">{verificationReason}</p></div>}

        <section className="flex flex-col gap-8" aria-label="Candidate profile form">
          <Card><CardHeader><h2 className="text-base font-semibold text-zinc-900">Academic &amp; Identity</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Establish the identity and academic context behind your professional record.</p></CardHeader><CardContent><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" error={errors.name} /><Input label="College / Institute" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Your college or institute" error={errors.college} /><Input label="Engineering Branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Computer Science & Engineering" error={errors.branch} /><Input label="Graduation Year" value={gradYear} onChange={(e) => setGradYear(e.target.value)} placeholder="2026" inputMode="numeric" error={errors.gradYear} /></div></CardContent></Card>

          <Card><CardHeader><h2 className="text-base font-semibold text-zinc-900">Skills &amp; Profiles</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Add the public references and technical capabilities you want reviewers to inspect.</p></CardHeader><CardContent><div className="flex flex-col gap-6"><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Input label="GitHub Profile URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" error={errors.githubUrl} /><Input label="Resume URL (Optional)" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..." helperText="Optional. Your project evidence remains the primary signal." error={errors.resumeUrl} /></div><TagInput label="Technical Skills" tags={skills} onChange={setSkills} placeholder="Add a technical skill" helperText="Press Enter or comma to add a skill." /></div></CardContent></Card>

          <Card><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold text-zinc-900">Verified Project Submissions</h2><Badge variant="locked" size="sm">Primary Signal</Badge></div><p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">Reviewers evaluate your repository history, architecture, and implementation decisions here.</p></div><Button type="button" variant="outline" size="sm" onClick={addProject} leftIcon={<Plus className="size-4" />}>Add Project</Button></CardHeader><CardContent><div className="flex flex-col gap-5">{projects.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-10 text-center"><div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400"><Layers className="size-5" /></div><h3 className="mt-4 text-sm font-semibold text-zinc-900">No projects submitted yet</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Add a project repository to give reviewers a concrete signal of how you build.</p>{errors.projects && <p className="mt-3 text-sm font-medium text-red-600">{errors.projects}</p>}<Button variant="primary" size="sm" onClick={addProject} className="mt-5" leftIcon={<Plus className="size-4" />}>Add First Project</Button></div> : projects.map((project, index) => <div key={project.id} className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between border-b border-zinc-100 pb-4"><div className="flex items-center gap-3"><span className="text-sm font-semibold text-zinc-900">Project {index + 1}</span><Badge variant="locked" size="sm">Audit Pending</Badge></div><button type="button" onClick={() => removeProject(project.id)} className="flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove project ${index + 1}`}><Trash2 className="size-4" /></button></div><div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2"><Input label="Project Title" value={project.title} onChange={(e) => updateProject(project.id, "title", e.target.value)} placeholder="Name this project" error={errors[`project-${project.id}-title`]} /><Input label="GitHub Repository URL" value={project.repoUrl} onChange={(e) => updateProject(project.id, "repoUrl", e.target.value)} placeholder="https://github.com/username/repository" error={errors[`project-${project.id}-repoUrl`]} /></div><div className="mt-5"><Input label="Live Demo URL (Optional)" value={project.liveUrl} onChange={(e) => updateProject(project.id, "liveUrl", e.target.value)} placeholder="https://your-demo.example.com" error={errors[`project-${project.id}-liveUrl`]} /></div><div className="mt-5"><Textarea label="Architecture & Implementation Summary" rows={5} value={project.description} onChange={(e) => updateProject(project.id, "description", e.target.value)} placeholder="Summarize the architecture, key implementation decisions, and your contribution." error={errors[`project-${project.id}-description`]} /></div></div>)}</div></CardContent></Card>
        </section>
      </main>

      {showSuccessModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8"><div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600"><Check className="size-6" /></div><div className="text-center"><h2 id="modal-title" className="mt-5 text-lg font-bold text-zinc-900">Profile submitted</h2><p className="mt-3 text-sm leading-6 text-zinc-600">Your profile has been submitted to Meritlane for verification. We&apos;ll update your status once the review is complete.</p></div><Button variant="primary" className="mt-8 w-full" onClick={() => { setShowSuccessModal(false); router.push("/candidate/dashboard"); }}>Continue to Dashboard</Button></div></div>}
    </div>
  );
}
