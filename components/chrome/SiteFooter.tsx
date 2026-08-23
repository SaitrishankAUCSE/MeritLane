"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export function SiteFooter() {
  const pathname = usePathname();
  const isPublicHome = pathname === "/";
  const isApp = pathname ? (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/p/")) : false;

  if (isApp) return null;

  return (
    <footer className={`border-t pt-12 pb-8 ${isPublicHome ? "border-[var(--color-border)] bg-transparent" : "border-border"}`}>
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <h3 className="font-serif text-lg font-medium tracking-tight">Meritlane</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Proof of skill. Not just credentials.
            </p>
          </div>
          <div>
            <h3 className="font-label text-muted-foreground">For Candidates</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/signup" className="hover:text-foreground">Create Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-label text-muted-foreground">For Employers</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/employer/dashboard" className="hover:text-foreground">Hire Talent</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-label text-muted-foreground">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="font-data text-muted-foreground">&copy; {new Date().getFullYear()} Meritlane</p>
        </div>
      </div>
    </footer>
  );
}

