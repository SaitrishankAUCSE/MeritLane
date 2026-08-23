import Link from "next/link";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

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
    "inline-flex items-center justify-center font-sans font-medium transition-all select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D0D0D] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0";

  const sizeStyles = {
    xs: "text-[12px] px-3 h-7 gap-1.5 rounded-sm",
    sm: "text-[13px] px-4 h-8 gap-1.5 rounded-sm",
    md: "text-[14px] px-5 h-9 gap-2 rounded-sm",
    lg: "text-[14px] px-6 h-10 gap-2.5 rounded-sm",
    icon: "h-9 w-9 p-0 rounded-sm",
  };

  const variantStyles = {
    primary:
      "bg-[#0D0D0D] text-[#FFFFFF] border border-[#0D0D0D] hover:bg-[#222222] hover:border-[#222222]",
    secondary:
      "bg-[#FFFFFF] text-[#0D0D0D] border border-[#E5E5E5] hover:bg-[#F3F3F1]",
    outline:
      "bg-[#FFFFFF] text-[#0D0D0D] border border-[#E5E5E5] hover:bg-[#F3F3F1]",
    ghost:
      "bg-transparent text-[#525252] border border-transparent hover:text-[#0D0D0D] hover:bg-[#F3F3F1]",
    tertiary:
      "bg-transparent text-[#737373] border border-transparent underline-offset-4 hover:underline hover:text-[#525252] p-0 h-auto",
    danger:
      "bg-[#B42318]/5 text-[#B42318] border border-[#B42318]/20 hover:bg-[#B42318] hover:text-[#FFFFFF] hover:border-[#B42318]",
    success:
      "bg-[#15803D]/5 text-[#15803D] border border-[#15803D]/20 hover:bg-[#15803D] hover:text-[#FFFFFF] hover:border-[#15803D]",
  };

  const appliedVariant = variant === "outline" ? "secondary" : variant;
  
  // If tertiary is used, override sizing to be inline
  const finalSize = variant === "tertiary" ? "" : sizeStyles[size];
  const combinedClassName = `${baseStyles} ${finalSize} ${variantStyles[appliedVariant]} ${className}`;

  const content = (
    <>
      {loading ? (
        <span aria-hidden="true"><MeritlaneLoader level="button" /></span>
      ) : (
        leftIcon && <span aria-hidden="true" className={size === "icon" ? "" : "shrink-0"}>{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span aria-hidden="true" className="shrink-0">{rightIcon}</span>}
    </>
  );

  if (props.href) {
    const { href, ...rest } = props as ButtonProps & { href: string };
    const isLinkDisabled = disabled || loading;
    const linkProps = {
      ...rest,
      "aria-disabled": isLinkDisabled ? ("true" as const) : undefined,
      tabIndex: isLinkDisabled ? -1 : undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isLinkDisabled) {
          e.preventDefault();
          return;
        }
        (rest as any).onClick?.(e);
      },
    };

    if (href.startsWith("http")) {
      return (
        <a href={href} className={combinedClassName} {...(linkProps as any)}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} {...(linkProps as any)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      {...props}
    >
      {content}
    </button>
  );
}
