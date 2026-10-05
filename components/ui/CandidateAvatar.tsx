"use client";

import React from "react";
import { Check, Clock } from "lucide-react";

export type AvatarBadgeType = "auto" | "job_ready" | "in_verification" | "none";

interface CandidateAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isEligibleForJob?: boolean;
  badgePreference?: AvatarBadgeType;
  showBadge?: boolean;
  className?: string;
}

export function CandidateAvatar({
  avatarUrl,
  name = "Candidate",
  size = "xl",
  isEligibleForJob = false,
  badgePreference = "auto",
  showBadge = true,
  className = "",
}: CandidateAvatarProps) {
  // Determine active badge mode: ONLY given to candidates who completed all skills verifications
  let effectiveBadge: "job_ready" | "none" = "none";
  if (showBadge && isEligibleForJob && badgePreference !== "none") {
    effectiveBadge = "job_ready";
  }

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || "")
      .join("") || "C";

  // Sizing definitions: small, round, perfectly proportioned
  const sizeMap = {
    sm: {
      container: "h-8 w-8 text-xs",
      ring: effectiveBadge === "job_ready" ? "ring-2 ring-[#059669] ring-offset-1" : "",
      badge: "bottom-0 -left-2 -right-2 py-0.5",
      badgeText: "READY",
      textSize: "text-[5.5px]",
      iconSize: "h-1.5 w-1.5",
    },
    md: {
      container: "h-11 w-11 text-sm",
      ring: effectiveBadge === "job_ready" ? "ring-2 ring-[#059669] ring-offset-1" : "",
      badge: "bottom-1 -left-3 -right-3 py-0.5",
      badgeText: "#JOB READY",
      textSize: "text-[6.5px]",
      iconSize: "h-2 w-2",
    },
    lg: {
      container: "h-14 w-14 text-base",
      ring: effectiveBadge === "job_ready" ? "ring-2 ring-[#059669] ring-offset-1.5" : "",
      badge: "bottom-1.5 -left-4 -right-4 py-0.5 sm:py-1",
      badgeText: "#JOB READY",
      textSize: "text-[7px]",
      iconSize: "h-2 w-2",
    },
    xl: {
      container: "h-[74px] w-[74px] sm:h-[82px] sm:w-[82px] text-xl",
      ring: effectiveBadge === "job_ready" ? "ring-2.5 ring-[#059669] ring-offset-2" : "",
      badge: "bottom-2 -left-5 -right-5 py-1 sm:py-1.5",
      badgeText: "#JOB READY",
      textSize: "text-[8px] sm:text-[8.5px]",
      iconSize: "h-2.5 w-2.5",
    },
    "2xl": {
      container: "h-20 w-20 sm:h-[90px] sm:w-[90px] text-2xl",
      ring: effectiveBadge === "job_ready" ? "ring-3 ring-[#059669] ring-offset-2" : "",
      badge: "bottom-2.5 -left-6 -right-6 py-1.5",
      badgeText: "#JOB READY",
      textSize: "text-[8.5px] sm:text-[9.5px]",
      iconSize: "h-3 w-3",
    },
  }[size];

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {/* Circular Avatar Container */}
      <div
        className={`relative ${sizeMap.container} rounded-full overflow-hidden border border-[#E7E2DA] bg-[#F5F1EB] shadow-2xs transition-all ${sizeMap.ring}`}
        title={
          effectiveBadge === "job_ready"
            ? "Eligible for Job: 100% verified technical skills (all assessments passed ≥75%)"
            : name
        }
      >
        {/* Headshot or Monogram */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-gradient-to-br from-[#064E3B] via-[#043E30] to-[#022A21] flex items-center justify-center font-serif font-bold text-white shadow-inner tracking-tight">
            {initials}
          </div>
        )}

        {/* Diagonal Semi-Transparent Verified Tag: ONLY rendered when all skills verifications are passed */}
        {effectiveBadge === "job_ready" && (
          <div
            className={`absolute ${sizeMap.badge} z-10 flex items-center justify-center pointer-events-none transition-all -rotate-12 shadow-[0_2px_8px_rgba(0,0,0,0.25)] bg-[#059669]/90 backdrop-blur-[2px] border-y border-white/50 text-white`}
          >
            <span
              className={`font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1 leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${sizeMap.textSize}`}
            >
              <Check className={`${sizeMap.iconSize} stroke-[3.5] shrink-0 text-white`} />
              <span className="whitespace-nowrap">{sizeMap.badgeText}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
