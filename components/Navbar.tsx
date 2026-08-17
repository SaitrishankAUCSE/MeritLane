"use client";

import Link from "next/link";
import { Menu, ShieldCheck, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function Navbar() {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const resolving = loading || (Boolean(user) && profileLoading);
  const links = userProfile?.role === "candidate"
    ? [{ href: "/candidate/dashboard", label: "Workspace" }, { href: "/candidate/profile", label: "Profile" }]
    : userProfile?.role === "employer"
      ? [{ href: "/employer/dashboard", label: "Hiring workspace" }]
      : [{ href: "/#model", label: "How it works" }, { href: "/#employers", label: "For employers" }];

  const close = () => setOpen(false);
  const logout = async () => { await signOut(auth); close(); router.push("/"); };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={close}>
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShieldCheck aria-hidden="true" /></span>
          <span className="text-lg font-semibold tracking-tight">Meritlane</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {!resolving && links.map((link) => <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"}`}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {!resolving && user && userProfile ? <><span className="text-right text-xs text-muted-foreground"><strong className="block text-sm text-foreground">{userProfile.displayName || user.email?.split("@")[0]}</strong><span className="capitalize">{userProfile.role}</span></span><Button variant="outline" size="sm" onClick={logout}><LogOut data-icon="inline-start" /> Sign out</Button></> : !resolving && <><Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link><Link href="/signup"><Button size="sm">Get started</Button></Link></>}
        </div>
        <button type="button" className="flex size-10 items-center justify-center rounded-md border md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
      {open && <div className="border-t bg-card px-5 py-5 md:hidden"><nav className="flex flex-col gap-4" aria-label="Mobile navigation">{!resolving && links.map((link) => <Link key={link.href} href={link.href} onClick={close} className="text-sm font-medium">{link.label}</Link>)}{!resolving && user ? <button className="text-left text-sm font-medium text-primary" onClick={logout}>Sign out</button> : !resolving && <div className="flex flex-col gap-3 pt-2"><Link href="/login" onClick={close}><Button variant="outline" className="w-full">Sign in</Button></Link><Link href="/signup" onClick={close}><Button className="w-full">Get started</Button></Link></div>}</nav></div>}
    </header>
  );
}
