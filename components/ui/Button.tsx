import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"; size?: "sm" | "md" | "lg"; }
export function Button({ children, variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = { primary: "border-primary bg-primary text-primary-foreground hover:bg-primary/90", secondary: "border-foreground bg-foreground text-background hover:bg-foreground/90", outline: "border-border bg-card text-foreground hover:bg-secondary", ghost: "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground", danger: "border-red-700 bg-red-700 text-white hover:bg-red-800" };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
