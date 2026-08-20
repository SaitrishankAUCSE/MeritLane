import React from "react";

export type VerdictStatus = "verified" | "pending" | "changes_required" | "rejected" | "draft" | "unverified";

interface VerdictMarkProps {
  status: VerdictStatus;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

export function VerdictMark({ status, size = "md", showLabel = true, className = "" }: VerdictMarkProps) {
  const config = {
    verified: {
      theme: "text-success border-success/50 bg-success/10",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M9 12l2 2 4-4" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      ),
      label: "VERIFIED",
      sealText: "MERITLANE",
      ringClass: "border-emerald-600/30"
    },
    pending: {
      theme: "text-warning border-warning/50 bg-warning/10",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M12 8v4l3 3" strokeWidth="2" strokeLinecap="square" />
          <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      ),
      label: "AUDIT PENDING",
      sealText: "QUEUE",
      ringClass: "border-amber-600/30"
    },
    changes_required: {
      theme: "text-warning border-warning/50 bg-warning/10",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M12 9v4M12 17h.01" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      ),
      label: "NEEDS REVISION",
      sealText: "AUDIT",
      ringClass: "border-amber-600/30"
    },
    rejected: {
      theme: "text-danger border-danger/50 bg-danger/10",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="square" />
        </svg>
      ),
      label: "REJECTED",
      sealText: "DENIED",
      ringClass: "border-red-600/30"
    },
    draft: {
      theme: "text-muted-foreground border-outline bg-surface-low",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      ),
      label: "INCOMPLETE",
      sealText: "DRAFT",
      ringClass: "border-zinc-400/30"
    },
    unverified: {
      theme: "text-muted-foreground border-outline bg-surface-low",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="square" />
        </svg>
      ),
      label: "NOT VERIFIED",
      sealText: "UNVERIFIED",
      ringClass: "border-zinc-400/30"
    }
  };

  const selected = config[status] || config.unverified;

  const sizeClasses = {
    sm: {
      container: "h-8 px-1.5",
      markArea: "w-6 h-6 border-2",
      iconBox: "w-3 h-3",
      label: "text-[9px]",
      sealText: "text-[7px]",
      gap: "gap-1.5",
    },
    md: {
      container: "h-10 px-2",
      markArea: "w-8 h-8 border-[2.5px]",
      iconBox: "w-4 h-4",
      label: "text-[10px]",
      sealText: "text-[8px]",
      gap: "gap-2",
    },
    lg: {
      container: "h-14 px-3",
      markArea: "w-11 h-11 border-[3px]",
      iconBox: "w-5 h-5",
      label: "text-xs",
      sealText: "text-[9px]",
      gap: "gap-3",
    },
    xl: {
      container: "h-20 px-4",
      markArea: "w-16 h-16 border-[4px]",
      iconBox: "w-7 h-7",
      label: "text-sm",
      sealText: "text-[10px]",
      gap: "gap-4",
    },
  };

  const sz = sizeClasses[size];

  return (
    <div className={`inline-flex items-center ${sz.gap} ${className}`}>
      {/* The distinct geometric seal */}
      <div className={`relative flex items-center justify-center shrink-0 ${sz.markArea} ${selected.theme} ${selected.theme.split(' ')[0]} rounded-none`}>
        {/* Inner concentric ring to give it a "stamp" quality */}
        <div className={`absolute inset-[10%] border ${selected.ringClass}`} />
        <div className={`relative z-10 ${sz.iconBox}`}>
          {selected.icon}
        </div>
      </div>
      
      {/* The typographical signature */}
      {showLabel && (
        <div className="flex flex-col justify-center">
          <span className={`${sz.sealText} font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-0.5`}>
            {selected.sealText}
          </span>
          <span className={`${sz.label} font-black uppercase tracking-widest ${selected.theme.split(' ')[0]} leading-none`}>
            {selected.label}
          </span>
        </div>
      )}
    </div>
  );
}
