"use client";

import React, { useState } from "react";
import { Users, Plus, CheckCircle2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  skills: string[];
  experienceLevel: string;
  status: "active" | "draft";
}

export default function EmployerDashboardPage() {
  const { user, role: userRole, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/login");
      } else if (!userRole) {
        router.push("/login"); // or show role selector, but login handles it
      } else if (userRole !== "employer") {
        router.push("/candidate/profile");
      }
    }
  }, [user, userRole, authLoading, profileLoading, router]);

  // Auth States Handled Explicitly
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  if (!user || !userRole || userRole !== "employer") {
    return null; // Wait for useEffect redirect
  }

  const [activeTab, setActiveTab] = useState<"candidates" | "post-role">("candidates");

  // Post Role Form State
  const [roleTitle, setRoleTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Early Career (0-2 Yrs)");
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [roles, setRoles] = useState<JobPosting[]>([]);

  const [formSuccess, setFormSuccess] = useState(false);

  const handlePostRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    const newRole: JobPosting = {
      id: `role-${Date.now()}`,
      title: roleTitle,
      department: department || "Engineering",
      skills: skillsNeeded,
      experienceLevel,
      status: "active",
    };

    setRoles([newRole, ...roles]);
    setRoleTitle("");
    setDepartment("");
    setSkillsNeeded([]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab("candidates");
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Employer Dashboard
            </h1>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 border border-zinc-200">
              Technical Recruiter View
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Source high-calibre Tier-2/Tier-3 engineering graduates pre-audited on actual code quality.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "candidates" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("candidates")}
          >
            <Users className="h-3.5 w-3.5" />
            Verified Pipeline
          </Button>
          <Button
            variant={activeTab === "post-role" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("post-role")}
          >
            <Plus className="h-3.5 w-3.5" />
            Post a Role
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {activeTab === "candidates" ? (
          <div className="space-y-8">
            {/* Active Postings Overview Bar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Active Roles</span>
                <p className="mt-1 text-xl font-semibold text-zinc-900">{roles.length}</p>
              </div>
              <div className="rounded border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Verified Pipeline Ready</span>
                <p className="mt-1 text-xl font-semibold text-zinc-900">0</p>
              </div>
              <div className="rounded border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Benchmark Assessments</span>
                <p className="mt-1 text-xs font-medium text-blue-600">Pending Live Launch</p>
              </div>
            </div>

            {/* Empty State for Verified Candidates */}
            <div className="rounded border border-zinc-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-400">
                <ShieldCheck className="h-6 w-6 text-zinc-600" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-zinc-900">
                Verified candidates will appear here once assessments go live
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-zinc-500 leading-relaxed">
                We are currently onboarding candidate portfolios and running initial repository audit algorithms.
                You will receive signal-ranked profiles with objective test results directly in this dashboard.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("post-role")}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Define Next Role Requirements
                </Button>
              </div>
            </div>

            {/* Currently Posted Roles */}
            {roles.length > 0 && (
              <div className="rounded border border-zinc-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-zinc-900">Posted Roles ({roles.length})</h3>
                <div className="mt-4 divide-y divide-zinc-100">
                  {roles.map((role) => (
                    <div key={role.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-900">{role.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span>{role.department}</span>
                          <span>•</span>
                          <span>{role.experienceLevel}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {role.skills.map((s, idx) => (
                          <Badge key={idx}>{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Post a Role Form */
          <div className="mx-auto max-w-2xl rounded border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-base font-semibold text-zinc-900">Post an Engineering Role</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Define the core technical skills needed. Candidate matches will be ranked by verified codebase signal.
              </p>
            </div>

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Role created successfully! Redirecting to pipeline...
              </div>
            )}

            <form onSubmit={handlePostRole} className="mt-6 space-y-5">
              <Input
                label="Role Title"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Junior Backend Engineer (Go / Distributed Systems)"
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Department / Team"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Platform Infrastructure"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-700">Target Experience</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option>Early Career (0-1 Yr / 2026 Grad)</option>
                    <option>Junior Engineer (1-2 Yrs)</option>
                    <option>Mid-Level Engineer (2-4 Yrs)</option>
                  </select>
                </div>
              </div>

              <TagInput
                label="Required Skills & Technologies"
                tags={skillsNeeded}
                onChange={setSkillsNeeded}
                placeholder="Type skill and press Enter (e.g. Go, PostgreSQL, Redis)..."
                helperText="Profiles with verified projects matching these skills will be surfaced first."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setActiveTab("candidates")}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Publish Role Requirements
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
