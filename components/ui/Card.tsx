import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function Card({ children, interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white ${
        interactive ? "cursor-pointer transition-colors hover:border-zinc-300 hover:bg-zinc-50/50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-zinc-100 px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
}
