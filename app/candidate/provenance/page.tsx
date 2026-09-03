"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import Link from "next/link";
import { ExternalLink, Copy, Check, ShieldCheck } from "lucide-react";

export default function ProvenancePage() {
  const { user, loading } = useAuth();
  const [candidate, setCandidate] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setFetching(true);
      try {
        const [cProfile, uSnap] = await Promise.all([
          fetchCandidateProfile(user.uid),
          getDoc(doc(db, "users", user.uid)),
        ]);
        if (cProfile) setCandidate(cProfile);
        if (uSnap.exists()) setUserDoc(uSnap.data());
      } catch (err) {
        console.error("Error fetching provenance data:", err);
      } finally {
        setFetching(false);
      }
    }
    if (!loading && user) loadData();
  }, [user, loading]);

  const verifiedCount = Object.values((candidate as any)?.verifiedSkills || {}).filter(
    (v: any) => v.status === "verified"
  ).length;
  const isDiscoverable = verifiedCount > 0;
  const publicUrl = user ? `${typeof window !== "undefined" ? window.location.origin : "https://merit-lane.vercel.app"}/p/${user.uid}` : "";
  const shortId = user?.uid?.substring(0, 8).toUpperCase() || "—";
  const auditDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const handleCopy = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="w-full min-h-full bg-[#FAF8F5] pb-24">

      {/* ── Dossier Command Header ── */}
      <div className="border-b border-[#E7E2DA] bg-white px-6 sm:px-10 py-5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#78716C] uppercase mb-1">
                Public Audit Dossier · Meritlane Verified Record Registry
              </div>
              <h1 className="text-[26px] sm:text-[32px] text-[#1C1917] font-semibold tracking-tight leading-tight">
                Provenance Record
              </h1>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-mono text-[#78716C]">
                  Record ID: <span className="text-[#1C1917] font-semibold">#{shortId}</span>
                </span>
                <div className="w-px h-3 bg-[#E7E2DA]" />
                <span className="text-[11px] font-mono text-[#78716C]">
                  Last Audited: <span className="text-[#1C1917]">{auditDate}</span>
                </span>
                <div className="w-px h-3 bg-[#E7E2DA]" />
                <span className="text-[11px] font-mono text-[#78716C]">
                  Custodian: <span className="text-[#1C1917]">Meritlane Registry</span>
                </span>
              </div>
            </div>
            {user && (
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-4 py-2 border border-[#E7E2DA] bg-white hover:bg-[#F5F1EB] text-[#1C1917] transition-colors rounded-full shadow-2xs"
                >
                  {copied ? <Check className="h-3 w-3 text-[#064E3B]" /> : <Copy className="h-3 w-3" />}
                  {copied ? "COPIED" : "COPY LINK"}
                </button>
                <Link href={publicUrl} target="_blank">
                  <button className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-4 py-2 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors rounded-full shadow-2xs">
                    <ExternalLink className="h-3 w-3" />
                    OPEN PUBLIC RECORD
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-6 space-y-6">

        {/* ── Metadata Strip: 3 columns ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#E7E2DA] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E7E2DA]">

          {/* Record Status */}
          <div className="p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Record Status
            </div>
            <div className={`text-[22px] font-serif mb-1 ${isDiscoverable ? "text-[#064E3B]" : "text-[#78716C]"}`}>
              {isDiscoverable ? "Active" : "Inactive"}
            </div>
            <div className="text-[11px] font-sans text-[#78716C] leading-relaxed">
              {isDiscoverable
                ? `${verifiedCount} verified credential${verifiedCount !== 1 ? "s" : ""} on record. Active and discoverable.`
                : "Pass at least one proctored assessment to activate this record."}
            </div>
          </div>

          {/* Chain of Custody */}
          <div className="p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Chain of Custody
            </div>
            <div className="space-y-2.5">
              {[
                { step: "Assertion", party: "Candidate (self-declared)" },
                { step: "Examination", party: "Meritlane Proctored System" },
                { step: "Certification", party: "Meritlane Registry (automated)" },
                { step: "Integrity", party: "Timestamp-signed records" },
              ].map(({ step, party }) => (
                <div key={step} className="flex gap-3">
                  <div className="text-[9px] font-mono text-[#C8BFB0] pt-0.5 shrink-0 w-16">{step}</div>
                  <div className="text-[11px] font-sans text-[#525252]">{party}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosure Status */}
          <div className="p-5">
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase mb-3">
              Disclosure Status
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Discoverable by Employers", value: isDiscoverable },
                { label: "Indexed in Registry", value: true },
                { label: "Employer-Visible", value: isDiscoverable },
                { label: "Public URL Active", value: !!user },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-sans text-[#525252]">{label}</span>
                  <span className={`text-[9px] font-mono font-semibold tracking-[0.14em] px-2 py-[2px] uppercase border ${
                    value
                      ? "text-[#064E3B] bg-[#064E3B]/[0.06] border-[#064E3B]/25"
                      : "text-[#78716C] bg-[#F5F1EB] border-[#C8BFB0]"
                  }`}>
                    {value ? "YES" : "NO"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Notice band ── */}
        <div className="border border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3 flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-[#064E3B] shrink-0" />
          <p className="text-[11px] font-mono text-[#525252]">
            This is a live preview of your public dossier exactly as employers see it.
            It updates automatically when new credentials are verified.
          </p>
        </div>

        {/* ── Filed Document Frame ── */}
        {fetching ? (
          <div className="border border-[#E7E2DA] bg-white p-16 text-center">
            <div className="h-5 w-5 border-2 border-[#E7E2DA] border-t-[#1C1917] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[12px] font-mono text-[#78716C]">Compiling public proof record…</p>
          </div>
        ) : !candidate ? (
          <div className="border border-dashed border-[#C8BFB0] bg-white p-16 text-center">
            <p className="text-[16px] font-serif text-[#1C1917] mb-2">Profile not initialised</p>
            <p className="text-[13px] text-[#78716C] mb-6 font-sans">
              Complete your identity details to generate a provenance record.
            </p>
            <Link href="/candidate/profile">
              <button className="text-[11px] font-mono font-semibold px-5 py-2.5 bg-[#1C1917] hover:bg-[#064E3B] text-white transition-colors tracking-[0.06em]">
                COMPLETE IDENTITY RECORD
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E7E2DA] bg-white">
            {/* Document header bar */}
            <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-6 py-3 flex items-center justify-between">
              <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase">
                Filed Document — Public Proof Record
              </div>
              <div className="text-[9px] font-mono text-[#78716C]">
                UID: {user?.uid?.substring(0, 12).toLowerCase()}…
              </div>
            </div>
            {/* Embedded proof record */}
            <div className="p-6 md:p-10">
              <PublicProofRecord
                id={user?.uid || ""}
                candidate={candidate}
                user={userDoc}
                hideHeader={true}
              />
            </div>
            {/* Document footer */}
            <div className="border-t border-[#E7E2DA] bg-[#F5F1EB] px-6 py-3 flex items-center justify-between">
              <div className="text-[9px] font-mono text-[#78716C]">
                Meritlane Registry · merit-lane.vercel.app
              </div>
              <div className="text-[9px] font-mono text-[#78716C]">
                Generated: {auditDate}
              </div>
            </div>
          </div>
        )}

        {/* ── Usage guidance ── */}
        <div className="border border-[#E7E2DA] bg-white p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="text-[9px] font-mono tracking-[0.18em] text-[#78716C] uppercase sm:col-span-3 pb-3 border-b border-[#E7E2DA]">
            How to Use This Record
          </div>
          {[
            {
              step: "01",
              title: "Share Your Link",
              desc: "Copy your public URL and include it in job applications, CVs, and LinkedIn as a verified proof link.",
            },
            {
              step: "02",
              title: "Employer Discovery",
              desc: "Employers using Meritlane can search the registry and your profile will surface when you have verified credentials.",
            },
            {
              step: "03",
              title: "Keep it Current",
              desc: "Every new verified skill automatically appears here. Pass more examinations to strengthen your record.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="text-[20px] font-serif text-[#E7E2DA] shrink-0 leading-none mt-0.5">{step}</div>
              <div>
                <div className="text-[12px] font-mono font-semibold text-[#1C1917] mb-1">{title}</div>
                <div className="text-[11px] font-sans text-[#78716C] leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

