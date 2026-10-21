
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
        className="group flex h-9 items-center justify-center gap-2 rounded-[12px_3px_12px_3px] hover:rounded-[3px_12px_3px_12px] border border-[#D5CBBA] bg-gradient-to-b from-white via-[#FAF6ED] to-[#F1EAE0] px-4 text-[11px] font-semibold uppercase tracking-widest text-foreground shadow-[0_2px_8px_rgba(28,25,23,0.08),inset_0_1px_0_#FFFFFF] transition-all duration-300 hover:border-[#1F3D2B] hover:text-[#1F3D2B] hover:shadow-[0_4px_14px_-2px_rgba(31,61,43,0.18)] active:scale-[0.98] cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-muted-foreground group-hover:text-[#1F3D2B]" />
        <span>Back</span>
      </button>
    </div>
  );
}

