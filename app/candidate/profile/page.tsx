"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, saveCandidateProfile, CandidateProfile, getCachedCandidateProfile } from "@/lib/firebase/candidate";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  GitBranch,
  RefreshCw,
  PenTool,
  ExternalLink,
  BookOpen,
  FileText,
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Lock,
  ArrowRight,
  Briefcase,
  MapPin,
  Download,
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
import { CandidateAvatar, AvatarBadgeType } from "@/components/ui/CandidateAvatar";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(() => {
    if (typeof window !== "undefined" && user?.uid) {
      const cached = getCachedCandidateProfile(user.uid);
      if (cached) return cached;
    }
    return null;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(() => {
    if (typeof window !== "undefined" && user?.uid) {
      return !getCachedCandidateProfile(user.uid);
    }
    return true;
  });
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [cooldowns, setCooldowns] = useState<Record<string, { timestamp: number; daysLeft: number; score?: number }>>({});
  const [supportedSkills, setSupportedSkills] = useState<{keys: string[], aliases: string[]} | null>(null);

  // Resume Upload State at Top of Profile
  const [uploadingResume, setUploadingResume] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeProfile | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>(() => {
    if (user?.uid) {
      const cached = getCachedCandidateProfile(user.uid);
      if (cached?.resumeFileName) return cached.resumeFileName;
    }
    return "";
  });
  const lastUploadedFileNameRef = useRef<string>("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pendingDataRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && user) {
      Promise.all([
        fetchCandidateProfile(user.uid),
        getDoc(doc(db, "users", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
        getDoc(doc(db, "candidates", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
        fetch("/api/candidate/supported-skills").then(res => res.json()).catch(() => null)
      ])
        .then(([p, uData, cData, ssData]) => {
          setProfile(p);
          if (ssData && ssData.keys) setSupportedSkills(ssData);
          if (p && typeof window !== "undefined") {
            try {
              localStorage.setItem("meritlane_current_candidate", JSON.stringify({
                name: p.name || uData?.name || user?.displayName || "Candidate",
                avatarUrl: p.avatarUrl || uData?.avatarUrl || user?.photoURL || "",
              }));
              window.dispatchEvent(
                new CustomEvent("meritlane-profile-updated", {
                  detail: {
                    name: p.name || uData?.name || user?.displayName || "Candidate",
                    avatarUrl: p.avatarUrl || uData?.avatarUrl || user?.photoURL || "",
                  },
                })
              );
            } catch {}
          }
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
      router.push("/");
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

    lastUploadedFileNameRef.current = file.name;
    setResumeFileName(file.name);
    setScannerOpen(true);
    setUploadingResume(true);
    setScannerError(null);
    setParsedData(null);
    pendingDataRef.current = null;

    try {
      const token = await user?.getIdToken();
      const data = new FormData();
      data.append("file", file);
      data.append("fileName", file.name);
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

    const exactFileName = lastUploadedFileNameRef.current || data.resumeFileName || resumeFileName || profile?.resumeFileName || "Candidate_Resume.pdf";
    setResumeFileName(exactFileName);

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
      resumeUrl: data.resumeUrl || profile?.resumeUrl || "",
      resumeFileName: exactFileName,
      resumeUploadedAt: Date.now(),
      resumePdfDataUrl: data.resumePdfDataUrl || profile?.resumePdfDataUrl || "",
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
        <p className="text-[13px] font-mono">Loading identity record…</p>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full min-h-full bg-transparent pb-24 text-[#101010]"
      >
        {/* ── Flush Header Strip ── */}
        <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase mb-1">
                Candidate Profile · Meritlane
              </div>
              <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#101010] tracking-[-0.03em] leading-tight">
                {profile?.name ? "Edit Your Profile" : "Create Your Profile"}
              </h1>
              <p className="text-[13px] text-[#737373] font-sans mt-0.5">
                Upload your resume to automatically fill your technical background, or update your information below.
              </p>
            </div>
            {profile?.name && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] text-xs font-medium px-4 py-2 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <ProfileForm
            initialData={profile}
            onSave={handleSave}
            onCancel={profile?.name ? () => setIsEditing(false) : undefined}
            isNew={!profile?.name}
          />
        </div>
      </motion.div>
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

  const isSkillSupported = (skill: string) => {
    if (!supportedSkills) return true; // optimistic if not loaded
    const normalized = skill.toLowerCase().trim();
    if (supportedSkills.keys.includes(normalized) || supportedSkills.aliases.includes(normalized)) return true;
    return supportedSkills.keys.some(key => normalized.includes(key));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full min-h-full bg-transparent pb-24"
    >

      {/* ── Registry Command Header ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-6">
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
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                  Candidate Profile · Meritlane
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                  ID: {candidateKey}
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[38px] text-[#101010] font-semibold tracking-[-0.035em] leading-tight py-0.5">
                {name}
              </h1>
              <div className="mt-1 flex items-center gap-2 flex-wrap text-[13px] text-[#737373] font-sans">
                {profile?.degree && <span>{profile.degree}</span>}
                {profile?.degree && profile?.branch && <span className="text-black/20">·</span>}
                {profile?.branch && <span>{profile.branch}</span>}
                {(profile?.degree || profile?.branch) && profile?.college && <span className="text-black/20">·</span>}
                {profile?.college && <span>{profile.college}</span>}
                {profile?.gradYear && (
                  <>
                    <span className="text-black/20">·</span>
                    <span className="font-mono text-[12px] text-[#737373]">Class of {profile.gradYear}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-5 py-2.5 transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PenTool className="h-3.5 w-3.5" />
            Edit Profile
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
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] shrink-0">
                    <FileText className="h-5 w-5 text-[#101010]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-medium tracking-[0.14em] uppercase text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                        Current Resume
                      </span>
                      <span className="text-[11px] font-mono text-[#737373]">
                        {profile?.resumeUploadedAt
                          ? `Updated on ${new Date(profile.resumeUploadedAt).toLocaleDateString()}`
                          : "Uploaded"}
                      </span>
                    </div>
                    <h2 className="text-[18px] sm:text-[20px] text-[#101010] font-semibold tracking-[-0.02em] mt-1">
                      {profile?.resumeFileName || resumeFileName || "Candidate_Resume.pdf"}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {(profile?.resumePdfDataUrl || (profile?.resumeUrl && profile.resumeUrl.toLowerCase().includes(".pdf"))) && (
                    <a
                      href={profile.resumePdfDataUrl || profile.resumeUrl}
                      download={profile?.resumeFileName || resumeFileName || "Candidate_Resume.pdf"}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] text-xs font-medium px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download Current Resume"
                    >
                      <Download className="h-3.5 w-3.5 text-[#101010]" />
                      <span>Download</span>
                    </a>
                  )}
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-4 py-2 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${uploadingResume ? "animate-spin" : ""}`} />
                    <span>Update Resume</span>
                  </button>
                </div>
              </div>

              {/* Status summary banner */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#FAFAF9] border border-black/[0.06] rounded-xl">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Total Skills</div>
                  <div className="text-[14px] font-mono font-semibold text-[#101010] mt-0.5">
                    {skills.length} Skills Added
                  </div>
                </div>
                <div className="p-3.5 bg-[#FAFAF9] border border-black/[0.06] rounded-xl">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Resume Score</div>
                  <div className="text-[14px] font-mono font-semibold text-[#101010] mt-0.5">
                    {profile?.atsScore ? `${profile.atsScore}/100 · ${profile.atsRating || "Evaluated"}` : "Score: Pending"}
                  </div>
                </div>
                <div className="p-3.5 bg-[#FAFAF9] border border-black/[0.06] rounded-xl">
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Skill Tests</div>
                  <div className="text-[14px] font-mono font-semibold text-[#101010] mt-0.5">
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
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#737373]">
                      Quick Setup
                    </div>
                    <h2 className="text-[18px] text-[#101010] font-semibold tracking-[-0.02em]">
                      Add Details from Resume
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#737373] bg-[#FAFAF9] border border-black/[0.06] px-3 py-1 rounded-full w-fit">
                  PDF format · Up to 12MB
                </span>
              </div>

              <p className="text-[13px] font-sans text-[#737373] mt-3 mb-4 leading-relaxed">
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
                className="border-2 border-dashed border-black/[0.12] hover:border-black/30 bg-[#FAFAF9] hover:bg-black/[0.02] rounded-xl p-6 text-center transition-all cursor-pointer"
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
                <UploadCloud className="h-7 w-7 text-[#737373] mx-auto mb-2" />
                <div className="text-[13px] font-medium text-[#101010]">
                  Click to choose a file or drag your resume PDF here
                </div>
                <div className="text-[11px] font-mono text-[#737373] mt-1">
                  Automatically fills your name, college, degree, graduation year, and skills
                </div>
              </div>
            </div>
          )}

          {/* ── Targeted Roles & Work Preferences Card ── */}
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-[#101010] shrink-0">
                  <Briefcase className="h-4 w-4 text-[#101010]" />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[18px] text-[#101010] font-semibold tracking-[-0.02em]">
                    Targeted Roles &amp; Work Preferences
                  </h3>
                  <p className="text-[11px] text-[#737373] font-sans">
                    Visible to employers discovering verified candidates on Meritlane
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] text-xs font-medium px-3.5 py-1.5 transition-all shrink-0 cursor-pointer"
              >
                Edit Preferences
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Bio / Headline */}
              {profile?.bio && (
                <div className="p-3.5 bg-[#FAFAF9] border border-black/[0.06] rounded-xl text-[13px] text-[#101010] font-sans leading-relaxed">
                  &ldquo;{profile.bio}&rdquo;
                </div>
              )}

              {/* Target Roles */}
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#737373] block mb-1.5">
                  Targeted Engineering Roles
                </span>
                {profile?.targetRoles && profile.targetRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.targetRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium bg-[#FAFAF9] border border-black/[0.08] text-[#101010] px-3 py-1 rounded-full"
                      >
                        <Briefcase className="h-3 w-3 text-[#737373]" />
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] font-sans text-[#737373] flex items-center gap-2">
                    <span>No target roles specified yet.</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#101010] font-medium text-[11px] hover:underline"
                    >
                      + Add Target Roles
                    </button>
                  </div>
                )}
              </div>

              {/* Preferred Locations, Working Model, and Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-black/[0.06]">
                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#737373] block mb-1">
                    Preferred Locations
                  </span>
                  {profile?.preferredLocations && profile.preferredLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.preferredLocations.map((loc) => (
                        <span key={loc} className="inline-flex items-center gap-1 text-[11px] font-mono bg-[#FAFAF9] border border-black/[0.08] text-[#101010] px-2.5 py-0.5 rounded-full">
                          <MapPin className="h-2.5 w-2.5 text-[#737373]" />
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[12px] font-mono text-[#737373]">Flexible / Open</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#737373] block mb-1">
                    Working Model
                  </span>
                  <span className="text-[12px] font-mono font-semibold text-[#101010] block">
                    {profile?.workPreference || "Remote / Flexible"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#737373] block mb-1">
                    Notice / Availability
                  </span>
                  <span className="text-[12px] font-mono font-semibold text-emerald-700 block">
                    {profile?.availability || "Immediate"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Ledger Table */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-3.5 flex items-center justify-between">
              <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                Technical Skills
              </div>
              <div className="text-[10px] font-mono text-[#737373]">
                {skills.length} {skills.length === 1 ? "skill" : "skills"}
              </div>
            </div>

            {skills.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-[16px] text-[#101010] font-semibold mb-2">No skills added yet</div>
                <p className="text-[13px] font-sans text-[#737373] mb-5">
                  Upload your resume above or add your skills to start testing and getting verified.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-5 py-2 transition-all shadow-xs"
                >
                  Add Skills
                </button>
              </div>
            ) : (
              <>
                {/* Table head */}
                <div className="hidden sm:grid sm:grid-cols-[2.5rem_1fr_8rem_7rem_8rem] border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-2.5">
                  {["#", "Skill", "Status", "Score", "Action"].map((h) => (
                    <div key={h} className={`text-[10px] font-medium text-[#737373] uppercase tracking-[0.14em] ${h === "Action" ? "text-right" : ""}`}>
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
                      className={`sm:grid sm:grid-cols-[2.5rem_1fr_8rem_7rem_8rem] flex flex-col gap-1 sm:gap-0 items-start sm:items-center px-6 py-4 border-b border-black/[0.06] last:border-b-0 transition-colors ${
                        isVerified ? "bg-emerald-500/[0.02]" : "bg-white hover:bg-black/[0.01]"
                      }`}
                    >
                      <div className="hidden sm:block text-[11px] font-mono text-[#A3A3A3]">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#101010]">{skill}</div>
                        {isVerified && (
                          <div className="text-[11px] font-mono text-emerald-700 mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />Verified on public record
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
                        <span className={`inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                          isVerified
                            ? "text-emerald-800 bg-emerald-500/10 border-emerald-500/20"
                            : inCooldown
                            ? "text-amber-800 bg-amber-500/10 border-amber-500/20"
                            : "text-[#737373] bg-black/[0.04] border-black/[0.08]"
                        }`}>
                          {isVerified ? "Verified" : inCooldown ? "Cooldown" : "Not Tested"}
                        </span>
                      </div>
                      <div className="text-[13px] font-mono text-[#101010]">
                        {isVerified && v?.score ? (
                          `${v.score}%`
                        ) : inCooldown ? (
                          <span className="text-red-600 font-medium">{cdInfo.score !== undefined ? `${cdInfo.score}% (Failed)` : "0% (Failed)"}</span>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="sm:flex sm:justify-end">
                        {isVerified ? (
                          <span className="text-[11px] font-mono text-emerald-700 font-medium">✓ Passed</span>
                        ) : inCooldown ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-800 px-2.5 py-1 rounded-full cursor-not-allowed select-none tabular-nums"
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
                          isSkillSupported(skill) ? (
                            <button
                              onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                              className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-4 py-1.5 transition-all shadow-xs cursor-pointer"
                              title={`Take test to verify ${skill}`}
                            >
                              Take Test →
                            </button>
                          ) : (
                            <span
                              title="Assessment currently in development"
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-black/[0.04] border border-black/[0.08] text-[#737373] px-2.5 py-1 rounded-full cursor-not-allowed select-none tabular-nums"
                            >
                              In Development
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Education Record */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-3.5">
              <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                Education
              </div>
            </div>
            <div className="p-6">
              {profile?.college ? (
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl border border-black/[0.08] bg-black/[0.04] flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-[#101010]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-[#101010] tracking-[-0.01em] mb-1">{profile.college}</div>
                    <div className="text-[13px] font-sans text-[#737373]">
                      {profile.degree && `${profile.degree} · `}{profile.branch || "Computer Science"}
                    </div>
                    <div className="text-[11px] font-mono text-[#737373] mt-1.5">
                      Class of {profile.gradYear || "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[13px] font-sans text-[#737373] mb-4">
                    No education details added yet.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] px-4 py-2 text-xs font-medium transition-all"
                  >
                    Add Education
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          {profile?.projects && profile.projects.length > 0 && (
            <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-3.5">
                <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                  Projects
                </div>
              </div>
              <div className="divide-y divide-black/[0.06]">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="p-6">
                    <div className="text-[15px] font-semibold text-[#101010] mb-1">{proj.title}</div>
                    <div className="text-[13px] font-sans text-[#737373] leading-relaxed">{proj.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Record Status Panel ── */}
        <div className="space-y-6">
          {/* Record Status */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-3.5 flex items-center justify-between">
              <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                Profile Overview
              </div>
              {isEligibleForJob && (
                <span className="text-[10px] font-mono text-emerald-800 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Career Badge Active
                </span>
              )}
            </div>
            <div className="divide-y divide-black/[0.06]">
              {[
                {
                  label: "Candidate ID",
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
                <div key={label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-[12px] font-sans text-[#737373]">{label}</span>
                  <span className={`text-[12px] font-mono font-medium ${accent ? "text-[#101010]" : "text-[#737373]"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {skills.length > 0 && (
              <div className="p-4 bg-[#FAFAF9] border-t border-black/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#737373] uppercase">Skills Verification</span>
                  <span className="font-semibold text-[#101010]">{verifiedCount} / {skills.length} Verified</span>
                </div>
                <p className="text-[11px] text-[#737373] leading-relaxed font-sans">
                  Career badge is awarded automatically once all skills assessments are verified (≥75% score).
                </p>
              </div>
            )}
          </div>

          {/* External Links */}
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase mb-3.5">
              Links
            </div>
            <div className="space-y-3">
              <a
                href={profile?.githubUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 text-[13px] font-medium text-[#101010] hover:text-black/70 transition-colors ${!profile?.githubUrl ? "opacity-40 pointer-events-none" : ""}`}
              >
                <GitBranch className="h-4 w-4 shrink-0 text-[#737373]" />
                GitHub Profile
                <ExternalLink className="h-3 w-3 ml-auto text-black/30" />
              </a>
              {(profile?.portfolioUrl || (profile?.resumeUrl && (profile.resumeUrl.includes("portfolio") || profile.resumeUrl.includes("vercel.app")))) && (
                <a
                  href={profile?.portfolioUrl || profile?.resumeUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[13px] font-medium text-[#101010] hover:text-black/70 transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#737373]" />
                  Portfolio Website
                  <ExternalLink className="h-3 w-3 ml-auto text-black/30" />
                </a>
              )}
              {profile?.resumeUrl && (!profile.resumeUrl.includes("portfolio") && !profile.resumeUrl.includes("vercel.app")) && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[13px] font-medium text-[#101010] hover:text-black/70 transition-colors"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#737373]" />
                  Resume Document
                  <ExternalLink className="h-3 w-3 ml-auto text-black/30" />
                </a>
              )}
            </div>
          </div>

          {/* GitHub Archive Panel */}
          <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="border-b border-black/[0.06] bg-[#FAFAF9] px-6 py-3.5 flex items-center justify-between">
              <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase">
                GitHub Archive
              </div>
              {githubSynced && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 font-medium">
                  <ShieldCheck className="h-3 w-3" />SYNCED
                </div>
              )}
            </div>
            <div className="p-6">
              {githubSynced ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mb-1">Repositories</div>
                      <div className="text-[22px] font-semibold text-[#101010] tracking-tight">{profile!.githubEvidence!.repoCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mb-1">Commits</div>
                      <div className="text-[22px] font-semibold text-[#101010] tracking-tight">~{profile!.githubEvidence!.totalCommits}</div>
                    </div>
                  </div>
                  {profile!.githubEvidence!.topLanguages?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mb-2">
                        Primary Languages
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {profile!.githubEvidence!.topLanguages.slice(0, 4).map((lang) => (
                          <span
                            key={lang}
                            className="text-[11px] font-mono bg-[#FAFAF9] border border-black/[0.08] text-[#101010] px-2.5 py-0.5 rounded-full"
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-xs font-medium text-[#101010] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncingGithub ? "animate-spin" : ""}`} />
                    {isSyncingGithub ? "Syncing…" : "Resync Now"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] font-sans text-[#737373] leading-relaxed">
                    Connect your GitHub account to automatically import repository metrics and languages into your record.
                  </p>
                  {syncError && (
                    <p className="text-[12px] font-sans text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">{syncError}</p>
                  )}
                  <button
                    onClick={openGithubModal}
                    disabled={isSyncingGithub}
                    className="w-full rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium py-2.5 px-4 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingGithub ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <GitBranch className="h-3.5 w-3.5" />
                    )}
                    {isSyncingGithub ? "Syncing…" : "Sync GitHub Account"}
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
          <div className="w-full max-w-md bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
            <div className="p-6 border-b border-black/[0.06] bg-[#FAFAF9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#101010] text-white flex items-center justify-center">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#101010] tracking-[-0.01em]">Connect GitHub Account</h3>
                  <p className="text-[11px] font-mono text-[#737373]">MeritLane Provenance &amp; Code Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGithubModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center text-[#737373] hover:text-[#101010] rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmGithubSync} className="p-6 space-y-4">
              <p className="text-[13px] text-[#737373] leading-relaxed">
                Connect your GitHub profile to import your repositories, top programming languages, and verified commit metrics into your candidate record.
              </p>

              <div>
                <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#101010] mb-1.5">
                  GitHub Username or Profile URL *
                </label>
                <input
                  type="text"
                  required
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="e.g. SaitrishankAUCSE or https://github.com/SaitrishankAUCSE"
                  className="w-full h-11 px-3.5 bg-[#FAFAF9] border border-black/[0.1] rounded-xl text-[13px] font-mono text-[#101010] focus:outline-none focus:bg-white focus:border-[#101010] focus:ring-1 focus:ring-[#101010] transition-all"
                />
                <p className="text-[11px] text-[#737373] mt-1 font-mono">
                  We verify your public repositories and contributions in real-time.
                </p>
              </div>

              <div className="bg-[#FAFAF9] border border-black/[0.06] rounded-xl p-3.5 space-y-2 text-[12px] text-[#525252]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#101010]">
                  What will be synced:
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Public repositories &amp; commit frequency</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Language distribution breakdown</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Verified GitHub badge on public record</span>
                </div>
              </div>

              {syncError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{syncError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsGithubModalOpen(false)}
                  disabled={isSyncingGithub}
                  className="rounded-full border border-black/[0.12] bg-white hover:bg-black/[0.04] text-[#101010] text-xs font-medium px-4 py-2 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncingGithub}
                  className="rounded-full bg-[#101010] hover:bg-black/90 text-white text-xs font-medium px-5 py-2.5 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
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
    </motion.div>
  );
}


