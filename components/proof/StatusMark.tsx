import React from "react";
import { cn } from "@/lib/utils";

export type ProofStatus = "verified" | "pending" | "changes_required" | "rejected" | "draft" | "declared" | "assessed";

const LABELS: Record<ProofStatus, string> = {
  verified: "Verified",
  pending: "Under review",
  changes_required: "Changes required",
  rejected: "Not verified",
  draft: "Draft",
  declared: "Declared",
  assessed: "Assessed",
};

export function StatusMark({
  status,
  label,
  className,
}: {
  status: ProofStatus;
  label?: string;
  className?: string;
}) {
  const tone =
    status === "verified"
      ? "text-success border-success/40 bg-success/5"
      : status === "pending" || status === "changes_required"
        ? "text-warning border-warning/40 bg-warning/5"
        : status === "rejected"
          ? "text-danger border-danger/40 bg-danger/5"
          : "text-muted-foreground border-border bg-transparent";

  return (
    <span className={cn("inline-flex items-center gap-2 font-data uppercase", tone, "border px-2 py-1", className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0",
          status === "verified" && "rounded-full bg-success",
          status === "pending" && "border border-warning bg-transparent",
          status === "changes_required" && "rotate-45 border border-warning bg-transparent",
          status === "rejected" && "rounded-full bg-danger",
          (status === "draft" || status === "declared") && "rounded-full bg-outline",
          status === "assessed" && "h-px w-2.5 bg-foreground"
        )}
        aria-hidden
      />
      {label || LABELS[status]}
    </span>
  );
}

export function RailDot({ status }: { status: ProofStatus }) {
  return (
    <span
      className={cn(
        "absolute -left-[3.5px] top-2 z-10 h-2 w-2",
        status === "verified" && "rounded-full bg-foreground verified-dot",
        status === "pending" && "border border-outline bg-background",
        status === "changes_required" && "rotate-45 border border-warning bg-background",
        status === "rejected" && "rounded-full bg-danger",
        (status === "draft" || status === "declared") && "hidden",
        status === "assessed" && "h-2 w-2 rotate-45 border border-outline bg-background"
      )}
      aria-hidden
    />
  );
}
