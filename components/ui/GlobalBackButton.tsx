
"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname === "/") return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999]">
      <button
        onClick={() => router.back()}
        className="group flex h-9 items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] px-4 text-[11px] font-mono font-medium uppercase tracking-widest text-[#737373] shadow-sm transition-all hover:border-[#D2D2D2] hover:text-[#0D0D0D] hover:shadow-md"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back</span>
      </button>
    </div>
  );
}

