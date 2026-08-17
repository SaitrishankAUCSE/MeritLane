"use client";

import React, { useState } from "react";
import { Users, Plus, CheckCircle2, ShieldCheck, Briefcase, Sparkles, Building2, Code2, Layers } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

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

  const [activeTab, setActiveTab] = useState<"candidates" | "post-role">("candidates");

  const [roleTitle, setRoleTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Early Career (0-2 Yrs)");
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [roles, setRoles] = useState<JobPosting[]>([]);

  const [formSuccess, setFormSuccess] = useState(false);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600"></div>
      </div>
    );
  }

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
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Employer Dashboard
              </h1>
              <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                Technical Recruiter
              </span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">
              Source high-calibre engineering talent pre-verified by code quality.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant={activeTab === "candidates" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("candidates")}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Verified Pipeline
            </Button>
            <Button
              variant={activeTab === "post-role" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("post-role")}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Post a Role
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {activeTab === "candidates" ? (
            <>
              {/* Overview Metrics Bar */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Roles</span>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{roles.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verified Talent Pool</span>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">0</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Assessment Status</span>
                    <p className="mt-3 text-sm font-semibold text-indigo-600">Pending Live Cohort</p>
                  </CardContent>
                </Card>
              </div>

              {/* Verified Candidates Empty State */}
              <EmptyState 
                icon={<ShieldCheck className="h-6 w-6 text-indigo-600" />}
                title="Verified candidates will appear here soon"
                description="We are currently onboarding candidate portfolios and running repository audits. You will receive signal-ranked profiles directly in this pipeline."
                action={
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("post-role")} leftIcon={<Plus className="h-4 w-4" />}>
                    Define Next Role
                  </Button>
                }
              />

              {/* Posted Roles */}
              {roles.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-bold text-zinc-900">Posted Roles ({roles.length})</h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-100">
                      {roles.map((role) => (
                        <div key={role.id} className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center hover:bg-zinc-50/50 transition-colors">
                          <div>
                            <h4 className="text-base font-semibold text-zinc-900">{role.title}</h4>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-zinc-400" /> {role.department}</span>
                              <span className="text-zinc-300">•</span>
                              <span>{role.experienceLevel}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:justify-end">
                            {role.skills.map((s, idx) => (
                              <Badge key={idx} size="sm">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Post a Role Form */
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardHeader>
                  <h2 className="text-base font-bold text-zinc-900">Post an Engineering Role</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Define technical requirements. Candidate matches will be ranked by verified repository audits.
                  </p>
                </CardHeader>
                <CardContent>
                  {formSuccess && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in duration-150">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                      Role created successfully! Redirecting to pipeline...
                    </div>
                  )}

                  <form onSubmit={handlePostRole} className="space-y-6">
                    <Input
                      label="Role Title"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Junior Backend Engineer (Go / Distributed Systems)"
                      required
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Input
                        label="Department / Team"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Platform Infrastructure"
                      />

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Target Experience</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm transition-all hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
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

                    <div className="flex justify-end gap-2.5 pt-6 border-t border-zinc-100">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("candidates")}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Publish Role Requirements
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
