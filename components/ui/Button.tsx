import Link from "next/link";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tertiary" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
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
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1C1917] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0";

  const sizeStyles: Record<string, string> = {
    xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-none",
    sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-none",
    md:   "text-[14px] px-5 h-9 gap-2 rounded-none",
    lg:   "text-[15px] px-6 h-10 gap-2.5 rounded-none",
    icon: "h-9 w-9 p-0 rounded-none",
  };

  const variantStyles: Record<string, string> = {
    primary:
      "bg-[#064E3B] text-white border border-[#064E3B] hover:bg-[#043d2e] active:bg-[#032b20]",
    secondary:
      "bg-white text-[#1C1917] border border-[#E7E2DA] hover:bg-[#F8F6F3] hover:border-[#1C1917] active:bg-[#EAE6DF]",
    outline:
      "bg-white text-[#1C1917] border border-[#E7E2DA] hover:bg-[#F8F6F3] hover:border-[#1C1917] active:bg-[#EAE6DF]",
    ghost:
      "bg-transparent text-[#525252] border border-transparent hover:bg-[#F2EFE9] hover:text-[#1C1917] active:bg-[#EAE6DF]",
    tertiary:
      "bg-transparent text-[#737373] border border-transparent underline-offset-4 hover:underline hover:text-[#525252] p-0 h-auto",
    danger:
      "bg-[#B42318] text-white border border-[#B42318] hover:bg-[#922015] active:bg-[#7a1b12]",
    success:
      "bg-[#064E3B] text-white border border-[#064E3B] hover:bg-[#043d2e] active:bg-[#032b20]",
  };

  // Tertiary overrides sizing to be inline
  const finalSize = variant === "tertiary" ? "" : sizeStyles[size];
  const combinedClassName = `${baseStyles} ${finalSize} ${variantStyles[variant] || variantStyles.primary} ${className}`;

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
