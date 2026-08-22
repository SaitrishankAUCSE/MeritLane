"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] text-[#0D0D0D] font-sans p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F3F1] border border-[#D2D2D2] mb-6">
        <AlertCircle className="h-8 w-8 text-[#B42318]" />
      </div>
      <h2 className="text-2xl font-serif text-[#0D0D0D] mb-3">Something went wrong!</h2>
      <p className="text-[14px] text-[#737373] mb-8 max-w-md">
        We encountered an unexpected error while trying to load this page.
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#0D0D0D] text-[#FFFFFF] rounded-md text-[14px] font-medium transition-transform hover:scale-[0.98] active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#FFFFFF] text-[#0D0D0D] border border-[#E5E5E5] rounded-md text-[14px] font-medium hover:bg-[#F3F3F1] transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
