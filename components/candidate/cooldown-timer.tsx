"use client";

import React, { useState, useEffect } from "react";
import { Clock, Lock } from "lucide-react";

interface CooldownTimerProps {
  timestamp: number;
  durationDays?: number;
  variant?: "detail" | "badge" | "compact" | "boxes";
  onExpire?: () => void;
  className?: string;
}

export function useCooldownTime(timestamp: number, durationDays: number = 14, onExpire?: () => void) {
  const durationMs = durationDays * 24 * 60 * 60 * 1000;
  const expiresAt = timestamp + durationMs;

  const [remainingMs, setRemainingMs] = useState<number>(() => {
    return Math.max(0, expiresAt - Date.now());
  });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, expiresAt - Date.now());
      setRemainingMs(diff);
      if (diff <= 0 && onExpire) {
        onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isExpired = remainingMs <= 0;
  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

  const formattedDetail = `${days > 0 ? `${days}d ` : ""}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  const formattedCompact = `${days > 0 ? `${days}d ` : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    remainingMs,
    isExpired,
    days,
    hours,
    minutes,
    seconds,
    formattedDetail,
    formattedCompact,
  };
}

export default function CooldownTimer({
  timestamp,
  durationDays = 14,
  variant = "detail",
  onExpire,
  className = "",
}: CooldownTimerProps) {
  const { isExpired, days, hours, minutes, seconds, formattedCompact } = useCooldownTime(
    timestamp,
    durationDays,
    onExpire
  );

  if (isExpired) {
    return <span className={`text-[#064E3B] font-mono text-[11px] font-medium ${className}`}>Cooldown ended</span>;
  }

  if (variant === "badge") {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-[10px] font-semibold ${className}`}>
        <Lock className="h-3 w-3 text-[#B45309] shrink-0" />
        <span>LOCKED ({formattedCompact})</span>
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={`font-mono tabular-nums font-semibold ${className}`}>
        {formattedCompact}
      </span>
    );
  }

  if (variant === "boxes") {
    return (
      <div className={`grid grid-cols-4 gap-2 text-center ${className}`}>
        <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-2">
          <div className="text-[18px] sm:text-[22px] font-mono font-bold text-[#1C1917] tabular-nums">
            {days}
          </div>
          <div className="text-[9px] uppercase font-mono text-[#78716C] tracking-widest">Days</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-2">
          <div className="text-[18px] sm:text-[22px] font-mono font-bold text-[#1C1917] tabular-nums">
            {String(hours).padStart(2, "0")}
          </div>
          <div className="text-[9px] uppercase font-mono text-[#78716C] tracking-widest">Hours</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-2">
          <div className="text-[18px] sm:text-[22px] font-mono font-bold text-[#1C1917] tabular-nums">
            {String(minutes).padStart(2, "0")}
          </div>
          <div className="text-[9px] uppercase font-mono text-[#78716C] tracking-widest">Mins</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded p-2 border-[#FDE68A] bg-[#FEF3C7]/40">
          <div className="text-[18px] sm:text-[22px] font-mono font-bold text-[#B42318] tabular-nums animate-pulse">
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-[9px] uppercase font-mono text-[#92400E] tracking-widest font-semibold">Secs</div>
        </div>
      </div>
    );
  }

  // Default "detail"
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-[10px] text-[#92400E] ${className}`}>
      <Clock className="h-3 w-3 text-[#B45309] shrink-0 animate-spin" style={{ animationDuration: "10s" }} />
      <span>
        Cooldown active:{" "}
        <strong className="font-semibold text-[#B45309]">
          {days > 0 && <span>{days}d </span>}
          <span>{String(hours).padStart(2, "0")}h </span>
          <span>{String(minutes).padStart(2, "0")}m </span>
          <span className="text-[#B42318]">{String(seconds).padStart(2, "0")}s</span>
        </strong>
      </span>
    </span>
  );
}
