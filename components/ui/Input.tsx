import React from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  disabled,
  rightElement,
  ...props
}: InputProps) {
  const reactId = React.useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : reactId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  
  const describedBy = error ? errorId : helperText ? helperId : props["aria-describedby"];

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
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full h-[42px] px-3 py-2 bg-surface text-foreground text-[14px] font-sans border rounded-md transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-outline focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-50 ${error ? "border-danger text-danger pr-10" : "border-border"} ${rightElement ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {rightElement && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p id={helperId} className="text-[13px] text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[13px] font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
