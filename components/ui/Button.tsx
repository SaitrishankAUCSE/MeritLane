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
    sm: "text-xs px-3 py-1.5 rounded gap-1.5",
    md: "text-sm px-4 py-2 rounded gap-2",
    lg: "text-base px-5 py-2.5 rounded gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 border border-transparent font-medium",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 border border-transparent font-medium",
    outline:
      "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 hover:text-zinc-900 active:bg-zinc-100 font-medium",
    ghost:
      "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 border border-transparent font-medium",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent font-medium",
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
      {children}
      {!loading && rightIcon}
    </button>
  );
}
