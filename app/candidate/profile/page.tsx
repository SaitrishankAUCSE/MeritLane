"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { useRouter } from "next/navigation";
import { ShieldCheck, Fingerprint, Link, BookOpen, Briefcase, ChevronRight, PenTool, GitBranch, RefreshCw } from "lucide-react";
import { ProfileForm } from "@/components/candidate/ProfileForm";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { GithubAuthProvider, linkWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
          // If profile is missing fundamental data, force edit mode
          if (!p || !p.name || !p.skills || p.skills.length === 0) {
            setIsEditing(true);
          }
          setIsInitializing(false);
        })
        .catch((err) => {
          console.error(err);
          setIsEditing(true);
          setIsInitializing(false);
        });
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSave = (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleGithubSync = async () => {
    if (!user) return;
    setIsSyncingGithub(true);
    setSyncError(null);
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("read:user");
      provider.addScope("repo");

      // linkWithPopup returns the credentials including the oauth token
      const result = await linkWithPopup(user, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error("Could not retrieve GitHub token.");
      }

      // Send token to our API route
      const idToken = await user.getIdToken();
      const res = await fetch("/api/candidate/github-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ githubToken: token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync GitHub data.");

      // Refresh local profile state
      setProfile((prev) => prev ? { ...prev, githubEvidence: data.githubEvidence } : prev);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/credential-already-in-use') {
        setSyncError("This GitHub account is already linked to another profile.");
      } else {
        setSyncError(err.message || "An error occurred during synchronization.");
      }
    } finally {
      setIsSyncingGithub(false);
    }
  };

  if (loading || isInitializing) {
    return <MeritlaneLoader level="page" text="Authenticating" />;
  }

  if (isEditing) {
    return (
      <div className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide">
        <ProfileForm 
          initialData={profile} 
          onSave={handleSave} 
          onCancel={profile?.name ? () => setIsEditing(false) : undefined}
          isNew={!profile?.name}
        />
      </div>
    );
  }

  const name = profile?.name || user?.displayName || "";
  const primaryDomain = profile?.skills?.[0] || "";
  const skills = profile?.skills || [];

  const isProfileIncomplete = !profile?.name || !profile?.skills || profile.skills.length === 0;

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide">
      
      {!isProfileIncomplete && (
        <ContextGuide 
          storageKey="candidate_profile"
          title="Identity & Claims"
          description="Your profile forms the foundation of your verified record. Any skills you claim here must be backed by evidence (like a GitHub project) or passed through an assessment before employers will trust them."
          steps={[
            { title: "Define Identity", description: "Establish your basic details and domain.", isCompleted: true },
            { title: "Claim Skills", description: "List the technical skills you can prove.", isCompleted: (profile?.skills?.length || 0) > 0 },
            { title: "Link Evidence", description: "Connect projects that prove these skills in the Evidence tab.", isCompleted: false }
          ]}
          ctaLabel="Proceed to Evidence"
          ctaHref="/candidate/dashboard"
        />
      )}

      <div className="mb-10">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3 flex items-center gap-2">
          <Fingerprint className="h-3 w-3" /> Technical identity
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[40px] sm:text-[48px] text-[#0D0D0D] leading-tight mb-2">{name}</h1>
            <div className="text-[14px] text-[#0D0D0D] font-sans">{primaryDomain}</div>
          </div>
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 h-10 border border-[#D2D2D2] bg-transparent text-[#0D0D0D] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] hover:border-[#0D0D0D] rounded-md text-[14px] font-sans font-medium transition-all">
            <PenTool className="h-3.5 w-3.5" /> Edit identity
          </button>
        </div>
      </div>

      {/* Main Claims Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Skills / Claims */}
        <div className="md:col-span-2 space-y-10">
          
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-[#E5E5E5] pb-3">
              <h2 className="text-[14px] font-sans font-medium text-[#737373]">Technical claims</h2>
              <button onClick={() => router.push('/candidate/dashboard')} className="text-[14px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors">Add evidence</button>
            </div>
            
            <div className="space-y-4">
              {skills.map((skill, idx) => {
                const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
                const isFailed = profile?.verifiedSkills?.[skill]?.status === "failed";
                
                return (
                  <div key={idx} className={`border p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-colors ${isVerified ? 'border-[#15803D]/30 bg-[#F0FDF4]' : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D2D2D2]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 shrink-0 border rounded-md flex items-center justify-center font-mono text-[14px] ${isVerified ? 'bg-[#FFFFFF] border-[#15803D]/30 text-[#15803D]' : 'bg-transparent border-[#D2D2D2] text-[#0D0D0D]'}`}>
                        {skill.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#0D0D0D] mb-1 font-serif">{skill}</div>
                        <div className={`text-[10px] font-mono uppercase tracking-[0.15em] ${isVerified ? 'text-[#15803D]' : 'text-[#666666]'}`}>
                          State: {isVerified ? 'Verified' : 'Declared'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {isVerified ? (
                        <>
                          <div className="text-[10px] text-[#15803D] font-mono uppercase tracking-[0.1em] mb-2">Verified by MeritLane</div>
                          <div className="text-[14px] font-sans font-medium text-[#15803D] flex items-center justify-end gap-1.5 h-9">
                            ✓ Verified
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[10px] text-[#666666] font-mono uppercase tracking-[0.1em] mb-2">No evidence.</div>
                          <button 
                            onClick={() => router.push('/candidate/dashboard')}
                            className="text-[14px] font-sans font-medium text-[#0D0D0D] border border-[#D2D2D2] px-4 h-9 rounded-md hover:bg-[#F3F3F1] hover:text-[#0D0D0D] hover:border-[#E5E5E5] transition-colors"
                          >
                            Add evidence
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-[#E5E5E5] pb-3">
              <h2 className="text-[14px] font-sans font-medium text-[#737373]">Experience & projects</h2>
              <button onClick={() => router.push('/candidate/dashboard')} className="text-[14px] font-sans font-medium text-[#737373] hover:text-[#0D0D0D] transition-colors">Add evidence</button>
            </div>
            
            {profile?.projects && profile.projects.length > 0 ? (
              <div className="space-y-4">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 rounded-md group hover:border-[#D2D2D2] transition-colors">
                    <div className="text-[16px] font-serif text-[#0D0D0D] mb-2">{proj.title}</div>
                    <div className="text-[13px] text-[#737373] leading-relaxed font-sans">{proj.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#D2D2D2] p-10 rounded-md text-center bg-[#FAFAFA]">
                <div className="text-[14px] text-[#0D0D0D] font-serif mb-2">Define your technical claims.</div>
                <div className="text-[13px] text-[#737373] mb-6 font-sans">Add the projects you have built to establish your experience layer.</div>
                <button onClick={() => router.push('/candidate/dashboard')} className="text-[14px] font-sans font-medium text-[#0D0D0D] border border-[#D2D2D2] px-5 h-10 rounded-md hover:bg-[#F3F3F1] hover:text-[#0D0D0D] transition-colors">
                  Add experience
                </button>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Meta & Links */}
        <div className="space-y-10">
          
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 rounded-md mb-10">
            <h3 className="text-[14px] font-sans font-medium text-[#737373] mb-5 border-b border-[#E5E5E5] pb-3">Automated Evidence</h3>
            
            {profile?.githubEvidence ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#15803D] mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[13px] font-medium font-sans">GitHub Synced</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-1">Repos</div>
                    <div className="text-[16px] font-serif text-[#0D0D0D]">{profile.githubEvidence.repoCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-1">Commits</div>
                    <div className="text-[16px] font-serif text-[#0D0D0D]">~{profile.githubEvidence.totalCommits}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-2 mt-2">Top Languages</div>
                  <div className="flex gap-2 flex-wrap">
                    {profile.githubEvidence.topLanguages.map(lang => (
                      <span key={lang} className="text-[11px] font-mono bg-[#E5E5E5] text-[#0D0D0D] px-2 py-0.5 rounded-sm">{lang}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleGithubSync}
                  disabled={isSyncingGithub}
                  className="w-full mt-4 flex items-center justify-center gap-2 h-9 border border-[#D2D2D2] text-[#0D0D0D] rounded-md text-[12px] font-medium hover:bg-[#F3F3F1] transition-colors disabled:opacity-50"
                >
                  {isSyncingGithub ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  {isSyncingGithub ? "Syncing..." : "Resync Now"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[12px] text-[#737373] font-sans leading-relaxed">
                  Connect your GitHub account to automatically verify your repository metrics and languages.
                </p>
                {syncError && (
                  <p className="text-[12px] text-red-600 font-sans">{syncError}</p>
                )}
                <button 
                  onClick={handleGithubSync}
                  disabled={isSyncingGithub}
                  className="w-full flex items-center justify-center gap-2 h-9 bg-[#0D0D0D] text-white rounded-md text-[13px] font-medium hover:bg-[#222222] transition-colors disabled:opacity-50"
                >
                  {isSyncingGithub ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <GitBranch className="h-4 w-4" />
                  )}
                  {isSyncingGithub ? "Syncing..." : "Sync GitHub Account"}
                </button>
              </div>
            )}
          </div>

          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 rounded-md">
            <h3 className="text-[14px] font-sans font-medium text-[#737373] mb-5 border-b border-[#E5E5E5] pb-3">External links</h3>
            <div className="space-y-4">
              <a href={profile?.githubUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[13px] text-[#0D0D0D] hover:text-[#0D0D0D] transition-colors group">
                <Link className="h-[14px] w-[14px] text-[#737373] group-hover:text-[#0D0D0D]" /> <span className="font-mono">GitHub Profile</span>
              </a>
              <a href={profile?.resumeUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[13px] text-[#0D0D0D] hover:text-[#0D0D0D] transition-colors group">
                <Briefcase className="h-[14px] w-[14px] text-[#737373] group-hover:text-[#0D0D0D]" /> <span className="font-mono">External Resume</span>
              </a>
            </div>
          </div>

          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 rounded-md">
            <h3 className="text-[14px] font-sans font-medium text-[#737373] mb-5 border-b border-[#E5E5E5] pb-3">Education</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-[14px] w-[14px] text-[#737373] mt-1 shrink-0" />
                  <div>
                    <div className="text-[14px] text-[#0D0D0D] font-serif mb-1">{profile?.college || "University"}</div>
                    <div className="text-[12px] text-[#666666] font-sans">{profile?.branch || "Computer Science"}</div>
                    <div className="text-[10px] font-mono tracking-[0.1em] text-[#D2D2D2] uppercase mt-2">Class of {profile?.gradYear || "2024"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}


