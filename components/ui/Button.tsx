import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
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
    xs: "text-xs px-2.5 h-7 rounded gap-1",
    sm: "text-sm px-3 h-8 rounded-md gap-1.5",
    md: "text-sm px-4 h-9 rounded-md gap-2",
    lg: "text-base px-5 h-10 rounded-md gap-2.5",
    icon: "h-8 w-8 rounded-md p-0", // Compact square for icon-only
  };

  const variantStyles = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 border border-transparent shadow-sm",
    secondary:
      "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 active:bg-zinc-100 shadow-sm",
    outline:
      "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 active:bg-zinc-100 shadow-sm",
    ghost:
      "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 border border-transparent",
    danger:
      "bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200", // Cutshort style subtle danger
  };

  // Map outline to secondary visually, but keep the prop for backwards compatibility
  const appliedVariant = variant === "outline" ? "secondary" : variant;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[appliedVariant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className={size === "icon" ? "" : "shrink-0"}>{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
