"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchCandidateProfile, CandidateProfile, ProjectEntry } from "@/lib/firebase/candidate";
import {
  FileCheck,
  Code,
  FolderOpen,
  ArrowRight,
  X,
  CheckCircle2,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Activity,
  FileText,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  Calendar,
  Lock,
  ChevronRight,
  Database
} from "lucide-react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ContextGuide } from "@/components/ui/ContextGuide";
import CooldownTimer from "@/components/candidate/cooldown-timer";

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "artifacts" | "provenance">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, { timestamp: number; daysLeft: number; score?: number }>>({});

  const [newProject, setNewProject] = useState<Partial<ProjectEntry>>({
    title: "",
    repoUrl: "",
    liveUrl: "",
    description: "",
    supportsClaim: "",
    skillsUsed: []
  });

  useEffect(() => {
    if (!loading && user) {
      Promise.all([
        fetchCandidateProfile(user.uid),
        getDoc(doc(db, "users", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
        getDoc(doc(db, "candidates", user.uid)).then((d) => (d.exists() ? d.data() : null)).catch(() => null),
      ])
        .then(([p, uData, cData]) => {
          setProfile(p);
          if (p?.skills && p.skills.length > 0) {
            setNewProject((prev) => ({ ...prev, supportsClaim: p.skills[0] }));
          }

          const allSkills = p?.skills || [];
          const cd: Record<string, { timestamp: number; daysLeft: number; score?: number }> = {};
          const now = Date.now();
          const fourteenDays = 14 * 24 * 60 * 60 * 1000;

          allSkills.forEach((skill) => {
            let ts: number | null = null;
            let score: number | undefined = undefined;

            // Check users or candidates collections in firestore
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

            // Check localStorage fallback for immediate responsiveness
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
        })
        .catch((err) => console.error(err));
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const skills = profile?.skills || [];
  const projects = profile?.projects || [];
  const verifiedSkillsCount = Object.values(profile?.verifiedSkills || {}).filter(
    (v: any) => v.status === "verified" && (v.score === undefined || v.score >= 75)
  ).length;
  const requiredForEmployerPortal = Math.max(1, Math.ceil(skills.length / 2));
  const isEmployerPortalUnlocked = skills.length > 0 && verifiedSkillsCount >= requiredForEmployerPortal;

  // Calculate evidence health index (0 to 100)
  const skillFactor = skills.length > 0 ? (verifiedSkillsCount / skills.length) * 50 : 0;
  const projectFactor = Math.min(30, (projects.length / Math.max(1, skills.length)) * 30);
  const gitFactor = profile?.githubEvidence ? 20 : 0;
  const healthIndex = Math.min(100, Math.round(skillFactor + projectFactor + gitFactor));

  const handleCopyPublicLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/p/${user.uid}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    if (!newProject.title || !newProject.repoUrl) {
      setErrorMsg("Title and Repository URL are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const finalSkills = (newProject.skillsUsed && newProject.skillsUsed.length > 0)
        ? newProject.skillsUsed
        : (newProject.supportsClaim ? [newProject.supportsClaim] : (skills[0] ? [skills[0]] : []));

      const projectToAdd: ProjectEntry = {
        id: Date.now().toString(),
        title: newProject.title || "",
        repoUrl: newProject.repoUrl || "",
        liveUrl: newProject.liveUrl || "",
        description: newProject.description || "",
        supportsClaim: finalSkills[0] || newProject.supportsClaim || "",
        skillsUsed: finalSkills
      };

      const updatedProjects = [...projects, projectToAdd];
      await updateDoc(doc(db, "candidates", user.uid), {
        projects: updatedProjects,
        updatedAt: Date.now()
      });

      setProfile({ ...profile, projects: updatedProjects });
      setIsModalOpen(false);
      setNewProject({ title: "", repoUrl: "", liveUrl: "", description: "", supportsClaim: skills[0] || "", skillsUsed: [] });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save evidence.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEvidence = async (idToRemove: string) => {
    if (!user || !profile) return;
    try {
      const updatedProjects = projects.filter(p => p.id !== idToRemove);
      await updateDoc(doc(db, "candidates", user.uid), {
        projects: updatedProjects,
        updatedAt: Date.now()
      });
      setProfile({ ...profile, projects: updatedProjects });
    } catch (err) {
      console.error("Failed to remove evidence", err);
    }
  };

  if (loading && !user) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24 text-[#1C1917] font-sans">
      
      {/* ── Registry Command Header (Full Width Strip) ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <span className="text-[10px] font-medium tracking-[0.2em] text-[#78716C] uppercase">
                Projects &amp; Evidence · Meritlane
              </span>
              <span className="text-[11px] font-mono font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20">
                ID: #{user?.uid.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[11px] text-[#78716C] font-mono">
                · Employer Discovery: {isEmployerPortalUnlocked ? "Unlocked" : `${verifiedSkillsCount}/${requiredForEmployerPortal} (50% needed)`}
              </span>
            </div>

            <h1 className="font-serif text-[32px] sm:text-[38px] text-[#1C1917] font-bold tracking-tight leading-tight py-0.5">
              {profile?.name || "Candidate Profile"}
            </h1>

            {(profile?.college || profile?.branch) && (
              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[13px] text-[#57534E] font-sans">
                <GraduationCap className="h-4 w-4 text-[#064E3B]" />
                {profile.branch && <span className="font-medium text-[#1C1917]">{profile.branch}</span>}
                {profile.branch && profile.college ? <span className="text-[#C8BFB0]">·</span> : null}
                {profile.college && <span>{profile.college}</span>}
                {profile.gradYear ? (
                  <>
                    <span className="text-[#C8BFB0]">·</span>
                    <span className="font-mono text-[12px] text-[#78716C]">Class of {profile.gradYear}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick Actions & Public Dossier Copy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyPublicLink}
              className="flex items-center justify-center gap-2 px-4 h-9 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[#1C1917] rounded text-[13px] font-medium transition-colors shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-[#064E3B]" />
                  <span>Public Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#78716C]" />
                  <span>Copy Public Profile Link</span>
                </>
              )}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 h-9 bg-[#064E3B] text-white hover:bg-[#043327] rounded text-[13px] font-medium transition-colors shadow-2xs"
            >
              <span>+</span> Add Project
            </motion.button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Context Guide */}
        <ContextGuide 
          storageKey="candidate_dashboard"
          title="Your Projects & Proof"
          steps={[
            { title: "Add Skills", isCompleted: true },
            { title: "Add Projects", isCompleted: projects.length > 0 },
            { title: "Pass Skill Tests", isCompleted: verifiedSkillsCount > 0 }
          ]}
          ctaLabel="Take Skill Test"
          ctaHref="/candidate/verification"
        />

        {/* 4-Pillar Telemetry Grid */}
        <div className="border border-[#E7E2DA] bg-white rounded shadow-2xs overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E2DA]">
            
            {/* 1. Evidence Health */}
            <div className="p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
                <span>Profile Strength</span>
                <Activity className="h-3.5 w-3.5 text-[#064E3B]" />
              </div>
              <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
                {healthIndex}%
              </div>
              <div className="w-full bg-[#E7E2DA] h-1.5 rounded overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthIndex}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="bg-[#064E3B] h-full"
                />
              </div>
              <div className="text-[11.5px] font-sans text-[#78716C]">
                {healthIndex >= 80 ? "Your profile is in great shape!" : "Pass skill tests to reach verified status"}
              </div>
            </div>

            {/* 2. Verified Assessments */}
            <div className="p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-[#064E3B] mb-1.5">
                <span>Verified Skills</span>
                <ShieldCheck className="h-3.5 w-3.5 text-[#064E3B]" />
              </div>
              <div className="text-[28px] font-serif text-[#064E3B] leading-tight mb-2">
                {verifiedSkillsCount} / {skills.length || 0}
              </div>
              <div className="text-[11.5px] font-sans text-[#78716C]">
                {isEmployerPortalUnlocked
                  ? "✓ 50% Milestone Met (Visible to Employers)"
                  : `${verifiedSkillsCount}/${requiredForEmployerPortal} with ≥75% (Reach 50% to unlock)`}
              </div>
            </div>

            {/* 3. Git Provenance */}
            <div className="p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
                <span>GitHub Commits</span>
                <GitBranch className="h-3.5 w-3.5 text-[#1C1917]" />
              </div>
              <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
                {profile?.githubEvidence?.totalCommits || 0}
              </div>
              <div className="text-[11.5px] font-sans text-[#78716C]">
                {profile?.githubEvidence
                  ? `Across ${profile.githubEvidence.repoCount} repositories`
                  : "GitHub not connected"}
              </div>
            </div>

            {/* 4. ATS Keyword Match */}
            <div className="p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
                <span>Resume Score</span>
                <FileText className="h-3.5 w-3.5 text-[#78716C]" />
              </div>
              <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
                {typeof profile?.atsScore === "number" ? `${profile.atsScore}/100` : "Not scored"}
              </div>
              <div className="text-[11.5px] font-sans text-[#78716C]">
                {profile?.atsRating ? `${profile.atsRating} match rating` : "Upload resume in Profile"}
              </div>
            </div>

          </div>
        </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E2DA] mb-8 pb-px">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3.5 px-4 text-[13px] font-medium transition-all relative ${
            activeTab === "matrix"
              ? "text-[#064E3B] font-semibold"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Skills</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#FAF8F5] border border-[#E7E2DA]">
            {skills.length}
          </span>
          {activeTab === "matrix" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064E3B]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("artifacts")}
          className={`pb-3.5 px-4 text-[13px] font-medium transition-all relative ${
            activeTab === "artifacts"
              ? "text-[#064E3B] font-semibold"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>Projects</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#FAF8F5] border border-[#E7E2DA]">
            {projects.length}
          </span>
          {activeTab === "artifacts" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064E3B]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("provenance")}
          className={`pb-3.5 px-4 text-[13px] font-medium transition-all relative ${
            activeTab === "provenance"
              ? "text-[#064E3B] font-semibold"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <span>GitHub Activity</span>
          {activeTab === "provenance" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064E3B]"
            />
          )}
        </button>
      </div>

      {/* Tab 1: Competency Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E2DA] rounded shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#E7E2DA] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-serif text-[#1C1917] font-normal">
                  Skills &amp; Test Results
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-[11px] font-medium uppercase tracking-[0.12em] text-[#78716C]">
                    <th className="py-3 px-6 font-semibold">Skill</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                    <th className="py-3 px-6 font-semibold">Score</th>
                    <th className="py-3 px-6 font-semibold">Projects</th>
                    <th className="py-3 px-6 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {skills.map((skill, idx) => {
                    const skillVer = profile?.verifiedSkills?.[skill];
                    const isVerified = skillVer?.status === "verified";
                    const cdInfo = cooldowns[skill];
                    const inCooldown = !isVerified && !!cdInfo;
                    const itemsCount = projects.filter(p => p.supportsClaim === skill || p.skillsUsed?.includes(skill)).length;

                    return (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-[#1C1917] text-[14px]">
                          <div>{skill}</div>
                          {inCooldown && (
                            <div className="mt-1">
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
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border transition-all duration-300 ${
                              isVerified
                                ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] shadow-[0_0_8px_rgba(22,101,52,0.15)] animate-pulse"
                                : inCooldown
                                ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                                : itemsCount > 0
                                ? "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
                                : "bg-[#FAF8F5] text-[#78716C] border-[#E7E2DA]"
                            }`}
                          >
                            {isVerified
                              ? "✓ VERIFIED"
                              : inCooldown
                              ? "COOLDOWN"
                              : itemsCount > 0
                              ? "PROJECT LINKED"
                              : "NOT TESTED"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[13px]">
                          {isVerified && skillVer?.score ? (
                            <span className="font-bold text-[#166534]">{skillVer.score}%</span>
                          ) : inCooldown ? (
                            <div>
                              <span className="font-semibold text-[#B42318]">{cdInfo.score !== undefined ? `${cdInfo.score}%` : "0%"}</span>
                              <span className="text-[10px] text-[#78716C] block">Failed</span>
                            </div>
                          ) : (
                            <span className="text-[#78716C]">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#78716C]">
                          {itemsCount > 0 ? (
                            <span className="font-mono text-[#1C1917] font-medium">
                              {itemsCount} project{itemsCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span>No project added</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isVerified ? (
                            <span className="text-[12px] font-mono text-[#166534] font-medium">
                              Verified
                            </span>
                          ) : inCooldown ? (
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[12px] font-mono font-semibold rounded cursor-not-allowed select-none tabular-nums"
                              title="Locked in study cooldown"
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
                            </div>
                          ) : (
                            <Link
                              href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}
                              prefetch={true}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[12px] font-medium rounded transition-colors"
                            >
                              <Clock className="h-3 w-3" />
                              <span>Take Test</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {skills.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#78716C]">
                        No skills added yet. Add your skills in Profile to take tests and get verified badges.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === "artifacts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-serif text-[#1C1917] font-normal">
                Projects ({projects.length})
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#064E3B] text-white text-[13px] font-medium rounded hover:bg-[#043327] transition-colors"
            >
              + Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-2 p-12 border border-dashed border-[#E7E2DA] rounded text-center bg-white">
                <h3 className="text-base font-serif text-[#1C1917] mb-2 font-normal">No projects added yet</h3>
                <p className="text-sm text-[#78716C] max-w-md mx-auto mb-6">
                  Add code repositories or live websites to show recruiters what you can build.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-[#064E3B] text-white text-[13px] font-medium rounded hover:bg-[#043327] transition-colors"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              projects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="border border-[#E7E2DA] bg-white p-6 rounded transition-colors hover:border-[#1C1917]/40 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[18px] font-serif text-[#1C1917] font-medium">
                        {project.title}
                      </h3>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-1 rounded border border-[#064E3B]/20 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" /> Live Demo ↗
                        </a>
                      )}
                    </div>

                    <div className="text-[12px] font-mono text-[#78716C] mb-3 truncate">
                      {project.repoUrl}
                    </div>

                    {project.description && (
                      <p className="text-[13.5px] text-[#78716C] mb-4 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    )}

                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skillsUsed.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[11px] font-mono text-[#78716C]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E7E2DA] pt-3 mt-4 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#78716C]">Skill:</span>
                      <span className="font-mono text-[#1C1917] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA] text-[11px]">
                        {project.supportsClaim || "General Skill"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1C1917] underline hover:text-[#064E3B] text-[12px]"
                      >
                        View Code ↗
                      </a>
                      <span className="text-[#E7E2DA]">|</span>
                      <button
                        onClick={() => handleRemoveEvidence(project.id)}
                        className="text-[#78716C] hover:text-[#B42318] text-[12px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Git Activity */}
      {activeTab === "provenance" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E2DA] rounded p-6 sm:p-8 shadow-xs">
            <h2 className="text-[18px] font-serif text-[#1C1917] font-normal mb-6">
              GitHub Activity &amp; Stats
            </h2>

            {profile?.githubEvidence ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E7E2DA]">
                  <div className="text-[11px] font-medium uppercase text-[#78716C] mb-1">
                    Total Commits
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.totalCommits}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E7E2DA]">
                  <div className="text-[11px] font-medium uppercase text-[#78716C] mb-1">
                    Repositories
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.repoCount}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded border border-[#E7E2DA]">
                  <div className="text-[11px] font-medium uppercase text-[#78716C] mb-1">
                    Top Language
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.topLanguages?.[0] || "TypeScript"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#FAF8F5] rounded border border-[#E7E2DA] text-center">
                <GitBranch className="h-8 w-8 text-[#78716C] mx-auto mb-2" />
                <h3 className="text-[15px] font-medium text-[#1C1917] mb-1">No GitHub profile connected</h3>
                <p className="text-[13px] text-[#78716C] mb-4">
                  Add your GitHub link in your Profile to automatically display your repositories and commit counts.
                </p>
                <button
                  onClick={() => router.push("/candidate/profile")}
                  className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-medium rounded hover:bg-[#292524]"
                >
                  Go to Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#0D0D0D]/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-evidence-title"
              className="relative z-10 bg-white rounded shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-[#E7E2DA]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E2DA] bg-[#FAF8F5]">
                <h2 id="modal-evidence-title" className="text-[18px] font-serif text-[#1C1917]">Add Project</h2>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#78716C] hover:text-[#1C1917]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvidence} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[13px] rounded">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed In-Memory Cache"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[14px] text-[#1C1917] outline-none focus:border-[#064E3B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Repository URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newProject.repoUrl}
                    onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[14px] text-[#1C1917] outline-none focus:border-[#064E3B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Live Demo / Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://my-app.vercel.app"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[14px] text-[#1C1917] outline-none focus:border-[#064E3B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Skills Used in This Project
                  </label>
                  <p className="text-[11.5px] text-[#78716C] mb-2">
                    Click to select all skills and technologies used in this project:
                  </p>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded max-h-40 overflow-y-auto">
                    {skills.map((s) => {
                      const isSelected = (newProject.skillsUsed || []).includes(s) || (newProject.supportsClaim === s && (!newProject.skillsUsed || newProject.skillsUsed.length === 0));
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const current = newProject.skillsUsed && newProject.skillsUsed.length > 0
                              ? newProject.skillsUsed
                              : (newProject.supportsClaim ? [newProject.supportsClaim] : []);
                            const updated = isSelected
                              ? current.filter(x => x !== s)
                              : [...current, s];
                            setNewProject({
                              ...newProject,
                              skillsUsed: updated,
                              supportsClaim: updated[0] || ""
                            });
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all flex items-center gap-1 cursor-pointer border ${
                            isSelected
                              ? "bg-[#064E3B] text-white border-[#064E3B]"
                              : "bg-white text-[#78716C] border-[#E7E2DA] hover:border-[#1C1917]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                  {skills.length === 0 && (
                    <input
                      type="text"
                      placeholder="e.g. JavaScript, React, Python"
                      value={(newProject.skillsUsed || []).join(", ")}
                      onChange={(e) => {
                        const parsed = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
                        setNewProject({ ...newProject, skillsUsed: parsed, supportsClaim: parsed[0] || "" });
                      }}
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[14px] text-[#1C1917] outline-none focus:border-[#064E3B] focus:bg-white mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Project Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Briefly describe what this project does and what tech you used."
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[13px] text-[#1C1917] outline-none focus:border-[#064E3B] focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#E7E2DA] text-[#78716C] hover:text-[#1C1917] rounded text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#064E3B] text-white rounded text-[13px] font-medium hover:bg-[#043327] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-[#1C1917] text-white border border-[#333] shadow-2xl rounded p-4 z-50 min-w-[280px] flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-[#22c55e] shrink-0" />
            <span className="text-[13px] font-sans font-medium">
              Profile link copied to clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
