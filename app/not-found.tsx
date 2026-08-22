import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-background min-h-screen items-center justify-center text-center">
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-2 border border-border bg-surface-low px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
          <ShieldCheck className="h-4 w-4 text-foreground" />
          404 - Not Found
        </span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-serif font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
        Record not found
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        We couldn&apos;t find the verified engineering record or page you were looking for. It may have been moved or doesn&apos;t exist.
      </p>

      <div className="mt-9 flex justify-center">
        <Link href="/">
          <Button size="lg" className="bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] rounded-none border border-[#0D0D0D]" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
