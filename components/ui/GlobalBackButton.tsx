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
        className="group flex h-9 items-center justify-center gap-2 rounded-lg border border-black/[0.12] bg-white hover:bg-[#F4F4F2] px-4 text-xs font-medium text-[#101010] shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-[#71717A] group-hover:text-[#101010]" />
        <span>Back</span>
      </button>
    </div>
  );
}
