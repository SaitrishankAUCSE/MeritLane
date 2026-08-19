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
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-semibold text-zinc-900">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          disabled={disabled}
          className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 disabled:bg-zinc-50 ${
            error
              ? "border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500 text-red-900"
              : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute top-3 right-3 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="text-xs text-zinc-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-600 animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
