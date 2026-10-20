"use client";

import React from "react";

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
  // ── PAGE LEVEL (Full Screen / Modal Overlay) ──────────────────
  if (level === "page") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-background)]/90 backdrop-blur-md select-none ${className}`}
      >
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          {/* Rotating Meritlane Emblem Seal */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            {/* Outer archival orbital dashed ring */}
            <div className="absolute -inset-2 rounded-full border border-dashed border-emerald-900/30 animate-[spin_8s_linear_infinite]" />
            {/* Secondary subtle halo ring */}
            <div className="absolute -inset-4 rounded-full border border-[var(--color-border)]/40 opacity-50" />

            {/* Rotating Meritlane Logo */}
            <img
              src="/logo-m.png"
              alt="Meritlane"
              className="h-12 w-12 object-contain animate-[spin_2s_linear_infinite] drop-shadow-xs"
            />
          </div>

          {/* Text & Provenance Info */}
          <div className="space-y-1.5">
            <p className="text-[13px] font-grotesk font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)]">
              {text || "Loading Meritlane…"}
            </p>
            <p className="text-[10.5px] font-mono text-[var(--color-muted-foreground)] tracking-widest uppercase">
              Skill-Verified Technical Registry
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── BUTTON LEVEL (Inline within actions) ───────────────────────
  if (level === "button") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} role="status">
        <img
          src="/logo-m.png"
          alt="Loading"
          className="h-3.5 w-3.5 object-contain animate-[spin_1.5s_linear_infinite] shrink-0"
        />
        {text && <span className="text-current font-medium">{text}</span>}
      </span>
    );
  }

  // ── SECTION LEVEL (Default in-page containers) ─────────────────
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-12 px-4 w-full min-h-[200px] gap-4 ${className}`}
    >
      {/* Rotating Meritlane Emblem Container */}
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/80 shadow-2xs">
        {/* Subtle rotating dashed orbital ring */}
        <div className="absolute -inset-1.5 rounded-full border border-dashed border-emerald-900/25 animate-[spin_6s_linear_infinite]" />

        {/* Rotating Meritlane Logo */}
        <img
          src="/logo-m.png"
          alt="Meritlane"
          className="h-8 w-8 object-contain animate-[spin_2s_linear_infinite]"
        />
      </div>

      {/* Caption Text */}
      <div className="text-center">
        <p className="text-[12px] font-grotesk font-semibold tracking-[0.16em] uppercase text-[var(--color-foreground)]/80">
          {text || "Loading Verified Content…"}
        </p>
      </div>
    </div>
  );
};
