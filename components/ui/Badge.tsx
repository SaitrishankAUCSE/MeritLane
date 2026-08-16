import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "locked" | "verified" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  if (variant === "locked") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 ${className}`}
      >
        <Lock className="h-3 w-3 text-zinc-400" />
        {children || "Verification Pending"}
      </span>
    );
  }

  if (variant === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ${className}`}
      >
        <CheckCircle2 className="h-3 w-3 text-blue-600" />
        {children || "Skill Verified"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700 ${className}`}
    >
      {children}
    </span>
  );
}
