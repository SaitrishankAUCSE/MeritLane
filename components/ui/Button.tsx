import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2",
  };

  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent shadow-sm",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-transparent shadow-sm",
    outline: "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 shadow-sm",
    ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-sm",
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
