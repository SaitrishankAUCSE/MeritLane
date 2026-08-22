import React from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="font-sans text-[14px] text-foreground font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          className={`w-full h-[42px] px-3 py-2 bg-surface text-foreground text-[14px] font-sans border rounded-md transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-outline focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 ${error ? "border-danger text-danger" : "border-border"} ${className}`}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="text-[13px] text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-[13px] font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
