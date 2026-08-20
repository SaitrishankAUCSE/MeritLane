import React from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
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
    "inline-flex items-center justify-center font-medium tracking-wide select-none focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 btn-press";

  const sizeStyles = {
    xs: "text-[11px] uppercase tracking-[0.1em] px-3 h-8 gap-1.5",
    sm: "text-[11px] uppercase tracking-[0.1em] px-4 h-9 gap-1.5",
    md: "text-[11px] uppercase tracking-[0.1em] px-5 h-10 gap-2",
    lg: "text-xs uppercase tracking-[0.1em] px-6 h-11 gap-2.5",
    icon: "h-9 w-9 p-0",
  };

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 border border-primary",
    secondary:
      "bg-transparent text-foreground hover:bg-surface-low border border-border",
    outline:
      "bg-transparent text-foreground hover:bg-surface-low border border-border",
    ghost:
      "text-muted-foreground hover:text-foreground border border-transparent",
    danger:
      "bg-transparent text-danger hover:bg-danger/10 border border-danger/40",
  };

  const appliedVariant = variant === "outline" ? "secondary" : variant;
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[appliedVariant]} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className={size === "icon" ? "" : "shrink-0"}>{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  if (props.href) {
    const { href, ...rest } = props as ButtonProps & { href: string };
    if (href.startsWith("http")) {
      return (
        <a href={href} className={combinedClassName} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
