"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { useRouter } from "next/navigation";
import { ShieldCheck, Fingerprint, Link, BookOpen, Briefcase, ChevronRight, PenTool } from "lucide-react";
import { ProfileForm } from "@/components/candidate/ProfileForm";

export default function CandidateProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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

  if (loading || isInitializing) {
    return <div className="h-full w-full flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#8e928f] border-t-white animate-spin rounded-full"></div></div>;
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 h-full overflow-y-auto scrollbar-hide">
        <ProfileForm 
          initialData={profile} 
          onSave={handleSave} 
          onCancel={profile?.name ? () => setIsEditing(false) : undefined}
          isNew={!profile?.name}
        />
      </div>
    );
  }

  const name = profile?.name || user?.displayName || "Alex Vance";
  const primaryDomain = profile?.skills?.[0] || "Software Engineering";
  const skills = profile?.skills || ["Python", "React", "Firebase"];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 h-full overflow-y-auto scrollbar-hide">
      
      <div className="mb-10">
        <div className="text-[14px] font-sans font-medium text-[#8e928f] mb-3 flex items-center gap-2">
          <Fingerprint className="h-3 w-3" /> Technical identity
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#272a2f] pb-6">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[40px] text-white leading-tight mb-2">{name}</h1>
            <div className="text-[14px] text-[#e3e2e5] font-sans">{primaryDomain}</div>
          </div>
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 h-10 border border-[#444846] bg-transparent text-[#e3e2e5] hover:text-black hover:bg-white hover:border-white rounded-md text-[14px] font-sans font-medium transition-all">
            <PenTool className="h-3.5 w-3.5" /> Edit identity
          </button>
        </div>
      </div>

      {/* Main Claims Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Skills / Claims */}
        <div className="md:col-span-2 space-y-10">
          
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-[#272a2f] pb-3">
              <h2 className="text-[14px] font-sans font-medium text-[#8e928f]">Technical claims</h2>
              <button className="text-[14px] font-sans font-medium text-[#8e928f] hover:text-white transition-colors">Add evidence</button>
            </div>
            
            <div className="space-y-4">
              {skills.map((skill, idx) => (
                <div key={idx} className="border border-[#272a2f] bg-[#0b0c0e] p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#444846] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 bg-transparent border border-[#444846] rounded-md flex items-center justify-center font-mono text-[14px] text-white">
                      {skill.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-white mb-1 font-serif">{skill}</div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#8e928f]">State: Declared</div>
                    </div>
                  </div>
                  
                  {/* Cross-pillar navigation logic */}
                  {idx === 0 ? (
                    <div className="text-right">
                      <div className="text-[10px] text-[#8e928f] font-mono uppercase tracking-[0.1em] mb-2">No evidence.</div>
                      <button 
                        onClick={() => router.push('/candidate/dashboard')}
                        className="text-[14px] font-sans font-medium text-[#e3e2e5] border border-[#444846] px-4 h-9 rounded-md hover:bg-white hover:text-black hover:border-white transition-colors"
                      >
                        Add evidence
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-[10px] text-[#a8a2ff] font-mono uppercase tracking-[0.1em] mb-2">Evidence Linked.</div>
                      <button 
                        onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                        className="text-[14px] font-sans font-medium text-[#e3e2e5] border border-[#a8a2ff]/40 bg-[#a8a2ff]/5 px-4 h-9 rounded-md hover:bg-[#a8a2ff] hover:text-black hover:border-[#a8a2ff] transition-colors"
                      >
                        Test Claim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 border-b border-[#272a2f] pb-3">
              <h2 className="text-[14px] font-sans font-medium text-[#8e928f]">Experience & projects</h2>
              <button className="text-[14px] font-sans font-medium text-[#8e928f] hover:text-white transition-colors">Add evidence</button>
            </div>
            
            {profile?.projects && profile.projects.length > 0 ? (
              <div className="space-y-4">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="border border-[#272a2f] bg-[#0b0c0e] p-6 rounded-md group hover:border-[#444846] transition-colors">
                    <div className="text-[16px] font-serif text-white mb-2">{proj.title}</div>
                    <div className="text-[13px] text-[#8e928f] leading-relaxed font-sans">{proj.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#444846] p-10 rounded-md text-center bg-[#0b0c0e]">
                <div className="text-[14px] text-white font-serif mb-2">Define your technical claims.</div>
                <div className="text-[13px] text-[#8e928f] mb-6 font-sans">Add the projects you have built to establish your experience layer.</div>
                <button className="text-[14px] font-sans font-medium text-white border border-[#444846] px-5 h-10 rounded-md hover:bg-white hover:text-black transition-colors">
                  Add experience
                </button>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Meta & Links */}
        <div className="space-y-10">
          
          <div className="border border-[#272a2f] bg-[#0b0c0e] p-6 rounded-md">
            <h3 className="text-[14px] font-sans font-medium text-[#8e928f] mb-5 border-b border-[#272a2f] pb-3">External links</h3>
            <div className="space-y-4">
              <a href={profile?.githubUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[13px] text-[#e3e2e5] hover:text-white transition-colors group">
                <Link className="h-[14px] w-[14px] text-[#8e928f] group-hover:text-white" /> <span className="font-mono">GitHub Profile</span>
              </a>
              <a href={profile?.resumeUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[13px] text-[#e3e2e5] hover:text-white transition-colors group">
                <Briefcase className="h-[14px] w-[14px] text-[#8e928f] group-hover:text-white" /> <span className="font-mono">External Resume</span>
              </a>
            </div>
          </div>

          <div className="border border-[#272a2f] bg-[#0b0c0e] p-6 rounded-md">
            <h3 className="text-[14px] font-sans font-medium text-[#8e928f] mb-5 border-b border-[#272a2f] pb-3">Education</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-[14px] w-[14px] text-[#8e928f] mt-1 shrink-0" />
                  <div>
                    <div className="text-[14px] text-white font-serif mb-1">{profile?.college || "University"}</div>
                    <div className="text-[12px] text-[#8e928f] font-sans">{profile?.branch || "Computer Science"}</div>
                    <div className="text-[10px] font-mono tracking-[0.1em] text-[#444846] uppercase mt-2">Class of {profile?.gradYear || "2024"}</div>
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


