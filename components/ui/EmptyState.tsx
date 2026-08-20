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
    <div className={`flex flex-col border border-dashed border-border px-6 py-12 ${className}`}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
