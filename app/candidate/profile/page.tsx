"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, saveCandidateProfile, ProjectEntry } from "@/lib/firebase/candidate";

export default function CandidateProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"draft" | "pending" | "verified">("draft");

  const [name, setName] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [gradYear, setGradYear] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
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
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [user, authLoading, router]);

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

  const handleSave = async (status: "draft" | "pending") => {
    if (!user) return;
    setSaving(true);
    try {
      await saveCandidateProfile(user.uid, {
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
      setVerificationStatus(status);
      alert(`Profile ${status === "draft" ? "saved as draft" : "submitted for verification"}!`);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header & Verification Status */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Candidate Profile
            </h1>
            <Badge variant={verificationStatus === 'verified' ? 'verified' : verificationStatus === 'pending' ? 'locked' : 'neutral'}>
              {verificationStatus === 'verified' ? 'Verified' : verificationStatus === 'pending' ? 'Verification Pending' : 'Unverified'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Fill in your details and submit projects for verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={saving || verificationStatus === "verified"}
          >
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave("pending")}
            disabled={saving || verificationStatus === "pending" || verificationStatus === "verified" || projects.length === 0}
          >
            Submit for Verification
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Section 1: Academic & Identity */}
        <section className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Academic &amp; Identity
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Verification evaluates code independently of institution tier.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              placeholder="e.g. Government Engineering College, Thrissur"
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
        </section>

        {/* Section 2: Skills & Links */}
        <section className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Skills &amp; Profiles
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Public links for audit and skill tags for employer discovery.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                placeholder="Link to your resume"
                helperText="Optional — codebase verification is the primary signal."
              />
            </div>

            <TagInput
              label="Technical Skills"
              tags={skills}
              onChange={setSkills}
              placeholder="Add skill (e.g. PostgreSQL, Go, Docker)..."
              helperText="Press Enter or comma to add."
            />
          </div>
        </section>

        {/* Section 3: Verified Projects — the core product */}
        <section className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-2 border-b border-zinc-100 pb-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Verified Project Submissions
                </h2>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  Primary Signal
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Your repositories are what employers evaluate — this is the
                product, not decoration.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProject}
              className="self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Project
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            {projects.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-300 p-8 text-center">
                <AlertCircle className="mx-auto h-7 w-7 text-zinc-400" />
                <h3 className="mt-2 text-sm font-semibold text-zinc-900">
                  No projects submitted yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
                  Meritlane operates on proof of skill. Attach at least one
                  production-grade project repository to qualify for
                  verification.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addProject}
                  className="mt-4"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add First Project
                </Button>
              </div>
            ) : (
              projects.map((project: ProjectEntry, index: number) => (
                <div
                  key={project.id}
                  className="rounded border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500">
                        Project #{index + 1}
                      </span>
                      <Badge variant="locked">Audit Pending</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(project.id)}
                      className="text-zinc-400 transition-colors hover:text-red-600"
                      title="Remove Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Project Title"
                      value={project.title}
                      onChange={(e) =>
                        updateProject(project.id, "title", e.target.value)
                      }
                      placeholder="e.g. Distributed Key-Value Store"
                    />
                    <Input
                      label="GitHub Repository URL"
                      value={project.repoUrl}
                      onChange={(e) =>
                        updateProject(project.id, "repoUrl", e.target.value)
                      }
                      placeholder="https://github.com/user/repo"
                    />
                  </div>

                  <div className="mt-3">
                    <Input
                      label="Live Demo URL (Optional)"
                      value={project.liveUrl}
                      onChange={(e) =>
                        updateProject(project.id, "liveUrl", e.target.value)
                      }
                      placeholder="https://demo.example.com"
                    />
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Architecture &amp; Implementation Summary
                    </label>
                    <textarea
                      rows={3}
                      value={project.description}
                      onChange={(e) =>
                        updateProject(project.id, "description", e.target.value)
                      }
                      placeholder="Describe architectural choices, concurrency handling, database optimizations, or benchmark results..."
                      className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
