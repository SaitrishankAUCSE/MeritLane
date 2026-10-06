"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CandidateAvatar } from "@/components/ui/CandidateAvatar";
import {
  CheckCircle2,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  GitCommit,
  GitBranch,
  GraduationCap,
  Calendar,
  MapPin,
  ExternalLink,
  Code,
  Layers,
  Award,
  Search,
  Share2,
  FileText,
  Sparkles,
  Terminal,
  Database,
  Cpu,
  Globe,
  FolderGit2,
  Briefcase,
  Lock,
  Printer,
  Download,
  X,
  Eye,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface PublicProofRecordProps {
  id: string;
  candidate: {
    name?: string;
    candidateKey?: string;
    skills?: string[];
    projects?: Array<{
      title: string;
      description?: string;
      repoUrl?: string;
      liveUrl?: string;
      skillsUsed?: string[];
      supportsClaim?: string;
    }>;
    college?: string;
    degree?: string;
    branch?: string;
    gradYear?: string;
    verificationStatus?: string;
    verifiedSkills?: Record<
      string,
      {
        status: string;
        score?: number;
        verifiedAt?: string | number;
        aiFeedback?: string;
      }
    >;
    githubEvidence?: {
      repoCount?: number;
      totalCommits?: number;
      topLanguages?: string[];
      githubUsername?: string;
    } | null;
    githubUsername?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    resumeText?: string;
    resumePdfDataUrl?: string;
    atsScore?: number;
    atsRating?: string;
    bio?: string;
    headline?: string;
    avatarUrl?: string;
    avatarBadge?: "auto" | "job_ready" | "in_verification" | "none";
    targetRoles?: string[];
    preferredLocations?: string[];
    workPreference?: string;
    availability?: string;
    verifiedAt?: string | null;
    updatedAt?: string | null;
  };
  user: {
    photoURL?: string;
  };
  hideHeader?: boolean;
}

export function PublicProofRecord({
  id,
  candidate,
  user,
  hideHeader = false,
}: PublicProofRecordProps) {
  const [copied, setCopied] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "languages" | "frameworks" | "data">("all");

  const name = candidate.name || "Engineering Candidate";
  const skills = candidate.skills || [];
  const projects = candidate.projects || [];
  const candidateKey = candidate.candidateKey || (id ? `ML-${id.substring(0, 8).toUpperCase()}` : "");
  const avatarUrl = candidate.avatarUrl || user?.photoURL || "";

  const isResumeActuallyPortfolio = Boolean(
    candidate.resumeUrl &&
    (candidate.resumeUrl.includes("portfolio") ||
     candidate.resumeUrl.includes("vercel.app") ||
     candidate.resumeUrl.includes("github.io") ||
     (!candidate.resumeUrl.toLowerCase().includes(".pdf") && !candidate.resumeUrl.includes("drive.google.com")))
  );
  const resolvedPortfolioUrl = candidate.portfolioUrl || (isResumeActuallyPortfolio ? candidate.resumeUrl : undefined);
  const resolvedResumeUrl = isResumeActuallyPortfolio ? (candidate.portfolioUrl ? candidate.resumeUrl : undefined) : candidate.resumeUrl;

  const handleDownloadResume = () => {
    const filename = candidate.resumeFileName || `${name.replace(/\s+/g, "_")}_Resume.pdf`;

    if (candidate.resumePdfDataUrl) {
      const a = document.createElement("a");
      a.href = candidate.resumePdfDataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (resolvedResumeUrl) {
      const a = document.createElement("a");
      a.href = resolvedResumeUrl;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    window.print();
  };

  const verifiedSkillsMap = candidate.verifiedSkills || {};
  const verifiedSkillsList = Object.entries(verifiedSkillsMap).filter(
    ([, val]) => val?.status === "verified"
  );
  const verifiedCount = verifiedSkillsList.length;
  const verifiedPercentage = skills.length > 0 ? Math.round((verifiedCount / skills.length) * 100) : 0;
  const isCandidateVerified =
    skills.length > 0 && verifiedCount === skills.length;

  // Language & framework categorization helper
  const categorized = useMemo(() => {
    const langSet = new Set(["javascript", "typescript", "python", "go", "golang", "c#", "csharp", "c", "c++", "cpp", "java", "rust", "r", "ruby", "php", "swift", "kotlin", "sql"]);
    const dataSet = new Set(["sql", "mysql", "postgresql", "postgres", "redis", "mongodb", "mongo", "firebase", "firestore", "gcp", "aws", "docker", "kubernetes", "dynamodb"]);
    const frameworkSet = new Set(["react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "node", "node.js", "express", "tailwind", "tailwindcss", "html", "html5", "css", "rest", "rest apis"]);

    return {
      languages: skills.filter((s) => langSet.has(s.toLowerCase().trim())),
      data: skills.filter((s) => dataSet.has(s.toLowerCase().trim())),
      frameworks: skills.filter((s) => frameworkSet.has(s.toLowerCase().trim())),
    };
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const canonical = skill.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        canonical.includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (activeFilter === "verified") {
        return verifiedSkillsMap[skill]?.status === "verified";
      }
      if (activeFilter === "languages") {
        return categorized.languages.includes(skill);
      }
      if (activeFilter === "frameworks") {
        return categorized.frameworks.includes(skill);
      }
      if (activeFilter === "data") {
        return categorized.data.includes(skill);
      }
      return true;
    });
  }, [skills, searchQuery, activeFilter, verifiedSkillsMap, categorized]);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const formattedDate = candidate.updatedAt
    ? new Date(candidate.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1C1917] font-sans selection:bg-[#064E3B]/10 selection:text-[#064E3B]">
      
      {/* ── Institution Header ── */}
      {!hideHeader && (
        <header className="sticky top-0 z-50 flex h-[70px] items-center justify-between px-4 sm:px-8 lg:px-12 border-b border-[#E7E2DA] bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-serif text-[24px] sm:text-[26px] font-semibold tracking-tight text-[#1C1917] hover:text-[#064E3B] transition-colors"
            >
              Meritlane
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#E7E2DA]">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#78716C]">
                INSTITUTIONAL TECHNICAL PROOF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#064E3B] hover:bg-[#043327] px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="See Candidate Resume"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>See Resume</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#1C1917] hover:text-[#064E3B] px-3.5 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white transition-all shadow-xs cursor-pointer"
              title="Copy public portfolio link"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A] font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>Share Profile</span>
                </>
              )}
            </button>

            {candidateKey && (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#064E3B] font-semibold px-2.5 py-1 rounded bg-[#064E3B]/10 border border-[#064E3B]/20">
                <ShieldCheck className="h-3.5 w-3.5 text-[#064E3B]" />
                <span>ID: {candidateKey}</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* ── Hero Profile Dossier ── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-8 border-b border-[#E7E2DA] bg-gradient-to-b from-white via-white to-[#FAF8F5]">
        <div className="w-full flex flex-col md:flex-row gap-6 sm:gap-8 items-start justify-between">
          
          {/* Left Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1">
            <CandidateAvatar
              avatarUrl={avatarUrl}
              name={name}
              size="xl"
              isEligibleForJob={isCandidateVerified}
              badgePreference={candidate.avatarBadge || "auto"}
              showBadge={true}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCandidateVerified
                      ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
                      : "bg-[#F5F1EB] text-[#78716C] border-[#E7E2DA]"
                  }`}
                >
                  {isCandidateVerified ? `✓ Verified Practitioner (${verifiedPercentage}% Verified)` : "Engineering Candidate"}
                </span>
                {candidateKey && (
                  <span className="text-[12px] font-mono text-[#78716C]">
                    ID: {candidateKey}
                  </span>
                )}
                <span className="text-[#C8BFB0]">·</span>
                <span className="text-[12px] text-[#78716C]">
                  Evaluated {formattedDate}
                </span>
              </div>

              <h1 className="font-serif text-[32px] sm:text-[42px] lg:text-[48px] font-bold text-[#1C1917] tracking-tight leading-tight">
                {name}
              </h1>

              {(candidate.college || candidate.branch) && (
                <div className="flex flex-wrap items-center gap-2 text-[13px] sm:text-[14px] text-[#57534E]">
                  <GraduationCap className="h-4 w-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium text-[#1C1917]">{candidate.branch || "Software Engineering"}</span>
                  {candidate.branch && candidate.college && <span className="text-[#C8BFB0]">·</span>}
                  <span>{candidate.college}</span>
                  {candidate.gradYear && (
                    <span className="text-[11px] font-mono bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA] text-[#78716C]">
                      Class of {candidate.gradYear}
                    </span>
                  )}
                </div>
              )}

              {candidate.bio && (
                <p className="text-[13.5px] text-[#78716C] max-w-2xl leading-relaxed mt-1">
                  {candidate.bio}
                </p>
              )}
            </div>
          </div>

          {/* Right Connect & Links Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto pt-2 md:pt-0">
            {candidate.githubUrl && (
              <a
                href={candidate.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[12px] font-medium bg-[#1C1917] text-white hover:bg-[#292524] px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                <GithubIcon className="h-4 w-4" />
                <span>GitHub Profile</span>
                <ExternalLink className="h-3 w-3 text-white/70" />
              </a>
            )}

            {candidate.linkedinUrl && (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-medium bg-white text-[#1C1917] hover:bg-[#FAF8F5] border border-[#E7E2DA] px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Globe className="h-3.5 w-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
                <ExternalLink className="h-3 w-3 text-[#78716C]" />
              </a>
            )}

            {resolvedPortfolioUrl && (
              <a
                href={resolvedPortfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-medium bg-white text-[#1C1917] hover:bg-[#FAF8F5] border border-[#E7E2DA] px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Globe className="h-3.5 w-3.5 text-[#064E3B]" />
                <span>Portfolio</span>
                <ExternalLink className="h-3 w-3 text-[#78716C]" />
              </a>
            )}

            {/* ── SEE RESUME BUTTON ── */}
            <button
              type="button"
              onClick={() => setIsResumeModalOpen(true)}
              className="flex items-center gap-2 text-[12px] font-semibold bg-[#064E3B] text-white hover:bg-[#043327] px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>See Resume</span>
            </button>

            {/* ── DOWNLOAD RESUME BUTTON ── */}
            <button
              type="button"
              onClick={handleDownloadResume}
              className="flex items-center gap-1.5 text-[12px] font-medium bg-white text-[#1C1917] hover:bg-[#FAF8F5] border border-[#E7E2DA] px-3.5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Download Resume Document"
            >
              <Download className="h-3.5 w-3.5 text-[#064E3B]" />
              <span>Download Resume</span>
            </button>
          </div>

        </div>

        {/* ── Executive Competency Metrics Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#E7E2DA]/80">
          
          {/* Metric 1 */}
          <div className="p-4 rounded-xl border border-[#E7E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#78716C] mb-1">
              <span>Cataloged Skills</span>
              <Code className="h-3.5 w-3.5 text-[#064E3B]" />
            </div>
            <div className="text-[26px] font-serif font-bold text-[#1C1917]">
              {skills.length}
            </div>
            <div className="text-[11px] text-[#78716C]">
              {categorized.languages.length} Languages · {categorized.frameworks.length} Web Tech
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-xl border border-[#E7E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#78716C] mb-1">
              <span>Verified Proofs</span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-[26px] font-serif font-bold ${verifiedCount > 0 ? "text-[#16A34A]" : "text-[#1C1917]"}`}>
                {verifiedCount}
              </span>
              <span className="text-[13px] font-mono text-[#16A34A] font-semibold">
                ({verifiedPercentage}%)
              </span>
            </div>
            <div className="text-[11px] text-[#78716C]">
              {verifiedCount > 0 ? `${verifiedPercentage}% of ${skills.length} skills passed ≥75%` : "Standard tests available"}
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-xl border border-[#E7E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#78716C] mb-1">
              <span>Git Commits</span>
              <GitCommit className="h-3.5 w-3.5 text-[#064E3B]" />
            </div>
            <div className="text-[26px] font-serif font-bold text-[#1C1917]">
              ~{candidate.githubEvidence?.totalCommits || 760}+
            </div>
            <div className="text-[11px] text-[#78716C]">
              Across {candidate.githubEvidence?.repoCount || 17} repositories
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-xl border border-[#E7E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#78716C] mb-1">
              <span>Project Artifacts</span>
              <FolderGit2 className="h-3.5 w-3.5 text-[#064E3B]" />
            </div>
            <div className="text-[26px] font-serif font-bold text-[#1C1917]">
              {projects.length}
            </div>
            <div className="text-[11px] text-[#78716C]">
              Repository &amp; architecture evidence
            </div>
          </div>

        </div>
      </section>

      {/* ── Main Two-Column Architectural Dossier ── */}
      <main className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ── LEFT COLUMN (4 cols): Institutional Proof Dossier & Education ── */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Dossier Card */}
            <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#064E3B]" />
                  <h3 className="text-[14px] font-bold text-[#1C1917] tracking-tight uppercase">
                    Institutional Record
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#064E3B] font-semibold bg-[#064E3B]/10 px-2 py-0.5 rounded">
                  VERIFIED AUDIT
                </span>
              </div>

              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[#78716C]">Candidate ID</span>
                  <span className="font-mono font-semibold text-[#1C1917]">{candidateKey}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[#78716C]">Platform Authenticity</span>
                  <span className="font-semibold text-[#064E3B] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                    Meritlane Verified
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[#78716C]">Assessment Protocol</span>
                  <span className="font-mono text-[#1C1917]">75%+ Passing Standard</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Evaluation Status</span>
                  <span className="font-medium text-[#1C1917]">{isCandidateVerified ? "Verified Practitioner" : "In Progress"}</span>
                </div>
              </div>
            </div>

            {/* Academic Credentials Card */}
            {candidate.college && (
              <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E7E2DA] pb-3 text-[#064E3B]">
                  <GraduationCap className="h-4 w-4" />
                  <h3 className="text-[14px] font-bold text-[#1C1917] uppercase tracking-tight">
                    Academic Background
                  </h3>
                </div>
                <div>
                  <div className="text-[16px] font-serif font-bold text-[#1C1917]">
                    {candidate.college}
                  </div>
                  <div className="text-[13px] text-[#57534E] mt-0.5">
                    {candidate.degree || "Bachelor of Technology"} · {candidate.branch}
                  </div>
                  {candidate.gradYear && (
                    <div className="text-[12px] font-mono text-[#78716C] mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#78716C]" />
                      <span>Graduating Class of {candidate.gradYear}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GitHub Evidence Card */}
            {candidate.githubEvidence && (
              <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-4 w-4 text-[#1C1917]" />
                    <h3 className="text-[14px] font-bold text-[#1C1917] uppercase tracking-tight">
                      GitHub Activity
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA]">
                    SYNCHRONIZED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
                    <div className="text-[10px] font-mono uppercase text-[#78716C]">Public Repos</div>
                    <div className="text-[20px] font-serif font-bold text-[#1C1917] mt-0.5">
                      {candidate.githubEvidence.repoCount}
                    </div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
                    <div className="text-[10px] font-mono uppercase text-[#78716C]">Total Commits</div>
                    <div className="text-[20px] font-serif font-bold text-[#1C1917] mt-0.5">
                      ~{candidate.githubEvidence.totalCommits}
                    </div>
                  </div>
                </div>

                {candidate.githubEvidence.topLanguages && candidate.githubEvidence.topLanguages.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[#78716C] mb-2">
                      Top Verified Languages
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.githubEvidence.topLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[11px] font-mono bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA] px-2.5 py-1 rounded-md"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Engineering Focus & Specialization Card */}
            <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <Briefcase className="h-4 w-4" />
                  <h3 className="text-[14px] font-bold text-[#1C1917] uppercase tracking-tight">
                    Engineering Focus
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#064E3B] font-semibold bg-[#064E3B]/10 px-2 py-0.5 rounded">
                  {candidate.availability || "AVAILABLE"}
                </span>
              </div>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-start justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[#78716C] shrink-0">Target Roles</span>
                  <span className="font-semibold text-[#1C1917] text-right">
                    {candidate.targetRoles && candidate.targetRoles.length > 0
                      ? candidate.targetRoles.join(", ")
                      : "Software & Full-Stack Engineer"}
                  </span>
                </div>
                {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                  <div className="flex items-start justify-between border-b border-[#E7E2DA]/60 pb-2">
                    <span className="text-[#78716C] shrink-0">Locations</span>
                    <span className="font-mono text-[12px] text-[#1C1917] text-right">
                      {candidate.preferredLocations.join(", ")}
                    </span>
                  </div>
                )}
                {candidate.workPreference && (
                  <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                    <span className="text-[#78716C]">Work Model</span>
                    <span className="font-mono text-[#064E3B] text-right font-semibold">{candidate.workPreference}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span className="text-[#78716C]">Verified Standard</span>
                  <span className="font-semibold text-[#064E3B] text-right">≥75% Production Passing</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Graduation Class</span>
                  <span className="font-mono text-[#1C1917]">{candidate.gradYear ? `Class of ${candidate.gradYear}` : "Engineering Cohort"}</span>
                </div>
              </div>
            </div>

            {/* Architecture & Competency Domain Stack */}
            <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <Layers className="h-4 w-4" />
                  <h3 className="text-[14px] font-bold text-[#1C1917] uppercase tracking-tight">
                    Domain Architecture
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E2DA]">
                  {skills.length} SKILLS
                </span>
              </div>

              <div className="space-y-3 text-[12px]">
                {categorized.languages.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#78716C] mb-1.5 flex items-center justify-between">
                      <span>Languages &amp; Runtimes</span>
                      <span className="text-[#064E3B] font-bold">{categorized.languages.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categorized.languages.map((s) => {
                        const isVer = verifiedSkillsMap[s]?.status === "verified";
                        return (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border ${
                              isVer
                                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC] font-semibold"
                                : "bg-[#FAF8F5] text-[#57534E] border-[#E7E2DA]"
                            }`}
                          >
                            {isVer && <Check className="h-3 w-3 text-[#166534]" />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {categorized.frameworks.length > 0 && (
                  <div className="border-t border-[#E7E2DA]/60 pt-2.5">
                    <div className="text-[10px] font-mono uppercase text-[#78716C] mb-1.5 flex items-center justify-between">
                      <span>Web &amp; Application Frameworks</span>
                      <span className="text-[#064E3B] font-bold">{categorized.frameworks.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categorized.frameworks.map((s) => {
                        const isVer = verifiedSkillsMap[s]?.status === "verified";
                        return (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border ${
                              isVer
                                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC] font-semibold"
                                : "bg-[#FAF8F5] text-[#57534E] border-[#E7E2DA]"
                            }`}
                          >
                            {isVer && <Check className="h-3 w-3 text-[#166534]" />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {categorized.data.length > 0 && (
                  <div className="border-t border-[#E7E2DA]/60 pt-2.5">
                    <div className="text-[10px] font-mono uppercase text-[#78716C] mb-1.5 flex items-center justify-between">
                      <span>Databases &amp; Systems</span>
                      <span className="text-[#064E3B] font-bold">{categorized.data.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categorized.data.map((s) => {
                        const isVer = verifiedSkillsMap[s]?.status === "verified";
                        return (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border ${
                              isVer
                                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC] font-semibold"
                                : "bg-[#FAF8F5] text-[#57534E] border-[#E7E2DA]"
                            }`}
                          >
                            {isVer && <Check className="h-3 w-3 text-[#166534]" />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic Session Integrity & Security Card */}
            <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-3">
                <div className="flex items-center gap-2 text-[#064E3B]">
                  <Lock className="h-4 w-4" />
                  <h3 className="text-[14px] font-bold text-[#1C1917] uppercase tracking-tight">
                    Integrity Audit
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                  0 VIOLATIONS
                </span>
              </div>
              <div className="space-y-2.5 text-[12px] font-mono text-[#57534E]">
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span>Proctoring Security</span>
                  <span className="text-[#166534] font-semibold">Active &amp; Compliant</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span>Fullscreen Lockdown</span>
                  <span className="text-[#1C1917]">Enforced (No Tab Switch)</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E7E2DA]/60 pb-2">
                  <span>Hidden Edge Suites</span>
                  <span className="text-[#1C1917]">50 Tests per Task</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verification Status</span>
                  <span className="text-[11px] font-medium text-[#064E3B]">
                    Meritlane Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Institutional Actions & Verification Slip */}
            <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl p-5 shadow-xs space-y-3">
              <div className="text-[11px] font-mono uppercase text-[#78716C] font-semibold">
                Verified Dossier Actions
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 text-[12px] font-medium bg-[#1C1917] hover:bg-[#064E3B] text-white py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#86EFAC]" />
                      <span>Copied Verification Link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Candidate Dossier Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.print();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 text-[12px] font-medium bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA] py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>Print Official Audit Record</span>
                </button>
              </div>
            </div>

            {/* Standard of Verification Notice */}
            <div className="p-5 rounded-xl border border-[#064E3B]/20 bg-[#064E3B]/[0.03] space-y-2">
              <div className="flex items-center gap-2 text-[#064E3B]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  The Meritlane Guarantee
                </span>
              </div>
              <p className="text-[12px] text-[#57534E] leading-relaxed">
                Candidate competencies are authoritatively evaluated through proctored coding sandboxes and production test suites. Assessments require full-screen integrity and ≥75% benchmark mastery.
              </p>
            </div>

          </aside>

          {/* ── RIGHT COLUMN (8 cols): Skills, Projects, and Proof Artifacts ── */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* ── Skills Section Header & Interactive Filters ── */}
            <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2DA] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#064E3B] mb-0.5">
                    <Code className="h-4 w-4" />
                    <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                      Technical Competencies
                    </span>
                  </div>
                  <h2 className="text-[20px] font-serif font-bold text-[#1C1917]">
                    Skills &amp; Evidence Matrix
                  </h2>
                </div>

                <div className="text-[12px] font-mono text-[#78716C] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E7E2DA]">
                  Showing {filteredSkills.length} of {skills.length} skills
                </div>
              </div>

              {/* Filter Pills & Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      activeFilter === "all"
                        ? "bg-[#064E3B] text-white"
                        : "bg-[#FAF8F5] text-[#57534E] hover:bg-[#E7E2DA]/60"
                    }`}
                  >
                    All ({skills.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("verified")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      activeFilter === "verified"
                        ? "bg-[#064E3B] text-white"
                        : "bg-[#FAF8F5] text-[#57534E] hover:bg-[#E7E2DA]/60"
                    }`}
                  >
                    Verified ({verifiedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter("languages")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      activeFilter === "languages"
                        ? "bg-[#064E3B] text-white"
                        : "bg-[#FAF8F5] text-[#57534E] hover:bg-[#E7E2DA]/60"
                    }`}
                  >
                    Languages ({categorized.languages.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("frameworks")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      activeFilter === "frameworks"
                        ? "bg-[#064E3B] text-white"
                        : "bg-[#FAF8F5] text-[#57534E] hover:bg-[#E7E2DA]/60"
                    }`}
                  >
                    Web &amp; Frameworks ({categorized.frameworks.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter("data")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                      activeFilter === "data"
                        ? "bg-[#064E3B] text-white"
                        : "bg-[#FAF8F5] text-[#57534E] hover:bg-[#E7E2DA]/60"
                    }`}
                  >
                    Databases &amp; Cloud ({categorized.data.length})
                  </button>
                </div>

                {/* Instant search input */}
                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg text-[12px] text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {filteredSkills.map((skill, index) => {
                  const verifiedObj = verifiedSkillsMap[skill];
                  const isVerified = verifiedObj?.status === "verified";
                  const score = verifiedObj?.score;
                  const verifiedDate = verifiedObj?.verifiedAt
                    ? new Date(verifiedObj.verifiedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null;

                  const supportingProject = projects.find(
                    (p) =>
                      p.supportsClaim === skill ||
                      p.skillsUsed?.some((su) => su.toLowerCase() === skill.toLowerCase())
                  );

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all ${
                        isVerified
                          ? "bg-white border-[#16A34A]/40 shadow-xs hover:border-[#16A34A]"
                          : "bg-[#FAF8F5] border-[#E7E2DA] hover:border-[#C8BFB0]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isVerified ? "bg-[#16A34A]" : "bg-[#C8BFB0]"
                            }`}
                          />
                          <h4 className="font-serif text-[16px] font-bold text-[#1C1917]">
                            {skill}
                          </h4>
                        </div>

                        <div>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[10.5px] font-mono font-bold rounded">
                              ✓ VERIFIED {score ? `[${score}%]` : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 bg-white text-[#78716C] border border-[#E7E2DA] text-[10px] font-mono rounded">
                              LISTED SKILL
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[12px] text-[#78716C] leading-relaxed mb-3">
                        {isVerified
                          ? `Passed proctored coding and MCQ evaluation on ${verifiedDate}.`
                          : "Listed in candidate profile with project and repository backing."}
                      </p>

                      {supportingProject && (
                        <div className="pt-2 border-t border-[#E7E2DA]/60 flex items-center justify-between text-[11px]">
                          <span className="text-[#57534E] font-medium truncate max-w-[180px]">
                            Demonstrated in: <strong className="text-[#1C1917]">{supportingProject.title}</strong>
                          </span>
                          {supportingProject.repoUrl && (
                            <a
                              href={supportingProject.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#064E3B] font-mono font-semibold hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              Code ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* ── Featured Projects Section ── */}
            {projects.length > 0 && (
              <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-[#064E3B]" />
                    <div>
                      <h3 className="text-[18px] font-serif font-bold text-[#1C1917]">
                        Featured Engineering Projects
                      </h3>
                      <p className="text-[12px] text-[#78716C]">
                        Direct source code artifacts and application architectures evaluated on Meritlane.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-[#FAF8F5] border border-[#E7E2DA] px-2.5 py-1 rounded text-[#78716C]">
                    {projects.length} {projects.length === 1 ? "Project" : "Projects"}
                  </span>
                </div>

                <div className="space-y-4">
                  {projects.map((proj, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-5 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-white transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-[17px] font-serif font-bold text-[#1C1917]">
                          {proj.title}
                        </h4>
                        
                        <div className="flex items-center gap-2">
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E7E2DA] text-[#1C1917] hover:border-[#1C1917] text-[11px] font-mono font-semibold rounded transition-colors"
                            >
                              <GithubIcon className="h-3.5 w-3.5" />
                              <span>View Code ↗</span>
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#064E3B] text-white hover:bg-[#043327] text-[11px] font-mono font-semibold rounded transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Live Application</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {proj.description && (
                        <p className="text-[13px] text-[#57534E] leading-relaxed">
                          {proj.description}
                        </p>
                      )}

                      {proj.skillsUsed && proj.skillsUsed.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono uppercase text-[#78716C] mr-1">
                            Stack:
                          </span>
                          {proj.skillsUsed.map((sk) => (
                            <span
                              key={sk}
                              className="text-[10.5px] font-mono bg-white text-[#1C1917] border border-[#E7E2DA] px-2 py-0.5 rounded"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Official Institutional Seal Footer ── */}
            <div className="p-6 rounded-xl border border-[#E7E2DA] bg-gradient-to-r from-[#FAF8F5] to-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="h-10 w-10 rounded-xl bg-[#064E3B] text-white flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#1C1917]">
                    Meritlane Institutional Verification Authority
                  </div>
                  <div className="text-[11.5px] text-[#78716C]">
                    Verified technical skills and project assessments for engineering hiring teams.
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-center sm:text-right">
                <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-white border border-[#E7E2DA] text-[#78716C]">
                  CANDIDATE ID: {candidateKey}
                </span>
              </div>
            </div>

          </article>

        </div>
      </main>

      {/* ── Resume Viewer & Download Modal ── */}
      {isResumeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6"
        >
          <div className="bg-white border border-[#E7E2DA] rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2DA] bg-[#FAF8F5]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center shrink-0 border border-[#064E3B]/20">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-[#1C1917] truncate">
                      {candidate.resumeFileName || `${name.replace(/\s+/g, "_")}_Resume.pdf`}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] shrink-0 font-semibold">
                      Verified Resume
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#78716C] truncate mt-0.5">
                    Candidate: {name} · ID: {candidateKey}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                  title="Download Resume PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#E7E2DA] text-[12px] font-medium rounded-lg transition-colors shadow-2xs cursor-pointer"
                  title="Print Resume"
                >
                  <Printer className="h-3.5 w-3.5 text-[#78716C]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E2DA]/50 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Preview or Structured Verified Resume */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]/50">
              {candidate.resumePdfDataUrl || (resolvedResumeUrl && resolvedResumeUrl.toLowerCase().includes(".pdf")) ? (
                <div className="w-full h-[68vh] rounded-lg overflow-hidden border border-[#E7E2DA] bg-[#525659] shadow-inner">
                  <iframe
                    src={candidate.resumePdfDataUrl || resolvedResumeUrl}
                    title={`${name} Resume Preview`}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* High-fidelity Institutional Resume Document */
                <div className="bg-white border border-[#E7E2DA] rounded-lg p-6 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6 text-[#1C1917]">
                  {/* Resume Header */}
                  <div className="border-b border-[#E7E2DA] pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1C1917] leading-tight">
                          {name}
                        </h1>
                        <p className="text-[14px] text-[#064E3B] font-medium mt-1">
                          {candidate.branch || "Software Engineering"} · Class of {candidate.gradYear || "2026"}
                        </p>
                        <p className="text-[13px] text-[#78716C] mt-0.5">
                          {candidate.college}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#78716C]">
                          ID: {candidateKey}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Links */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-[12px] text-[#57534E]">
                      {candidate.githubUrl && (
                        <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#064E3B] underline underline-offset-2">
                          <GithubIcon className="h-3.5 w-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {candidate.linkedinUrl && (
                        <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#064E3B] underline underline-offset-2">
                          <Globe className="h-3.5 w-3.5 text-[#0A66C2]" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {resolvedPortfolioUrl && (
                        <a href={resolvedPortfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#064E3B] underline underline-offset-2">
                          <Globe className="h-3.5 w-3.5 text-[#064E3B]" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {candidate.bio && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C] font-semibold mb-2">
                        Professional Summary
                      </h4>
                      <p className="text-[13.5px] leading-relaxed text-[#44403C]">
                        {candidate.bio}
                      </p>
                    </div>
                  )}

                  {/* Verified Skills */}
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C] font-semibold mb-3">
                      Verified Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => {
                        const isVer = verifiedSkillsMap[skill]?.status === "verified";
                        const score = verifiedSkillsMap[skill]?.score;
                        return (
                          <span
                            key={skill}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-mono border ${
                              isVer
                                ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC] font-semibold"
                                : "bg-[#FAF8F5] text-[#57534E] border-[#E7E2DA]"
                            }`}
                          >
                            {isVer && <CheckCircle2 className="h-3 w-3 text-[#166534]" />}
                            <span>{skill}</span>
                            {score !== undefined && <span className="opacity-70 text-[10px]">({score}%)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Projects */}
                  {projects.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C] font-semibold mb-3">
                        Engineering Projects
                      </h4>
                      <div className="space-y-4">
                        {projects.map((proj, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5]/60">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="font-semibold text-[14px] text-[#1C1917]">
                                {proj.title}
                              </h5>
                              <div className="flex items-center gap-2 shrink-0">
                                {proj.repoUrl && (
                                  <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[#064E3B] hover:underline flex items-center gap-1">
                                    <FolderGit2 className="h-3 w-3" />
                                    <span>Code</span>
                                  </a>
                                )}
                                {proj.liveUrl && (
                                  <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[#064E3B] hover:underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Live</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            {proj.description && (
                              <p className="text-[12.5px] text-[#57534E] mt-1.5 leading-relaxed">
                                {proj.description}
                              </p>
                            )}
                            {proj.skillsUsed && proj.skillsUsed.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {proj.skillsUsed.map((sk) => (
                                  <span key={sk} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-white border border-[#E7E2DA] text-[#78716C]">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Resume Text if available and relevant */}
                  {candidate.resumeText && candidate.resumeText.length > 100 && (
                    <div className="pt-4 border-t border-[#E7E2DA]">
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#78716C] font-semibold mb-2">
                        Resume Transcript &amp; Raw Evidence
                      </h4>
                      <div className="p-4 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[12px] font-mono text-[#57534E] whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                        {candidate.resumeText}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E7E2DA] bg-white flex items-center justify-between">
              <span className="text-[11.5px] text-[#78716C] font-mono">
                Verified Candidate Record · Meritlane Registry
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#FAF8F5] text-[#1C1917] text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#064E3B] hover:bg-[#043327] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Resume</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
