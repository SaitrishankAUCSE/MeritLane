import React from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tertiary";
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
    "inline-flex items-center justify-center font-sans font-medium transition-all select-none focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0";

  const sizeStyles = {
    xs: "text-[13px] px-3 h-8 gap-1.5 rounded",
    sm: "text-[14px] px-4 h-9 gap-1.5 rounded-md",
    md: "text-[14px] px-5 h-10 gap-2 rounded-md",
    lg: "text-[15px] px-6 h-11 gap-2.5 rounded-md",
    icon: "h-9 w-9 p-0 rounded-md",
  };

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 border border-primary",
    secondary:
      "bg-transparent text-foreground hover:bg-surface-low border border-border",
    outline:
      "bg-transparent text-foreground hover:bg-surface-low border border-border",
    ghost:
      "bg-transparent text-muted-foreground hover:text-foreground border border-transparent hover:bg-surface-low",
    tertiary:
      "bg-transparent text-muted-foreground hover:text-foreground border border-transparent underline-offset-4 hover:underline p-0 h-auto",
    danger:
      "bg-transparent text-danger hover:bg-danger/10 border border-danger/40",
  };

  const appliedVariant = variant === "outline" ? "secondary" : variant;
  
  // If tertiary is used, override sizing to be inline
  const finalSize = variant === "tertiary" ? "" : sizeStyles[size];
  const combinedClassName = `${baseStyles} ${finalSize} ${variantStyles[appliedVariant]} ${className}`;

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
