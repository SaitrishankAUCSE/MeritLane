"use client";

import { usePathname } from "next/navigation";
import { Footerdemo } from "@/components/ui/footer-section";

export function SiteFooter() {
  const pathname = usePathname();

  const publicRoutes = ["/", "/about", "/how-verification-works", "/privacy", "/terms"];
  if (!publicRoutes.includes(pathname || "")) return null;

  return (
    <div className="theme-public">
      <Footerdemo />
    </div>
  );
}

