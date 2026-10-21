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
    "relative inline-flex items-center justify-center font-sans font-medium transition-[border-radius,transform,box-shadow,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0 group tracking-[-0.01em] cursor-pointer active:scale-[0.98]";

  // Standard professional rectangular rounded button architecture (No pill shapes)
  const effectiveShape = shape || "default";

  const shapeStyles: Record<string, Record<string, string>> = {
    crest: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-md",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-lg",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-lg",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-lg",
      icon: "h-9 w-9 p-0 rounded-lg",
    },
    "crest-reverse": {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-md",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-lg",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-lg",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-lg",
      icon: "h-9 w-9 p-0 rounded-lg",
    },
    notch: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-md",
      sm:   "text-[13px] px-3.5 h-8 gap-1.5 rounded-lg",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-lg",
      lg:   "text-[15px] px-7 h-11 gap-2.5 rounded-lg",
      icon: "h-9 w-9 p-0 rounded-lg",
    },
    pill: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-md",
      sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-lg",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-lg",
      lg:   "text-[15px] px-6 h-11 gap-2.5 rounded-lg",
      icon: "h-9 w-9 p-0 rounded-lg",
    },
    default: {
      xs:   "text-[12px] px-3 h-7 gap-1.5 rounded-md",
      sm:   "text-[13px] px-4 h-8 gap-1.5 rounded-lg",
      md:   "text-[14px] px-5 h-9 gap-2 rounded-lg",
      lg:   "text-[15px] px-6 h-11 gap-2.5 rounded-lg",
      icon: "h-9 w-9 p-0 rounded-lg",
    },
  };

  const variantStyles: Record<string, string> = {
    primary:
      "bg-[#101010] text-[#FFFFFF] border border-[#101010] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#252525] hover:-translate-y-[0.5px] active:translate-y-0 active:bg-[#000000]",
    secondary:
      "bg-[#FFFFFF] text-[#101010] border border-[rgba(0,0,0,0.12)] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#F4F4F2] hover:border-[rgba(0,0,0,0.2)] hover:-translate-y-[0.5px] active:translate-y-0 active:bg-[#ECECE8]",
    outline:
      "bg-transparent text-[#101010] border border-[rgba(0,0,0,0.15)] hover:bg-[#F4F4F2] hover:border-[#101010] hover:-translate-y-[0.5px] active:translate-y-0 active:bg-[#ECECE8]",
    ghost:
      "bg-transparent text-[#71717A] border border-transparent hover:bg-[rgba(0,0,0,0.05)] hover:text-[#101010] active:bg-[rgba(0,0,0,0.08)] rounded-lg",
    tertiary:
      "bg-transparent text-[#71717A] border border-transparent underline-offset-4 hover:underline hover:text-[#101010] p-0 h-auto rounded-none",
    danger:
      "bg-[#EF4444] text-white border border-[#DC2626] shadow-[0_1px_2px_rgba(239,68,68,0.2)] hover:bg-[#DC2626] hover:-translate-y-[0.5px] active:translate-y-0",
    success:
      "bg-[#10B981] text-white border border-[#059669] shadow-[0_1px_2px_rgba(16,185,129,0.2)] hover:bg-[#059669] hover:-translate-y-[0.5px] active:translate-y-0",
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
