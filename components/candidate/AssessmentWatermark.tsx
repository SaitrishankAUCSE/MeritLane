"use client";

import React from "react";

interface AssessmentWatermarkProps {
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  skill: string;
}

/**
 * AssessmentWatermark
 *
 * Renders an unobtrusive, repeating diagonal pattern of identifying text across
 * the entire assessment interface.
 *
 * It is pointer-events-none, non-selectable, transparent, and deters candidates
 * from taking unauthorized screenshots or sharing proprietary assessment content.
 */
export function AssessmentWatermark({
  candidateId,
  candidateName,
  candidateEmail,
  skill,
}: AssessmentWatermarkProps) {
  const shortId = candidateId ? candidateId.slice(0, 10) : "ANON";
  const label = `${candidateName || candidateEmail || shortId} · ${shortId} · ${skill.toUpperCase()} · MERITLANE CONFIDENTIAL`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-30 overflow-hidden opacity-[0.035] dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='450' height='220'><text x='20' y='110' fill='%23000000' font-family='monospace' font-size='12' font-weight='bold' transform='rotate(-25 150 110)' letter-spacing='2'>${encodeURIComponent(
          label
        )}</text></svg>")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export default AssessmentWatermark;
