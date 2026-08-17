import React from "react";
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { children: React.ReactNode; }
export function Card({ children, className = "", ...props }: CardProps) { return <div className={`rounded-lg border bg-card shadow-sm ${className}`} {...props}>{children}</div>; }
export function CardHeader({ children, className = "", ...props }: CardProps) { return <div className={`flex flex-col gap-1.5 border-b px-6 py-5 ${className}`} {...props}>{children}</div>; }
export function CardContent({ children, className = "", ...props }: CardProps) { return <div className={`p-6 ${className}`} {...props}>{children}</div>; }
