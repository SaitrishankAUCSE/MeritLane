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
  const [supportedSkills, setSupportedSkills] = useState<{keys: string[], aliases: string[]} | null>(null);

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
        fetch("/api/candidate/supported-skills").then(res => res.json()).catch(() => null)
      ])
        .then(([p, uData, cData, ssData]) => {
          setProfile(p);
          if (ssData && ssData.keys) setSupportedSkills(ssData);
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
  const isSkillSupported = (skill: string) => {
    if (!supportedSkills) return true; // optimistic if not loaded
    const normalized = skill.toLowerCase().trim();
    if (supportedSkills.keys.includes(normalized) || supportedSkills.aliases.includes(normalized)) return true;
    return supportedSkills.keys.some(key => normalized.includes(key));
  };

  if (loading && !user) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010] font-sans">
      
      {/* ── Registry Command Header (Full Width Strip) ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <span className="text-[11px] font-medium tracking-wider text-[#71717A] uppercase">
                Candidate Dashboard
              </span>
              <span className="text-xs font-mono font-medium text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                ID: {profile?.candidateKey || (user?.uid ? `ML-${user.uid.slice(0, 8).toUpperCase()}` : "—")}
              </span>
              <span className="text-xs text-[#71717A]">
                · Employer Discovery: {isEmployerPortalUnlocked ? "Unlocked" : `${verifiedSkillsCount}/${requiredForEmployerPortal} (50% needed)`}
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[34px] text-[#101010] font-semibold tracking-[-0.035em] leading-tight">
              {profile?.name || "Candidate Profile"}
            </h1>

            {(profile?.college || profile?.branch) && (
              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[13px] text-[#71717A]">
                <GraduationCap className="h-4 w-4 text-[#101010]" />
                {profile.branch && <span className="font-medium text-[#101010]">{profile.branch}</span>}
                {profile.branch && profile.college ? <span className="text-black/20">·</span> : null}
                {profile.college && <span>{profile.college}</span>}
                {profile.gradYear ? (
                  <>
                    <span className="text-black/20">·</span>
                    <span className="font-mono text-xs text-[#71717A]">Class of {profile.gradYear}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick Actions & Public Dossier Copy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyPublicLink}
              className="flex items-center justify-center gap-2 px-4 h-9 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-[#101010] rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#71717A]" />
                  <span>Copy Profile Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-meritlane-welcome"))}
              className="flex items-center justify-center gap-1.5 px-3.5 h-9 border border-black/[0.12] bg-white hover:bg-[#F4F4F2] text-[#101010] rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              title="Learn how MeritLane works"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#71717A]" />
              <span>Protocol Tour</span>
            </button>

            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 h-9 bg-[#101010] text-white hover:bg-[#252525] rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <span>+</span> Add Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">




      {/* Navigation Tabs (Devin Minimalist) */}
      <div className="flex items-center gap-2 border-b border-black/[0.08] mb-8 pb-px">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3.5 px-4 text-xs font-medium transition-all relative ${
            activeTab === "matrix"
              ? "text-[#101010] font-semibold"
              : "text-[#71717A] hover:text-[#101010]"
          }`}
        >
          <span>Skills</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-mono bg-black/[0.04] text-[#101010]">
            {skills.length}
          </span>
          {activeTab === "matrix" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#101010]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("artifacts")}
          className={`pb-3.5 px-4 text-xs font-medium transition-all relative ${
            activeTab === "artifacts"
              ? "text-[#101010] font-semibold"
              : "text-[#71717A] hover:text-[#101010]"
          }`}
        >
          <span>Projects</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-mono bg-black/[0.04] text-[#101010]">
            {projects.length}
          </span>
          {activeTab === "artifacts" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#101010]"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("provenance")}
          className={`pb-3.5 px-4 text-xs font-medium transition-all relative ${
            activeTab === "provenance"
              ? "text-[#101010] font-semibold"
              : "text-[#71717A] hover:text-[#101010]"
          }`}
        >
          <span>GitHub Activity</span>
          {activeTab === "provenance" && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#101010]"
            />
          )}
        </button>
      </div>

      {/* Tab 1: Competency Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <div className="bg-white border border-black/[0.08] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-black/[0.08] flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#101010] tracking-tight">
                  Skills &amp; Test Results
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Complete technical assessments to achieve skill verification badges
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
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
                      <tr key={idx} className="hover:bg-surface/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-foreground text-[14px]">
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : inCooldown
                                ? "bg-amber-50 text-amber-800 border-amber-200 font-mono"
                                : itemsCount > 0
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-black/[0.04] text-[#71717A] border-black/[0.08]"
                            }`}
                          >
                            {isVerified
                              ? "✓ Verified"
                              : inCooldown
                              ? "Cooldown"
                              : itemsCount > 0
                              ? "Project Linked"
                              : "Not Tested"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#101010]">
                          {isVerified && skillVer?.score ? (
                            <span className="font-semibold text-emerald-700">{skillVer.score}%</span>
                          ) : inCooldown ? (
                            <div>
                              <span className="font-semibold text-red-600">{cdInfo.score !== undefined ? `${cdInfo.score}%` : "0%"}</span>
                              <span className="text-[10px] text-[#71717A] block">Failed</span>
                            </div>
                          ) : (
                            <span className="text-[#A1A1AA]">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#71717A]">
                          {itemsCount > 0 ? (
                            <span className="text-[#101010] font-medium">
                              {itemsCount} project{itemsCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-[#A1A1AA]">No project added</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isVerified ? (
                            <span className="text-xs font-mono text-emerald-700 font-medium">
                              Verified
                            </span>
                          ) : inCooldown ? (
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium rounded-full cursor-not-allowed select-none tabular-nums"
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
                            isSkillSupported(skill) ? (
                              <Link
                                href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}
                                prefetch={true}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#101010] text-white hover:bg-[#252525] text-xs font-medium rounded-full transition-all shadow-xs active:scale-[0.98]"
                              >
                                <Clock className="h-3 w-3" />
                                <span>Take Test</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span
                                title="Assessment currently in development"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F4F2] text-[#71717A] text-xs font-medium rounded-full border border-black/[0.08] cursor-not-allowed select-none"
                              >
                                In Development
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {skills.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
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
              <h2 className="text-[18px] font-serif text-foreground font-normal">
                Projects ({projects.length})
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-900 text-white text-[13px] font-medium rounded hover:bg-emerald-950 transition-colors"
            >
              + Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-2 p-12 border border-dashed border-border rounded text-center bg-white">
                <h3 className="text-base font-serif text-foreground mb-2 font-normal">No projects added yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Add code repositories or live websites to show recruiters what you can build.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-900 text-white text-[13px] font-medium rounded hover:bg-emerald-950 transition-colors"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              projects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="border border-border bg-white p-6 rounded transition-colors hover:border-foreground/40 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[18px] font-serif text-foreground font-medium">
                        {project.title}
                      </h3>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-emerald-900 bg-emerald-900/10 px-2.5 py-1 rounded border border-emerald-900/20 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" /> Live Demo ↗
                        </a>
                      )}
                    </div>

                    <div className="text-[12px] font-mono text-muted-foreground mb-3 truncate">
                      {project.repoUrl}
                    </div>

                    {project.description && (
                      <p className="text-[13.5px] text-muted-foreground mb-4 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    )}

                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skillsUsed.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 bg-surface border border-border rounded text-[11px] font-mono text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3 mt-4 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Skill:</span>
                      <span className="font-mono text-foreground bg-surface px-2 py-0.5 rounded border border-border text-[11px]">
                        {project.supportsClaim || "General Skill"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-emerald-900 text-[12px]"
                      >
                        View Code ↗
                      </a>
                      <span className="text-border">|</span>
                      <button
                        onClick={() => handleRemoveEvidence(project.id)}
                        className="text-muted-foreground hover:text-danger text-[12px]"
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
          <div className="bg-white border border-border rounded p-6 sm:p-8 shadow-xs">
            <h2 className="text-[18px] font-serif text-foreground font-normal mb-6">
              GitHub Activity &amp; Stats
            </h2>

            {profile?.githubEvidence ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-surface rounded border border-border">
                  <div className="text-[11px] font-medium uppercase text-muted-foreground mb-1">
                    Total Commits
                  </div>
                  <div className="text-[26px] font-serif text-foreground">
                    {profile.githubEvidence.totalCommits}
                  </div>
                </div>

                <div className="p-4 bg-surface rounded border border-border">
                  <div className="text-[11px] font-medium uppercase text-muted-foreground mb-1">
                    Repositories
                  </div>
                  <div className="text-[26px] font-serif text-foreground">
                    {profile.githubEvidence.repoCount}
                  </div>
                </div>

                <div className="p-4 bg-surface rounded border border-border">
                  <div className="text-[11px] font-medium uppercase text-muted-foreground mb-1">
                    Top Language
                  </div>
                  <div className="text-[26px] font-serif text-foreground">
                    {profile.githubEvidence.topLanguages?.[0] || "TypeScript"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-surface rounded border border-border text-center">
                <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-[15px] font-medium text-foreground mb-1">No GitHub profile connected</h3>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Add your GitHub link in your Profile to automatically display your repositories and commit counts.
                </p>
                <button
                  onClick={() => router.push("/candidate/profile")}
                  className="px-4 py-2 bg-foreground text-white text-[12px] font-medium rounded hover:bg-stone-800"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-stone-900/40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-evidence-title"
              className="relative z-10 bg-[#FDFBF7] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border-2 border-[#D8D2C5] my-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8D2C5] bg-[#F3EFE6] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Code className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 id="modal-evidence-title" className="text-[16px] font-bold text-[#1C1917] leading-tight font-sans">
                      Add Project Repository
                    </h2>
                    <p className="text-[12px] text-[#78716C] font-sans">
                      Attach verified GitHub code to showcase proof of work.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#78716C] hover:text-[#1C1917] p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveEvidence} className="p-6 space-y-4.5 overflow-y-auto flex-1 font-sans">
                {errorMsg && (
                  <div className="p-3.5 bg-[#FAF5F4] border border-[#E8D8D5] text-[#8B3525] text-[13px] rounded-xl flex items-center gap-2">
                    <span className="font-semibold">Notice:</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-[#1C1917] mb-1.5 font-sans">
                    Project Title <span className="text-[#8B3525]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed In-Memory Cache"
                    className="w-full h-11 px-3.5 bg-white border border-[#D8D2C5] rounded-xl text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1C1917] mb-1.5 font-sans">
                    Repository URL <span className="text-[#8B3525]">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={newProject.repoUrl}
                    onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full h-11 px-3.5 bg-white border border-[#D8D2C5] rounded-xl text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1C1917] mb-1.5 font-sans">
                    Live Demo / Website <span className="text-[#78716C] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://my-app.vercel.app"
                    className="w-full h-11 px-3.5 bg-white border border-[#D8D2C5] rounded-xl text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1C1917] mb-1 font-sans">
                    Skills Used in This Project
                  </label>
                  <p className="text-[12px] text-[#78716C] mb-2 font-sans">
                    Select the key technologies, languages, and frameworks used:
                  </p>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-[#D8D2C5] rounded-xl max-h-36 overflow-y-auto">
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
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? "bg-emerald-900 text-white border-emerald-900 shadow-xs"
                              : "bg-[#FAF7F0] text-[#57534E] border-[#D8D2C5] hover:border-[#1C1917] hover:text-[#1C1917]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 shrink-0" />}
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
                      className="w-full h-11 px-3.5 bg-white border border-[#D8D2C5] rounded-xl text-[14px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-all font-sans mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1C1917] mb-1.5 font-sans">
                    Project Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Briefly describe what this project does and the engineering problems you solved."
                    className="w-full p-3 bg-white border border-[#D8D2C5] rounded-xl text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 transition-all font-sans resize-none"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D8D2C5]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 border border-[#D8D2C5] bg-white text-[#57534E] hover:text-[#1C1917] rounded-xl text-[13px] font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-6 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-[13px] font-bold transition-all shadow-md hover:scale-[1.01] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving Project..." : "Save Project"}
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
            className="fixed bottom-6 right-6 bg-foreground text-white border border-[#333] shadow-2xl rounded p-4 z-50 min-w-[280px] flex items-center gap-3"
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
