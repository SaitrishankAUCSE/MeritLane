"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, saveCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  GitBranch,
  RefreshCw,
  PenTool,
  ExternalLink,
  BookOpen,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ProfileForm } from "@/components/candidate/ProfileForm";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { InstitutionalResumeScanner } from "@/components/candidate/InstitutionalResumeScanner";
import { ParsedResumeProfile } from "@/lib/resume/parser";
import { GithubAuthProvider, linkWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Resume Upload State at Top of Profile
  const [uploadingResume, setUploadingResume] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeProfile | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pendingDataRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
          if (!p || !p.name || !p.skills || p.skills.length === 0) setIsEditing(true);
          setIsInitializing(false);
        })
        .catch(() => {
          setIsEditing(true);
          setIsInitializing(false);
        });
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSave = (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleResumeUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Please upload a PDF document (.pdf)");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert("File size exceeds 12MB limit.");
      return;
    }

    setResumeFileName(file.name);
    setScannerOpen(true);
    setUploadingResume(true);
    setParsedData(null);
    pendingDataRef.current = null;

    try {
      const token = await user?.getIdToken(true);
      const data = new FormData();
      data.append("file", file);
      data.append("skills", JSON.stringify(profile?.skills || []));
      const res = await fetch("/api/candidate/ats-check", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to parse resume.");
      pendingDataRef.current = resData;
      if (resData.parsed) {
        setParsedData(resData.parsed);
      }
    } catch (err: any) {
      console.error("Resume parse error:", err);
      setScannerOpen(false);
      setUploadingResume(false);
      alert(err.message || "Failed to process resume.");
    }
  };

  const handleScannerComplete = async () => {
    setScannerOpen(false);
    setUploadingResume(false);
    const data = pendingDataRef.current;
    if (!data?.parsed || !user) return;
    const parsed: ParsedResumeProfile = data.parsed;

    // Merge with existing profile skills
    const existingSkills = new Set(profile?.skills || []);
    (parsed.skills || []).forEach((s: string) => existingSkills.add(s));

    const updated: CandidateProfile = {
      ...profile,
      name: profile?.name && profile.name !== "Candidate" ? profile.name : (parsed.name || profile?.name || "Candidate"),
      college: parsed.college || profile?.college || "",
      degree: parsed.degree || profile?.degree || "",
      branch: parsed.branch || profile?.branch || "",
      gradYear: parsed.gradYear || profile?.gradYear || "",
      githubUrl: parsed.githubUrl || profile?.githubUrl || "",
      skills: Array.from(existingSkills),
      resumeText: data.extractedText || profile?.resumeText || "",
      atsScore: data.result?.score ?? profile?.atsScore,
      atsRating: data.result?.rating ?? profile?.atsRating,
      atsSummary: data.result?.summary ?? profile?.atsSummary,
    };

    try {
      await saveCandidateProfile(user.uid, updated);
      setProfile(updated);
    } catch (saveErr) {
      console.error("Error saving parsed profile:", saveErr);
    }
  };

  const handleGithubSync = async () => {
    if (!user) return;
    setIsSyncingGithub(true);
    setSyncError(null);
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("read:user");
      provider.addScope("repo");
      const result = await linkWithPopup(user, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (!token) throw new Error("Could not retrieve GitHub token.");
      const idToken = await user.getIdToken();
      const res = await fetch("/api/candidate/github-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ githubToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync GitHub data.");
      setProfile((prev) => (prev ? { ...prev, githubEvidence: data.githubEvidence } : prev));
    } catch (err: any) {
      if (err.code === "auth/credential-already-in-use") {
        setSyncError("This GitHub account is already linked to another profile.");
      } else {
        setSyncError(err.message || "An error occurred during synchronisation.");
      }
    } finally {
      setIsSyncingGithub(false);
    }
  };

  if (loading && !user) return <MeritlaneLoader level="page" text="Authenticating" />;

  if (isInitializing) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20 text-[#737373]">
        <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
        <p className="text-[13px] font-mono">Loading identity record…</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide">
        <ProfileForm
          initialData={profile}
          onSave={handleSave}
          onCancel={profile?.name ? () => setIsEditing(false) : undefined}
          isNew={!profile?.name}
        />
      </div>
    );
  }

  const name = profile?.name || user?.displayName || "—";
  const skills = profile?.skills || [];
  const verifiedCount = skills.filter(
    (s) => profile?.verifiedSkills?.[s]?.status === "verified"
  ).length;
  const atsScore = profile?.atsScore;
  const githubSynced = !!profile?.githubEvidence;

  const candidateKey = profile?.candidateKey || (user?.uid ? `ML-${user.uid.slice(0, 8).toUpperCase()}` : "—");

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">

      {/* ── Registry Command Header ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase">
                Candidate Identity Record · Meritlane Registry
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20">
                KEY: {candidateKey}
              </span>
            </div>
            <h1 className="font-signature text-[40px] sm:text-[50px] text-[#1C1917] leading-none py-1 font-semibold">
              {name}
            </h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {profile?.degree && (
                <span className="text-[11px] font-mono text-[#78716C]">{profile.degree}</span>
              )}
              {profile?.branch && (
                <>
                  <div className="w-px h-3 bg-[#E7E2DA]" />
                  <span className="text-[11px] font-mono text-[#78716C]">{profile.branch}</span>
                </>
              )}
              {profile?.college && (
                <>
                  <div className="w-px h-3 bg-[#E7E2DA]" />
                  <span className="text-[11px] font-mono text-[#78716C]">{profile.college}</span>
                </>
              )}
              {profile?.gradYear && (
                <>
                  <div className="w-px h-3 bg-[#E7E2DA]" />
                  <span className="text-[11px] font-mono text-[#78716C]">Class of {profile.gradYear}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#F5F1EB] text-[#1C1917] text-[11px] font-mono font-semibold transition-colors shrink-0 tracking-[0.06em] rounded shadow-2xs"
          >
            <PenTool className="h-3 w-3" />
            EDIT IDENTITY
          </button>
        </div>
      </div>

      {/* Institutional Resume Scanner Modal */}
      <InstitutionalResumeScanner
        isOpen={scannerOpen}
        fileName={resumeFileName}
        parsedData={parsedData}
        onComplete={handleScannerComplete}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Main Claims Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Top-of-Profile Resume Upload Card ── */}
          <div className="border border-[#E7E2DA] bg-white rounded p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E2DA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#1C1917] shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#78716C]">
                    Institutional Registry Ingestion
                  </div>
                  <h2 className="font-serif text-[18px] text-[#1C1917] font-semibold">
                    Auto-Populate Profile from Resume
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded w-fit">
                PDF format · Max 12MB
              </span>
            </div>

            <p className="text-[13px] font-sans text-[#78716C] mt-3 mb-4 leading-relaxed">
              Upload your official resume to automatically populate your education, experience, and technical capabilities into your identity record. All fields remain fully editable, and every extracted skill can be verified through our proctored assessments.
            </p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleResumeUpload(file);
              }}
              onClick={() => resumeInputRef.current?.click()}
              className="border-2 border-dashed border-[#E7E2DA] hover:border-[#064E3B] bg-[#FAF8F5] hover:bg-[#F5F1EB] rounded-lg p-6 text-center transition-colors cursor-pointer"
            >
              <input
                type="file"
                ref={resumeInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
                accept=".pdf,application/pdf"
                className="hidden"
              />
              <UploadCloud className="h-7 w-7 text-[#78716C] mx-auto mb-2" />
              <div className="text-[13px] font-medium text-[#1C1917]">
                Click to browse or drop your resume PDF here
              </div>
              <div className="text-[11px] font-mono text-[#A8A29E] mt-1">
                Auto-extracts name, college, degree, graduation year, and technical skills
              </div>
            </div>
          </div>

          {/* Skills Ledger Table */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3 flex items-center justify-between">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                Section A — Declared Technical Capabilities
              </div>
              <div className="text-[9px] font-mono text-[#78716C]">
                {skills.length} {skills.length === 1 ? "claim" : "claims"}
              </div>
            </div>

            {/* Assessment requirement notice */}
            <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                Every skill present on your resume must be verified by writing an assessment before it is certified.
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#064E3B] font-semibold underline hover:text-[#1C1917] shrink-0 text-left"
              >
                Edit Skills
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-[15px] font-serif text-[#1C1917] mb-2">No capabilities declared</div>
                <p className="text-[12px] font-sans text-[#78716C] mb-5">
                  Upload your resume above or add technical skills to begin the verification process.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-mono font-semibold px-4 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors rounded"
                >
                  ADD CAPABILITIES
                </button>
              </div>
            ) : (
              <>
                {/* Table head */}
                <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_8rem_8rem_9rem] border-b border-[#E7E2DA] bg-[#FAF8F5] px-5 py-2.5">
                  {["#", "Skill / Technology", "Status", "Score", "Action"].map((h) => (
                    <div key={h} className={`text-[9px] font-mono text-[#78716C] uppercase tracking-[0.18em] ${h === "Action" ? "text-right" : ""}`}>
                      {h}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {skills.map((skill, idx) => {
                  const v = profile?.verifiedSkills?.[skill];
                  const isVerified = v?.status === "verified";
                  return (
                    <div
                      key={skill}
                      className={`sm:grid sm:grid-cols-[2rem_1fr_8rem_8rem_9rem] flex flex-col gap-1 sm:gap-0 items-start sm:items-center px-5 py-4 border-b border-[#E7E2DA] last:border-b-0 transition-colors ${
                        isVerified ? "bg-[#064E3B]/[0.02]" : "bg-white hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="hidden sm:block text-[11px] font-mono text-[#C8BFB0]">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="text-[14px] font-serif text-[#1C1917]">{skill}</div>
                        {isVerified && (
                          <div className="text-[10px] font-mono text-[#064E3B] mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" />Active on public record
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`inline-block text-[9px] font-mono font-semibold tracking-[0.16em] px-2 py-[3px] uppercase border ${
                          isVerified
                            ? "text-[#064E3B] bg-[#064E3B]/[0.08] border-[#064E3B]/30"
                            : "text-[#78716C] bg-[#F5F1EB] border-[#C8BFB0]"
                        }`}>
                          {isVerified ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </div>
                      <div className="text-[13px] font-mono text-[#1C1917]">
                        {v?.score ? `${v.score}%` : "—"}
                      </div>
                      <div className="sm:flex sm:justify-end">
                        {isVerified ? (
                          <span className="text-[10px] font-mono text-[#064E3B] font-semibold">✓ Passed</span>
                        ) : (
                          <button
                            onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                            className="text-[10px] font-mono font-semibold text-white bg-[#1C1917] hover:bg-[#064E3B] px-3 py-1.5 transition-colors rounded shadow-2xs"
                            title={`Take assessment to verify ${skill}`}
                          >
                            TAKE ASSESSMENT →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Education Record */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                Section B — Education Record
              </div>
            </div>
            <div className="p-5">
              {profile?.college ? (
                <div className="flex gap-5 items-start">
                  <div className="h-10 w-10 border border-[#E7E2DA] bg-[#F5F1EB] flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-[#78716C]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-serif text-[#1C1917] mb-1">{profile.college}</div>
                    <div className="text-[12px] font-sans text-[#525252]">
                      {profile.degree && `${profile.degree} · `}{profile.branch || "Computer Science"}
                    </div>
                    <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-[0.12em] mt-1.5">
                      Class of {profile.gradYear || "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[13px] font-sans text-[#78716C] mb-4">
                    No education record on file.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-mono text-[#1C1917] border border-[#E7E2DA] px-4 py-2 hover:bg-[#F5F1EB] transition-colors rounded"
                  >
                    ADD EDUCATION
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          {profile?.projects && profile.projects.length > 0 && (
            <div className="border border-[#E7E2DA] bg-white">
              <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
                <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                  Section C — Technical Projects
                </div>
              </div>
              <div className="divide-y divide-[#F0EDE8]">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="p-5">
                    <div className="text-[14px] font-serif text-[#1C1917] mb-1">{proj.title}</div>
                    <div className="text-[12px] font-sans text-[#525252] leading-relaxed">{proj.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Record Status Panel ── */}
        <div className="space-y-5">

          {/* Record Status */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                Record Status
              </div>
            </div>
            <div className="divide-y divide-[#F0EDE8]">
              {[
                {
                  label: "Registry Key",
                  value: candidateKey,
                  accent: true,
                },
                {
                  label: "Skills Declared",
                  value: String(skills.length),
                  accent: false,
                },
                {
                  label: "Skills Verified",
                  value: String(verifiedCount),
                  accent: verifiedCount > 0,
                },
                {
                  label: "ATS Score",
                  value: atsScore !== undefined ? `${atsScore} / 100` : "—",
                  accent: atsScore !== undefined && atsScore >= 80,
                },
                {
                  label: "GitHub Archive",
                  value: githubSynced ? "Synced" : "Not linked",
                  accent: githubSynced,
                },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[11px] font-mono text-[#78716C]">{label}</span>
                  <span className={`text-[12px] font-mono font-semibold ${accent ? "text-[#064E3B]" : "text-[#1C1917]"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              External Records
            </div>
            <div className="space-y-3">
              <a
                href={profile?.githubUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 text-[12px] font-mono text-[#1C1917] hover:text-[#064E3B] transition-colors ${!profile?.githubUrl ? "opacity-40 pointer-events-none" : ""}`}
              >
                <GitBranch className="h-3.5 w-3.5 shrink-0 text-[#78716C]" />
                GitHub Profile
                <ExternalLink className="h-2.5 w-2.5 ml-auto text-[#C8BFB0]" />
              </a>
              <a
                href={profile?.resumeUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 text-[12px] font-mono text-[#1C1917] hover:text-[#064E3B] transition-colors ${!profile?.resumeUrl ? "opacity-40 pointer-events-none" : ""}`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#78716C]" />
                External Resume
                <ExternalLink className="h-2.5 w-2.5 ml-auto text-[#C8BFB0]" />
              </a>
            </div>
          </div>

          {/* GitHub Archive Panel */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3 flex items-center justify-between">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                GitHub Archive
              </div>
              {githubSynced && (
                <div className="flex items-center gap-1 text-[9px] font-mono text-[#064E3B]">
                  <ShieldCheck className="h-2.5 w-2.5" />SYNCED
                </div>
              )}
            </div>
            <div className="p-5">
              {githubSynced ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Repositories</div>
                      <div className="text-[20px] font-serif text-[#1C1917]">{profile!.githubEvidence!.repoCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-[#78716C] uppercase tracking-wider mb-1">Commits</div>
                      <div className="text-[20px] font-serif text-[#1C1917]">~{profile!.githubEvidence!.totalCommits}</div>
                    </div>
                  </div>
                  {profile!.githubEvidence!.topLanguages?.length > 0 && (
                    <div>
                      <div className="text-[9px] font-mono text-[#78716C] uppercase tracking-wider mb-2">
                        Primary Languages
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {profile!.githubEvidence!.topLanguages.slice(0, 4).map((lang) => (
                          <span
                            key={lang}
                            className="text-[10px] font-mono bg-[#F5F1EB] border border-[#E7E2DA] text-[#1C1917] px-2 py-0.5"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleGithubSync}
                    disabled={isSyncingGithub}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-[#E7E2DA] text-[11px] font-mono text-[#1C1917] hover:bg-[#F5F1EB] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncingGithub ? "animate-spin" : ""}`} />
                    {isSyncingGithub ? "SYNCING…" : "RESYNC NOW"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[12px] font-sans text-[#78716C] leading-relaxed">
                    Connect your GitHub account to automatically import repository metrics and languages into your record.
                  </p>
                  {syncError && (
                    <p className="text-[11px] font-sans text-red-600 bg-red-50 border border-red-100 p-2">{syncError}</p>
                  )}
                  <button
                    onClick={handleGithubSync}
                    disabled={isSyncingGithub}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSyncingGithub ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <GitBranch className="h-3 w-3" />
                    )}
                    {isSyncingGithub ? "SYNCING…" : "SYNC GITHUB ACCOUNT"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


