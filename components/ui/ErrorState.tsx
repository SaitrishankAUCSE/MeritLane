"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`border border-[#E7E2DA] bg-white rounded-2xl p-8 text-center max-w-md mx-auto my-6 shadow-sm ${className}`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318] border border-[#B42318]/20">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-[18px] font-semibold text-[#1C1917] mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-[14px] text-[#78716C] leading-relaxed mb-6 font-sans">
        {description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          size="md"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="mx-auto"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
