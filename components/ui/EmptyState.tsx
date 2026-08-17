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
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-center ${className}`}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100/80 text-zinc-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight text-zinc-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
