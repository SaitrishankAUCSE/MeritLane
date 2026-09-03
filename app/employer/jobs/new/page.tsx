"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { ArrowLeft, Plus, X, Briefcase, Check, AlertCircle } from "lucide-react";
import { COMMON_SKILLS } from "@/lib/constants";
import { WorkMode, EmploymentType } from "@/lib/firebase/jobs";

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
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 text-[#1C1917]">
      {/* ── Top Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK TO POSTED ROLES
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C]">
            New Job Specification
          </span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-8">
        <div className="border border-[#E7E2DA] bg-white p-7 sm:p-10 rounded-2xl shadow-xs space-y-8">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Job Intake Formulation
            </div>
            <h1 className="text-[24px] sm:text-[30px] font-bold uppercase tracking-[0.06em] text-[#1C1917]">
              POST AN ENGINEERING ROLE
            </h1>
            <p className="text-[13px] text-[#78716C] mt-1">
              Create an audited opportunity. Candidates with 100% profile completion and matching capabilities will be able to submit their technical dossiers directly.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-[#FEF2F2] border border-[#B42318]/20 rounded-xl text-[13px] text-[#B42318] flex items-center gap-2 font-sans">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Job Title <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Department / Squad
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Infrastructure"
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>
            </div>

            {/* Work Mode, Employment Type, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Work Mode <span className="text-[#B42318]">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-Site</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Role Type <span className="text-[#B42318]">*</span>
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Location <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru / Remote"
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>
            </div>

            {/* Compensation Range */}
            <div>
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Annual Compensation / Range (Optional)
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₹14,00,000 - ₹22,00,000 PA"
                className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>

            {/* Required Skills Picker */}
            <div className="space-y-3">
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917]">
                Required Technical Capabilities <span className="text-[#B42318]">*</span>
              </label>

              {/* Active Pills */}
              <div className="flex items-center gap-2 flex-wrap min-h-[40px] p-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl">
                {skills.length === 0 ? (
                  <span className="text-[12px] text-[#A8A29E] px-2 font-mono">
                    No capabilities added yet. Choose from below or type custom.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E7E2DA] rounded-full text-[12px] font-mono text-[#1C1917] shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#78716C] hover:text-[#B42318]"
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
                  className="flex-1 h-10 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-4 h-10 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded-xl"
                >
                  ADD
                </button>
              </div>

              {/* Suggested Skills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono uppercase text-[#78716C] mr-1">Suggestions:</span>
                {COMMON_SKILLS.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[10px] font-mono px-2.5 py-0.5 border border-[#E7E2DA] bg-white hover:border-[#1C1917] rounded-full text-[#78716C] hover:text-[#1C1917]"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Full Role Specification & Responsibilities <span className="text-[#B42318]">*</span>
              </label>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the technical responsibilities, engineering expectations, project domain, and team structure…"
                className="w-full p-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917] font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-[#F5F1EB] flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("draft")}
              className="w-full sm:w-auto px-6 h-11 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 shadow-2xs"
            >
              SAVE AS DRAFT
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("published")}
              className="w-full sm:w-auto px-7 h-11 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PROCESSING…</span>
                </>
              ) : (
                <span>PUBLISH OPPORTUNITY NOW</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
