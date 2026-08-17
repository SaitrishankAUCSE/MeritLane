"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Layers3,
  Loader2,
  XCircle,
} from "lucide-react";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const statusCopy = {
  draft: {
    title: "Profile incomplete",
    description: "Finish your profile before submitting it for Meritlane verification.",
    badge: "Action required",
  },
  pending: {
    title: "Verification Pending",
    description: "Your profile is in the Meritlane review queue.",
    badge: "Verification Pending",
  },
  verified: {
    title: "Verified",
    description: "Your profile has been verified by Meritlane.",
    badge: "Verified",
  },
  changes_required: {
    title: "Changes requested",
    description: "Review the feedback below and update your profile to continue.",
    badge: "Action required",
  },
  rejected: {
    title: "Not verified",
    description: "Your profile was not verified by Meritlane.",
    badge: "Not verified",
  },
} as const;

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then(setProfile)
        .catch((err) => console.error("Error fetching candidate profile:", err))
        .finally(() => setDataLoading(false));
    }
  }, [user, loading]);

  const status = profile?.verificationStatus || "draft";
  const copy = statusCopy[status];
  const isProfileComplete = Boolean(
    profile?.name && profile.college && profile.branch && profile.gradYear && profile.skills?.length,
  );
  const projectCount = profile?.projects?.length ?? 0;
  const skillCount = profile?.skills?.length ?? 0;
  const nextAction = useMemo(() => {
    if (!isProfileComplete || status === "draft") {
      return {
        eyebrow: "Next action",
        title: "Complete your profile to start verification",
        description: "Add your education, skills, and evidence so Meritlane can review your profile.",
        label: "Complete profile",
        href: "/candidate/profile",
      };
    }
    if (status === "pending") {
      return {
        eyebrow: "Next action",
        title: "Take your skill assessment",
        description: "Complete the assessment to add technical proof to your verification review.",
        label: "Start assessment",
        href: "/candidate/assessment",
      };
    }
    if (status === "changes_required") {
      return {
        eyebrow: "Next action",
        title: "Update your profile",
        description: "Address the reviewer feedback and resubmit your profile for verification.",
        label: "Review feedback",
        href: "/candidate/profile",
      };
    }
    if (status === "rejected") {
      return {
        eyebrow: "Verification outcome",
        title: "Review your profile",
        description: "You can update your profile and submit new evidence for review.",
        label: "Edit profile",
        href: "/candidate/profile",
      };
    }
    return null;
  }, [isProfileComplete, status]);

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500">Loading your profile status...</p>
      </div>
    );
  }

  const StatusIcon = status === "verified" ? CheckCircle2 : status === "rejected" ? XCircle : status === "changes_required" ? AlertTriangle : Clock3;
  const statusTone = status === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "pending" ? "border-amber-200 bg-amber-50 text-amber-700" : status === "rejected" ? "border-red-200 bg-red-50 text-red-700" : "border-zinc-200 bg-zinc-50 text-zinc-700";
  const badgeVariant = status === "verified" ? "verified" : status === "pending" ? "pending" : status === "rejected" ? "rejected" : status === "changes_required" ? "changes_required" : "neutral";

  return (
    <main className="min-h-screen bg-[#fafafa] pb-20 pt-8 sm:pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Candidate workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Your verification status and professional evidence.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/candidate/profile")}>Edit profile</Button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Verification</p>
                <h2 className="mt-1 text-base font-semibold text-zinc-950">Profile status</h2>
              </div>
              <Badge variant={badgeVariant}>{copy.badge}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg border ${statusTone}`}>
                  <StatusIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-zinc-950">{copy.title}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-600">{status === "rejected" && profile?.verificationReason ? `${copy.description} ${profile.verificationReason}` : copy.description}</p>
                </div>
              </div>
              {status === "changes_required" && profile?.verificationReason && (
                <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-800">Reviewer feedback</p>
                  <p className="mt-2 text-sm leading-6 text-amber-950">{profile.verificationReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-indigo-200/80 bg-indigo-50/40">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
              {nextAction ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">{nextAction.eyebrow}</p>
                    <h2 className="mt-3 text-lg font-semibold leading-7 text-zinc-950">{nextAction.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{nextAction.description}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => router.push(nextAction.href)} rightIcon={<ArrowRight className="size-4" />}>
                    {nextAction.label}
                  </Button>
                </>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">All set</p>
                  <h2 className="mt-3 text-lg font-semibold leading-7 text-zinc-950">Your profile is ready to be discovered.</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">Keep your evidence current as you build new skills and projects.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">Professional evidence</h2>
              <p className="mt-1 text-sm text-zinc-500">Only information currently saved to your profile.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><span className="text-sm font-medium text-zinc-700">Skills listed</span><Code2 className="size-4 text-zinc-400" /></CardHeader>
              <CardContent>
                {skillCount ? <div className="flex flex-wrap gap-2">{profile?.skills.map((skill) => <span key={skill} className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">{skill}</span>)}</div> : <p className="text-sm text-zinc-500">No skills added yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><span className="text-sm font-medium text-zinc-700">Projects submitted</span><Layers3 className="size-4 text-zinc-400" /></CardHeader>
              <CardContent><p className="text-3xl font-semibold tracking-tight text-zinc-950">{projectCount}</p><p className="mt-1 text-sm text-zinc-500">{projectCount === 1 ? "Project submitted" : "Projects submitted"}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><span className="text-sm font-medium text-zinc-700">GitHub profile</span><Code2 className="size-4 text-zinc-400" /></CardHeader>
              <CardContent>{profile?.githubUrl ? <a className="inline-flex max-w-full items-center gap-2 truncate text-sm font-medium text-indigo-700 hover:text-indigo-800" href={profile.githubUrl} target="_blank" rel="noreferrer"><span className="truncate">{profile.githubUrl.replace(/^https?:\/\//, "")}</span><ExternalLink className="size-4 shrink-0" /></a> : <p className="text-sm text-zinc-500">Not added yet.</p>}</CardContent>
            </Card>
          </div>
        </section>

        <div className="flex items-center gap-2 text-xs text-zinc-400"><span className="size-1.5 rounded-full bg-zinc-300" /> Meritlane keeps verification status tied to submitted evidence.</div>
      </div>
    </main>
  );
}
