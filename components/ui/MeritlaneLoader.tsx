import React from "react";
import { Loader2 } from "lucide-react";

export type LoaderLevel = "page" | "section" | "button";

interface MeritlaneLoaderProps {
  level?: LoaderLevel;
  text?: string;
  className?: string;
}

export const MeritlaneLoader: React.FC<MeritlaneLoaderProps> = ({
  level = "section",
  text,
  className = "",
}) => {
  // ── PAGE LEVEL ─────────────────────────────────────────────────
  if (level === "page") {
    return (
      <div className={`fixed inset-0 z-50 flex items-start justify-center pointer-events-none ${className}`}>
        {/* Animated Top Progress Bar */}
        <div className="w-full h-1 bg-[var(--color-surface-dim)] relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[var(--color-primary)] animate-[slideRight_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  // ── BUTTON LEVEL ───────────────────────────────────────────────
  if (level === "button") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-current opacity-70" />
        {text && <span>{text}</span>}
      </div>
    );
  }

  // ── SECTION LEVEL (default) ────────────────────────────────────
  return (
    <div className={`flex flex-col items-center justify-center py-12 w-full ${className}`}>
      <div className="w-48 h-1 bg-[var(--color-surface-dim)] relative overflow-hidden rounded-full">
        <div className="absolute top-0 left-0 h-full w-1/2 bg-[var(--color-outline)] animate-[slideRight_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
