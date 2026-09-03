"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { ArrowRight, Clock, ShieldCheck, BookOpen, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

function StatusStamp({ status }: { status: "VERIFIED" | "ELIGIBLE" | "COOLDOWN" }) {
  const map = {
    VERIFIED: "text-[#064E3B] bg-[#064E3B]/[0.08] border border-[#064E3B]/30",
    ELIGIBLE: "text-[#1C1917] bg-[#F5F1EB] border border-[#C8BFB0]",
    COOLDOWN: "text-[#92400E] bg-[#FEF3C7] border border-[#D97706]/30",
  };
  return (
    <span className={`inline-block text-[9px] font-mono font-semibold tracking-[0.18em] px-2 py-[3px] uppercase ${map[status]}`}>
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
    (v) => v.status === "verified"
  ).length;

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">

      {/* ── Registry Header Strip ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
              Technical Assessment Registry · Meritlane Examination System
            </div>
            <h1 className="text-[26px] sm:text-[32px] text-[#1C1917] font-semibold tracking-tight leading-tight">
              Skill Examination Records
            </h1>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Verified</div>
              <div className="text-[24px] font-semibold text-[#064E3B]">{verifiedCount}</div>
            </div>
            <div className="w-px h-10 bg-[#E7E2DA]" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider mb-0.5">Claimed</div>
              <div className="text-[24px] font-semibold text-[#1C1917]">{skills.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Exam Index Table ── */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-0.5">Section A</div>
              <h2 className="text-[12px] font-mono font-semibold text-[#1C1917] uppercase tracking-[0.08em]">
                Declared Capabilities — Assessment Index
              </h2>
            </div>
            <div className="text-[10px] font-mono text-[#78716C]">
              {skills.length} {skills.length === 1 ? "record" : "records"}
            </div>
          </div>

          {isFetching ? (
            <div className="border border-[#E7E2DA] bg-white p-12 text-center">
              <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] font-mono text-[#78716C]">Retrieving examination records…</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="border border-dashed border-[#C8BFB0] bg-white p-14 text-center">
              <BookOpen className="h-8 w-8 text-[#C8BFB0] mx-auto mb-4" />
              <div className="text-[16px] font-serif text-[#1C1917] mb-2">No capabilities declared</div>
              <p className="text-[13px] text-[#78716C] font-sans mb-6 max-w-sm mx-auto leading-relaxed">
                Declare skills in your Identity record to become eligible for proctored examinations.
              </p>
              <Link href="/candidate/profile">
                <button className="text-[11px] font-mono font-semibold px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors tracking-[0.06em] rounded-full">
                  OPEN IDENTITY RECORD
                </button>
              </Link>
            </div>
          ) : (
            <div className="border border-[#E7E2DA] bg-white overflow-hidden">
              {/* Table head */}
              <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_7rem_5rem_7rem_8rem] border-b border-[#E7E2DA] bg-[#F5F1EB] px-4 py-2.5">
                {["#", "Skill / Technology", "Status", "Score", "Exam Date", "Action"].map((h) => (
                  <div key={h} className={`text-[9px] font-mono text-[#78716C] uppercase tracking-[0.18em] ${h === "Action" ? "text-right" : ""}`}>
                    {h}
                  </div>
                ))}
              </div>

              {skills.map((skill, idx) => {
                const verifiedObj = profile?.verifiedSkills?.[skill];
                const isVerified = verifiedObj?.status === "verified";
                const inCooldown = !isVerified && !!cooldowns[skill];
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
                          <ShieldCheck className="h-2.5 w-2.5" />Active on public record
                        </div>
                      )}
                      {inCooldown && (
                        <div className="text-[10px] font-mono text-[#92400E] mt-0.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />Retry in ~{daysLeft}d
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
                            <button className="flex items-center gap-1 text-[10px] font-mono text-[#064E3B] border border-[#064E3B]/30 px-3 py-1 hover:bg-[#064E3B]/5 transition-colors rounded-full">
                              VIEW <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          </Link>
                        )
                      ) : inCooldown ? (
                        <span className="text-[10px] font-mono text-[#78716C]">Locked</span>
                      ) : (
                        <Link href={`/candidate/assessment?skill=${encodeURIComponent(skill)}`}>
                          <button className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-[#1C1917] hover:bg-[#064E3B] text-white px-3.5 py-1 transition-colors rounded-full">
                            EXAMINE <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Audit Trail */}
          {verifiedCount > 0 && (
            <div className="border border-[#E7E2DA] bg-white">
              <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
                <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                  Section B — Examination Audit Trail
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
                        <div className="h-1.5 w-1.5 rounded-full bg-[#064E3B] shrink-0" />
                        <div className="flex-1 text-[12px] font-sans text-[#1C1917]">
                          <span className="font-medium">{s}</span>
                          <span className="text-[#78716C]"> — proctored examination passed</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#78716C] shrink-0">{dt}</div>
                        <div className="text-[10px] font-mono font-semibold text-[#064E3B] shrink-0">
                          {v.score ? `${v.score}%` : "80%+"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Protocol Panel ── */}
        <div className="space-y-5">

          <div className="border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                Examination Protocol
              </div>
            </div>
            <div className="divide-y divide-[#F0EDE8]">
              {[
                { label: "Passing Threshold", value: "80 / 100" },
                { label: "Duration", value: "45 Minutes" },
                { label: "Environment", value: "Monitored Fullscreen" },
                { label: "Cooldown on Failure", value: "14 Calendar Days" },
                { label: "Record Visibility", value: "Public Registry" },
                { label: "Retakes", value: "After Cooldown" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[11px] font-mono text-[#78716C]">{label}</span>
                  <span className="text-[12px] font-mono font-semibold text-[#1C1917]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Eligibility Criteria
            </div>
            <div className="space-y-3">
              {[
                "Skill declared in Identity record.",
                "No active 14-day cooldown on the skill.",
                "Stable connection required for fullscreen monitor.",
                "Score ≥ 80% required for certification.",
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
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Status Legend
            </div>
            <div className="space-y-3">
              {(["VERIFIED", "ELIGIBLE", "COOLDOWN"] as const).map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <div className="pt-0.5"><StatusStamp status={s} /></div>
                  <span className="text-[11px] font-sans text-[#78716C] leading-relaxed">
                    {s === "VERIFIED"
                      ? "Proctored examination passed ≥ 80%"
                      : s === "ELIGIBLE"
                      ? "Ready to sit the examination"
                      : "Failed — 14-day study period active"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#E7E2DA] bg-white p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Examination Standards
            </div>
            <p className="text-[12px] font-sans text-[#525252] leading-relaxed mb-4">
              All examinations are administered under a standardised proctoring protocol.
              Scores are timestamped and immutably recorded against your candidate ID.
            </p>
            <Link
              href="/how-verification-works"
              className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#1C1917] hover:text-[#064E3B] transition-colors"
            >
              READ FULL METHODOLOGY <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

