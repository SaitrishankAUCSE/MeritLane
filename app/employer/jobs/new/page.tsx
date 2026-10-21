"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { ArrowLeft, Plus, X, Briefcase, Check, AlertCircle } from "lucide-react";
import { COMMON_SKILLS } from "@/lib/constants";
import { WorkMode, EmploymentType } from "@/lib/firebase/jobs";
import { ALL_LOCATIONS } from "@/lib/locations";
import { Button } from "@/components/ui/Button";

export default function NewJobPostingPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("Bengaluru, India");
  const [workMode, setWorkMode] = useState<WorkMode>("remote");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddSkill = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return;
    if (!skills.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (targetStatus: "draft" | "published") => {
    if (!user || role !== "employer") return;

    if (!title.trim()) {
      setError("Please enter a valid job title.");
      return;
    }
    if (!description.trim() || description.trim().length < 30) {
      setError("Please provide a meaningful role description (at least 30 characters).");
      return;
    }
    if (!location.trim()) {
      setError("Please specify the role location or designate as Remote.");
      return;
    }
    if (skills.length === 0) {
      setError("Please add at least one required technical skill.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          department,
          location,
          workMode,
          employmentType,
          salaryRange,
          description,
          requiredSkills: skills,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job posting.");

      router.push("/employer/jobs");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F8F6] pb-24 text-[#101010] font-sans">
      {/* ── Top Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-2 text-xs font-medium text-black/60 hover:text-[#101010] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to posted roles
          </Link>
          <span className="text-xs font-medium text-black/40">
            Employer Portal · Job Creation
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 sm:px-10 py-8">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-7 sm:p-10 shadow-xs space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.08] text-[11px] font-medium text-black/70 mb-3">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Role Intake Form</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101010]">
              Post an Engineering Role
            </h1>
            <p className="text-sm text-black/60 mt-1 leading-relaxed">
              Create an audited opportunity. Candidates with verified capability profiles will be able to review and submit their technical dossiers directly.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-700 flex items-center gap-2 font-sans">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#101010] mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] mb-2">
                  Department / Squad
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Infrastructure"
                  className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Work Mode, Employment Type, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#101010] mb-2">
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] mb-2">
                  Role Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="locations-list"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India / Remote"
                  className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
                />
                <datalist id="locations-list">
                  {ALL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Compensation Range */}
            <div>
              <label className="block text-xs font-semibold text-[#101010] mb-2">
                Annual Compensation / Range (Optional)
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₹14,00,000 - ₹22,00,000 PA"
                className="w-full h-11 px-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Required Skills Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#101010]">
                Required Technical Capabilities <span className="text-red-500">*</span>
              </label>

              {/* Active Pills */}
              <div className="flex items-center gap-2 flex-wrap min-h-[44px] p-2 bg-[#F8F8F6] border border-black/[0.12] rounded-xl">
                {skills.length === 0 ? (
                  <span className="text-xs text-black/40 px-2">
                    No capabilities added yet. Choose suggestions below or type custom.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-black/[0.08] rounded-full text-xs font-medium text-[#101010] shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-black/40 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Type a capability and press Add…"
                  className="flex-1 h-10 px-4 bg-white border border-black/[0.12] rounded-full text-xs text-[#101010] focus:outline-none focus:border-black transition-colors"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-5 h-10 rounded-full border-black/[0.12] bg-white text-xs font-medium text-[#101010] hover:bg-black/[0.04]"
                >
                  Add
                </Button>
              </div>

              {/* Suggested Skills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-medium text-black/50 mr-1">Suggestions:</span>
                {COMMON_SKILLS.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-xs px-3 py-1 border border-black/[0.08] bg-white hover:border-black rounded-full text-black/70 hover:text-[#101010] transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#101010] mb-2">
                Full Role Specification & Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the technical responsibilities, engineering expectations, project domain, and team structure…"
                className="w-full p-4 bg-[#F8F8F6] border border-black/[0.12] rounded-xl text-sm text-[#101010] focus:outline-none focus:border-black font-sans leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSubmit("draft")}
              className="w-full sm:w-auto px-6 h-10 rounded-full border-black/[0.12] bg-white text-xs font-medium text-[#101010] hover:bg-black/[0.04] transition-colors disabled:opacity-50"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("published")}
              className="w-full sm:w-auto px-7 h-10 bg-[#101010] hover:bg-black text-white text-xs font-medium rounded-full transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <span>Publish Opportunity Now</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
