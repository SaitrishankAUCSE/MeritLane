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
    "inline-flex items-center justify-center font-sans font-medium transition-all duration-75 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1C1917] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0";

  const sizeStyles: Record<string, string> = {
    xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-none",
    sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-none",
    md:   "text-[14px] px-5 h-9 gap-2 rounded-none",
    lg:   "text-[15px] px-6 h-10 gap-2.5 rounded-none",
    icon: "h-9 w-9 p-0 rounded-none",
  };

  const variantStyles: Record<string, string> = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border border-[var(--color-primary)] hover:bg-[#162D1E] active:bg-[#0D1B12]",
    secondary:
      "bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-surface-dim)] hover:border-[var(--color-foreground)] active:bg-[var(--color-surface-container)]",
    outline:
      "bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-surface-dim)] hover:border-[var(--color-foreground)] active:bg-[var(--color-surface-container)]",
    ghost:
      "bg-transparent text-[var(--color-muted-foreground)] border border-transparent hover:bg-[var(--color-surface-dim)] hover:text-[var(--color-foreground)] active:bg-[var(--color-surface-container)]",
    tertiary:
      "bg-transparent text-[var(--color-muted-foreground)] border border-transparent underline-offset-4 hover:underline hover:text-[var(--color-foreground)] p-0 h-auto",
    danger:
      "bg-[var(--color-danger)] text-white border border-[var(--color-danger)] hover:bg-[#5E2D23] active:bg-[#4A241C]",
    success:
      "bg-[var(--color-success)] text-white border border-[var(--color-success)] hover:bg-[#162D1E] active:bg-[#0D1B12]",
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
