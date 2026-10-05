"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ArrowRight, Clock, ShieldCheck, BookOpen, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import CooldownTimer from "@/components/candidate/cooldown-timer";

function StatusStamp({ status }: { status: "VERIFIED" | "ELIGIBLE" | "COOLDOWN" }) {
  const map = {
    VERIFIED: "text-[#064E3B] bg-[#064E3B]/[0.08] border border-[#064E3B]/30",
    ELIGIBLE: "text-[#1C1917] bg-[#F5F1EB] border border-[#C8BFB0]",
    COOLDOWN: "text-[#92400E] bg-[#FEF3C7] border border-[#D97706]/30",
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

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchCandidateProfile(user.uid),
      getDoc(doc(db, "users", user.uid))
        .then((d) => (d.exists() ? d.data() : null))
        .catch(() => null),
    ]).then(([p, uData]) => {
      setProfile(p);
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

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">

      {/* ── Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Skill Verification · Meritlane
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-[#1C1917] font-semibold tracking-tight leading-tight">
              Skill Tests &amp; Badges
            </h1>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-medium text-[#78716C] uppercase tracking-wider mb-0.5">Verified (≥75%)</div>
              <div className="text-[24px] font-semibold text-[#064E3B]">{verifiedCount}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-[#78716C] uppercase tracking-wider mb-0.5">Total Skills</div>
              <div className="text-[24px] font-semibold text-[#1C1917]">{skills.length}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <div className="text-right">
              <div className="text-[10px] font-medium text-[#78716C] uppercase tracking-wider mb-0.5">Employer Discovery</div>
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

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Exam Index Table ── */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase mb-0.5">Your Skills</div>
              <h2 className="text-[12px] font-medium font-semibold text-[#1C1917] uppercase tracking-[0.08em]">
                Available Skill Tests
              </h2>
            </div>
            <div className="text-[10px] font-mono text-[#78716C]">
              {skills.length} {skills.length === 1 ? "skill" : "skills"}
            </div>
          </div>

          {isFetching ? (
            <div className="border border-[#E7E2DA] bg-white p-12 text-center">
              <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] font-mono text-[#78716C]">Loading your skill tests…</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-[#C8BFB0] bg-white p-14 text-center">
              <BookOpen className="h-8 w-8 text-[#C8BFB0] mx-auto mb-4" />
              <div className="text-[16px] font-serif text-[#1C1917] mb-2">No skills added yet</div>
              <p className="text-[13px] text-[#78716C] font-sans mb-6 max-w-sm mx-auto leading-relaxed">
                Add skills in your profile to take tests and earn verified badges for recruiters to see.
              </p>
              <Link href="/candidate/profile">
                <button className="text-[11px] font-mono font-semibold px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors tracking-[0.06em] rounded">
                  GO TO PROFILE
                </button>
              </Link>
            </div>
          ) : (
            <div className="border border-[#E7E2DA] bg-white overflow-hidden">
              {/* Table head */}
              <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] border-b border-[#E7E2DA] bg-[#F5F1EB] px-4 py-2.5">
                {["#", "Skill", "Status", "Score", "Test Date", "Action"].map((h) => (
                  <div key={h} className={`text-[9px] font-medium text-[#78716C] uppercase tracking-[0.18em] ${h === "Action" ? "text-right" : ""}`}>
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
                    className={`sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] flex flex-col gap-2 sm:gap-0 items-start sm:items-center px-4 py-4 border-b border-[#E7E2DA] last:border-b-0 transition-colors ${
                      isVerified ? "bg-[#064E3B]/[0.02]" : "bg-white hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="hidden sm:block text-[11px] font-mono text-[#C8BFB0]">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div>
                      <div className="text-[14px] font-serif text-[#1C1917]">{skill}</div>
                      {isVerified && (
                        <div className="text-[10px] font-mono text-[#064E3B] mt-0.5 flex items-center gap-1">
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

                    <div className="text-[13px] font-mono text-[#1C1917]">
                      {score ? `${score}%` : "—"}
                    </div>

                    <div className="text-[11px] font-mono text-[#78716C]">
                      {verifiedAt || "—"}
                    </div>

                    <div className="sm:flex sm:justify-end">
                      {isVerified ? (
                        user && (
                          <Link href={`/p/${user.uid}`} target="_blank">
                            <button className="flex items-center gap-1 text-[10px] font-mono text-[#064E3B] border border-[#064E3B]/30 px-3 py-1 hover:bg-[#064E3B]/5 transition-colors rounded">
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
                        <Link href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}>
                          <button className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-[#1C1917] hover:bg-[#064E3B] text-white px-3.5 py-1 transition-colors rounded">
                            TAKE TEST <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Test History */}
          {verifiedCount > 0 && (
            <div className="border border-[#E7E2DA] bg-white">
              <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
                <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
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
                        <div className="h-1.5 w-1.5 rounded bg-[#064E3B] shrink-0" />
                        <div className="flex-1 text-[12px] font-sans text-[#1C1917]">
                          <span className="font-medium">{s}</span>
                          <span className="text-[#78716C]"> — test passed</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#78716C] shrink-0">{dt}</div>
                        <div className="text-[10px] font-mono font-semibold text-[#064E3B] shrink-0">
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
        <div className="space-y-5">

          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
              <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
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
                  <span className="text-[11px] font-mono text-[#78716C]">{label}</span>
                  <span className="text-[12px] font-mono font-semibold text-[#1C1917]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase mb-3">
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
                  <div className="text-[12px] font-sans text-[#525252] leading-relaxed">{rule}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Status Explanations
            </div>
            <div className="space-y-3">
              {(["VERIFIED", "ELIGIBLE", "COOLDOWN"] as const).map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <div className="pt-0.5"><StatusStamp status={s} /></div>
                  <span className="text-[11px] font-sans text-[#78716C] leading-relaxed">
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

          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Why Verification Matters
            </div>
            <p className="text-[12px] font-sans text-[#525252] leading-relaxed mb-4">
              Tests verify your practical coding abilities. Once you pass, verified badges appear on your public profile for tech recruiters to see.
            </p>
            <Link
              href="/how-verification-works"
              className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#1C1917] hover:text-[#064E3B] transition-colors"
            >
              LEARN HOW VERIFICATION WORKS <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

