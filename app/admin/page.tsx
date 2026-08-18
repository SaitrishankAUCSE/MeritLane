"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Code,
  FileText, 
  Loader2, 
  Eye, 
  Check, 
  X, 
  Search,
  Download,
  BarChart3,
  Layers,
  Activity,
  UserCheck,
  Building2,
  Filter,
  History,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCheck,
  Trash2
} from "lucide-react";

import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface ProjectEntry {
  id: string;
  title: string;
  repoUrl: string;
  liveUrl?: string;
  description: string;
}

interface CandidateAdminRecord {
  uid: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  gradYear: string;
  githubUrl: string;
  resumeUrl: string;
  skills: string[];
  projects: ProjectEntry[];
  verificationStatus: "draft" | "pending" | "verified" | "changes_required" | "rejected";
  verificationReason: string | null;
  verifiedAt: number | null;
  verifiedByUid: string | null;
  verifiedByEmail: string | null;
  updatedAt: number | null;
  assessmentScores: Record<string, any> | null;
  assessmentDate: any;
}

const FEEDBACK_PRESETS = [
  "README lacks architectural overview, API schema, and local execution instructions.",
  "Project repositories are set to private and cannot be evaluated by reviewers.",
  "Codebase lacks automated unit test coverage or CI/CD workflow configuration.",
  "Monolithic repository with single commit; requires genuine git development history.",
  "Projects demonstrate superficial tutorials; submit an original production system."
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAdminRecord | null>(null);

  // Active Tab: queue, directory, analytics, audit
  const [activeTab, setActiveTab] = useState<"queue" | "directory" | "analytics" | "audit">("queue");

  // Action dialog states
  const [actionType, setActionType] = useState<"verified" | "changes_required" | "rejected" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCandidates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/candidates", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}: Failed to fetch candidates`);
      }

      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates);
      }
    } catch (err: any) {
      console.error("API fallback fetchCandidates notice:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time Firestore snapshot listener for instant live updates
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribeCandidates = onSnapshot(
      collection(db, "candidates"),
      (candSnapshot) => {
        const candidateRecords: CandidateAdminRecord[] = [];

        candSnapshot.forEach((docSnap) => {
          const candidateData = docSnap.data();
          const uid = docSnap.id;

          candidateRecords.push({
            uid,
            name: candidateData.name || "",
            email: candidateData.email || "",
            college: candidateData.college || "",
            branch: candidateData.branch || "",
            gradYear: candidateData.gradYear || "",
            githubUrl: candidateData.githubUrl || "",
            resumeUrl: candidateData.resumeUrl || "",
            skills: candidateData.skills || [],
            projects: candidateData.projects || [],
            verificationStatus: candidateData.verificationStatus || "draft",
            verificationReason: candidateData.verificationReason || null,
            verifiedAt: candidateData.verifiedAt || null,
            verifiedByUid: candidateData.verifiedByUid || null,
            verifiedByEmail: candidateData.verifiedByEmail || null,
            updatedAt: candidateData.updatedAt || null,
            assessmentScores: candidateData.assessmentScores || null,
            assessmentDate: candidateData.assessmentDate || null,
          });
        });

        // Sort: pending first, then by updatedAt descending
        candidateRecords.sort((a, b) => {
          if (a.verificationStatus === "pending" && b.verificationStatus !== "pending") return -1;
          if (b.verificationStatus === "pending" && a.verificationStatus !== "pending") return 1;
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        });

        setCandidates(candidateRecords);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore onSnapshot error, using API fallback:", error);
        fetchCandidates();
      }
    );

    return () => unsubscribeCandidates();
  }, [user, fetchCandidates]);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleExecuteAction = async (directType?: "verified" | "changes_required" | "rejected") => {
    const effectiveActionType = directType || actionType;
    if (!selectedCandidate || !effectiveActionType || !user) return;

    if ((effectiveActionType === "changes_required" || effectiveActionType === "rejected") && !actionReason.trim()) {
      setActionError("Please provide a reason or select a preset for this verification decision.");
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      // 1. Direct Firestore write for instant real-time sync
      try {
        const candidateRef = doc(db, "candidates", selectedCandidate.uid);
        await updateDoc(candidateRef, {
          verificationStatus: effectiveActionType,
          verificationReason: actionReason.trim() || null,
          verifiedByEmail: user.email,
          verifiedByUid: user.uid,
          verifiedAt: Date.now(),
          updatedAt: Date.now(),
        });
      } catch (directErr) {
        console.warn("Direct Firestore update fallback, using API route:", directErr);
        const idToken = await user.getIdToken();
        const res = await fetch("/api/admin/verify-candidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            candidateId: selectedCandidate.uid,
            status: effectiveActionType,
            reason: actionReason.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update verification status");
        }
      }

      if (effectiveActionType === "verified") {
        setSuccessToast("Candidate verified successfully.");
      } else if (effectiveActionType === "changes_required") {
        setSuccessToast("Changes request submitted.");
      } else if (effectiveActionType === "rejected") {
        setSuccessToast("Candidate rejected.");
      }

      // Close modal
      setActionType(null);
      setActionReason("");
      setSelectedCandidate(null);
    } catch (err: any) {
      setActionError(err.message || "Operation failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetCooldown = async (candidateId: string) => {
    if (!user) return;
    setResetLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/reset-cooldown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ candidateId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset cooldown");
      }

      setSuccessToast("Candidate cooldown reset. They can re-take the assessment immediately.");
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Could not reset cooldown.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (!user) return;
    if (!window.confirm("WARNING: This will delete ALL users, candidates, and employers from both Firebase Auth and Firestore, EXCEPT the admin account. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/wipe-database", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessToast(`Wiped successfully: ${data.stats.deletedAuthCount} Auth users, ${data.stats.deletedFirestoreUsers} Firestore users.`);
        fetchCandidates();
      } else {
        throw new Error(data.error || "Failed to wipe database");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error wiping database.");
    } finally {
      setLoading(false);
    }
  };

  // Metrics from real data
  const pendingCount = candidates.filter((c) => c.verificationStatus === "pending").length;
  const verifiedCount = candidates.filter((c) => c.verificationStatus === "verified").length;
  const changesCount = candidates.filter((c) => c.verificationStatus === "changes_required").length;
  const totalCount = candidates.length;
  const verifiedRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // Filtered list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.verificationStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.college.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [candidates, statusFilter, searchQuery]);

  // Queue only candidates pending review
  const queueCandidates = useMemo(() => {
    return candidates.filter((c) => c.verificationStatus === "pending");
  }, [candidates]);

  // Audit list: candidates that have been reviewed
  const auditLogs = useMemo(() => {
    return candidates
      .filter((c) => c.verifiedAt || c.verificationStatus === "verified" || c.verificationStatus === "changes_required" || c.verificationStatus === "rejected")
      .sort((a, b) => (b.verifiedAt || b.updatedAt || 0) - (a.verifiedAt || a.updatedAt || 0));
  }, [candidates]);

  // CSV Export for candidates
  const exportToCSV = () => {
    const headers = ["UID", "Name", "Email", "College", "Branch", "GradYear", "Status", "Skills", "ProjectsCount", "VerifiedBadge", "ReviewedBy"];
    const rows = filteredCandidates.map((c) => [
      c.uid,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      `"${c.college.replace(/"/g, '""')}"`,
      `"${c.branch.replace(/"/g, '""')}"`,
      c.gradYear,
      c.verificationStatus,
      `"${c.skills.join(', ')}"`,
      c.projects?.length || 0,
      c.verificationStatus === 'verified' ? "Yes" : "No",
      c.verifiedByEmail || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meritlane_talent_dossier_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="verified" size="sm">Verified</Badge>;
      case "pending":
        return <Badge variant="pending" size="sm">Pending Review</Badge>;
      case "changes_required":
        return <Badge variant="changes_required" size="sm">Needs Changes</Badge>;
      case "rejected":
        return <Badge variant="rejected" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 pt-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Administrator Command Center
              </h1>
              <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 text-xs font-semibold text-white">
                Superadmin
              </span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">
              Direct verification pipeline, repository audits, candidate directory, and platform integrity logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWipeDatabase}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Wipe Test Users
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Talent Dossier
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCandidates} 
              loading={loading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verification Queue</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{pendingCount}</p>
              <p className="mt-1 text-[11px] text-zinc-400">Awaiting codebase review</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verified Talent</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{verifiedCount}</p>
              <p className="mt-1 text-[11px] text-zinc-400">{verifiedRate}% verification pass rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Action Required</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{changesCount}</p>
              <p className="mt-1 text-[11px] text-zinc-400">Feedback sent to candidate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Registered</span>
                <Layers className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{totalCount}</p>
              <p className="mt-1 text-[11px] text-zinc-400">Candidate portfolios</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "queue"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pending Review Queue ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "directory"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Candidate Directory ({filteredCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "analytics"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Platform Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "audit"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Trail &amp; History ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: PENDING QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Priority Verification Queue</h2>
                <p className="text-xs text-zinc-500">Candidates awaiting manual codebase audit and verification.</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {queueCandidates.length === 0 ? (
                  <div className="flex min-h-[250px] flex-col items-center justify-center space-y-3 p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">Queue is completely clear!</p>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      All submitted candidate profiles have been reviewed and verified.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-600">
                      <thead className="border-b border-zinc-200 bg-zinc-50/80 font-bold uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="px-6 py-3.5">Candidate</th>
                          <th className="px-6 py-3.5">College &amp; Branch</th>
                          <th className="px-6 py-3.5">Skills</th>
                          <th className="px-6 py-3.5">Submitted Projects</th>
                          <th className="px-6 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {queueCandidates.map((c) => (
                          <tr key={c.uid} className="hover:bg-zinc-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-zinc-900">{c.name || "Unnamed Candidate"}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{c.email || c.uid.slice(0, 12) + "..."}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-zinc-900 font-medium">{c.college || "—"}</div>
                              <div className="text-[11px] text-zinc-400">{c.branch || "—"} {c.gradYear ? `(${c.gradYear})` : ""}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {c.skills && c.skills.length > 0 ? (
                                  c.skills.slice(0, 3).map((s, i) => (
                                    <span key={i} className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-zinc-400 text-xs">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-zinc-900">
                                {c.projects?.length || 0} {c.projects?.length === 1 ? "project" : "projects"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setActionType(null);
                                  setActionReason("");
                                  setActionError(null);
                                }}
                                leftIcon={<Eye className="h-3.5 w-3.5" />}
                              >
                                Audit &amp; Verify
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: CANDIDATE DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Full Candidate Directory</h2>
                <p className="text-xs text-zinc-500">Search and filter across all candidates in the Meritlane database.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search name, college, skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-sm transition-all hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition-all hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="changes_required">Needs Changes</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-600">
                    <thead className="border-b border-zinc-200 bg-zinc-50/80 font-bold uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-6 py-3.5">Candidate</th>
                        <th className="px-6 py-3.5">College &amp; Branch</th>
                        <th className="px-6 py-3.5">Skills</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Projects</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredCandidates.map((c) => (
                        <tr key={c.uid} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-zinc-900">{c.name || "Unnamed"}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{c.email || c.uid.slice(0, 12) + "..."}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-zinc-900 font-medium">{c.college || "—"}</div>
                            <div className="text-[11px] text-zinc-400">{c.branch || "—"} {c.gradYear ? `(${c.gradYear})` : ""}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {c.skills && c.skills.length > 0 ? (
                                c.skills.slice(0, 3).map((s, i) => (
                                  <span key={i} className="inline-block rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-zinc-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(c.verificationStatus)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-zinc-900">
                              {c.projects?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => {
                                setSelectedCandidate(c);
                                setActionType(null);
                                setActionReason("");
                                setActionError(null);
                              }}
                              leftIcon={<Eye className="h-3.5 w-3.5" />}
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: PLATFORM ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Platform KPIs &amp; Verification Funnel</h2>
              <p className="text-xs text-zinc-500">Live operational data from candidates and assessments.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verification Rate</span>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-zinc-900">{verifiedRate}%</p>
                  <p className="mt-1 text-xs text-zinc-500">{verifiedCount} verified out of {totalCount} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Assessment Readiness</span>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-indigo-600">
                    {candidates.filter(c => c.verificationStatus === 'verified').length}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Passed Python technical audit</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Repositories Submitted</span>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-zinc-900">
                    {candidates.reduce((acc, c) => acc + (c.projects?.length || 0), 0)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Production codebases attached</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Administrative Decision History</h2>
              <p className="text-xs text-zinc-500">Immutable audit log of all verification decisions and reasons.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                {auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-zinc-500">
                    No decisions logged yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-600">
                      <thead className="border-b border-zinc-200 bg-zinc-50/80 font-bold uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="px-6 py-3.5">Candidate</th>
                          <th className="px-6 py-3.5">Decision</th>
                          <th className="px-6 py-3.5">Reviewed By</th>
                          <th className="px-6 py-3.5">Feedback / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {auditLogs.map((c) => (
                          <tr key={c.uid} className="hover:bg-zinc-50/70">
                            <td className="px-6 py-4 font-semibold text-zinc-900">
                              {c.name || c.email || c.uid}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(c.verificationStatus)}
                            </td>
                            <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">
                              {c.verifiedByEmail || "saitrishankb9@gmail.com"}
                            </td>
                            <td className="px-6 py-4 text-zinc-600 max-w-sm">
                              {c.verificationReason || "Standard verification approval."}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Candidate Review Modal */}
      {selectedCandidate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-200/80 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-zinc-900">{selectedCandidate.name || "Candidate Review"}</h2>
                  {getStatusBadge(selectedCandidate.verificationStatus)}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedCandidate.email} • UID: <code className="text-xs font-mono text-zinc-600">{selectedCandidate.uid}</code>
                </p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Academic & Background */}
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Academic Identity</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block">College / University</span>
                    <span className="font-semibold text-zinc-900">{selectedCandidate.college || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Branch</span>
                    <span className="font-semibold text-zinc-900">{selectedCandidate.branch || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Graduation Year</span>
                    <span className="font-semibold text-zinc-900">{selectedCandidate.gradYear || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Skills & External Links */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Skills &amp; Profiles</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                      selectedCandidate.skills.map((skill, idx) => (
                        <span key={idx} className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">No skills specified</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs">
                    {selectedCandidate.githubUrl && (
                      <a 
                        href={selectedCandidate.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <Code className="h-4 w-4" /> GitHub Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {selectedCandidate.resumeUrl && (
                      <a 
                        href={selectedCandidate.resumeUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <FileText className="h-4 w-4" /> View Resume <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Assessment Signal & Admin Cooldown Override */}
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Technical Assessment Signal</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    loading={resetLoading}
                    onClick={() => handleResetCooldown(selectedCandidate.uid)}
                    leftIcon={<RotateCcw className="h-3 w-3" />}
                    title="Reset 14-day cooldown so candidate can re-test immediately"
                  >
                    Reset Cooldown
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedCandidate.verificationStatus === 'verified' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-zinc-400" />
                    )}
                    <span className="text-xs font-semibold text-zinc-900">
                      {selectedCandidate.verificationStatus === 'verified' ? "Passed Code Assessment (Full Score)" : "Assessment Pending / Incomplete"}
                    </span>
                  </div>
                  {selectedCandidate.assessmentScores && (
                    <span className="text-xs font-mono bg-zinc-100 px-2.5 py-1 rounded text-zinc-700">
                      Score: {JSON.stringify(selectedCandidate.assessmentScores)}
                    </span>
                  )}
                </div>
              </div>

              {/* Project Submissions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Submitted Codebases ({selectedCandidate.projects?.length || 0})
                </h3>
                {selectedCandidate.projects && selectedCandidate.projects.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCandidate.projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="rounded-xl border border-zinc-200/90 bg-white p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-zinc-900 text-sm">{proj.title || `Project #${idx + 1}`}</h4>
                          <div className="flex items-center gap-3 text-xs">
                            {proj.repoUrl && (
                              <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold">
                                <Code className="h-3.5 w-3.5" /> Repository <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {proj.liveUrl && (
                              <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-zinc-600 hover:underline inline-flex items-center gap-1">
                                Demo <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">{proj.description || "No architecture description provided."}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No projects submitted yet.</p>
                )}
              </div>

              {/* Existing Feedback / Reason if any */}
              {selectedCandidate.verificationReason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">Previous Verification Feedback</span>
                  <p className="text-xs text-amber-950 font-mono">{selectedCandidate.verificationReason}</p>
                  {selectedCandidate.verifiedByEmail && (
                    <span className="text-[11px] text-amber-700 block mt-2">
                      Reviewed by: {selectedCandidate.verifiedByEmail}
                    </span>
                  )}
                </div>
              )}

              {/* Action Error */}
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {actionError}
                </div>
              )}

              {/* Action Form (if Changes Required or Reject is clicked) */}
              {actionType && actionType !== "verified" && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4.5 space-y-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Reason for {actionType === "changes_required" ? "Requesting Changes" : "Rejection"} <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Preset quick buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-500">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {FEEDBACK_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActionReason(preset)}
                          className="rounded bg-white border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 transition-colors text-left"
                        >
                          {preset.slice(0, 45)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter specific audit remarks or click a preset above..."
                    className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setActionType(null);
                        setActionReason("");
                        setActionError(null);
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleExecuteAction()}
                      loading={actionLoading}
                      className={actionType === "rejected" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    >
                      Submit Decision
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            {!actionType && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setActionType("rejected");
                      setActionReason("");
                      setActionError(null);
                    }}
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Reject
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-800 hover:bg-amber-50"
                    onClick={() => {
                      setActionType("changes_required");
                      setActionReason("");
                      setActionError(null);
                    }}
                    leftIcon={<AlertTriangle className="h-4 w-4" />}
                  >
                    Request Changes
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={() => {
                      handleExecuteAction("verified");
                    }}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Verify Candidate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
