"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const { user, userProfile, isAdmin, loading, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isUserAdmin = isAdmin || user?.email?.toLowerCase() === "saitrishankb9@gmail.com";

  const isResolvingAuth = loading || (!isUserAdmin && user && profileLoading);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navLinks = () => {
    if (isUserAdmin) {
      return (
        <div className="flex items-center gap-1.5">
          <Link 
            href="/admin" 
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-150 ${
              pathname === "/admin" 
                ? "text-zinc-900 bg-zinc-100 font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Command Center
          </Link>
        </div>
      );
    }
    if (userProfile?.role === "candidate") {
      return (
        <div className="flex items-center gap-1.5">
          <Link 
            href="/candidate/dashboard" 
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-150 ${
              pathname === "/candidate/dashboard" 
                ? "text-zinc-900 bg-zinc-100 font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/candidate/profile" 
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-150 ${
              pathname === "/candidate/profile" 
                ? "text-zinc-900 bg-zinc-100 font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Profile
          </Link>
        </div>
      );
    }
    if (userProfile?.role === "employer") {
      return (
        <div className="flex items-center gap-1.5">
          <Link 
            href="/employer/dashboard" 
            className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-150 ${
              pathname === "/employer/dashboard" 
                ? "text-zinc-900 bg-zinc-100 font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            Dashboard
          </Link>
        </div>
      );
    }
    return null;
  };

  const renderPublicLinks = () => (
    <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-600">
      {/* Intentionally left blank - no dead links allowed */}
    </div>
  );

  return (
    <header 
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-200 border-b border-zinc-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link 
            href={isUserAdmin ? "/admin" : "/"} 
            className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900 group select-none"
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xl tracking-tight">Meritlane</span>
            {isUserAdmin && (
              <span className="rounded bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Public Nav */}
          {(!user || !isResolvingAuth) && renderPublicLinks()}

          {/* Desktop Dashboard Nav */}
          <nav className="hidden md:flex items-center">
            {!isResolvingAuth && user && navLinks()}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isResolvingAuth ? (
            <div className="flex gap-2.5">
              <div className="h-8 w-20 animate-pulse rounded bg-zinc-100"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-zinc-100"></div>
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-zinc-900 leading-tight">
                  {isUserAdmin ? user?.email : (userProfile?.displayName || user?.email?.split('@')[0])}
                </span>
                <span className="text-xs font-medium text-zinc-500 capitalize">
                  {isUserAdmin ? "Superadmin" : userProfile?.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-zinc-600 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Log in
              </Link>
              <span className="text-zinc-300">|</span>
              <Link href="/signup" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                Register
              </Link>
              <Link href="/employer/dashboard" className="ml-2">
                <Button variant="primary" size="sm">Post a Job</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center h-9 w-9 rounded text-zinc-600 hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-5 shadow-lg">
          {!isResolvingAuth && user && (
            <div className="space-y-4">
              <div className="border-b border-zinc-100 pb-3">
                <p className="text-sm font-semibold text-zinc-900">
                  {isAdmin ? user?.email : (userProfile?.displayName || user?.email?.split('@')[0])}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {isAdmin ? "Administrator" : userProfile?.role}
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks()}
                <button 
                  onClick={handleSignOut} 
                  className="flex items-center gap-2 pt-2 text-left text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </nav>
            </div>
          )}
          {!isResolvingAuth && !user && (
            <div className="flex flex-col gap-2.5">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="w-full justify-center">Register</Button>
              </Link>
              <Link href="/employer/dashboard">
                <Button variant="primary" className="w-full justify-center">Post a Job</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
