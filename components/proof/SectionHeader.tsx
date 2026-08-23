import React from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  meta,
  className,
}: {
  kicker?: string;
  title: string;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex items-end justify-between gap-4 border-b border-border/70 pb-3", className)}>
      <div>
        {kicker && <p className="font-label mb-2 text-muted-foreground">{kicker}</p>}
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-[32px] md:leading-[1.2]">
          {title}
        </h2>
      </div>
      {meta && <div className="font-data shrink-0 text-muted-foreground">{meta}</div>}
    </header>
  );
}

export function LabelCaps({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-label text-muted-foreground", className)}>{children}</span>;
}

