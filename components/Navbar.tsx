"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Settings, ShieldCheck, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Navbar() {
  const { user, userProfile, isAdmin, loading, profileLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const resolving = loading || (!!user && profileLoading);
  const authenticated = !!user && (isAdmin || !!userProfile);
  const displayName = isAdmin ? user?.email : (userProfile?.displayName || user?.email?.split("@")[0]);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/candidate/dashboard", label: "Candidates" },
    { href: "/employer/dashboard", label: "Employers" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={isAdmin ? "/admin" : "/"} className="flex shrink-0 items-center gap-2 text-foreground" aria-label="Meritlane home">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShieldCheck className="size-4" /></span>
          <span className="text-base font-semibold tracking-tight">Meritlane</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith(link.href.split("/").slice(0, 2).join("/")) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{link.label}</Link>)}
        </nav>

        <div className="hidden min-w-[170px] items-center justify-end gap-3 md:flex">
          {resolving ? <div className="flex items-center gap-2" aria-label="Loading account"><span className="size-8 animate-pulse rounded-full bg-muted" /><span className="h-4 w-20 animate-pulse rounded bg-muted" /></div> : authenticated ? <><span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{displayName?.charAt(0).toUpperCase()}</span><span className="max-w-28 truncate text-sm font-medium text-foreground">{displayName}</span><Link href="/settings" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Account settings"><Settings className="size-4" /></Link></> : <><Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link><Link href="/signup"><Button size="sm">Get Started</Button></Link></>}
        </div>

        <button type="button" className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {open && <div className="border-t border-border bg-background px-4 py-4 md:hidden"><nav className="flex flex-col gap-1" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2.5 text-sm font-medium ${pathname.startsWith(link.href.split("/").slice(0, 2).join("/")) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{link.label}</Link>)}</nav><div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">{resolving ? <div className="flex items-center gap-2 px-3"><span className="size-8 animate-pulse rounded-full bg-muted" /><span className="h-4 w-24 animate-pulse rounded bg-muted" /></div> : authenticated ? <><div className="flex items-center gap-3 px-3"><span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">{displayName?.charAt(0).toUpperCase()}</span><span className="text-sm font-medium">{displayName}</span></div><Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"><Settings className="size-4" /> Account settings</Link></> : <><Link href="/login" className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Sign in</Link><Link href="/signup"><Button className="w-full">Get Started</Button></Link></>}</div></div>}
    </header>
  );
}
