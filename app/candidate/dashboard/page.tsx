"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
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
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"matrix" | "artifacts" | "provenance">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

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
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
          if (p?.skills && p.skills.length > 0) {
            setNewProject(prev => ({ ...prev, supportsClaim: p.skills[0] }));
          }
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
    (v: any) => v.status === "verified"
  ).length;

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
      const projectToAdd: ProjectEntry = {
        id: Date.now().toString(),
        title: newProject.title || "",
        repoUrl: newProject.repoUrl || "",
        liveUrl: newProject.liveUrl || "",
        description: newProject.description || "",
        supportsClaim: newProject.supportsClaim || "",
        skillsUsed: newProject.skillsUsed || []
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
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10 mx-auto max-w-[1500px] h-full overflow-y-auto scrollbar-hide relative bg-[#FAF8F5] text-[#1C1917] font-sans">
      
      {/* Context Guide */}
      <ContextGuide 
        storageKey="candidate_dashboard"
        title="Evidence Workspace"
        description="MeritLane operates on audited evidence. Your declared skills must be substantiated with proctored assessment records and verified code artifacts."
        steps={[
          { title: "Review Claims", description: "Audit declared skills against evidence requirements.", isCompleted: true },
          { title: "Link Artifacts", description: "Attach GitHub repositories or live deployed URLs.", isCompleted: projects.length > 0 },
          { title: "Proctored Evaluation", description: "Complete timed assessments for 80%+ verified proof.", isCompleted: verifiedSkillsCount > 0 }
        ]}
        ctaLabel="Take Assessment"
        ctaHref="/candidate/verification"
      />

      {/* Institutional Dossier Header */}
      <div className="mb-8 border border-[#E7E2DA] bg-white rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E7E2DA]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20">
                AUDITED CANDIDATE RECORD
              </span>
              <span className="text-[12px] font-mono text-[#78716C]">
                ID: #{user?.uid.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[12px] text-[#78716C] font-mono">
                · STATUS: {verifiedSkillsCount > 0 ? "EVALUATED & ACTIVE" : "PENDING AUDIT"}
              </span>
            </div>

            <h1 className="font-serif text-[38px] sm:text-[46px] text-[#1C1917] leading-none py-1 font-semibold">
              {profile?.name || "Candidate Engineering Record"}
            </h1>

            {(profile?.college || profile?.branch) && (
              <p className="text-[14px] text-[#78716C] mt-1.5 flex items-center gap-1.5 flex-wrap font-sans">
                <GraduationCap className="h-4 w-4 text-[#064E3B]" />
                <span className="font-medium text-[#1C1917]">{profile.branch}</span>
                {profile.branch && profile.college ? <span>·</span> : null}
                <span>{profile.college}</span>
                {profile.gradYear ? <span className="font-mono text-[#78716C]">({profile.gradYear})</span> : null}
              </p>
            )}
          </div>

          {/* Quick Actions & Public Dossier Copy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleCopyPublicLink}
              className="flex items-center justify-center gap-2 px-4 h-10 border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white text-[#1C1917] rounded-full text-[13px] font-medium transition-colors shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-[#16A34A]" />
                  <span className="text-[#16A34A] font-medium">Public URL Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#78716C]" />
                  <span>Copy Public Dossier Link</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 h-10 bg-[#064E3B] text-[#FFFFFF] hover:bg-[#022c22] rounded-full text-[13px] font-medium transition-colors shadow-xs"
            >
              <span>+</span> Attach Code Evidence
            </button>
          </div>
        </div>

        {/* 4-Pillar Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E2DA] bg-[#FAF8F5]/40">
          
          {/* 1. Evidence Health */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
              <span>Evidence Completeness</span>
              <Activity className="h-3.5 w-3.5 text-[#064E3B]" />
            </div>
            <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
              {healthIndex}%
            </div>
            <div className="w-full bg-[#E7E2DA] h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#064E3B] h-full transition-all duration-500"
                style={{ width: `${healthIndex}%` }}
              />
            </div>
            <div className="text-[11.5px] font-sans text-[#78716C]">
              {healthIndex >= 80 ? "Record meets hiring threshold" : "Complete evaluations to reach 80%"}
            </div>
          </div>

          {/* 2. Verified Assessments */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.15em] text-[#064E3B] mb-1.5">
              <span>Verified Competencies</span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#064E3B]" />
            </div>
            <div className="text-[28px] font-serif text-[#064E3B] leading-tight mb-2">
              {verifiedSkillsCount} / {skills.length || 0}
            </div>
            <div className="text-[11.5px] font-sans text-[#78716C]">
              {verifiedSkillsCount > 0 ? "Proctored timed evaluations" : "No evaluations recorded"}
            </div>
          </div>

          {/* 3. Git Provenance */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
              <span>Git Archive Footprint</span>
              <GitBranch className="h-3.5 w-3.5 text-[#1C1917]" />
            </div>
            <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
              {profile?.githubEvidence?.totalCommits || 0}
            </div>
            <div className="text-[11.5px] font-sans text-[#78716C]">
              {profile?.githubEvidence
                ? `Commits across ${profile.githubEvidence.repoCount} repositories`
                : "Archive link pending"}
            </div>
          </div>

          {/* 4. ATS Keyword Match */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-1.5">
              <span>ATS Resume Standing</span>
              <FileText className="h-3.5 w-3.5 text-[#78716C]" />
            </div>
            <div className="text-[28px] font-serif text-[#1C1917] leading-tight mb-2">
              {typeof profile?.atsScore === "number" ? `${profile.atsScore}/100` : "Unindexed"}
            </div>
            <div className="text-[11.5px] font-sans text-[#78716C]">
              {profile?.atsRating ? `${profile.atsRating} keyword density` : "Check resume in Identity"}
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
          <span>Skill Competency Matrix</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#E7E2DA]/60">
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
          <span>Linked Technical Artifacts</span>
          <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#E7E2DA]/60">
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
          <span>Git Provenance &amp; Activity</span>
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
          <div className="bg-white border border-[#E7E2DA] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#E7E2DA] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-serif text-[#1C1917] font-normal">
                  Audited Skill Matrix &amp; Evaluation Records
                </h2>
                <p className="text-[13px] text-[#78716C] mt-0.5">
                  Every technical claim requires a proctored 45-minute timed coding assessment and code repository proof.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E7E2DA] text-[11px] font-mono uppercase tracking-[0.12em] text-[#78716C]">
                    <th className="py-3 px-6 font-semibold">Technical Skill</th>
                    <th className="py-3 px-6 font-semibold">Audit Status</th>
                    <th className="py-3 px-6 font-semibold">Assessment Score</th>
                    <th className="py-3 px-6 font-semibold">Linked Artifacts</th>
                    <th className="py-3 px-6 font-semibold text-right">Evaluation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2DA]">
                  {skills.map((skill, idx) => {
                    const skillVer = profile?.verifiedSkills?.[skill];
                    const isVerified = skillVer?.status === "verified";
                    const itemsCount = projects.filter(p => p.supportsClaim === skill).length;

                    return (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-4 px-6 font-medium text-[#1C1917] text-[14px]">
                          {skill}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                              isVerified
                                ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]"
                                : itemsCount > 0
                                ? "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
                                : "bg-[#F8F6F3] text-[#78716C] border-[#E7E2DA]"
                            }`}
                          >
                            {isVerified ? "✓ VERIFIED" : itemsCount > 0 ? "EVIDENCE LINKED" : "UNVERIFIED"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[13px]">
                          {isVerified && skillVer?.score ? (
                            <span className="font-bold text-[#166534]">{skillVer.score}%</span>
                          ) : (
                            <span className="text-[#78716C]">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#78716C]">
                          {itemsCount > 0 ? (
                            <span className="font-mono text-[#1C1917] font-medium">
                              {itemsCount} repository{itemsCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span>No code attached</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isVerified ? (
                            <span className="text-[12px] font-mono text-[#166534] font-medium">
                              Validated Standard
                            </span>
                          ) : (
                            <button
                              onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-white text-[12px] font-medium rounded-lg transition-colors"
                            >
                              <Clock className="h-3 w-3" />
                              <span>Take 45m Exam</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {skills.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#78716C]">
                        No technical skills declared. Add your skills in Identity to establish your audit ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Linked Technical Artifacts */}
      {activeTab === "artifacts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-serif text-[#1C1917] font-normal">
                Linked Technical Artifacts ({projects.length})
              </h2>
              <p className="text-[13px] text-[#78716C]">
                Substantiated repositories and deployed applications inspected by prospective hiring teams.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#064E3B] text-white text-[13px] font-medium rounded-xl hover:bg-[#022c22] transition-colors"
            >
              + Link Repository
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-2 p-12 border border-dashed border-[#E7E2DA] rounded-2xl text-center bg-white">
                <h3 className="text-base font-serif text-[#1C1917] mb-2 font-normal">No artifacts attached</h3>
                <p className="text-sm text-[#78716C] max-w-md mx-auto mb-6">
                  Attach code repositories or production links to establish evidentiary proof for employer review.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-[#064E3B] text-white text-[13px] font-medium rounded-xl hover:bg-[#022c22] transition-colors"
                >
                  + Link Code Repository
                </button>
              </div>
            ) : (
              projects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="border border-[#E7E2DA] bg-white p-6 rounded-2xl transition-colors hover:border-[#1C1917] shadow-xs flex flex-col justify-between"
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
                          <ExternalLink className="h-3 w-3" /> Live System ↗
                        </a>
                      )}
                    </div>

                    <div className="text-[12px] font-mono text-[#78716C] mb-3 truncate">
                      {project.repoUrl}
                    </div>

                    {project.description && (
                      <p className="text-[13.5px] text-[#525252] mb-4 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    )}

                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skillsUsed.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-[11px] font-mono text-[#525252]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E7E2DA] pt-3 mt-4 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#78716C]">Proves:</span>
                      <span className="font-mono text-[#1C1917] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA] text-[11px]">
                        {project.supportsClaim || "General Capability"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1C1917] underline hover:text-[#064E3B] text-[12px]"
                      >
                        Inspect Code ↗
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

      {/* Tab 3: Git Provenance */}
      {activeTab === "provenance" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E2DA] rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-[18px] font-serif text-[#1C1917] font-normal mb-2">
              GitHub Technical Archive Audit
            </h2>
            <p className="text-[13px] text-[#78716C] mb-6">
              Verified signals collected directly from your authenticated GitHub account.
            </p>

            {profile?.githubEvidence ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA]">
                  <div className="text-[11px] font-mono uppercase text-[#78716C] mb-1">
                    Audited Commits
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.totalCommits}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA]">
                  <div className="text-[11px] font-mono uppercase text-[#78716C] mb-1">
                    Public Repositories
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.repoCount}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA]">
                  <div className="text-[11px] font-mono uppercase text-[#78716C] mb-1">
                    Top Language
                  </div>
                  <div className="text-[26px] font-serif text-[#1C1917]">
                    {profile.githubEvidence.topLanguages?.[0] || "TypeScript"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA] text-center">
                <GitBranch className="h-8 w-8 text-[#78716C] mx-auto mb-2" />
                <h3 className="text-[15px] font-medium text-[#1C1917] mb-1">No GitHub archive connected</h3>
                <p className="text-[13px] text-[#78716C] mb-4">
                  Connect your GitHub account in the Identity tab to automatically sync commit metrics and code repositories.
                </p>
                <button
                  onClick={() => router.push("/candidate/profile")}
                  className="px-4 py-2 bg-[#1C1917] text-white text-[12px] font-medium rounded-lg hover:bg-[#292524]"
                >
                  Go to Identity
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
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
              className="relative z-10 bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-[#E5E5E5]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <h2 id="modal-evidence-title" className="text-[18px] font-serif text-[#0D0D0D]">Add Supporting Evidence</h2>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#737373] hover:text-[#0D0D0D]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvidence} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[13px] rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Project / Artifact Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed In-Memory Cache"
                    className="w-full h-11 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] outline-none focus:border-[#1C1917]"
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
                    className="w-full h-11 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Live Production URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://my-app.vercel.app"
                    className="w-full h-11 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Claim Substantiated
                  </label>
                  <select
                    value={newProject.supportsClaim}
                    onChange={(e) => setNewProject({ ...newProject, supportsClaim: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-[#E7E2DA] rounded-xl text-[14px] text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    {skills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="General Capability">General Capability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1C1917] mb-1">
                    Description &amp; Engineering Details
                  </label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Briefly describe the architectural approach and technical complexity."
                    className="w-full p-3 bg-white border border-[#E7E2DA] rounded-xl text-[13px] text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#E7E2DA] text-[#78716C] hover:text-[#1C1917] rounded-xl text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#064E3B] text-white rounded-xl text-[13px] font-medium hover:bg-[#022c22] disabled:opacity-50"
                  >
                    {saving ? "Attaching..." : "Save Evidence"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
