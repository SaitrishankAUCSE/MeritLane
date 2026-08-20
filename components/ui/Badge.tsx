import React from "react";
import { StatusMark, ProofStatus } from "@/components/proof/StatusMark";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: "locked" | "pending" | "verified" | "changes_required" | "rejected" | "neutral" | "active";
  className?: string;
  size?: "sm" | "md";
}

const VARIANT_TO_STATUS: Record<string, ProofStatus> = {
  verified: "verified",
  locked: "pending",
  pending: "pending",
  changes_required: "changes_required",
  rejected: "rejected",
  active: "assessed",
  neutral: "declared",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <StatusMark
      status={VARIANT_TO_STATUS[variant] || "declared"}
      label={typeof children === "string" ? children : undefined}
      className={className}
    />
  );
}
