import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-background min-h-screen items-center justify-center text-center">
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-2 border border-[#D4AF37]/50 bg-[#F0EAD6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A192F] shadow-sm">
          <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
          404 - Not Found
        </span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-serif font-black tracking-tight text-[#0A192F] sm:text-5xl md:text-6xl">
        Record not found
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#0A192F]/80 sm:text-lg">
        We couldn&apos;t find the verified engineering record or page you were looking for. It may have been moved or doesn&apos;t exist.
      </p>

      <div className="mt-9 flex justify-center">
        <Link href="/">
          <Button size="lg" className="bg-[#0A192F] text-white hover:bg-[#0A192F]/90 rounded-none border border-[#0A192F]" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
