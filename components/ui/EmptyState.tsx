import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center border border-dashed border-[#E7E2DA] rounded-2xl bg-white/60 p-8 sm:p-12 ${className}`}>
      {icon && <div className="mb-4 text-[#78716C]">{icon}</div>}
      <h3 className="font-semibold text-lg text-[#1C1917] tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#78716C] font-sans">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
