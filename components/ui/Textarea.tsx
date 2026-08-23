import React from "react";
import { AlertCircle } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className = "",
  disabled,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="font-data text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          disabled={disabled}
          className={`field-line min-h-[96px] resize-y ${error ? "border-danger text-danger" : ""} ${className}`}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute top-3 right-0">
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

