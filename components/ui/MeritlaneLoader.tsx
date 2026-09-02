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
  // Logo centered, single spinning ring around it. Nothing else.
  if (level === "page") {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F8F6F3] ${className}`}
      >
        <div className="relative flex items-center justify-center">
          {/* Spinning ring */}
          <div className="h-16 w-16 rounded-full border-2 border-[#E7E2DA] border-t-[#1C1917] animate-spin" />
          {/* Logo centered inside the ring */}
          <img
            src="/logo-m.png"
            alt="Meritlane"
            className="absolute h-7 w-7 object-contain"
          />
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
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="h-5 w-5 rounded-full border-2 border-[#E7E2DA] border-t-[#1C1917] animate-spin" />
    </div>
  );
};
