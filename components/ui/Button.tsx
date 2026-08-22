import React from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tertiary" | "success";
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
    "inline-flex items-center justify-center font-sans font-medium transition-all select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0";

  const sizeStyles = {
    xs: "text-[12px] px-3 h-7 gap-1.5 rounded-sm",
    sm: "text-[13px] px-4 h-8 gap-1.5 rounded-sm",
    md: "text-[14px] px-5 h-9 gap-2 rounded-sm",
    lg: "text-[14px] px-6 h-10 gap-2.5 rounded-sm",
    icon: "h-9 w-9 p-0 rounded-sm",
  };

  const variantStyles = {
    primary:
      "bg-white text-black border border-white hover:bg-black hover:text-white",
    secondary:
      "bg-transparent text-[#e3e2e5] border border-[#444846] hover:bg-white hover:text-black hover:border-white",
    outline:
      "bg-transparent text-[#e3e2e5] border border-[#444846] hover:bg-white hover:text-black hover:border-white",
    ghost:
      "bg-transparent text-[#8e928f] border border-transparent hover:text-white",
    tertiary:
      "bg-transparent text-[#8e928f] border border-transparent underline-offset-4 hover:underline p-0 h-auto",
    danger:
      "bg-[#ffb4ab]/5 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab] hover:text-black hover:border-[#ffb4ab]",
    success:
      "bg-[#a8a2ff]/5 text-[#a8a2ff] border border-[#a8a2ff]/40 hover:bg-[#a8a2ff] hover:text-black hover:border-[#a8a2ff]",
  };

  const appliedVariant = variant === "outline" ? "secondary" : variant;
  
  // If tertiary is used, override sizing to be inline
  const finalSize = variant === "tertiary" ? "" : sizeStyles[size];
  const combinedClassName = `${baseStyles} ${finalSize} ${variantStyles[appliedVariant]} ${className}`;

  const content = (
    <>
      {loading ? (
        <div className="h-3 w-3 border-[1.5px] border-[#8e928f] border-t-current animate-spin rounded-full shrink-0" />
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
