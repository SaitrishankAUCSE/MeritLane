"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Link as LinkIcon, 
  ShieldCheck, 
  Clock, 
  Check, 
  User, 
  FileText, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from "lucide-react";
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
    if (typeof window !== "undefined" && user?.uid) {
      const url = `${window.location.origin}/p/${user.uid}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] pb-24 pt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-zinc-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 w-full bg-zinc-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const status = profile?.verificationStatus || "draft";
  const name = profile?.name || user?.displayName?.split(' ')[0] || "Engineer";
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  
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
    <div className="min-h-[calc(100vh-64px)] pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Good morning, {name}
              </h1>
              {status === "verified" ? (
                <Badge variant="verified">Verified</Badge>
              ) : status === "pending" ? (
                <Badge variant="pending">Under Review</Badge>
              ) : status === "changes_required" ? (
                <Badge variant="changes_required">Changes Required</Badge>
              ) : (
                <Badge variant="neutral">Incomplete</Badge>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Personal engineering command center &amp; verified talent identity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-md">
              <span>Profile setup:</span>
              <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-500" 
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <span className="font-semibold text-zinc-900">{completionScore}%</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/candidate/profile")}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Overview Stats Tiles — Cutshort 4-tile pattern */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Technical Skills
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900">{profile?.skills?.length || 0}</span>
                <span className="text-xs text-zinc-500">declared</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Project Repos
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900">{profile?.projects?.length || 0}</span>
                <span className="text-xs text-zinc-500">codebases</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Assessments
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900">{assessmentCount}</span>
                <span className="text-xs text-zinc-500">passed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Verification State
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-base font-bold capitalize ${status === 'verified' ? 'text-emerald-700' : 'text-zinc-900'}`}>
                  {status.replace('_', ' ')}
                </span>
                {status === "verified" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Talent Card + Next Steps (Left) | Record & History (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cutshort-inspired Talent Card */}
            <Card>
              <div className="border-b border-zinc-100 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Your Talent Card</h2>
                  <span className="text-xs text-zinc-400 hidden sm:inline">• Visible to verified employer network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => router.push("/candidate/profile")}
                  >
                    Edit Card
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => user?.uid && router.push(`/p/${user.uid}`)}
                    leftIcon={<ExternalLink className="h-3 w-3" />}
                  >
                    Public View
                  </Button>
                </div>
              </div>

              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="h-14 w-14 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-lg font-bold text-zinc-600 shrink-0 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900">{profile?.name || name}</h3>
                        {status === "verified" && (
                          <Badge variant="verified" size="sm">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {profile?.branch || "Software Engineering"} • Class of {profile?.gradYear || "2026"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{profile?.college || "University not specified"}</span>
                      </div>
                      {profile?.githubUrl && (
                        <div className="flex items-center gap-2">
                          <Code2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-700 hover:text-zinc-900 hover:underline truncate">
                            GitHub Profile
                          </a>
                        </div>
                      )}
                      {profile?.resumeUrl && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-zinc-700 hover:text-zinc-900 hover:underline truncate">
                            Resume Attached
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Skill Tags */}
                    {profile?.skills && profile.skills.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills.map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status & Action Feedback */}
            {status === "changes_required" && profile?.verificationReason && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-amber-900">Changes requested by Meritlane Reviewer:</p>
                  <p className="text-amber-800 leading-relaxed">{profile.verificationReason}</p>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => router.push("/candidate/profile")}
                    >
                      Update Profile Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Next Actions — Cutshort compact list style */}
            <Card>
              <CardHeader className="py-3.5">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Recommended Actions</h3>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-zinc-100">
                {!isProfileComplete && (
                  <div className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-zinc-900">Complete your verification profile</h4>
                      <p className="text-xs text-zinc-500">Add university details, skills, and project repositories to unlock verification.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/candidate/profile")}>
                      Complete Setup
                    </Button>
                  </div>
                )}
                
                {status !== "verified" && assessmentCount === 0 && (
                  <div className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-zinc-900">Take a technical skill assessment</h4>
                      <p className="text-xs text-zinc-500">Demonstrate practical coding proficiency to earn instant skill signals.</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => router.push("/candidate/assessment")}>
                      Start Assessment
                    </Button>
                  </div>
                )}

                {hasProjects && (
                  <div className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-zinc-900">Review project repositories</h4>
                      <p className="text-xs text-zinc-500">Ensure all linked GitHub repositories are public and contain architectural READMEs.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push("/candidate/profile")}>
                      View Repos
                    </Button>
                  </div>
                )}

                {status === "verified" && (
                  <div className="flex items-center justify-between p-4 bg-emerald-50/30">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">Your profile is verified and active</h4>
                        <p className="text-xs text-zinc-500">Employers in the Meritlane network can discover your verified portfolio.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => user?.uid && router.push(`/p/${user.uid}`)}
                      leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      Share Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Record Preview & Timeline */}
          <div className="space-y-6">
            
            {/* Public Record Share Card */}
            <Card>
              <CardHeader className="py-3.5">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Public Record Link</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Your immutable verification record can be shared with recruiters or added to your LinkedIn/resume.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => user?.uid && router.push(`/p/${user.uid}`)}
                    leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  >
                    View Public Record
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-center"
                    onClick={copyPublicLink}
                    leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <LinkIcon className="h-3.5 w-3.5" />}
                  >
                    {copied ? "Link Copied to Clipboard" : "Copy Share Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Timeline */}
            <Card>
              <CardHeader className="py-3.5">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Verification History</h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative border-l border-zinc-200 ml-2.5 space-y-5">
                  {status === "verified" && (
                    <div className="relative pl-5">
                      <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                      <h4 className="text-xs font-bold text-zinc-900">Verification Passed</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Profile approved by Meritlane auditors</p>
                    </div>
                  )}

                  {assessmentCount > 0 && (
                    <div className="relative pl-5">
                      <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-zinc-900"></span>
                      <h4 className="text-xs font-bold text-zinc-900">Assessment Completed</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Technical assessment scores recorded</p>
                    </div>
                  )}

                  {hasProjects && (
                    <div className="relative pl-5">
                      <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-zinc-900"></span>
                      <h4 className="text-xs font-bold text-zinc-900">Projects Attached</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{profile?.projects?.length} codebases submitted</p>
                    </div>
                  )}

                  {status !== "draft" && (
                    <div className="relative pl-5">
                      <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-zinc-900"></span>
                      <h4 className="text-xs font-bold text-zinc-900">Review Requested</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Submitted for verification queue</p>
                    </div>
                  )}

                  <div className="relative pl-5">
                    <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-zinc-300"></span>
                    <h4 className="text-xs font-bold text-zinc-900">Profile Created</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Joined Meritlane</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
