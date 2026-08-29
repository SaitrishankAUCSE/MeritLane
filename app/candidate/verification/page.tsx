
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { ContextGuide } from "@/components/ui/ContextGuide";

export default function CandidateVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchCandidateProfile(user.uid),
        getDoc(doc(db, "users", user.uid)).then(d => d.exists() ? d.data() : null).catch(() => null)
      ]).then(([p, uData]) => {
        setProfile(p);
        
        // Check cooldowns
        if (p?.skills) {
          const cd: Record<string, number> = {};
          const now = Date.now();
          const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

          p.skills.forEach(skill => {
            let timestamp: number | null = null;
            
            // Check Firestore failedAssessments
            if (uData?.failedAssessments && uData.failedAssessments[skill]) {
              const fa = uData.failedAssessments[skill];
              timestamp = typeof fa?.toMillis === "function" ? fa.toMillis() : (typeof fa === "number" ? fa : (fa?.seconds ? fa.seconds * 1000 : null));
            }

            // Fallback: localStorage
            if (!timestamp) {
              const cooldownStr = localStorage.getItem(`meritlane_cooldown_${user.uid}_${skill}`);
              if (cooldownStr) {
                timestamp = parseInt(cooldownStr, 10);
              }
            }

            if (timestamp && (now - timestamp < fourteenDaysMs)) {
              cd[skill] = timestamp;
            }
          });
          setCooldowns(cd);
        }
      });
    }
  }, [user]);

  if (loading || (!profile && user)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#FAFAFA]">
        <MeritlaneLoader text="Loading Verification" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#FAFAFA] text-[#666666] font-mono text-[11px] uppercase tracking-widest">
        Profile not initialized.
      </div>
    );
  }

  const skills = profile?.skills || [];

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
      
      <ContextGuide 
        storageKey="candidate_verification"
        title="Verification Status"
        description="This is where you initiate and track your formal skill assessments."
        steps={[
          { title: "Select Skill", description: "Choose an eligible skill to assess.", isCompleted: true },
          { title: "Take Assessment", description: "Pass the timed assessment (Score ≥ 80%).", isCompleted: Object.values(profile?.verifiedSkills || {}).some(v => v.status === "verified") },
          { title: "Get Verified", description: "Your skill is officially stamped and visible to employers.", isCompleted: Object.values(profile?.verifiedSkills || {}).some(v => v.status === "verified") }
        ]}
      />

      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3 flex items-center gap-2">
          <ShieldCheck className="h-3 w-3" /> Verification Status
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[40px] sm:text-[48px] text-[#0D0D0D] leading-tight mb-2">Technical Verification</h1>
            <div className="text-[14px] text-[#0D0D0D] font-sans">Transform your self-declared claims into verifiable proof.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between mb-4 border-b border-[#E5E5E5] pb-3">
            <h2 className="text-[14px] font-sans font-medium text-[#737373]">Eligible skills</h2>
          </div>

          {skills.length === 0 ? (
            <div className="border border-dashed border-[#D2D2D2] p-10 rounded-md text-center bg-[#FAFAFA]">
              <div className="text-[14px] text-[#0D0D0D] font-serif mb-2">No technical claims found.</div>
              <div className="text-[13px] text-[#737373] mb-6 font-sans">Add skills to your Identity before they can be verified.</div>
              <button 
                onClick={() => router.push("/candidate/profile")}
                className="text-[14px] font-sans font-medium text-[#0D0D0D] border border-[#D2D2D2] px-5 h-10 rounded-md hover:bg-[#F3F3F1] transition-colors"
              >
                Go to Identity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {skills.map((skill, idx) => {
                const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
                const cooldownTimestamp = cooldowns[skill];
                const isOnCooldown = !!cooldownTimestamp;
                
                return (
                  <div key={idx} className={`border p-6 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${isVerified ? "border-[#15803D]/30 bg-[#F0FDF4]" : "border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#D2D2D2]"}`}>
                    <div>
                      <div className="text-[16px] font-medium text-[#0D0D0D] mb-1 font-serif">{skill}</div>
                      
                      {isVerified ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#15803D] bg-[#F0FDF4] px-2 py-1 rounded-sm border border-[#15803D]/20 mt-2 w-fit">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified by MeritLane
                        </div>
                      ) : isOnCooldown ? (
                        <div className="text-[11px] font-mono text-[#B42318] uppercase tracking-[0.1em] flex items-center gap-1.5 mt-2">
                          <ShieldAlert className="h-3.5 w-3.5" /> Assessment Cooldown Active
                        </div>
                      ) : (
                        <div className="text-[12px] font-sans text-[#737373]">
                          Eligible for remote assessment. Requires ~45 minutes.
                        </div>
                      )}
                    </div>
                    
                    <div className="shrink-0 text-right">
                      {isVerified ? (
                        <button 
                          onClick={() => router.push("/candidate/provenance")}
                          className="text-[13px] font-sans font-medium text-[#15803D] bg-transparent border border-[#15803D]/20 px-4 h-9 rounded-md hover:bg-[#15803D]/10 transition-colors"
                        >
                          View Record
                        </button>
                      ) : isOnCooldown ? (
                        <div className="text-[12px] font-mono text-[#0D0D0D]">
                          Available on {new Date(cooldownTimestamp + (14 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                        </div>
                      ) : (
                        <button 
                          onClick={() => router.push(`/candidate/assessment?skill=${encodeURIComponent(skill)}`)}
                          className="flex items-center gap-2 text-[13px] font-sans font-medium bg-[#0D0D0D] text-[#FFFFFF] px-5 h-9 rounded-md hover:bg-[#222222] transition-colors"
                        >
                          Start assessment <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-6 rounded-md">
            <h3 className="text-[14px] font-sans font-medium text-[#0D0D0D] mb-2 font-serif">Assessment Protocol</h3>
            <p className="text-[13px] text-[#737373] font-sans leading-relaxed mb-4">
              Technical assessments are heavily proctored. Navigating away, attempting to extract source code, or utilizing unauthorized external APIs will immediately terminate the session and place your account on a 14-day cooldown.
            </p>
            <div className="text-[12px] font-sans font-medium text-[#B42318] flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5" /> 1 attempt per 14 days
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

