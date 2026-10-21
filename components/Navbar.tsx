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
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-[#F8F8F6]/85 backdrop-blur-md transition-all">
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8 md:px-12 max-w-[1440px] mx-auto">
        {/* Left: Logo & Wordmark */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-6 h-6 rounded-md bg-[#101010] flex items-center justify-center text-white font-bold text-[13px] tracking-tight">
              M
            </div>
            <span className="font-sans font-semibold text-[17px] tracking-[-0.025em] text-[#101010]">
              MeritLane
            </span>
          </Link>

          {/* Desktop Center Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-sans text-[#101010]">
            <Link 
              href="/#tracks" 
              className="text-[#101010] hover:text-[#666] transition-colors flex items-center gap-1 font-normal py-1"
            >
              Tracks
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A] opacity-70" />
            </Link>
            <Link 
              href="/how-verification-works" 
              className="text-[#101010] hover:text-[#666] transition-colors font-normal py-1"
            >
              How it works
            </Link>
            <Link 
              href="/#standards" 
              className="text-[#101010] hover:text-[#666] transition-colors font-normal py-1"
            >
              Standards
            </Link>
            <Link 
              href="/about" 
              className="text-[#101010] hover:text-[#666] transition-colors font-normal py-1"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right Action Controls (Devin.ai exact layout: text link + outline pill + solid pill) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 font-sans">
            <Link 
              href="/employer/dashboard"
              className="text-[14px] text-[#101010] hover:text-[#666] transition-colors font-normal px-2.5 py-1"
            >
              For Employers
            </Link>
            <button 
              onClick={() => openAuthModal("login")} 
              className="h-[32px] px-4 text-[13.5px] rounded-full border border-black/[0.12] text-[#101010] bg-transparent hover:bg-black/[0.04] transition-all font-normal flex items-center justify-center cursor-pointer"
            >
              Log in
            </button>
            <button 
              onClick={() => openAuthModal("signup", undefined, "candidate")} 
              className="h-[32px] px-4 text-[13.5px] rounded-full bg-[#101010] text-white hover:opacity-85 transition-all font-normal shadow-xs flex items-center justify-center cursor-pointer"
            >
              Get started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center text-[#101010] hover:text-[#666] lg:hidden rounded-full hover:bg-black/[0.04] transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-black/[0.08] px-6 py-5 lg:hidden bg-[#F8F8F6] font-sans">
          <div className="flex flex-col gap-3">
            <Link 
              href="/#tracks" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-normal py-1.5 text-[#101010] hover:text-[#666]"
            >
              Skill Tracks
            </Link>
            <Link 
              href="/how-verification-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-normal py-1.5 text-[#101010] hover:text-[#666]"
            >
              How it works
            </Link>
            <Link 
              href="/#standards" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-normal py-1.5 text-[#101010] hover:text-[#666]"
            >
              Standards
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-normal py-1.5 text-[#101010] hover:text-[#666]"
            >
              About
            </Link>
            <Link 
              href="/employer/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-normal py-1.5 text-[#101010] hover:text-[#666]"
            >
              For Employers
            </Link>
            <div className="pt-3 border-t border-black/[0.08] flex flex-col gap-2.5">
              <button 
                onClick={() => { setMobileMenuOpen(false); openAuthModal("login"); }}
                className="w-full h-10 rounded-full border border-black/[0.12] text-[#101010] font-normal text-[14px] flex items-center justify-center hover:bg-black/[0.04]"
              >
                Log in
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); openAuthModal("signup", undefined, "candidate"); }}
                className="w-full h-10 rounded-full bg-[#101010] text-white font-normal text-[14px] flex items-center justify-center hover:opacity-85 shadow-xs"
              >
                Get started — Free
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


