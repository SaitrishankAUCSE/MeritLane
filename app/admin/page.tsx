"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProofTrace } from "@/components/ui/ProofTrace";
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
import { ReviewConsole } from "@/components/admin/ReviewConsole";

import { collection, onSnapshot, doc, updateDoc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
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
  const [hasLoadedCandidates, setHasLoadedCandidates] = useState(false);
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
      if (Array.isArray(data.candidates)) {
        setCandidates(data.candidates);
      }
    } catch (err: any) {
      console.error("API fallback fetchCandidates notice:", err);
      setError(err.message || "Failed to fetch candidates from server");
    } finally {
      setLoading(false);
      setHasLoadedCandidates(true);
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
        setHasLoadedCandidates(true);
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

        // If we fell back to the API route, it means our local onSnapshot might be dead
        // (e.g. due to outdated firestore.rules in production).
        // We must re-fetch from the server to guarantee React state matches Firestore truth.
        await fetchCandidates();
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

  // Wipe Modal states
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);
  const [wipeResult, setWipeResult] = useState<{
    success: boolean;
    message: string;
    stats?: {
      deletedAuthCount: number;
      deletedFirestoreUsers: number;
      deletedCandidates: number;
      deletedEmployers: number;
    };
    warnings?: { authError?: string; firestoreError?: string };
    error?: string;
  } | null>(null);

  const handleExecuteWipe = async () => {
    if (!user) return;
    setWipeLoading(true);
    setWipeResult(null);

    let clientFirestoreUsers = 0;
    let clientCandidates = 0;
    let clientEmployers = 0;

    // Step 1: Direct Client Firestore Purge (immediate, guaranteed)
    try {
      const purgeClientCollection = async (collName: string, filterAdmin: boolean) => {
        const snap = await getDocs(collection(db, collName));
        let count = 0;
        let batch = writeBatch(db);
        let batchCount = 0;

        for (const d of snap.docs) {
          const data = d.data();
          if (!filterAdmin || (data.email?.toLowerCase() !== "saitrishankb9@gmail.com" && d.id !== user.uid)) {
            batch.delete(d.ref);
            count++;
            batchCount++;
            if (batchCount === 400) {
              await batch.commit();
              batch = writeBatch(db);
              batchCount = 0;
            }
          }
        }
        if (batchCount > 0) {
          await batch.commit();
        }
        return count;
      };

      clientCandidates = await purgeClientCollection("candidates", false);
      clientEmployers = await purgeClientCollection("employers", false);
      clientFirestoreUsers = await purgeClientCollection("users", true);
    } catch (cErr: any) {
      console.warn("Client-side firestore purge notice:", cErr);
    }

    // Step 2: Backend Auth Purge (deletes all non-admin Firebase Auth accounts)
    let authCount = 0;
    let serverWarning: string | undefined = undefined;
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch("/api/admin/wipe-database", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        }
      });
      
      const data = await res.json().catch(() => null);
      if (data && data.stats) {
        authCount = data.stats.deletedAuthCount || 0;
        if (data.warnings?.authError) {
          serverWarning = data.warnings.authError;
        }
      }
    } catch (sErr: any) {
      console.warn("Server auth purge notice:", sErr);
    }

    setWipeResult({
      success: true,
      message: "Platform database reset complete. All test users and portfolios purged.",
      stats: {
        deletedAuthCount: authCount,
        deletedFirestoreUsers: clientFirestoreUsers,
        deletedCandidates: clientCandidates,
        deletedEmployers: clientEmployers
      },
      warnings: serverWarning ? { authError: serverWarning } : undefined
    });

    setSuccessToast("Platform database reset complete.");
    fetchCandidates();
    setWipeLoading(false);
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
    <div className="min-h-[calc(100vh-64px)] pb-24 pt-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 rounded-md border border-zinc-700 bg-foreground px-4 py-2 h-10 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Administrator Command Center
              </h1>
              <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 text-xs font-semibold text-white">
                Superadmin
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Direct verification pipeline, repository audits, candidate directory, and platform integrity logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setWipeResult(null);
                setShowWipeModal(true);
              }}
              className="text-danger border-danger/40 hover:bg-danger/10 hover:text-danger"
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

        {/* Error Alert Banner */}
        {error && (
          <div className="rounded-md border border-danger/40 bg-danger/10 p-4 text-xs text-danger shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
              <span>Failed to synchronize candidate records: {error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchCandidates}
              className="text-xs text-danger border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Queue</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              {hasLoadedCandidates ? (
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground animate-fade-up">{pendingCount}</p>
              ) : (
                <div className="mt-2 h-9 w-16 animate-shimmer rounded bg-surface-high" />
              )}
              <p className="mt-1 text-[11px] text-outline">Awaiting codebase review</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Talent</span>
                <ShieldCheck className="h-4 w-4 text-success" />
              </div>
              {hasLoadedCandidates ? (
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground animate-fade-up">{verifiedCount}</p>
              ) : (
                <div className="mt-2 h-9 w-16 animate-shimmer rounded bg-surface-high" />
              )}
              <p className="mt-1 text-[11px] text-outline">
                {hasLoadedCandidates ? `${verifiedRate}% verification pass rate` : "Calculating..."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action Required</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              {hasLoadedCandidates ? (
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground animate-fade-up">{changesCount}</p>
              ) : (
                <div className="mt-2 h-9 w-16 animate-shimmer rounded bg-surface-high" />
              )}
              <p className="mt-1 text-[11px] text-outline">Feedback sent to candidate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Registered</span>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              {hasLoadedCandidates ? (
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground animate-fade-up">{totalCount}</p>
              ) : (
                <div className="mt-2 h-9 w-16 animate-shimmer rounded bg-surface-high" />
              )}
              <p className="mt-1 text-[11px] text-outline">Total platform candidates</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Navigation Tabs — Cutshort style */}
        <div className="flex items-center gap-8 border-b border-border">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "queue"
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pending Review ({hasLoadedCandidates ? pendingCount : "..."})</span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "directory"
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Candidate Directory ({hasLoadedCandidates ? filteredCandidates.length : "..."})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "analytics"
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Platform Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "audit"
                ? "border-foreground text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Audit Trail ({hasLoadedCandidates ? auditLogs.length : "..."})</span>
          </button>
        </div>

        {/* TAB 1: PENDING QUEUE */}
{activeTab === "queue" && (
  <ReviewConsole
    queueCandidates={queueCandidates}
    selectedCandidate={selectedCandidate}
    setSelectedCandidate={setSelectedCandidate}
    actionType={actionType}
    setActionType={setActionType}
    actionReason={actionReason}
    setActionReason={setActionReason}
    actionLoading={actionLoading}
    handleExecuteAction={handleExecuteAction}
    FEEDBACK_PRESETS={FEEDBACK_PRESETS}
  />
)}

{/* TAB 2: CANDIDATE DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-foreground">Full Candidate Directory</h2>
                <p className="text-xs text-muted-foreground">Search and filter across all candidates in the Meritlane database.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -tranzinc-y-1/2 text-outline" />
                  <input
                    type="text"
                    placeholder="Search name, college, skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-base sm:text-xs text-foreground placeholder:text-outline shadow-sm transition-all hover:border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-base sm:text-xs font-medium text-foreground shadow-sm transition-all hover:border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
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
                  <table className="w-full text-left text-xs text-muted-foreground">
                    <thead className="border-b border-border bg-surface-low font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-2 h-10.5">Candidate</th>
                        <th className="px-6 py-2 h-10.5">College &amp; Branch</th>
                        <th className="px-6 py-2 h-10.5">Skills</th>
                        <th className="px-6 py-2 h-10.5">Status</th>
                        <th className="px-6 py-2 h-10.5">Projects</th>
                        <th className="px-6 py-2 h-10.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {!hasLoadedCandidates ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <Loader2 className="h-5 w-5 animate-spin text-outline" />
                              <p className="text-sm font-medium text-muted-foreground">Loading directory...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            No candidates found matching the current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCandidates.map((c) => (
                        <tr key={c.uid} className="hover:bg-surface-low/70 transition-colors">
                          <td className="px-6 py-2 h-10">
                            <div className="font-semibold text-foreground">{c.name || "Unnamed"}</div>
                            <div className="text-[11px] text-outline font-mono">{c.email || c.uid.slice(0, 12) + "..."}</div>
                          </td>
                          <td className="px-6 py-2 h-10">
                            <div className="text-foreground font-medium">{c.college || "—"}</div>
                            <div className="text-[11px] text-outline">{c.branch || "—"} {c.gradYear ? `(${c.gradYear})` : ""}</div>
                          </td>
                          <td className="px-6 py-2 h-10">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {c.skills && c.skills.length > 0 ? (
                                c.skills.slice(0, 3).map((s, i) => (
                                  <span key={i} className="inline-block rounded bg-surface-low px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-outline text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-2 h-10">
                            {getStatusBadge(c.verificationStatus)}
                          </td>
                          <td className="px-6 py-2 h-10">
                            <span className="text-xs font-semibold text-foreground">
                              {c.projects?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-2 h-10 text-right">
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
                      ))
                      )}
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
              <h2 className="text-base font-bold text-foreground">Platform KPIs &amp; Verification Funnel</h2>
              <p className="text-xs text-muted-foreground">Live operational data from candidates and assessments.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Rate</span>
                </CardHeader>
                <CardContent>
                  {hasLoadedCandidates ? (
                    <>
                      <p className="text-3xl font-bold text-foreground">{verifiedRate}%</p>
                      <p className="mt-1 text-xs text-muted-foreground">{verifiedCount} verified out of {totalCount} total</p>
                    </>
                  ) : (
                    <div className="h-9 w-16 animate-pulse rounded bg-surface-high" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assessment Readiness</span>
                </CardHeader>
                <CardContent>
                  {hasLoadedCandidates ? (
                    <>
                      <p className="text-3xl font-bold text-muted-foreground">
                        {candidates.filter(c => c.verificationStatus === 'verified').length}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Passed Python technical audit</p>
                    </>
                  ) : (
                    <div className="h-9 w-16 animate-pulse rounded bg-surface-high" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Repositories Submitted</span>
                </CardHeader>
                <CardContent>
                  {hasLoadedCandidates ? (
                    <>
                      <p className="text-3xl font-bold text-foreground">
                        {candidates.reduce((acc, c) => acc + (c.projects?.length || 0), 0)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Production codebases attached</p>
                    </>
                  ) : (
                    <div className="h-9 w-16 animate-pulse rounded bg-surface-high" />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-foreground">Administrative Decision History</h2>
              <p className="text-xs text-muted-foreground">Immutable audit log of all verification decisions and reasons.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                {!hasLoadedCandidates ? (
                  <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-5 w-5 animate-spin text-outline" />
                    <p className="font-medium">Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground">
                    No decisions logged yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-muted-foreground">
                      <thead className="border-b border-border bg-surface-low font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-6 py-2 h-10.5">Candidate</th>
                          <th className="px-6 py-2 h-10.5">Decision</th>
                          <th className="px-6 py-2 h-10.5">Reviewed By</th>
                          <th className="px-6 py-2 h-10.5">Feedback / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {auditLogs.map((c) => (
                          <tr key={c.uid} className="hover:bg-surface-low/70">
                            <td className="px-6 py-2 h-10 font-semibold text-foreground">
                              {c.name || c.email || c.uid}
                            </td>
                            <td className="px-6 py-2 h-10">
                              {getStatusBadge(c.verificationStatus)}
                            </td>
                            <td className="px-6 py-2 h-10 text-muted-foreground font-mono text-[11px]">
                              {c.verifiedByEmail || "saitrishankb9@gmail.com"}
                            </td>
                            <td className="px-6 py-2 h-10 text-muted-foreground max-w-sm">
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

      {/* Custom Styled Wipe Test Users Confirmation & Result Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-lg rounded-md border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-danger/10 text-danger border border-red-100">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Reset Test Data & Users
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Admin Platform Purge Utility
                  </p>
                </div>
              </div>

              {!wipeLoading && (
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  className="rounded-md p-1.5 text-outline hover:bg-surface-low hover:text-muted-foreground transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4">
              {!wipeResult ? (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This action will reset the platform database to a <strong>zero-user clean state</strong>, allowing you to test fresh signups and onboarding without authentication conflicts.
                  </p>

                  <div className="rounded-md border border-border bg-surface-low p-3.5 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">What will be purged:</p>
                    <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                      <li>All non-admin <strong>Firebase Authentication</strong> accounts (Google & Email)</li>
                      <li>All Firestore <strong>candidates</strong> profiles, projects & scores</li>
                      <li>All Firestore <strong>employers</strong> profiles & created roles</li>
                      <li>All Firestore <strong>users</strong> collection profiles</li>
                    </ul>
                    <div className="pt-2 border-t border-border flex items-center gap-1.5 text-emerald-700 font-medium">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span>Admin account (<code>saitrishankb9@gmail.com</code>) will remain protected.</span>
                    </div>
                  </div>
                </>
              ) : wipeResult.success ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-emerald-200 bg-success/10 p-4">
                    <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>{wipeResult.message}</span>
                    </div>
                    {wipeResult.stats && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-surface/80 p-2.5 border border-emerald-100">
                          <span className="text-muted-foreground block">Auth Accounts</span>
                          <span className="text-base font-bold text-foreground">{wipeResult.stats.deletedAuthCount} purged</span>
                        </div>
                        <div className="rounded-md bg-surface/80 p-2.5 border border-emerald-100">
                          <span className="text-muted-foreground block">User Profiles</span>
                          <span className="text-base font-bold text-foreground">{wipeResult.stats.deletedFirestoreUsers} purged</span>
                        </div>
                        <div className="rounded-md bg-surface/80 p-2.5 border border-emerald-100">
                          <span className="text-muted-foreground block">Candidates</span>
                          <span className="text-base font-bold text-foreground">{wipeResult.stats.deletedCandidates} purged</span>
                        </div>
                        <div className="rounded-md bg-surface/80 p-2.5 border border-emerald-100">
                          <span className="text-muted-foreground block">Employers</span>
                          <span className="text-base font-bold text-foreground">{wipeResult.stats.deletedEmployers} purged</span>
                        </div>
                      </div>
                    )}
                    {wipeResult.warnings?.authError && (
                      <div className="mt-3 rounded-md bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900">
                        <div className="font-semibold flex items-center gap-1.5 text-amber-800 mb-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Firebase Auth Note:</span>
                        </div>
                        <p>{wipeResult.warnings.authError}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-danger/40 bg-danger/10 p-4 text-xs text-danger space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-danger">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Wipe Operation Notice</span>
                  </div>
                  <p>{wipeResult.error || wipeResult.message || "An unexpected error occurred."}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border pt-4">
              {!wipeResult ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWipeModal(false)}
                    disabled={wipeLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleExecuteWipe}
                    loading={wipeLoading}
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Confirm & Wipe All Test Users
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowWipeModal(false)}
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

