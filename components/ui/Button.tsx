import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2",
  };

  const variantStyles = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
    outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
    ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
