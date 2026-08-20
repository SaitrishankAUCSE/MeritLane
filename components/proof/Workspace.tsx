import React from "react";
import { cn } from "@/lib/utils";

export function Workspace({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-[calc(100vh-56px)] px-5 py-10 sm:px-8 lg:px-16", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-12%] right-[-8%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(168,162,255,0.07)_0%,transparent_70%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

export function TechnicalRecord({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/60 py-3">
      <p className="font-label mb-2 text-outline">{label}</p>
      <div className="text-[15px] leading-relaxed text-foreground">{value || "—"}</div>
    </div>
  );
}
