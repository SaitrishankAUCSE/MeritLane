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
  Clock,
  Lock,
  ArrowRight,
  Briefcase,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/candidate/ProfileForm";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { InstitutionalResumeScanner } from "@/components/candidate/InstitutionalResumeScanner";
import { ParsedResumeProfile } from "@/lib/resume/parser";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import CooldownTimer from "@/components/candidate/cooldown-timer";
import { ProfilePhotoUploader } from "@/components/candidate/ProfilePhotoUploader";
import { CandidateAvatar, AvatarBadgeType } from "@/components/ui/CandidateAvatar";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [cooldowns, setCooldowns] = useState<Record<string, { timestamp: number; daysLeft: number; score?: number }>>({});

  // Resume Upload State at Top of Profile
  const [uploadingResume, setUploadingResume] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeProfile | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pendingDataRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && user) {
      Promise.all([
        fetchCandidateProfile(user.uid),
        getDoc(doc(db, "users", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
        getDoc(doc(db, "candidates", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
      ])
        .then(([p, uData, cData]) => {
          setProfile(p);
          if (p?.resumeFileName) setResumeFileName(p.resumeFileName);
          if (!p || !p.name || !p.skills || p.skills.length === 0) setIsEditing(true);

          const allSkills = p?.skills || [];
          const cd: Record<string, { timestamp: number; daysLeft: number; score?: number }> = {};
          const now = Date.now();
          const fourteenDays = 14 * 24 * 60 * 60 * 1000;

          allSkills.forEach((skill) => {
            let ts: number | null = null;
            let score: number | undefined = undefined;

            const fa = uData?.failedAssessments?.[skill] || cData?.failedAssessments?.[skill];
            if (fa) {
              ts =
                typeof fa?.toMillis === "function"
                  ? fa.toMillis()
                  : typeof fa === "number"
                  ? fa
                  : fa?.seconds
                  ? fa.seconds * 1000
                  : null;
            }
            if (uData?.failedAssessmentsScore?.[skill] !== undefined) {
              score = uData.failedAssessmentsScore[skill];
            } else if (cData?.failedAssessmentsScore?.[skill] !== undefined) {
              score = cData.failedAssessmentsScore[skill];
            }

            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`meritlane_cooldown_${user.uid}_${skill}`);
              if (stored) {
                const storedTs = parseInt(stored, 10);
                if (!ts || storedTs > ts) ts = storedTs;
              }
              const storedScore = localStorage.getItem(`meritlane_last_score_${user.uid}_${skill}`);
              if (storedScore !== null && score === undefined) {
                score = parseInt(storedScore, 10);
              }
            }

            if (ts) {
              const elapsed = now - ts;
              if (elapsed < fourteenDays) {
                const daysLeft = Math.max(1, Math.ceil((ts + fourteenDays - now) / 86400000));
                cd[skill] = { timestamp: ts, daysLeft, score };
              }
            }
          });

          setCooldowns(cd);
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
      setScannerError("Please upload an official PDF document (.pdf)");
      setScannerOpen(true);
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setScannerError("File size exceeds 12MB limit.");
      setScannerOpen(true);
      return;
    }

    setResumeFileName(file.name);
    setScannerOpen(true);
    setUploadingResume(true);
    setScannerError(null);
    setParsedData(null);
    pendingDataRef.current = null;

    try {
      const token = await user?.getIdToken(true);
      const data = new FormData();
      data.append("file", file);
      data.append("skills", JSON.stringify(profile?.skills || []));
      data.append("candidateName", profile?.name || user?.displayName || "");
      data.append("college", profile?.college || "");
      data.append("degree", profile?.degree || "");
      data.append("branch", profile?.branch || "");
      data.append("gradYear", profile?.gradYear || "");

      const res = await fetch("/api/candidate/ats-check", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to parse resume.");
      pendingDataRef.current = resData;
      if (resData.parsed) {
        const unifiedParsed: ParsedResumeProfile = {
          ...resData.parsed,
          name: (resData.parsed.name && resData.parsed.name !== "Candidate")
            ? resData.parsed.name
            : (profile?.name || user?.displayName || "Candidate"),
          college: resData.parsed.college || profile?.college || "",
          degree: resData.parsed.degree || profile?.degree || "",
          branch: resData.parsed.branch || profile?.branch || "",
          gradYear: resData.parsed.gradYear || profile?.gradYear || "",
        };
        setParsedData(unifiedParsed);
      }
    } catch (err: any) {
      console.error("Resume parse error:", err);
      setScannerError(err.message || "Failed to process resume.");
    } finally {
      setUploadingResume(false);
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
      name: (parsed.name && parsed.name !== "Candidate")
        ? parsed.name
        : (profile?.name && profile.name !== "Candidate" ? profile.name : (user?.displayName || "Candidate")),
      college: parsed.college || profile?.college || "",
      degree: parsed.degree || profile?.degree || "",
      branch: parsed.branch || profile?.branch || "",
      gradYear: parsed.gradYear || profile?.gradYear || "",
      githubUrl: parsed.githubUrl || profile?.githubUrl || "",
      resumeUrl: profile?.resumeUrl || "",
      resumeFileName: resumeFileName || profile?.resumeFileName || "Candidate_Resume.pdf",
      resumeUploadedAt: Date.now(),
      skills: Array.from(existingSkills),
      resumeText: data.extractedText || profile?.resumeText || "",
      atsScore: data.result?.score ?? profile?.atsScore,
      atsRating: data.result?.rating ?? profile?.atsRating,
      atsSummary: data.result?.summary ?? profile?.atsSummary,
      projects: profile?.projects || [],
      verificationStatus: profile?.verificationStatus || "draft",
      updatedAt: Date.now(),
    };

    try {
      await saveCandidateProfile(user.uid, updated);
      setProfile(updated);
    } catch (saveErr) {
      console.error("Error saving parsed profile:", saveErr);
    }
  };

  const openGithubModal = () => {
    let initialVal = profile?.githubUrl || "";
    if (!initialVal && profile?.githubEvidence?.githubUsername) {
      initialVal = `https://github.com/${profile.githubEvidence.githubUsername}`;
    }
    setGithubInput(initialVal);
    setSyncError(null);
    setIsGithubModalOpen(true);
  };

  const handleConfirmGithubSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    const cleanInput = githubInput.trim();
    if (!cleanInput) {
      setSyncError("Please enter your GitHub username or profile URL.");
      return;
    }

    setIsSyncingGithub(true);
    setSyncError(null);

    try {
      const idToken = await user.getIdToken();
      let targetUsername = cleanInput.replace(/\/+$/, "");
      const parts = targetUsername.split("/");
      targetUsername = parts[parts.length - 1];

      const fullUrl = cleanInput.startsWith("http")
        ? cleanInput
        : `https://github.com/${targetUsername}`;

      const res = await fetch("/api/candidate/github-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          githubUsername: targetUsername,
          githubUrl: fullUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect to GitHub. Please check the username.");

      // Also persist githubUrl and githubEvidence to profile in Firestore
      const updatedProfile: CandidateProfile = {
        ...profile!,
        githubUrl: fullUrl,
        githubEvidence: data.githubEvidence,
        updatedAt: Date.now()
      };
      await saveCandidateProfile(user.uid, updatedProfile);
      setProfile(updatedProfile);
      setIsGithubModalOpen(false);
    } catch (err: any) {
      setSyncError(err.message || "An error occurred while connecting to GitHub.");
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mx-auto h-full overflow-y-auto scrollbar-hide">
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
  // Platform Rule: Only award the career badge to candidates who completed ALL skills verifications
  const isEligibleForJob =
    skills.length > 0 && verifiedCount === skills.length;
  const atsScore = profile?.atsScore;
  const githubSynced = !!profile?.githubEvidence;

  const candidateKey = profile?.candidateKey || (user?.uid ? `ML-${user.uid.slice(0, 8).toUpperCase()}` : "—");

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">

      {/* ── Registry Command Header ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <CandidateAvatar
              avatarUrl={profile?.avatarUrl || user?.photoURL}
              name={name}
              size="xl"
              isEligibleForJob={isEligibleForJob}
              badgePreference="auto"
              showBadge={true}
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-medium tracking-[0.2em] text-[#78716C] uppercase">
                  Candidate Profile · Meritlane
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20">
                  ID: {candidateKey}
                </span>
              </div>
              <h1 className="font-serif text-[32px] sm:text-[38px] text-[#1C1917] font-bold tracking-tight leading-tight py-0.5">
                {name}
              </h1>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[13px] text-[#57534E] font-sans">
                {profile?.degree && <span>{profile.degree}</span>}
                {profile?.degree && profile?.branch && <span className="text-[#C8BFB0]">·</span>}
                {profile?.branch && <span>{profile.branch}</span>}
                {(profile?.degree || profile?.branch) && profile?.college && <span className="text-[#C8BFB0]">·</span>}
                {profile?.college && <span>{profile.college}</span>}
                {profile?.gradYear && (
                  <>
                    <span className="text-[#C8BFB0]">·</span>
                    <span className="font-mono text-[12px] text-[#78716C]">Class of {profile.gradYear}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#F5F1EB] text-[#1C1917] text-[11px] font-mono font-semibold transition-colors shrink-0 tracking-[0.06em] rounded shadow-2xs"
          >
            <PenTool className="h-3 w-3" />
            EDIT PROFILE
          </button>
        </div>
      </div>

      {/* Institutional Resume Scanner Modal */}
      <InstitutionalResumeScanner
        isOpen={scannerOpen}
        fileName={resumeFileName || profile?.resumeFileName || "resume.pdf"}
        parsedData={parsedData}
        currentProfileName={profile?.name || user?.displayName || undefined}
        currentProfileCollege={profile?.college}
        isAnalyzing={uploadingResume}
        error={scannerError}
        onComplete={handleScannerComplete}
        onClose={() => {
          setScannerOpen(false);
          setUploadingResume(false);
        }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Main Claims Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Top-of-Profile Resume Card (Active Resume vs Upload Dropzone) ── */}
          {profile?.resumeFileName || profile?.resumeText || (profile?.skills && profile.skills.length > 0) ? (
            /* Active Resume on Record Card */
            <div className="border border-[#E7E2DA] bg-white rounded p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded bg-[#064E3B]/10 border border-[#064E3B]/30 flex items-center justify-center text-[#064E3B] shrink-0">
                    <FileText className="h-5 w-5 text-[#064E3B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-semibold tracking-[0.16em] uppercase text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded border border-[#064E3B]/20">
                        Current Resume
                      </span>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        {profile?.resumeUploadedAt
                          ? `Updated on ${new Date(profile.resumeUploadedAt).toLocaleDateString()}`
                          : "Uploaded"}
                      </span>
                    </div>
                    <h2 className="font-serif text-[18px] sm:text-[20px] text-[#1C1917] font-semibold mt-1">
                      {profile?.resumeFileName || `${name.replace(/\s+/g, "_")}_Resume.pdf`}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${uploadingResume ? "animate-spin" : ""}`} />
                    <span>Update Resume</span>
                  </button>
                </div>
              </div>

              {/* Status summary banner */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded">
                  <div className="text-[10px] font-mono text-[#78716C] uppercase">Total Skills</div>
                  <div className="text-[14px] font-mono font-semibold text-[#1C1917] mt-0.5">
                    {skills.length} Skills Added
                  </div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded">
                  <div className="text-[10px] font-mono text-[#78716C] uppercase">Resume Score</div>
                  <div className="text-[14px] font-mono font-semibold text-[#064E3B] mt-0.5">
                    {profile?.atsScore ? `${profile.atsScore}/100 · ${profile.atsRating || "Evaluated"}` : "Score: Pending"}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded">
                  <div className="text-[10px] font-mono text-[#78716C] uppercase">Skill Tests</div>
                  <div className="text-[14px] font-mono font-semibold text-[#1C1917] mt-0.5">
                    {verifiedCount > 0 ? `${verifiedCount}/${skills.length} Tests Passed` : "No Tests Taken Yet"}
                  </div>
                </div>
              </div>

              {/* Hidden file input for resume replacement */}
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
            </div>
          ) : (
            /* First-Time Upload Dropzone */
            <div className="border border-[#E7E2DA] bg-white rounded p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#1C1917] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#78716C]">
                      Quick Setup
                    </div>
                    <h2 className="font-serif text-[18px] text-[#1C1917] font-semibold">
                      Add Details from Resume
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded w-fit">
                  PDF format · Up to 12MB
                </span>
              </div>

              <p className="text-[13px] font-sans text-[#78716C] mt-3 mb-4 leading-relaxed">
                Upload your resume to automatically add your education, skills, and projects to your profile. You can edit any details anytime and take quick skill tests to verify them.
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
                  Click to choose a file or drag your resume PDF here
                </div>
                <div className="text-[11px] font-mono text-[#A8A29E] mt-1">
                  Automatically fills your name, college, degree, graduation year, and skills
                </div>
              </div>
            </div>
          )}

          {/* ── Targeted Roles & Work Preferences Card ── */}
          <div className="border border-[#E7E2DA] bg-white rounded p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E2DA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#1C1917] shrink-0">
                  <Briefcase className="h-4 w-4 text-[#1C1917]" />
                </div>
                <div>
                  <h3 className="font-serif text-[16px] sm:text-[18px] text-[#1C1917] font-semibold">
                    Targeted Roles &amp; Work Preferences
                  </h3>
                  <p className="text-[11px] text-[#78716C] font-sans">
                    Visible to employers discovering verified candidates on Meritlane
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] font-mono font-semibold text-[#1C1917] hover:text-[#064E3B] border border-[#E7E2DA] hover:border-[#1C1917] bg-[#FAF8F5] px-3 py-1.5 rounded transition-colors shrink-0 cursor-pointer"
              >
                Edit Preferences
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Bio / Headline */}
              {profile?.bio && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[13px] text-[#1C1917] font-sans leading-relaxed">
                  &ldquo;{profile.bio}&rdquo;
                </div>
              )}

              {/* Target Roles */}
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1.5">
                  Targeted Engineering Roles
                </span>
                {profile?.targetRoles && profile.targetRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.targetRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917] px-2.5 py-1 rounded"
                      >
                        <Briefcase className="h-3 w-3 text-[#78716C]" />
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] font-sans text-[#78716C] flex items-center gap-2">
                    <span>No target roles specified yet.</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#064E3B] font-mono font-semibold text-[11px] hover:underline"
                    >
                      + Add Target Roles
                    </button>
                  </div>
                )}
              </div>

              {/* Preferred Locations, Working Model, and Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#F5F1EB]">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
                    Preferred Locations
                  </span>
                  {profile?.preferredLocations && profile.preferredLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.preferredLocations.map((loc) => (
                        <span key={loc} className="inline-flex items-center gap-1 text-[11px] font-mono bg-[#FAF8F5] border border-[#E7E2DA] text-[#1C1917] px-2 py-0.5 rounded">
                          <MapPin className="h-2.5 w-2.5 text-[#78716C]" />
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[12px] font-mono text-[#78716C]">Flexible / Open</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
                    Working Model
                  </span>
                  <span className="text-[12px] font-mono font-semibold text-[#1C1917] block">
                    {profile?.workPreference || "Remote / Flexible"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
                    Notice / Availability
                  </span>
                  <span className="text-[12px] font-mono font-semibold text-[#064E3B] block">
                    {profile?.availability || "Immediate"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Ledger Table */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3 flex items-center justify-between">
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
                Technical Skills
              </div>
              <div className="text-[9px] font-mono text-[#78716C]">
                {skills.length} {skills.length === 1 ? "skill" : "skills"}
              </div>
            </div>

            {/* Assessment requirement notice */}
            <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                Take a quick skill test to verify each skill and earn a verified badge.
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
                <div className="text-[15px] font-serif text-[#1C1917] mb-2">No skills added yet</div>
                <p className="text-[12px] font-sans text-[#78716C] mb-5">
                  Upload your resume above or add your skills to start testing and getting verified.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-mono font-semibold px-4 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors rounded"
                >
                  ADD SKILLS
                </button>
              </div>
            ) : (
              <>
                {/* Table head */}
                <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_8rem_8rem_9rem] border-b border-[#E7E2DA] bg-[#FAF8F5] px-5 py-2.5">
                  {["#", "Skill", "Status", "Score", "Action"].map((h) => (
                    <div key={h} className={`text-[9px] font-medium text-[#78716C] uppercase tracking-[0.18em] ${h === "Action" ? "text-right" : ""}`}>
                      {h}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {skills.map((skill, idx) => {
                  const v = profile?.verifiedSkills?.[skill];
                  const isVerified = v?.status === "verified";
                  const cdInfo = cooldowns[skill];
                  const inCooldown = !isVerified && !!cdInfo;
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
                            <ShieldCheck className="h-2.5 w-2.5" />Verified on public profile
                          </div>
                        )}
                        {inCooldown && (
                          <div className="mt-0.5">
                            <CooldownTimer
                              timestamp={cdInfo.timestamp}
                              durationDays={14}
                              variant="detail"
                              onExpire={() => {
                                setCooldowns((prev) => {
                                  const next = { ...prev };
                                  delete next[skill];
                                  return next;
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`inline-block text-[9px] font-medium font-semibold tracking-[0.16em] px-2 py-[3px] uppercase border ${
                          isVerified
                            ? "text-[#064E3B] bg-[#064E3B]/[0.08] border-[#064E3B]/30"
                            : inCooldown
                            ? "text-[#92400E] bg-[#FEF3C7] border-[#FDE68A]"
                            : "text-[#78716C] bg-[#F5F1EB] border-[#C8BFB0]"
                        }`}>
                          {isVerified ? "VERIFIED" : inCooldown ? "COOLDOWN" : "NOT TESTED"}
                        </span>
                      </div>
                      <div className="text-[13px] font-mono text-[#1C1917]">
                        {isVerified && v?.score ? (
                          `${v.score}%`
                        ) : inCooldown ? (
                          <span className="text-[#B42318] font-semibold">{cdInfo.score !== undefined ? `${cdInfo.score}% (Failed)` : "0% (Failed)"}</span>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="sm:flex sm:justify-end">
                        {isVerified ? (
                          <span className="text-[10px] font-mono text-[#064E3B] font-semibold">✓ Passed</span>
                        ) : inCooldown ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-2.5 py-1 rounded cursor-not-allowed select-none tabular-nums"
                            title="Assessment locked in mandatory cooldown"
                          >
                            <CooldownTimer
                              timestamp={cdInfo.timestamp}
                              durationDays={14}
                              variant="badge"
                              onExpire={() => {
                                setCooldowns((prev) => {
                                  const next = { ...prev };
                                  delete next[skill];
                                  return next;
                                });
                              }}
                            />
                          </span>
                        ) : (
                          <button
                            onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                            className="text-[10px] font-mono font-semibold text-white bg-[#1C1917] hover:bg-[#064E3B] px-3 py-1.5 transition-colors rounded shadow-2xs cursor-pointer"
                            title={`Take test to verify ${skill}`}
                          >
                            TAKE TEST →
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
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
                Education
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
                    <div className="text-[10px] font-medium text-[#78716C] uppercase tracking-[0.12em] mt-1.5">
                      Class of {profile.gradYear || "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[13px] font-sans text-[#78716C] mb-4">
                    No education details added yet.
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
                <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
                  Projects
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

          {/* Profile Photo & LinkedIn Badge Manager */}
          <ProfilePhotoUploader
            currentAvatarUrl={profile?.avatarUrl || user?.photoURL}
            name={name}
            isEligibleForJob={isEligibleForJob}
            verifiedCount={verifiedCount}
            totalSkillsCount={skills.length}
            currentBadgePreference={profile?.avatarBadge || "auto"}
            onAvatarUpdated={(newUrl, badgePref) => {
              setProfile((prev) =>
                prev ? { ...prev, avatarUrl: newUrl || undefined, avatarBadge: badgePref } : null
              );
            }}
          />

          {/* Record Status */}
          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
                Profile Overview
              </div>
            </div>
            <div className="divide-y divide-[#F0EDE8]">
              {[
                {
                  label: "Profile ID",
                  value: candidateKey,
                  accent: true,
                },
                {
                  label: "Skills Added",
                  value: String(skills.length),
                  accent: false,
                },
                {
                  label: "Skill Tests Passed",
                  value: String(verifiedCount),
                  accent: verifiedCount > 0,
                },
                {
                  label: "Resume Score",
                  value: atsScore !== undefined ? `${atsScore} / 100` : "—",
                  accent: atsScore !== undefined && atsScore >= 80,
                },
                {
                  label: "GitHub Account",
                  value: githubSynced ? "Connected" : "Not connected",
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
            <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Links
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
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
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
                      <div className="text-[9px] font-medium text-[#78716C] uppercase tracking-wider mb-1">Repositories</div>
                      <div className="text-[20px] font-serif text-[#1C1917]">{profile!.githubEvidence!.repoCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-medium text-[#78716C] uppercase tracking-wider mb-1">Commits</div>
                      <div className="text-[20px] font-serif text-[#1C1917]">~{profile!.githubEvidence!.totalCommits}</div>
                    </div>
                  </div>
                  {profile!.githubEvidence!.topLanguages?.length > 0 && (
                    <div>
                      <div className="text-[9px] font-medium text-[#78716C] uppercase tracking-wider mb-2">
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
                    onClick={openGithubModal}
                    disabled={isSyncingGithub}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-[#E7E2DA] text-[11px] font-mono text-[#1C1917] hover:bg-[#F5F1EB] transition-colors disabled:opacity-50 cursor-pointer"
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
                    onClick={openGithubModal}
                    disabled={isSyncingGithub}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* ── Connect GitHub Account Connectivity Modal ── */}
      {isGithubModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white border border-[#E7E2DA] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
            <div className="p-5 border-b border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1C1917]">Connect GitHub Account</h3>
                  <p className="text-[11px] font-mono text-[#78716C]">MeritLane Provenance &amp; Code Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGithubModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center text-[#78716C] hover:text-[#1C1917] rounded hover:bg-[#E7E2DA]/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmGithubSync} className="p-5 space-y-4">
              <p className="text-[13px] text-[#44403C] leading-relaxed">
                Connect your GitHub profile to import your repositories, top programming languages, and verified commit metrics into your candidate record.
              </p>

              <div>
                <label className="block text-[12px] font-mono font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  GitHub Username or Profile URL *
                </label>
                <input
                  type="text"
                  required
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="e.g. SaitrishankAUCSE or https://github.com/SaitrishankAUCSE"
                  className="w-full h-11 px-3.5 bg-white border border-[#E7E2DA] rounded text-[13px] font-mono text-[#1C1917] focus:outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all"
                />
                <p className="text-[11px] text-[#78716C] mt-1 font-mono">
                  We verify your public repositories and contributions in real-time.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-3 space-y-2 text-[12px] text-[#44403C]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]">
                  What will be synced:
                </div>
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                  <span>Public repositories &amp; commit frequency</span>
                </div>
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                  <span>Language distribution breakdown</span>
                </div>
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
                  <span>Verified GitHub badge on public record</span>
                </div>
              </div>

              {syncError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded text-[12px] text-[#B42318] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{syncError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setIsGithubModalOpen(false)}
                  disabled={isSyncingGithub}
                  className="px-4 py-2 border border-[#E7E2DA] hover:bg-[#F5F1EB] text-[#1C1917] text-[12px] font-mono font-medium rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncingGithub}
                  className="px-5 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-mono font-semibold rounded transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSyncingGithub ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Connecting &amp; Syncing…</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>Connect &amp; Sync GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


