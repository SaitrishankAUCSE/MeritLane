"use client";

import { usePathname } from "next/navigation";
import { Footerdemo } from "@/components/ui/footer-section";

export function SiteFooter() {
  const pathname = usePathname();

  // The footer must ONLY be present on the homepage ("/")
  if (pathname !== "/") return null;

  return (
    <div className="theme-public">
      <Footerdemo />
    </div>
  );
}

