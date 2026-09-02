"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ShieldCheck, ArrowRight, ShieldAlert, Award, Clock } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { ContextGuide } from "@/components/ui/ContextGuide";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CandidateVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(true);

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
        setIsFetching(false);
      }).catch((e) => {
        console.error(e);
        setIsFetching(false);
      });
    }
  }, [user]);

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

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#737373]">
              <div className="h-6 w-6 border-2 border-[#D2D2D2] border-t-[#0D0D0D] rounded-full animate-spin mb-4" />
              <p className="text-[13px] font-sans">Loading verification records...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-[#D2D2D2] p-10 rounded-md text-center bg-[#FAFAFA]">
              <div className="text-[14px] text-[#0D0D0D] font-serif mb-2">No technical claims found.</div>
              <p className="text-[13px] text-[#737373] font-sans mb-6">
                Add skills in your Identity section to become eligible for verification assessments.
              </p>
              <Link href="/candidate/profile">
                <Button variant="outline">Edit Identity</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((skill) => {
                const isVerified = profile?.verifiedSkills?.[skill]?.status === "verified";
                const cooldownTs = cooldowns[skill];
                const inCooldown = !!cooldownTs;

                return (
                  <div 
                    key={skill} 
                    className="border border-[#E5E5E5] rounded-xl p-5 bg-white flex flex-col justify-between hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[16px] font-bold text-[#0D0D0D] font-sans">{skill}</span>
                        {isVerified ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-sm">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : inCooldown ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase text-[#B42318] bg-[#B42318]/10 px-2 py-0.5 rounded-sm">
                            <Clock className="h-3 w-3" /> Cooldown
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono font-semibold uppercase text-[#737373] bg-[#F3F3F1] px-2 py-0.5 rounded-sm">
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#737373] font-sans mb-4">
                        {isVerified 
                          ? "This skill is verified and visible to employers in discovery." 
                          : inCooldown 
                          ? "Assessment cooldown active. Please review course material before re-attempting." 
                          : "Take a timed assessment to formally verify this skill."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E5E5] flex justify-end">
                      {isVerified ? (
                        <div className="flex items-center gap-1.5 text-[12px] text-[#15803D] font-medium font-sans">
                          <Award className="h-4 w-4" /> Assessment Passed
                        </div>
                      ) : inCooldown ? (
                        <span className="text-[12px] text-[#737373] font-mono">
                          Available in 14 days
                        </span>
                      ) : (
                        <Link href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}>
                          <Button size="sm" className="gap-1 text-[12px]">
                            Start Assessment <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Verification Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <h3 className="text-[15px] font-serif font-bold text-[#0D0D0D] mb-3">Verification Rules</h3>
            <ul className="space-y-3 text-[13px] text-[#737373] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-[#0D0D0D] font-bold">•</span> Passing threshold is 80% or higher.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0D0D0D] font-bold">•</span> Timed challenges are anti-cheat monitored.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0D0D0D] font-bold">•</span> Failed assessments trigger a 14-day cooldown period.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0D0D0D] font-bold">•</span> Verified skills appear automatically on public proof records.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
