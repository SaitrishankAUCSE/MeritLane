"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ArrowRight, Clock, ShieldCheck, BookOpen, ExternalLink, Trophy, Award } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import CooldownTimer from "@/components/candidate/cooldown-timer";

function StatusStamp({ status }: { status: "VERIFIED" | "ELIGIBLE" | "COOLDOWN" }) {
  const map = {
    VERIFIED: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    ELIGIBLE: "text-[#101010] bg-black/[0.04] border border-black/[0.08]",
    COOLDOWN: "text-amber-800 bg-amber-50 border border-amber-200 font-mono",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status]}`}>
      {status === "VERIFIED" ? "✓ Verified" : status === "COOLDOWN" ? "Cooldown" : "Eligible"}
    </span>
  );
}

export default function CandidateVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [supportedSkills, setSupportedSkills] = useState<{keys: string[], aliases: string[]} | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchCandidateProfile(user.uid),
      getDoc(doc(db, "users", user.uid))
        .then((d) => (d.exists() ? d.data() : null))
        .catch(() => null),
      fetch("/api/candidate/supported-skills").then(res => res.json()).catch(() => null)
    ]).then(([p, uData, ssData]) => {
      setProfile(p);
      if (ssData && ssData.keys) setSupportedSkills(ssData);
      if (p?.skills) {
        const cd: Record<string, number> = {};
        const now = Date.now();
        const fourteenDays = 14 * 24 * 60 * 60 * 1000;
        p.skills.forEach((skill) => {
          let ts: number | null = null;
          if (uData?.failedAssessments?.[skill]) {
            const fa = uData.failedAssessments[skill];
            ts =
              typeof fa?.toMillis === "function"
                ? fa.toMillis()
                : typeof fa === "number"
                ? fa
                : fa?.seconds
                ? fa.seconds * 1000
                : null;
          }
          if (!ts) {
            const stored = localStorage.getItem(`meritlane_cooldown_${user.uid}_${skill}`);
            if (stored) ts = parseInt(stored, 10);
          }
          if (ts && now - ts < fourteenDays) cd[skill] = ts;
        });
        setCooldowns(cd);
      }
      setIsFetching(false);
    }).catch(() => setIsFetching(false));
  }, [user]);

  const skills = profile?.skills || [];
  const verifiedCount = Object.values(profile?.verifiedSkills || {}).filter(
    (v) => v.status === "verified" && (v.score === undefined || v.score >= 75)
  ).length;
  const requiredForEmployerPortal = Math.max(1, Math.ceil(skills.length / 2));
  const isEmployerPortalUnlocked = skills.length > 0 && verifiedCount >= requiredForEmployerPortal;

  const isSkillSupported = (skill: string) => {
    if (!supportedSkills) return true; // optimistic if not loaded
    const normalized = skill.toLowerCase().trim();
    if (supportedSkills.keys.includes(normalized) || supportedSkills.aliases.includes(normalized)) return true;
    return supportedSkills.keys.some(key => normalized.includes(key));
  };

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010] font-sans">

      {/* ── Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#71717A] uppercase mb-1">
              Skill Verification · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-[#101010] font-semibold tracking-[-0.035em] leading-tight">
              Skill Assessments
            </h1>
            <p className="text-[13px] text-[#71717A] mt-1">
              Take timed technical evaluations to earn verified proof badges on your profile.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider mb-0.5">Verified Badges</div>
              <div className="text-[24px] font-semibold text-emerald-700">{verifiedCount}</div>
            </div>
            <div className="w-px h-10 bg-black/[0.08]" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider mb-0.5">Employer Discovery</div>
              <div className={`text-xs font-mono font-medium mt-1.5 px-3 py-1 rounded-full border ${
                isEmployerPortalUnlocked
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {isEmployerPortalUnlocked ? "✓ Unlocked" : `${verifiedCount}/${requiredForEmployerPortal} (50%)`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT: Exam Index Table ── */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-0.5">Available Tests</div>
              <h2 className="text-base font-semibold text-[#101010] tracking-tight">
                Skill Test Index
              </h2>
            </div>
            <div className="text-xs font-mono text-[#71717A]">
              {skills.length} {skills.length === 1 ? "skill" : "skills"}
            </div>
          </div>

          {isFetching ? (
            <div className="border border-black/[0.08] bg-white rounded-2xl p-12 text-center shadow-xs">
              <div className="h-5 w-5 border-2 border-black/[0.1] border-t-[#101010] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#71717A]">Loading your skill tests…</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-black/[0.12] bg-white rounded-2xl p-14 text-center shadow-xs">
              <BookOpen className="h-8 w-8 text-[#A1A1AA] mx-auto mb-4" />
              <div className="text-lg font-semibold text-[#101010] mb-2 tracking-tight">No skills added yet</div>
              <p className="text-[13px] text-[#71717A] mb-6 max-w-sm mx-auto leading-relaxed">
                Add skills in your profile to take tests and earn verified badges for recruiters to see.
              </p>
              <Link href="/candidate/profile">
                <button className="text-xs font-medium px-5 py-2.5 bg-[#101010] hover:bg-[#252525] text-white transition-all rounded-full shadow-xs">
                  Go to Profile
                </button>
              </Link>
            </div>
          ) : (
            <div className="border border-black/[0.08] bg-white rounded-2xl shadow-xs overflow-hidden">
              {/* Table head */}
              <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] border-b border-black/[0.08] bg-[#FAFAF9] px-5 py-3">
                {["#", "Skill", "Status", "Score", "Test Date", "Action"].map((h) => (
                  <div key={h} className={`text-[11px] font-medium text-[#71717A] uppercase tracking-wider ${h === "Action" ? "text-right" : ""}`}>
                    {h}
                  </div>
                ))}
              </div>

              {skills.map((skill, idx) => {
                const verifiedObj = profile?.verifiedSkills?.[skill];
                const isVerified = verifiedObj?.status === "verified";
                const inCooldown = !isVerified && !!cooldowns[skill];
                const cooldownTs = cooldowns[skill] || 0;
                const score = verifiedObj?.score;
                const verifiedAt = verifiedObj?.verifiedAt
                  ? new Date(verifiedObj.verifiedAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })
                  : null;
                const rowStatus: "VERIFIED" | "ELIGIBLE" | "COOLDOWN" = isVerified
                  ? "VERIFIED" : inCooldown ? "COOLDOWN" : "ELIGIBLE";

                return (
                  <div
                    key={skill}
                    className={`sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] flex flex-col gap-2 sm:gap-0 items-start sm:items-center px-5 py-4 border-b border-black/[0.06] last:border-b-0 transition-colors ${
                      isVerified ? "bg-emerald-50/20" : "bg-white hover:bg-[#FAFAF9]"
                    }`}
                  >
                    <div className="hidden sm:block text-xs font-mono text-[#A1A1AA]">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#101010]">{skill}</span>
                        {isVerified && (verifiedObj?.badge === "gold_honors" || verifiedObj?.track === "advanced" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                            <Trophy className="h-3 w-3 text-amber-700" /> Gold Honors
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Award className="h-3 w-3 text-emerald-600" /> Professional
                          </span>
                        ))}
                      </div>
                      {isVerified && (
                        <div className="text-[11px] font-mono text-emerald-700 mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />Active on public profile
                        </div>
                      )}
                      {inCooldown && (
                        <div className="mt-0.5">
                          <CooldownTimer
                            timestamp={cooldownTs}
                            durationDays={14}
                            variant="detail"
                            onExpire={() => {
                              setCooldowns((prev) => {
                                const next = { ...prev };
                                delete next[skill];
                                return next;
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div><StatusStamp status={rowStatus} /></div>

                    <div className="text-[13px] font-mono text-[#101010]">
                      {score ? `${score}%` : "—"}
                    </div>

                    <div className="text-xs font-mono text-[#71717A]">
                      {verifiedAt || "—"}
                    </div>

                    <div className="sm:flex sm:justify-end">
                      {isVerified ? (
                        user && (
                          <Link href={`/p/${user.uid}`} target="_blank">
                            <button className="flex items-center gap-1 text-xs font-medium text-emerald-700 border border-emerald-200 px-3 py-1 hover:bg-emerald-50 transition-colors rounded-full cursor-pointer">
                              View <ExternalLink className="h-3 w-3" />
                            </button>
                          </Link>
                        )
                      ) : inCooldown ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-medium bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full cursor-not-allowed select-none tabular-nums">
                          <CooldownTimer
                            timestamp={cooldownTs}
                            durationDays={14}
                            variant="badge"
                            onExpire={() => {
                              setCooldowns((prev) => {
                                const next = { ...prev };
                                delete next[skill];
                                return next;
                              });
                            }}
                          />
                        </span>
                      ) : (
                        isSkillSupported(skill) ? (
                          <Link href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}>
                            <button className="flex items-center gap-1.5 text-xs font-medium bg-[#101010] hover:bg-[#252525] text-white px-4 py-1.5 transition-all rounded-full shadow-xs cursor-pointer active:scale-[0.98]">
                              Take Test <ArrowRight className="h-3 w-3" />
                            </button>
                          </Link>
                        ) : (
                          <span
                            title="Assessment currently in development"
                            className="inline-flex items-center gap-1 text-xs font-medium bg-[#F4F4F2] border border-black/[0.08] text-[#71717A] px-3.5 py-1 rounded-full cursor-not-allowed select-none"
                          >
                            In Development
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Test History */}
          {verifiedCount > 0 && (
            <div className="border border-black/[0.08] bg-white rounded-2xl shadow-xs overflow-hidden">
              <div className="border-b border-black/[0.08] bg-[#FAFAF9] px-6 py-4">
                <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                  Test History &amp; Verified Badges
                </div>
              </div>
              <div className="p-6 space-y-0 divide-y divide-black/[0.06]">
                {skills
                  .filter((s) => profile?.verifiedSkills?.[s]?.status === "verified")
                  .map((s) => {
                    const v = profile!.verifiedSkills![s];
                    const dt = v.verifiedAt
                      ? new Date(v.verifiedAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "long", year: "numeric",
                        })
                      : "Unknown date";
                    return (
                      <div key={s} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                        <div className="flex-1 text-[13px] text-[#101010]">
                          <span className="font-medium">{s}</span>
                          <span className="text-[#71717A]"> — evaluation passed</span>
                        </div>
                        <div className="text-xs font-mono text-[#71717A] shrink-0">{dt}</div>
                        <div className="text-xs font-mono font-semibold text-emerald-700 shrink-0">
                          {v.score ? `${v.score}%` : "Passed"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Test Rules & Info ── */}
        <div className="space-y-5 lg:sticky lg:top-6 self-start">

          <div className="border border-black/[0.08] bg-white rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-black/[0.08] bg-[#FAFAF9] px-5 py-3.5">
              <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                Test Details
              </div>
            </div>
            <div className="divide-y divide-black/[0.06]">
              {[
                { label: "Passing Score", value: "75% (All Components)" },
                { label: "Employer Portal", value: "Pass 50% of Skills" },
                { label: "Time Limit", value: "45 Minutes" },
                { label: "Mode", value: "Fullscreen Monitored" },
                { label: "Retry Wait Time", value: "14 Days" },
                { label: "Badge Visibility", value: "Public Profile" },
                { label: "Retakes", value: "Allowed After Wait Time" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#71717A]">{label}</span>
                  <span className="text-xs font-mono font-medium text-[#101010]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black/[0.08] bg-white rounded-2xl p-5 shadow-xs">
            <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider mb-3">
              Requirements
            </div>
            <div className="space-y-3">
              {[
                "Skill is added to your Profile.",
                "No active 14-day wait period on this skill.",
                "Stable internet connection for the timed session.",
                "Score 75% or higher on each assessment to earn the verified badge.",
                "Verify at least 50% of your listed skills to unlock visibility in the Employer Portal.",
              ].map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-xs font-mono text-[#A1A1AA] pt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-[#71717A] leading-relaxed">{rule}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black/[0.08] bg-white rounded-2xl p-5 shadow-xs">
            <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider mb-3">
              Status Explanations
            </div>
            <div className="space-y-3">
              {(["VERIFIED", "ELIGIBLE", "COOLDOWN"] as const).map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <div className="pt-0.5"><StatusStamp status={s} /></div>
                  <span className="text-xs text-[#71717A] leading-relaxed">
                    {s === "VERIFIED"
                      ? "Skill test passed and badge active"
                      : s === "ELIGIBLE"
                      ? "Ready to take the test"
                      : "Did not pass — retry available after 14 days"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black/[0.08] bg-white rounded-2xl p-5 shadow-xs">
            <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider mb-2">
              Why Verification Matters
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed mb-3.5">
              Tests verify your practical coding abilities. Once you pass, verified badges appear on your public profile for tech recruiters to see.
            </p>
            <Link
              href="/how-verification-works"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101010] hover:text-[#71717A] transition-colors"
            >
              Learn how verification works <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
