import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function Card({ children, interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] ${
        interactive ? "card-interactive cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-zinc-100/90 px-6 py-4 sm:px-8 sm:py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 sm:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-zinc-100/90 bg-zinc-50/50 px-6 py-4 sm:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
}
