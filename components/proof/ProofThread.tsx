"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ProofStatus, RailDot } from "@/components/proof/StatusMark";

export function ProofThread({
  claim,
  kicker = "Claim",
  status = "declared",
  children,
  className,
}: {
  claim: string;
  kicker?: string;
  status?: ProofStatus;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("proof-focus-item relative pl-8", className)}>
      <div
        className={cn(
          "provenance-rail absolute top-2 bottom-0 left-0",
          status === "verified" && "provenance-rail-verified"
        )}
      />
      <RailDot status={status} />
      <div className="mb-4">
        <span className="font-label mb-2 block text-accent/80">{kicker}</span>
        <h3 className="font-serif text-xl font-medium leading-tight text-foreground md:text-[32px] md:leading-[1.2]">
          {claim}
        </h3>
      </div>
      <div className="space-y-4 pb-10">{children}</div>
    </article>
  );
}

export function EvidenceBlock({
  source,
  children,
  className,
}: {
  source?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 border-l-2 border-border pl-4", className)}>
      {source && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Source: {source}
        </p>
      )}
      <div className="text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export function ProofCoverage({
  points,
  filled,
}: {
  points: number;
  filled: number;
}) {
  const ticks = Math.max(points, 1);
  return (
    <div 
      className="relative flex h-3 w-full items-center" 
      aria-label={`Proof coverage ${filled} of ${points}`}
    >
      <div className="absolute left-0 right-0 h-[1px] bg-border" />
      <div className="absolute left-0 right-0 flex justify-between">
        {Array.from({ length: ticks + 1 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "z-10 h-3 w-[1px]",
              i <= filled ? "bg-foreground" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

