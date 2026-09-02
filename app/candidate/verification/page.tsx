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
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 mx-auto max-w-[1600px] h-full overflow-y-auto scrollbar-hide relative">
      
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

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-[#064E3B] animate-pulse" />
          <span className="text-[12px] font-mono tracking-widest text-[#064E3B] uppercase font-medium">
            Protocol 002.A • Skill Verification Engine
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E7E2DA] pb-8">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[50px] text-[#1C1917] leading-[1.08] mb-3">
              Technical Verification
            </h1>
            <p className="text-[15px] text-[#525252] font-sans max-w-2xl leading-relaxed">
              Transform your self-declared engineering claims into immutable, cryptographically verifiable proof through monitored assessments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between mb-4 border-b border-[#E7E2DA] pb-3">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#78716C]">Eligible Technical Capabilities</h2>
            <span className="text-[11px] font-mono text-[#064E3B]">{skills.length} Capabilities</span>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#78716C]">
              <div className="h-6 w-6 border-2 border-[#E7E2DA] border-t-[#064E3B] rounded-full animate-spin mb-4" />
              <p className="text-[13px] font-mono">Retrieving verification audit logs...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-[#E7E2DA] p-12 rounded-xl text-center bg-white shadow-xs">
              <div className="text-[16px] text-[#1C1917] font-serif mb-2">No technical claims declared</div>
              <p className="text-[13px] text-[#78716C] font-sans mb-6 max-w-md mx-auto">
                Add skills in your Identity section to establish candidate eligibility for monitored verification assessments.
              </p>
              <Link href="/candidate/profile">
                <Button className="bg-[#064E3B] hover:bg-[#022c22] text-white">Edit Identity</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((skill) => {
                const verifiedObj = profile?.verifiedSkills?.[skill];
                const isVerified = verifiedObj?.status === "verified";
                const cooldownTs = cooldowns[skill];
                const inCooldown = !isVerified && !!cooldownTs;

                const daysRemaining = cooldownTs
                  ? Math.max(1, Math.ceil((cooldownTs + 14 * 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null;

                const score = verifiedObj?.score;
                const verifiedAt = verifiedObj?.verifiedAt
                  ? new Date(verifiedObj.verifiedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div 
                    key={skill} 
                    className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${isVerified ? 'border-[#064E3B]/30 bg-[#F0FDF4]/50 shadow-[0_2px_12px_rgba(6,78,59,0.05)]' : 'border-[#E7E2DA] bg-white hover:border-[#C8C0B5]'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[15px] font-serif font-medium text-[#1C1917]">{skill}</span>
                        {isVerified ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-medium uppercase text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded-full border border-[#064E3B]/20">
                            <ShieldCheck className="h-3 w-3 text-[#064E3B]" /> Verified
                          </span>
                        ) : inCooldown ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-medium uppercase text-[#B42318] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#B42318]/20">
                            <Clock className="h-3 w-3" /> Cooldown
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono font-medium uppercase text-[#78716C] bg-[#F8F6F3] px-2 py-0.5 rounded-full border border-[#E7E2DA]">
                            Pending Audit
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#78716C] font-sans mb-4 leading-relaxed">
                        {isVerified 
                          ? `Audited score: ${score ? `${score}%` : "80%+"}${verifiedAt ? ` on ${verifiedAt}` : ""}. Active on public verification records.`
                          : inCooldown 
                          ? `Assessment cooldown active. Available to retake in approximately ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}.`
                          : "Take a timed, monitored technical assessment to establish verifiable proof."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between">
                      {isVerified ? (
                        <>
                          <div className="flex items-center gap-1.5 text-[12px] text-[#064E3B] font-medium font-mono">
                            <Award className="h-4 w-4 text-[#064E3B]" /> {score ? `${score}% index` : "Passed"}
                          </div>
                          {user && (
                            <Link href={`/p/${user.uid}`}>
                              <Button variant="outline" size="sm" className="text-[12px] h-8 rounded-full">
                                View Public Record
                              </Button>
                            </Link>
                          )}
                        </>
                      ) : inCooldown ? (
                        <span className="text-[12px] text-[#78716C] font-mono">
                          Retry in ~{daysRemaining}d
                        </span>
                      ) : (
                        <Link href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`} className="w-full flex justify-end">
                          <button className="flex items-center gap-1 text-[12px] font-medium px-4 py-2 bg-[#064E3B] hover:bg-[#022c22] text-white rounded-full transition-colors shadow-xs">
                            Start Assessment <ArrowRight className="h-3.5 w-3.5" />
                          </button>
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
          <div className="bg-white border border-[#E7E2DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[15px] font-semibold text-[#1C1917] mb-3">Verification Rules</h3>
            <ul className="space-y-3 text-[13px] text-[#78716C] font-sans">
              <li className="flex items-start gap-2">
                <span className="text-[#1C1917] font-semibold">•</span> Passing threshold is 80% or higher.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1C1917] font-semibold">•</span> Timed challenges run in monitored fullscreen.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1C1917] font-semibold">•</span> Normal failure enforces a 14-day study cooldown.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1C1917] font-semibold">•</span> Verified skills appear automatically on public records.
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-[#E7E2DA]">
              <Link
                href="/how-verification-works"
                className="text-[13px] font-medium text-[#1C1917] hover:underline flex items-center gap-1"
              >
                How verification works <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
