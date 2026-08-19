import React from "react";
import { Lock, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: "locked" | "pending" | "verified" | "changes_required" | "rejected" | "neutral" | "active";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ 
  children, 
  variant = "neutral", 
  size = "md",
  className = "" 
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
  };

  const baseStyles = "inline-flex items-center font-medium rounded border select-none transition-colors";

  if (variant === "verified") {
    return (
      <span
        className={`${baseStyles} ${sizeStyles[size]} border-emerald-200 bg-emerald-50 text-emerald-800 font-medium ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        {children || "Verified"}
      </span>
    );
  }

  if (variant === "locked" || variant === "pending") {
    return (
      <span
        className={`${baseStyles} ${sizeStyles[size]} border-amber-200 bg-amber-50 text-amber-800 font-medium ${className}`}
      >
        <Clock className="h-3 w-3 text-amber-600 shrink-0" />
        {children || "Pending"}
      </span>
    );
  }

  if (variant === "changes_required") {
    return (
      <span
        className={`${baseStyles} ${sizeStyles[size]} border-amber-300 bg-amber-100 text-amber-900 font-medium ${className}`}
      >
        <AlertTriangle className="h-3 w-3 text-amber-700 shrink-0" />
        {children || "Needs Changes"}
      </span>
    );
  }

  if (variant === "rejected") {
    return (
      <span
        className={`${baseStyles} ${sizeStyles[size]} border-red-200 bg-red-50 text-red-800 font-medium ${className}`}
      >
        <XCircle className="h-3 w-3 text-red-600 shrink-0" />
        {children || "Not Verified"}
      </span>
    );
  }

  if (variant === "active") {
    return (
      <span
        className={`${baseStyles} ${sizeStyles[size]} border-zinc-900 bg-zinc-900 text-white font-medium ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
        {children || "Active"}
      </span>
    );
  }

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} border-zinc-200 bg-zinc-100 text-zinc-700 ${className}`}
    >
      {children}
    </span>
  );
}
