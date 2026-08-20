"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Link as LinkIcon, ShieldCheck, Clock, Check, ChevronRight } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

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

  const copyPublicLink = () => {
    if (typeof window !== "undefined" && profile?.uid) {
      const url = `${window.location.origin}/p/${profile.uid}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-transparent pb-24 pt-12 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-8 w-64 bg-zinc-200 rounded"></div>
          <div className="h-40 w-full bg-zinc-200 rounded"></div>
          <div className="h-40 w-full bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  const status = profile?.verificationStatus || "draft";
  const name = profile?.name || user?.displayName?.split(' ')[0] || "Engineer";
  
  // Calculate completion
  const hasBasicInfo = !!(profile?.name && profile?.college);
  const hasSkills = !!(profile?.skills && profile.skills.length > 0);
  const hasGithub = !!(profile?.githubUrl);
  const hasProjects = !!(profile?.projects && profile.projects.length > 0);
  
  let completionScore = 0;
  if (hasBasicInfo) completionScore += 25;
  if (hasSkills) completionScore += 25;
  if (hasGithub) completionScore += 20;
  if (hasProjects) completionScore += 30;

  const isProfileComplete = completionScore >= 100;
  const assessmentCount = userProfile?.assessmentScores ? Object.keys(userProfile.assessmentScores).length : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-transparent pb-24 pt-12 relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* TOP AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-2">Your Meritlane verification profile</p>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">Good morning, {name}</h1>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-sm font-medium text-zinc-600">Profile completion</span>
            <div className="flex items-center gap-3">
              <div className="w-32 md:w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-zinc-900">{completionScore}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* VERIFICATION STATUS */}
            <section className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-8 opacity-5 pointer-events-none">
                <ShieldCheck className="w-40 h-40" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  {status === "verified" ? (
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  ) : status === "changes_required" || status === "rejected" ? (
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 border border-zinc-200">
                      <Clock className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">
                      {status === "verified" ? "Verified" :
                       status === "pending" ? "Verification Pending" :
                       status === "changes_required" ? "Changes Required" :
                       status === "rejected" ? "Verification Failed" :
                       "Incomplete Profile"}
                    </h2>
                  </div>
                </div>

                <div className="mb-8 max-w-xl">
                  <p className="text-base text-zinc-600 leading-relaxed">
                    {status === "verified" ? "Your engineering background has been verified by Meritlane. You are now visible to top employers in our network." :
                     status === "pending" ? "Your profile is under review. Please ensure you have completed all required skill assessments to expedite the process." :
                     status === "changes_required" ? "Your verification is paused. Please address the feedback provided below to continue your review." :
                     status === "rejected" ? "Your profile did not meet our verification standards at this time." :
                     "Complete your profile and technical assessments to begin the verification process and gain access to employers."}
                  </p>
                  
                  {status === "changes_required" && profile?.verificationReason && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-sm font-semibold text-amber-900 mb-1">Feedback from Reviewer:</p>
                      <p className="text-sm text-amber-800">{profile.verificationReason}</p>
                    </div>
                  )}
                </div>

                {/* Status Signals */}
                {status === "verified" && (
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Profile reviewed
                    </div>
                    {assessmentCount > 0 && (
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Assessment completed
                      </div>
                    )}
                    {hasProjects && (
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Project evidence reviewed
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* OVERVIEW METRICS */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Skills</span>
                <span className="block text-2xl font-bold text-zinc-900">{profile?.skills?.length || 0}</span>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Projects</span>
                <span className="block text-2xl font-bold text-zinc-900">{profile?.projects?.length || 0}</span>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Assessments</span>
                <span className="block text-2xl font-bold text-zinc-900">{assessmentCount}</span>
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Verification</span>
                <span className={`block text-lg font-bold mt-1.5 ${status === 'verified' ? 'text-emerald-600' : 'text-zinc-900'} capitalize`}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            </section>

            {/* NEXT ACTIONS */}
            <section>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide mb-4">Next Steps</h3>
              <div className="space-y-3">
                {!isProfileComplete && (
                  <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-zinc-300 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Complete your profile</h4>
                      <p className="text-xs text-zinc-500 mt-1">Add education, skills, and projects to proceed.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/candidate/profile")}>
                      Edit Profile
                    </Button>
                  </div>
                )}
                
                {isProfileComplete && status !== "verified" && assessmentCount === 0 && (
                  <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-zinc-300 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Complete an assessment</h4>
                      <p className="text-xs text-zinc-500 mt-1">Prove your skills to earn verification.</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => router.push("/candidate/assessment")}>
                      Start Assessment
                    </Button>
                  </div>
                )}

                {/* Example placeholder action */}
                <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg shadow-sm hover:border-zinc-300 transition-colors">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Add a professional summary</h4>
                    <p className="text-xs text-zinc-500 mt-1">Tell employers what you specialize in.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/candidate/profile")}>
                    Add Summary
                  </Button>
                </div>

                {isProfileComplete && (status === "verified" || assessmentCount > 0) && (
                  <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-sm text-center">
                    <CheckCircle2 className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-zinc-900">You're all set.</h4>
                    <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">Your profile is ready to be discovered.</p>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN - Sidebar Content */}
          <div className="space-y-8">
            
            {/* PUBLIC RECORD PREVIEW */}
            <section className="bg-zinc-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
              
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-4">Your Meritlane Record</h3>
              
              <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-sm text-zinc-300">Status</span>
                  <span className={`text-sm font-semibold ${status === 'verified' ? 'text-emerald-400' : 'text-zinc-100'} capitalize`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-sm text-zinc-300">Verified Skills</span>
                  <span className="text-sm font-semibold">{assessmentCount}</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm text-zinc-300">Evidence</span>
                  <span className="text-sm font-semibold">{profile?.projects?.length || 0} Projects</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <Button 
                  variant="outline" 
                  className="w-full justify-center bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => router.push(`/p/${user.uid}`)}
                >
                  <ExternalLink className="mr-2 w-4 h-4" />
                  View Public Record
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-center bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                  onClick={copyPublicLink}
                >
                  {copied ? <Check className="mr-2 w-4 h-4 text-emerald-400" /> : <LinkIcon className="mr-2 w-4 h-4" />}
                  {copied ? "Link Copied" : "Copy Record Link"}
                </Button>
              </div>
            </section>

            {/* VERIFICATION TIMELINE */}
            <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide mb-6">Verification History</h3>
              
              <div className="relative border-l border-zinc-200 ml-3 space-y-6">
                
                {status === "verified" && (
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                    <h4 className="text-sm font-bold text-zinc-900">Verification Completed</h4>
                    <p className="text-xs text-zinc-500 mt-1">Profile visible to employers</p>
                  </div>
                )}

                {assessmentCount > 0 && (
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-zinc-900 ring-4 ring-white"></span>
                    <h4 className="text-sm font-bold text-zinc-900">Assessment Completed</h4>
                    <p className="text-xs text-zinc-500 mt-1">Technical skills verified</p>
                  </div>
                )}

                {hasProjects && (
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-zinc-900 ring-4 ring-white"></span>
                    <h4 className="text-sm font-bold text-zinc-900">Project Evidence Submitted</h4>
                    <p className="text-xs text-zinc-500 mt-1">Project repositories linked</p>
                  </div>
                )}

                {status !== "draft" && (
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-zinc-900 ring-4 ring-white"></span>
                    <h4 className="text-sm font-bold text-zinc-900">Profile Submitted</h4>
                    <p className="text-xs text-zinc-500 mt-1">Basic verification requested</p>
                  </div>
                )}

                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-zinc-400 ring-4 ring-white"></span>
                  <h4 className="text-sm font-bold text-zinc-900">Profile Created</h4>
                  <p className="text-xs text-zinc-500 mt-1">Joined Meritlane</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
