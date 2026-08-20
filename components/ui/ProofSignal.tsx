import React from "react";
import { CheckCircle2, Circle, ShieldCheck, FileCheck2, Cpu, Check, AlertCircle } from "lucide-react";

export type SignalType = "verified" | "declared" | "assessed" | "authenticated" | "pending" | "reviewed";

interface ProofSignalProps {
  type: SignalType;
  label: string;
  source?: string;
  className?: string;
}

export function ProofSignal({ type, label, source, className = "" }: ProofSignalProps) {
  const getStyles = () => {
    switch (type) {
      case "verified":
        return { wrapper: "text-emerald-700", icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" /> };
      case "assessed":
        return { wrapper: "text-indigo-700", icon: <Cpu className="w-3.5 h-3.5 mr-1" /> };
      case "authenticated":
        return { wrapper: "text-zinc-700", icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> };
      case "reviewed":
        return { wrapper: "text-emerald-700", icon: <FileCheck2 className="w-3.5 h-3.5 mr-1" /> };
      case "pending":
        return { wrapper: "text-amber-600", icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
      case "declared":
      default:
        return { wrapper: "text-zinc-500", icon: <Circle className="w-2.5 h-2.5 mr-1.5" strokeWidth={3} /> };
    }
  };

  const styles = getStyles();

  return (
    <div className={`inline-flex items-center text-xs font-semibold uppercase tracking-widest ${styles.wrapper} ${className}`}>
      {styles.icon}
      <span>{label}</span>
      {source && (
        <span className="ml-1.5 pl-1.5 border-l border-current opacity-70 font-medium">
          {source}
        </span>
      )}
    </div>
  );
}

export function EvidenceRail({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative pl-3 border-l-2 border-zinc-200/60 ml-1.5 space-y-2 py-1 ${className}`}>
      {children}
    </div>
  );
}
