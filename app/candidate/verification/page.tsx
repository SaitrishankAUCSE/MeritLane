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
    VERIFIED: "text-emerald-900 bg-emerald-900/[0.08] border border-emerald-900/30",
    ELIGIBLE: "text-foreground bg-border border border-[#C8BFB0]",
    COOLDOWN: "text-[#92400E] bg-[#FEF3C7] border border-amber-600/30",
  };
  return (
    <span className={`inline-block text-[9px] font-medium font-semibold tracking-[0.18em] px-2 py-[3px] uppercase ${map[status]}`}>
      {status}
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
    <div className="w-full min-h-full bg-transparent pb-24">

      {/* ── Header Strip ── */}
      <div className="border-b border-border bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Skill Verification · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-foreground font-semibold tracking-tight leading-tight">
              Skill Tests &amp; Badges
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Standardized, proctored assessments evaluating real executed code — earn verified credentials to unlock direct employer hiring without 0-2 year experience barriers.
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Verified (≥75%)</div>
              <div className="text-[24px] font-semibold text-emerald-900">{verifiedCount}</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total Skills</div>
              <div className="text-[24px] font-semibold text-foreground">{skills.length}</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Employer Discovery</div>
              <div className={`text-[12px] font-mono font-bold mt-1.5 px-2.5 py-0.5 rounded ${
                isEmployerPortalUnlocked
                  ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
              }`}>
                {isEmployerPortalUnlocked ? "✓ UNLOCKED" : `${verifiedCount}/${requiredForEmployerPortal} (50%)`}
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
              <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase mb-0.5">Your Skills</div>
              <h2 className="text-[12px] font-medium font-semibold text-foreground uppercase tracking-[0.08em]">
                Available Skill Tests
              </h2>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {skills.length} {skills.length === 1 ? "skill" : "skills"}
            </div>
          </div>

          {isFetching ? (
            <div className="border border-border bg-white p-12 text-center">
              <div className="h-5 w-5 border-2 border-border border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] font-mono text-muted-foreground">Loading your skill tests…</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-[#C8BFB0] bg-white p-14 text-center">
              <BookOpen className="h-8 w-8 text-[#C8BFB0] mx-auto mb-4" />
              <div className="text-[16px] font-serif text-foreground mb-2">No skills added yet</div>
              <p className="text-[13px] text-muted-foreground font-sans mb-6 max-w-sm mx-auto leading-relaxed">
                Add skills in your profile to take tests and earn verified badges for recruiters to see.
              </p>
              <Link href="/candidate/profile">
                <button className="text-[11px] font-mono font-semibold px-5 py-2.5 bg-foreground hover:bg-emerald-900 text-white transition-colors tracking-[0.06em] rounded">
                  GO TO PROFILE
                </button>
              </Link>
            </div>
          ) : (
            <div className="border border-border bg-white overflow-hidden">
              {/* Table head */}
              <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] border-b border-border bg-border px-4 py-2.5">
                {["#", "Skill", "Status", "Score", "Test Date", "Action"].map((h) => (
                  <div key={h} className={`text-[9px] font-medium text-muted-foreground uppercase tracking-[0.18em] ${h === "Action" ? "text-right" : ""}`}>
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
                const daysLeft = cooldowns[skill]
                  ? Math.max(1, Math.ceil((cooldowns[skill] + 14 * 24 * 60 * 60 * 1000 - Date.now()) / 86400000))
                  : null;
                const rowStatus: "VERIFIED" | "ELIGIBLE" | "COOLDOWN" = isVerified
                  ? "VERIFIED" : inCooldown ? "COOLDOWN" : "ELIGIBLE";

                return (
                  <div
                    key={skill}
                    className={`sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] flex flex-col gap-2 sm:gap-0 items-start sm:items-center px-4 py-4 border-b border-border last:border-b-0 transition-colors ${
                      isVerified ? "bg-emerald-900/[0.02]" : "bg-white hover:bg-surface"
                    }`}
                  >
                    <div className="hidden sm:block text-[11px] font-mono text-[#C8BFB0]">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-serif text-foreground">{skill}</span>
                        {isVerified && (verifiedObj?.badge === "gold_honors" || verifiedObj?.track === "advanced" ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
                            <Trophy className="h-2.5 w-2.5 text-amber-700" /> Gold Honors
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-1.5 py-0.5 rounded">
                            <Award className="h-2.5 w-2.5 text-emerald-900" /> Professional
                          </span>
                        ))}
                      </div>
                      {isVerified && (
                        <div className="text-[10px] font-mono text-emerald-900 mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" />Active on public profile
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

                    <div className="text-[13px] font-mono text-foreground">
                      {score ? `${score}%` : "—"}
                    </div>

                    <div className="text-[11px] font-mono text-muted-foreground">
                      {verifiedAt || "—"}
                    </div>

                    <div className="sm:flex sm:justify-end">
                      {isVerified ? (
                        user && (
                          <Link href={`/p/${user.uid}`} target="_blank">
                            <button className="flex items-center gap-1 text-[10px] font-mono text-emerald-900 border border-emerald-900/30 px-3 py-1 hover:bg-emerald-900/5 transition-colors rounded">
                              VIEW <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          </Link>
                        )
                      ) : inCooldown ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] px-2.5 py-1 rounded cursor-not-allowed select-none tabular-nums">
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
                            <button className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-foreground hover:bg-emerald-900 text-white px-3.5 py-1 transition-colors rounded">
                              TAKE TEST <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          </Link>
                        ) : (
                          <span
                            title="Assessment currently in development"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-[#F2EFE9] border border-border text-muted-foreground px-3.5 py-1 rounded cursor-not-allowed select-none tabular-nums"
                          >
                            IN DEVELOPMENT
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
            <div className="border border-border bg-white">
              <div className="border-b border-border bg-border px-5 py-3">
                <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Test History &amp; Verified Badges
                </div>
              </div>
              <div className="p-5 space-y-0 divide-y divide-[#F0EDE8]">
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
                      <div key={s} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="h-1.5 w-1.5 rounded bg-emerald-900 shrink-0" />
                        <div className="flex-1 text-[12px] font-sans text-foreground">
                          <span className="font-medium">{s}</span>
                          <span className="text-muted-foreground"> — test passed</span>
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground shrink-0">{dt}</div>
                        <div className="text-[10px] font-mono font-semibold text-emerald-900 shrink-0">
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

          <div className="border border-border bg-white">
            <div className="border-b border-border bg-border px-5 py-3">
              <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Test Details
              </div>
            </div>
            <div className="divide-y divide-[#F0EDE8]">
              {[
                { label: "Passing Score", value: "75% (All Components)" },
                { label: "Employer Portal", value: "Pass 50% of Skills" },
                { label: "Time Limit", value: "45 Minutes" },
                { label: "Mode", value: "Fullscreen Window" },
                { label: "Retry Wait Time", value: "14 Days" },
                { label: "Badge Visibility", value: "Public Profile" },
                { label: "Retakes", value: "Allowed After Wait Time" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
                  <span className="text-[12px] font-mono font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase mb-3">
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
                  <div className="text-[9px] font-mono text-[#C8BFB0] pt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[12px] font-sans text-muted-foreground leading-relaxed">{rule}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase mb-3">
              Status Explanations
            </div>
            <div className="space-y-3">
              {(["VERIFIED", "ELIGIBLE", "COOLDOWN"] as const).map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <div className="pt-0.5"><StatusStamp status={s} /></div>
                  <span className="text-[11px] font-sans text-muted-foreground leading-relaxed">
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

          <div className="border border-border bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase mb-3">
              Why Verification Matters
            </div>
            <p className="text-[12px] font-sans text-muted-foreground leading-relaxed mb-4">
              Tests verify your practical coding abilities. Once you pass, verified badges appear on your public profile for tech recruiters to see.
            </p>
            <Link
              href="/how-verification-works"
              className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-foreground hover:text-emerald-900 transition-colors"
            >
              LEARN HOW VERIFICATION WORKS <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

