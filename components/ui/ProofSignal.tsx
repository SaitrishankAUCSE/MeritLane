import React from "react";
import { CheckCircle2, Circle, ShieldCheck, FileCheck2, Cpu, AlertCircle } from "lucide-react";

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
        return { wrapper: "text-success", icon: <ShieldCheck className="mr-1 h-3.5 w-3.5" /> };
      case "assessed":
        return { wrapper: "text-foreground", icon: <Cpu className="mr-1 h-3.5 w-3.5" /> };
      case "authenticated":
        return { wrapper: "text-muted-foreground", icon: <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> };
      case "reviewed":
        return { wrapper: "text-success", icon: <FileCheck2 className="mr-1 h-3.5 w-3.5" /> };
      case "pending":
        return { wrapper: "text-warning", icon: <AlertCircle className="mr-1 h-3.5 w-3.5" /> };
      case "declared":
      default:
        return { wrapper: "text-outline", icon: <Circle className="mr-1.5 h-2.5 w-2.5" strokeWidth={3} /> };
    }
  };

  const styles = getStyles();

  return (
    <div className={`font-data inline-flex items-center uppercase ${styles.wrapper} ${className}`}>
      {styles.icon}
      <span>{label}</span>
      {source && (
        <span className="ml-1.5 border-l border-current pl-1.5 opacity-70">
          {source}
        </span>
      )}
    </div>
  );
}

export function EvidenceRail({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative ml-1.5 space-y-3 border-l border-border py-1 pl-4 ${className}`}>
      {children}
    </div>
  );
}
