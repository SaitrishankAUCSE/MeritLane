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
    xs: "text-[12px] px-3 h-7 gap-1.5 rounded-full",
    sm: "text-[13px] px-4 h-8 gap-1.5 rounded-full",
    md: "text-[14px] px-5 h-9 gap-2 rounded-full",
    lg: "text-[14px] px-6 h-10 gap-2.5 rounded-full",
    icon: "h-9 w-9 p-0 rounded-full",
  };

  const variantStyles = {
    primary:
      "bg-[#0D0D0D]/70 backdrop-blur-md border border-white/20 shadow-[0_4px_14px_0_rgba(0,0,0,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.3),inset_0_2px_4px_0_rgba(255,255,255,0.15)] text-[#FFFFFF] hover:bg-[#0D0D0D]/80 active:scale-95",
    secondary:
      "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_14px_0_rgba(0,0,0,0.08),inset_0_-2px_6px_0_rgba(0,0,0,0.05),inset_0_2px_4px_0_rgba(255,255,255,1)] text-[#0D0D0D] hover:bg-white/80 active:scale-95",
    outline:
      "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_14px_0_rgba(0,0,0,0.08),inset_0_-2px_6px_0_rgba(0,0,0,0.05),inset_0_2px_4px_0_rgba(255,255,255,1)] text-[#0D0D0D] hover:bg-white/80 active:scale-95",
    ghost:
      "bg-transparent hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/40 text-[#525252] hover:text-[#0D0D0D] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.05)] active:scale-95",
    tertiary:
      "bg-transparent text-[#737373] border border-transparent underline-offset-4 hover:underline hover:text-[#525252] p-0 h-auto",
    danger:
      "bg-[#B42318]/70 backdrop-blur-md border border-[#B42318]/50 shadow-[0_4px_14px_0_rgba(180,35,24,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.2),inset_0_2px_4px_0_rgba(255,255,255,0.2)] text-white hover:bg-[#B42318]/80 active:scale-95",
    success:
      "bg-[#15803D]/70 backdrop-blur-md border border-[#15803D]/50 shadow-[0_4px_14px_0_rgba(21,128,61,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.2),inset_0_2px_4px_0_rgba(255,255,255,0.2)] text-white hover:bg-[#15803D]/80 active:scale-95",
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
