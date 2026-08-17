import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeStyles = {
    xs: "text-xs px-2.5 py-1 rounded gap-1",
    sm: "text-xs px-3 py-1.5 rounded-md gap-1.5",
    md: "text-sm px-4 py-2 rounded-md gap-2",
    lg: "text-base px-5 py-2.5 rounded-lg gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(79,70,229,0.1)] border border-indigo-500/30",
    secondary:
      "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-sm border border-zinc-800",
    outline:
      "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 shadow-sm",
    ghost:
      "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 active:bg-zinc-200/60 border border-transparent",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-red-500/30",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
