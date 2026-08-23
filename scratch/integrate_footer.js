
const fs = require("fs");
let content = fs.readFileSync("components/chrome/SiteFooter.tsx", "utf8");

content = \`"use client";

import { usePathname } from "next/navigation";
import { Footerdemo } from "@/components/ui/footer-section";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export function SiteFooter() {
  const pathname = usePathname();
  const isPublicHome = pathname === "/";
  const isApp = pathname ? (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/p/")) : false;

  if (isApp) return null;

  return (
    <div className={isPublicHome ? "theme-public" : ""}>
      <Footerdemo />
    </div>
  );
}
\`;

fs.writeFileSync("components/chrome/SiteFooter.tsx", content, "utf8");
console.log("Done");

