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
        <label htmlFor={inputId} className="font-data text-outline">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          disabled={disabled}
          className={`field-line ${error ? "border-danger text-danger" : ""} ${className}`}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
            <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
