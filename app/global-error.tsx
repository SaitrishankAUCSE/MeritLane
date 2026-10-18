"use client";

import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] text-foreground font-sans p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded bg-surface-dim border border-[#D2D2D2] mb-6">
          <AlertCircle className="h-8 w-8 text-danger" />
        </div>
        <h2 className="text-2xl font-serif text-foreground mb-3">Critical Error</h2>
        <p className="text-[14px] text-muted-foreground mb-8 max-w-md">
          The application encountered a critical failure.
        </p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-foreground text-white rounded-md text-[14px] font-medium transition-transform hover:scale-[0.98] active:scale-95"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-2.5 bg-white text-foreground border border-border rounded-md text-[14px] font-medium hover:bg-surface-dim transition-all"
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
