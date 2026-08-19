"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function CandidateDashboardPage() {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
        })
        .catch((err) => {
          console.error("Error fetching candidate profile:", err);
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 pt-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-up">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="h-8 w-64 rounded bg-zinc-200 animate-shimmer"></div>
            <div className="h-9 w-28 rounded-md bg-zinc-200 animate-shimmer"></div>
          </div>
          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="h-12 w-12 rounded bg-zinc-200 animate-shimmer shrink-0"></div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-48 rounded bg-zinc-200 animate-shimmer"></div>
                    <div className="h-6 w-24 rounded-full bg-zinc-200 animate-shimmer"></div>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-zinc-200 animate-shimmer"></div>
                  <div className="h-4 w-1/2 rounded bg-zinc-200 animate-shimmer"></div>
                  <div className="pt-2">
                    <div className="h-10 w-48 rounded-md bg-zinc-200 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = profile?.verificationStatus || "draft";
  const isProfileComplete = profile && profile.name && profile.college && profile.skills && profile.skills.length > 0 && profile.projects && profile.projects.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-bold text-zinc-900">Candidate Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/candidate/profile")}
          >
            Edit Profile
          </Button>
        </div>

        {/* Status Card */}
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Icon */}
              {status === "verified" ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : status === "changes_required" || status === "rejected" ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-amber-50 border border-amber-200 text-amber-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-zinc-100 border border-zinc-200 text-zinc-600">
                  <span className="font-semibold text-lg">!</span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-zinc-900">
                      {status === "verified" ? "Profile Verified" :
                       status === "pending" ? "Verification Pending" :
                       status === "changes_required" ? "Action Required" :
                       status === "rejected" ? "Verification Failed" :
                       "Profile Incomplete"}
                    </h2>
                    <Badge variant={status === "verified" ? "verified" : status === "pending" ? "pending" : status === "changes_required" ? "changes_required" : status === "rejected" ? "rejected" : "neutral"}>
                      {status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600">
                    {status === "verified" ? "You have successfully passed the skill assessment. Your profile is now visible to employers in the Meritlane directory." :
                     status === "pending" ? "Your profile has been submitted. The next step is to pass the technical skill assessment to prove your abilities." :
                     status === "changes_required" ? "Your profile was reviewed but requires updates before you can proceed." :
                     status === "rejected" ? "Your profile did not pass verification." :
                     "Your profile is missing required information or has not been submitted for verification."}
                  </p>
                </div>

                {status === "changes_required" && profile?.verificationReason && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-900 mb-1">Feedback:</p>
                    <p className="text-sm text-amber-800">{profile.verificationReason}</p>
                  </div>
                )}

                <div className="pt-2">
                  {status === "verified" ? null : (
                    <>
                      {(!profile || !isProfileComplete || status === "draft") ? (
                        <Button 
                          variant="primary" 
                          onClick={() => router.push("/candidate/profile")}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Complete Your Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          onClick={() => router.push("/candidate/assessment")}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Take Skill Assessment
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Skills & Scores (Only shown if verified or has scores) */}
        {userProfile?.assessmentScores && Object.keys(userProfile.assessmentScores).length > 0 && (
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Verified Technical Skills</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-zinc-100">
                {Object.entries(userProfile.assessmentScores).map(([skill, score]) => (
                  <li key={skill} className="flex items-center justify-between p-4 sm:px-6">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {skill.replace('python_', 'Python (Variant ').replace('_', ' ').toUpperCase() + (skill.startsWith('python_') ? ')' : '')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">Proctored Assessment Passed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">{score} / 5</p>
                      <p className="text-xs text-zinc-500">Score</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Submitted Projects (Only shown if projects exist) */}
        {profile?.projects && profile.projects.length > 0 && (
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Submitted Projects</h2>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-zinc-100">
                {profile.projects.map((project, index) => (
                  <li key={project.id} className="p-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{project.title || `Project ${index + 1}`}</h3>
                        {project.description && (
                          <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      {project.repoUrl && (
                        <div className="shrink-0">
                          <a 
                            href={project.repoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Repository
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
