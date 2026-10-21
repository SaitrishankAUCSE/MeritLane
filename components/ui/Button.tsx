import Link from "next/link";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "tertiary" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  shape?: "crest" | "crest-reverse" | "notch" | "pill" | "default";
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
  shape,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-sans font-medium transition-[border-radius,transform,box-shadow,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0 group tracking-[-0.01em] cursor-pointer active:scale-[0.98]";

  // The signature Merit Crest & Key shape architecture
  const effectiveShape = shape || (variant === "secondary" || variant === "outline" ? "crest-reverse" : "crest");

  const shapeStyles: Record<string, Record<string, string>> = {
    crest: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-[9px_2px_9px_2px] hover:rounded-[2px_9px_2px_9px]",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-[12px_3px_12px_3px] hover:rounded-[3px_12px_3px_12px]",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-[16px_4px_16px_4px] hover:rounded-[4px_16px_4px_16px]",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-[22px_6px_22px_6px] hover:rounded-[6px_22px_6px_22px]",
      icon: "h-9 w-9 p-0 rounded-[12px_4px_12px_4px] hover:rounded-[4px_12px_4px_12px]",
    },
    "crest-reverse": {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-[2px_9px_2px_9px] hover:rounded-[9px_2px_9px_2px]",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-[3px_12px_3px_12px] hover:rounded-[12px_3px_12px_3px]",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-[4px_16px_4px_16px] hover:rounded-[16px_4px_16px_4px]",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-[6px_22px_6px_22px] hover:rounded-[22px_6px_22px_6px]",
      icon: "h-9 w-9 p-0 rounded-[4px_12px_4px_12px] hover:rounded-[12px_4px_12px_4px]",
    },
    notch: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-[8px_2px_8px_2px]",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-[10px_2px_10px_2px]",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-[14px_3px_14px_3px]",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-[18px_4px_18px_4px]",
      icon: "h-9 w-9 p-0 rounded-[10px_3px_10px_3px]",
    },
    pill: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-full",
      sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-full",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-full",
      lg:   "text-[15px] px-6 h-10 gap-2.5 rounded-full",
      icon: "h-9 w-9 p-0 rounded-full",
    },
    default: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-[10px_3px_10px_3px] hover:rounded-[3px_10px_3px_10px]",
      sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-[12px_3px_12px_3px] hover:rounded-[3px_12px_3px_12px]",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-[16px_4px_16px_4px] hover:rounded-[4px_16px_4px_16px]",
      lg:   "text-[15px] px-6 h-11 gap-2.5 rounded-[22px_6px_22px_6px] hover:rounded-[6px_22px_6px_22px]",
      icon: "h-9 w-9 p-0 rounded-[12px_4px_12px_4px] hover:rounded-[4px_12px_4px_12px]",
    },
  };

  const variantStyles: Record<string, string> = {
    primary:
      "bg-gradient-to-b from-[#244A33] via-[#1B3A28] to-[#132A1D] text-[#F7F3E9] border border-[#0F2217] shadow-[0_2px_5px_rgba(19,42,29,0.35),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_20px_-2px_rgba(19,42,29,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-[1px] hover:from-[#2B543B] hover:to-[#173523] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]",
    secondary:
      "bg-gradient-to-b from-[#FFFFFF] via-[#FAF6ED] to-[#F1EAE0] text-[var(--color-foreground)] border border-[#D5CBBA] shadow-[0_1px_3px_rgba(28,25,23,0.08),inset_0_1px_0_#FFFFFF] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[#EFE9DC] hover:shadow-[0_6px_16px_-2px_rgba(31,61,43,0.18)] hover:-translate-y-[1px] active:translate-y-0 active:bg-[#E8DFC8]",
    outline:
      "bg-gradient-to-b from-[#FBF8F1] to-[#EFE8D9] text-[var(--color-foreground)] border border-[#CFC5B2] shadow-[0_1px_2px_rgba(28,25,23,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[#EAE1D0] hover:shadow-[0_6px_14px_-2px_rgba(31,61,43,0.16)] hover:-translate-y-[1px] active:translate-y-0 active:bg-[#E2D6C2]",
    ghost:
      "bg-transparent text-[var(--color-muted-foreground)] border border-transparent hover:bg-[var(--color-surface-dim)] hover:text-[var(--color-foreground)] active:bg-[var(--color-surface-container)] rounded-md",
    tertiary:
      "bg-transparent text-[var(--color-muted-foreground)] border border-transparent underline-offset-4 hover:underline hover:text-[var(--color-foreground)] p-0 h-auto rounded-none",
    danger:
      "bg-gradient-to-b from-[#8F4435] via-[#7B382B] to-[#632B21] text-white border border-[#4D2018] shadow-[0_2px_5px_rgba(99,43,33,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_20px_-2px_rgba(99,43,33,0.5)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]",
    success:
      "bg-gradient-to-b from-[#244A33] via-[#1B3A28] to-[#132A1D] text-white border border-[#0F2217] shadow-[0_2px_5px_rgba(19,42,29,0.35),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_20px_-2px_rgba(19,42,29,0.45)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]",
  };

  // Tertiary overrides sizing to be inline
  const selectedShapeMap = shapeStyles[effectiveShape] || shapeStyles.crest;
  const finalSize = variant === "tertiary" ? "" : (selectedShapeMap[size] || selectedShapeMap.md);
  const combinedClassName = `${baseStyles} ${finalSize} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  const content = (
    <>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <MeritlaneLoader level="button" />
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {leftIcon && <span aria-hidden="true" className={size === "icon" ? "" : "shrink-0"}>{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden="true" className="shrink-0">{rightIcon}</span>}
      </span>
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
