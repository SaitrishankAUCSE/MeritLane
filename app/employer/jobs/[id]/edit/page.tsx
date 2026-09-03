"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { ArrowLeft, Plus, X, AlertCircle } from "lucide-react";
import { COMMON_SKILLS } from "@/lib/constants";
import { WorkMode, EmploymentType, JobStatus } from "@/lib/firebase/jobs";

export default function EditJobPostingPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, role } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("remote");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState<JobStatus>("published");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadJob = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load job.");
      const data = await res.json();
      const j = data.job;
      setTitle(j.title || "");
      setDepartment(j.department || "");
      setLocation(j.location || "");
      setWorkMode(j.workMode || "remote");
      setEmploymentType(j.employmentType || "full-time");
      setSalaryRange(j.salaryRange || "");
      setDescription(j.description || "");
      setSkills(j.requiredSkills || []);
      setStatus(j.status || "published");
    } catch (err: any) {
      setError(err.message || "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (user && role === "employer" && id) {
      loadJob();
    }
  }, [user, role, id, loadJob]);

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

  const handleSave = async (targetStatus?: JobStatus) => {
    if (!user || role !== "employer") return;

    if (!title.trim()) {
      setError("Please enter a valid job title.");
      return;
    }
    if (!description.trim() || description.trim().length < 30) {
      setError("Please provide a meaningful role description.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify location.");
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
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
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
          status: targetStatus || status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save job changes.");
      }

      router.push("/employer/jobs");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[12px] font-mono text-[#78716C] uppercase tracking-wider">
            Loading job #{id}…
          </div>
        </div>
      </div>
    );
  }

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
            Edit Job #{id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-8">
        <div className="border border-[#E7E2DA] bg-white p-7 sm:p-10 rounded-2xl shadow-xs space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
                Edit Opportunity
              </div>
              <h1 className="text-[24px] sm:text-[30px] font-bold uppercase tracking-[0.06em] text-[#1C1917]">
                MODIFY JOB SPECIFICATION
              </h1>
            </div>

            {/* Current Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-[#78716C]">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="h-9 px-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded-full text-[12px] font-mono font-semibold text-[#1C1917] focus:outline-none"
              >
                <option value="draft">DRAFT</option>
                <option value="published">PUBLISHED</option>
                <option value="paused">PAUSED</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#FEF2F2] border border-[#B42318]/20 rounded-xl text-[13px] text-[#B42318] flex items-center gap-2 font-sans">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Work Mode
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
                  Role Type
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
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Annual Compensation Range
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917]">
                Required Technical Capabilities
              </label>
              <div className="flex items-center gap-2 flex-wrap min-h-[40px] p-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl">
                {skills.map((skill) => (
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
                ))}
              </div>

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
                  className="flex-1 h-10 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917]"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-4 h-10 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[12px] font-mono font-semibold rounded-xl"
                >
                  ADD
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Full Role Specification
              </label>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] font-sans leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#F5F1EB] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="px-7 h-11 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-mono font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? "SAVING CHANGES…" : "SAVE UPDATES"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
