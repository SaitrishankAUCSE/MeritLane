"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";

interface ProjectEntry {
  id: string;
  title: string;
  repoUrl: string;
  liveUrl?: string;
  description: string;
  technologies: string[];
}

export default function CandidateProfilePage() {
  const [name, setName] = useState<string>("Aarav Sharma");
  const [college, setCollege] = useState<string>("Vellore Institute of Technology (Bhopal)");
  const [branch, setBranch] = useState<string>("Computer Science & Engineering");
  const [gradYear, setGradYear] = useState<string>("2026");
  const [githubUrl, setGithubUrl] = useState<string>("https://github.com/aarav-sharma");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([
    "TypeScript",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Tailwind CSS",
  ]);

  const [projects, setProjects] = useState<ProjectEntry[]>([
    {
      id: "p-1",
      title: "Distributed Task Queue with Redis & BullMQ",
      repoUrl: "https://github.com/aarav-sharma/distributed-task-queue",
      liveUrl: "https://queue-demo.aarav.dev",
      description:
        "High-throughput asynchronous job processor with automatic retry backoff, dead-letter queue, and Prometheus instrumentation metrics.",
      technologies: ["Node.js", "Redis", "Docker", "TypeScript"],
    },
  ]);

  const addProject = () => {
    const newProject: ProjectEntry = {
      id: `p-${Date.now()}`,
      title: "",
      repoUrl: "",
      liveUrl: "",
      description: "",
      technologies: [],
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = <K extends keyof ProjectEntry>(
    id: string,
    field: K,
    value: ProjectEntry[K]
  ) => {
    setProjects((prev) =>
      prev.map((p: ProjectEntry) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p: ProjectEntry) => p.id !== id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header & Verification Status */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Candidate Profile Shell
            </h1>
            <Badge variant="locked">Verification Pending</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            UI Shell — Authentication & database synchronization enabled in subsequent phase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Profile draft saved locally.")}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert("Assessment submission queue will open in Mission 2.")}
          >
            Submit for Verification
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {/* Academic & Personal Information */}
        <section className="rounded border border-zinc-200 bg-white p-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-base font-semibold text-zinc-900">1. Academic & Identity</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Basic identification details. Verification algorithms evaluate code independently of institution tier.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              placeholder="e.g. Computer Science / IT / Electronics"
            />
            <Input
              label="Graduation Year"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              placeholder="e.g. 2026"
            />
          </div>
        </section>

        {/* Technical Links & Skills */}
        <section className="rounded border border-zinc-200 bg-white p-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-base font-semibold text-zinc-900">2. Skills & Profiles</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Links used for public audit and skill tags for employer discovery.
            </p>
          </div>

          <div className="mt-5 space-y-4">
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
                placeholder="https://drive.google.com/... or personal domain"
                helperText="Optional — codebase verification remains the primary ranking metric."
              />
            </div>

            <TagInput
              label="Technical Skills (Tags)"
              tags={skills}
              onChange={setSkills}
              placeholder="Add skill (e.g. PostgreSQL, Go, Docker)..."
              helperText="Press Enter or comma to add a skill tag."
            />
          </div>
        </section>

        {/* Verified Projects — Core Product Section */}
        <section className="rounded border border-zinc-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-2 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900">
                  3. Verified Project Submissions
                </h2>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  Primary Signal
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Your submitted repositories are the core product evaluated by employers, not decoration.
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

          {/* Project List */}
          <div className="mt-6 space-y-6">
            {projects.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-300 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-zinc-400" />
                <h3 className="mt-2 text-sm font-semibold text-zinc-900">
                  No projects submitted yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Meritlane operates on proof of skill. You must attach at least one production-grade project repository to qualify for verification.
                </p>
                <Button variant="primary" size="sm" onClick={addProject} className="mt-4">
                  <Plus className="h-3.5 w-3.5" />
                  Add First Project
                </Button>
              </div>
            ) : (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className="relative rounded border border-zinc-200 bg-zinc-50/60 p-5 transition-all"
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
                      className="text-zinc-400 hover:text-red-600 transition-colors"
                      title="Remove Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  <div className="mt-4">
                    <Input
                      label="Live Demo URL (Optional)"
                      value={project.liveUrl || ""}
                      onChange={(e) => updateProject(project.id, "liveUrl", e.target.value)}
                      placeholder="https://demo.example.com"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Architecture & Implementation Summary
                    </label>
                    <textarea
                      rows={3}
                      value={project.description}
                      onChange={(e) => updateProject(project.id, "description", e.target.value)}
                      placeholder="Describe architectural choices, concurrency handling, database optimizations, or benchmark results..."
                      className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
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
