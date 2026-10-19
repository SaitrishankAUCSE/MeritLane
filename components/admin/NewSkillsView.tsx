"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  ExternalLink,
  RefreshCw,
  Mail,
  GraduationCap,
  FileText,
  CheckCircle2,
  Clock,
  Code,
  User,
  Filter,
  PlusCircle,
  Phone,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { sanitizeUrl } from "@/lib/security/url";

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

export interface NewSkillRecord {
  id: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateCollege: string;
  candidateBranch: string;
  candidateGradYear: string;
  candidateGithubUrl?: string;
  candidateResumeUrl?: string;
  candidateBio?: string;
  candidateKey?: string;
  skill: string;
  allSkills: string[];
  status: "pending" | "reviewed" | "track_created";
  createdAt: string | null;
  updatedAt?: string | null;
}

interface NewSkillsViewProps {
  newSkills: NewSkillRecord[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: "pending" | "reviewed" | "track_created") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function NewSkillsView({
  newSkills,
  loading,
  onRefresh,
  onUpdateStatus,
  onDelete,
}: NewSkillsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "track_created">("all");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<NewSkillRecord | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const filtered = useMemo(() => {
    return newSkills.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.skill.toLowerCase().includes(q) ||
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateEmail.toLowerCase().includes(q) ||
        item.candidateCollege.toLowerCase().includes(q) ||
        (item.candidateKey && item.candidateKey.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [newSkills, statusFilter, searchQuery]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  // Compute metrics
  const pendingCount = newSkills.filter((s) => s.status === "pending").length;
  const uniqueSkillsCount = new Set(newSkills.map((s) => s.skill.toLowerCase())).size;
  const uniqueCandidatesCount = new Set(newSkills.map((s) => s.candidateUid)).size;

  const handleStatusChange = async (id: string, newStatus: "pending" | "reviewed" | "track_created") => {
    try {
      setActionInProgress(id);
      await onUpdateStatus(id, newStatus);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to remove this skill record?")) return;
    try {
      setActionInProgress(id);
      await onDelete(id);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Requests
              </span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{newSkills.length}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Novel skills entered across platform</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Unique Technologies
              </span>
              <Code className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{uniqueSkillsCount}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Distinct uncurated skill tags</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Candidates
              </span>
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{uniqueCandidatesCount}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Talent requesting new tracks</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Pending Triage
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pendingCount}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Awaiting admin track creation</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Controls Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search skill, candidate, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-low border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-surface-low p-1 rounded-md border border-border text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "all" ? "bg-white text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({newSkills.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "pending" ? "bg-white text-amber-700 font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("reviewed")}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "reviewed" ? "bg-white text-blue-700 font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviewed ({newSkills.filter((s) => s.status === "reviewed").length})
            </button>
            <button
              onClick={() => setStatusFilter("track_created")}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "track_created" ? "bg-white text-emerald-700 font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Track Created ({newSkills.filter((s) => s.status === "track_created").length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 text-xs border-border flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-lg border border-border overflow-hidden shadow-xs">
        {loading && newSkills.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-foreground" />
            Loading new skill records...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Sparkles className="h-8 w-8 text-amber-500/50 mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">No new skill requests match your criteria</p>
            <p className="mt-1">When candidates enter novel or custom skills on their profiles, they will reflect here instantly with full candidate credentials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF7F0] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">New Skill</th>
                  <th className="py-3 px-4">Candidate Info</th>
                  <th className="py-3 px-4">Academic Background</th>
                  <th className="py-3 px-4">Credentials &amp; Links</th>
                  <th className="py-3 px-4">Other Skills</th>
                  <th className="py-3 px-4">Status &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {paginated.map((item) => {
                  const isPending = item.status === "pending";
                  const isCreated = item.status === "track_created";
                  const isReviewed = item.status === "reviewed";

                  return (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* 1. Skill Name */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100/70 border border-amber-300 text-amber-900 font-bold text-xs tracking-tight">
                            <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
                            {item.skill}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* 2. Candidate Info */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedCandidateModal(item)}
                              className="font-semibold text-foreground hover:underline text-left"
                            >
                              {item.candidateName}
                            </button>
                            {item.candidateKey && (
                              <span className="text-[9px] font-mono bg-surface-high border border-border px-1 rounded text-muted-foreground">
                                {item.candidateKey}
                              </span>
                            )}
                          </div>
                          {item.candidateEmail && (
                            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                              <Mail className="h-3 w-3 shrink-0" />
                              <a
                                href={`mailto:${item.candidateEmail}`}
                                className="truncate hover:text-foreground hover:underline"
                                title={item.candidateEmail}
                              >
                                {item.candidateEmail}
                              </a>
                            </div>
                          )}
                          {item.candidatePhone && (
                            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                              <Phone className="h-3 w-3 shrink-0" />
                              <a href={`tel:${item.candidatePhone}`} className="hover:text-foreground">
                                {item.candidatePhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Academic Background */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="space-y-0.5 text-[11px]">
                          {item.candidateCollege ? (
                            <div className="flex items-start gap-1 text-foreground font-medium">
                              <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="line-clamp-2" title={item.candidateCollege}>
                                {item.candidateCollege}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">College not specified</span>
                          )}
                          {(item.candidateBranch || item.candidateGradYear) && (
                            <div className="text-[10px] text-muted-foreground pl-4.5">
                              {item.candidateBranch} {item.candidateGradYear ? `· Class of ${item.candidateGradYear}` : ""}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Credentials & Links */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1 items-start text-[11px]">
                          {item.candidateResumeUrl ? (
                            <a
                              href={sanitizeUrl(item.candidateResumeUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 hover:underline font-medium"
                            >
                              <FileText className="h-3 w-3 shrink-0" />
                              <span>View Resume PDF</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[10px] italic">No resume URL</span>
                          )}

                          {item.candidateGithubUrl && (
                            <a
                              href={sanitizeUrl(item.candidateGithubUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline font-medium"
                            >
                              <GithubIcon className="h-3 w-3 shrink-0" />
                              <span>GitHub Profile</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedCandidateModal(item)}
                            className="text-[10px] text-muted-foreground hover:text-foreground underline pt-0.5"
                          >
                            Full profile details →
                          </button>
                        </div>
                      </td>

                      {/* 5. Other Declared Skills */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {(item.allSkills || [])
                            .filter((s) => s.toLowerCase() !== item.skill.toLowerCase())
                            .slice(0, 4)
                            .map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-surface-high border border-border text-[10px] text-foreground font-mono"
                              >
                                {s}
                              </span>
                            ))}
                          {(item.allSkills || []).length > 5 && (
                            <span className="text-[9px] text-muted-foreground self-center">
                              +{item.allSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Status & Actions */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          {/* Status Badge & Selector */}
                          <select
                            value={item.status}
                            disabled={actionInProgress === item.id}
                            onChange={(e) =>
                              handleStatusChange(
                                item.id,
                                e.target.value as "pending" | "reviewed" | "track_created"
                              )
                            }
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                              isPending
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : isCreated
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="reviewed">REVIEWED</option>
                            <option value="track_created">TRACK CREATED</option>
                          </select>

                          {/* Quick Action: Create Track */}
                          <Link
                            href={`/admin/question-drafts?skill=${encodeURIComponent(item.skill)}`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-1 rounded transition-colors"
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span>Create Track</span>
                          </Link>

                          {onDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={actionInProgress === item.id}
                              className="text-[10px] text-muted-foreground hover:text-danger flex items-center gap-1"
                              title="Delete record"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-[#FAF7F0] text-xs">
            <span className="text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Full Candidate Detail Modal ── */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-[#FAF7F0] px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-800" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Candidate Profile &amp; Requested Skill
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Complete candidate credentials submitted with skill:{" "}
                    <span className="font-semibold text-amber-800 font-mono">
                      {selectedCandidateModal.skill}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-border transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Identity Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface-low rounded-lg border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      {selectedCandidateModal.candidateName}
                    </span>
                    {selectedCandidateModal.candidateKey && (
                      <span className="text-[10px] font-mono bg-white border border-border px-1.5 py-0.5 rounded font-semibold text-emerald-900">
                        {selectedCandidateModal.candidateKey}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {selectedCandidateModal.candidateEmail}
                  </p>
                  {selectedCandidateModal.candidatePhone && (
                    <p className="text-[11px] text-muted-foreground">
                      Phone: {selectedCandidateModal.candidatePhone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedCandidateModal.candidateResumeUrl && (
                    <a
                      href={sanitizeUrl(selectedCandidateModal.candidateResumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-950 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Resume PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedCandidateModal.candidateGithubUrl && (
                    <a
                      href={sanitizeUrl(selectedCandidateModal.candidateGithubUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-foreground text-white font-semibold text-xs hover:bg-black transition-colors"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Academic Credentials */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-foreground" />
                  <span>Academic Background</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-border">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">College / University</span>
                    <span className="font-semibold text-foreground">
                      {selectedCandidateModal.candidateCollege || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Degree &amp; Branch</span>
                    <span className="font-semibold text-foreground">
                      {selectedCandidateModal.candidateBranch || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Graduation Year</span>
                    <span className="font-semibold text-foreground">
                      {selectedCandidateModal.candidateGradYear || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio / Headline */}
              {selectedCandidateModal.candidateBio && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Headline / Bio
                  </h4>
                  <p className="p-3 bg-surface-low rounded border border-border text-foreground leading-relaxed">
                    {selectedCandidateModal.candidateBio}
                  </p>
                </div>
              )}

              {/* Skills Grid */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-foreground" />
                  <span>Technical Skills Stack</span>
                </h4>
                <div className="p-3 bg-white rounded-lg border border-border space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Newly Requested / Uncurated Skill:
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs font-mono">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      {selectedCandidateModal.skill}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      All Declared Skills ({selectedCandidateModal.allSkills?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedCandidateModal.allSkills || []).map((s, idx) => {
                        const isRequested = s.toLowerCase() === selectedCandidateModal.skill.toLowerCase();
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                              isRequested
                                ? "bg-amber-100 border border-amber-400 text-amber-900 font-bold"
                                : "bg-surface-high border border-border text-foreground"
                            }`}
                          >
                            {s} {isRequested ? "★" : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Link
                  href={`/admin/question-drafts?skill=${encodeURIComponent(selectedCandidateModal.skill)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-950 transition-colors shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Generate Assessment Track for {selectedCandidateModal.skill}</span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCandidateModal(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
