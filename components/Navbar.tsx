"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, Menu, X, ChevronDown, User, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

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

  /* Cutshort-style: flat text nav links in a row, active = bold black */
  const navLinks = () => {
    if (isUserAdmin) {
      return (
        <Link 
          href="/admin" 
          className={`text-sm transition-colors ${
            pathname === "/admin" 
              ? "text-zinc-900 font-semibold" 
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Command Center
        </Link>
      );
    }
    if (userProfile?.role === "candidate") {
      return (
        <Link 
          href="/candidate/dashboard" 
          className="flex items-center"
        >
          <RandomLetterSwap
            className={`cursor-pointer text-sm transition-colors ${
              pathname === "/candidate/dashboard" 
                ? "text-zinc-900 font-semibold" 
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            label="Dashboard"
            staggerDuration={0.025}
            transition={{ duration: 0.6, type: "spring" }}
          />
        </Link>
      );
    }
    if (userProfile?.role === "employer") {
      return (
        <Link 
          href="/employer/dashboard" 
          className="flex items-center"
        >
          <RandomLetterSwap
            className={`cursor-pointer text-sm transition-colors ${
              pathname === "/employer/dashboard" 
                ? "text-zinc-900 font-semibold" 
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            label="Dashboard"
            staggerDuration={0.025}
            transition={{ duration: 0.6, type: "spring" }}
          />
        </Link>
      );
    }
    return null;
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 border-b border-zinc-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link 
            href={isUserAdmin ? "/admin" : user ? "/dashboard" : "/"} 
            className="flex items-center gap-2 font-bold tracking-tight text-zinc-900 select-none"
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-lg tracking-tight">Meritlane</span>
            {isUserAdmin && (
              <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Nav Links — Cutshort style: flat text in a row */}
          <nav className="hidden sm:flex items-center gap-6">
            {!isResolvingAuth && user && navLinks()}
          </nav>
        </div>

        {/* Right: Auth area */}
        <div className="flex items-center gap-3">
          {isResolvingAuth ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100"></div>
          ) : user ? (
            <ProfileDropdown 
              user={user} 
              userProfile={userProfile} 
              isAdmin={isUserAdmin} 
              handleSignOut={handleSignOut} 
            />
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Register
              </Link>
              <Link href="/employer/dashboard">
                <Button variant="primary" size="sm">Post a Job</Button>
              </Link>
            </div>
          )}

          {/* Mobile Nav Links for logged-in users */}
          {user && !isResolvingAuth && (
            <nav className="flex sm:hidden items-center">
              {navLinks()}
            </nav>
          )}

          {/* Mobile Menu Toggle (Only for public/logged out users) */}
          {!user && (
            <button 
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4">
          {!isResolvingAuth && !user && (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="secondary" className="w-full justify-center">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="w-full justify-center">Register</Button>
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

/* Cutshort-style profile dropdown: compact avatar, clean menu */
function ProfileDropdown({ user, userProfile, isAdmin, handleSignOut }: { user: any, userProfile: any, isAdmin: boolean, handleSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Close on outside click
  useEffect(() => {
    const close = () => setOpen(false);
    if (open) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  const displayName = isAdmin ? user?.email : (userProfile?.displayName || user?.email?.split('@')[0]);
  const displayRole = isAdmin ? "Administrator" : userProfile?.role;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const photoUrl = user?.photoURL;

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-7 w-7 overflow-hidden items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 ring-1 ring-zinc-200">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="max-w-[100px] truncate text-xs font-medium hidden sm:inline-block">{displayName}</span>
        <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg z-50">
          <div className="border-b border-zinc-100 px-3.5 py-2.5">
            <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
            <p className="truncate text-xs text-zinc-500 capitalize">{displayRole}</p>
          </div>
          
          <div className="py-1">
            {userProfile?.role === "candidate" && (
              <Link href="/candidate/profile" className="flex w-full items-center px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors" onClick={() => setOpen(false)}>
                <User className="mr-2.5 h-4 w-4 text-zinc-400" />
                Profile
              </Link>
            )}
            
            <Link href="/settings" className="flex w-full items-center px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors" onClick={() => setOpen(false)}>
              <Settings className="mr-2.5 h-4 w-4 text-zinc-400" />
              Settings
            </Link>
          </div>
          
          <div className="border-t border-zinc-100 py-1">
            <button 
              onClick={() => {
                setOpen(false);
                handleSignOut();
              }} 
              className="flex w-full items-center px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <LogOut className="mr-2.5 h-4 w-4 text-zinc-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
