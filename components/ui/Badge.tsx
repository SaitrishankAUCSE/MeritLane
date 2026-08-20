import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

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
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-xs gap-1",
  };

  const baseStyles = "inline-flex items-center font-medium rounded-md select-none leading-none";

  if (variant === "verified") {
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} bg-emerald-50 text-emerald-700 ${className}`}>
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        {children || "Verified"}
      </span>
    );
  }

  if (variant === "locked" || variant === "pending") {
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} bg-amber-50 text-amber-700 ${className}`}>
        <Clock className="h-3 w-3 shrink-0" />
        {children || "Pending"}
      </span>
    );
  }

  if (variant === "changes_required") {
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} bg-amber-50 text-amber-700 ${className}`}>
        <AlertTriangle className="h-3 w-3 shrink-0" />
        {children || "Needs Changes"}
      </span>
    );
  }

  if (variant === "rejected") {
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} bg-red-50 text-red-700 ${className}`}>
        <XCircle className="h-3 w-3 shrink-0" />
        {children || "Not Verified"}
      </span>
    );
  }

  if (variant === "active") {
    return (
      <span className={`${baseStyles} ${sizeStyles[size]} bg-zinc-900 text-white ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
        {children || "Active"}
      </span>
    );
  }

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} bg-zinc-100 text-zinc-600 ${className}`}>
      {children}
    </span>
  );
}
