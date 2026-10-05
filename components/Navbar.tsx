"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, Menu, X, ChevronDown, User, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export default function Navbar() {
  const { user, loading, openAuthModal } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // STRICT RULE: Dashboard navigation is preserved ONLY in the left sidebar.
  // The upper navbar is strictly removed for any authenticated user or internal route.
  if (
    user ||
    loading ||
    pathname?.startsWith("/candidate") || 
    pathname?.startsWith("/employer") || 
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/proof") ||
    pathname?.startsWith("/jobs") ||
    pathname?.startsWith("/p/") ||
    pathname === "/dashboard" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/logout"
  ) {
    return null;
  }

  const isPublicHome = pathname === "/";

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${isPublicHome ? "theme-public border-[var(--color-border)] bg-[var(--color-background)]/95" : "border-border bg-background/85"}`}>
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8 md:px-10 lg:px-12">
        <Link
          href="/"
          className="flex items-center shrink-0"
        >
          <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto" />
        </Link>

        {/* Public Visitor Nav */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/how-verification-works" className="text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors font-medium">
              How it works
            </Link>
            <button onClick={() => openAuthModal("login")} className="text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors font-medium cursor-pointer">
              Log in
            </button>
            <button onClick={() => openAuthModal("signup", undefined, "candidate")} className="text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors font-medium cursor-pointer">
              Register
            </button>
            <Button
              onClick={() => openAuthModal("signup", undefined, "employer")}
              variant="primary"
              size="sm"
            >
              Employer Access
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border px-5 py-4 md:hidden bg-background">
          <div className="flex flex-col gap-2">
            <Link 
              href="/how-verification-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-2 text-[#78716C] hover:text-[#1C1917]"
            >
              How it works
            </Link>
            <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("login"); }} variant="secondary" className="w-full justify-center">
              Log in
            </Button>
            <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("signup", undefined, "candidate"); }} variant="secondary" className="w-full justify-center">
              Register
            </Button>
            <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("signup", undefined, "employer"); }} variant="primary" className="w-full justify-center">
              Employer Access
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}


