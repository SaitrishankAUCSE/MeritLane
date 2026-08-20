"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, Menu, X, ChevronDown, User, LayoutDashboard, Settings } from "lucide-react";
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

          {/* Desktop & Mobile Dashboard Nav */}
          <nav className="flex items-center">
            {!isResolvingAuth && user && navLinks()}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isResolvingAuth ? (
            <div className="flex gap-2.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100"></div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <ProfileDropdown 
                user={user} 
                userProfile={userProfile} 
                isAdmin={isUserAdmin} 
                handleSignOut={handleSignOut} 
              />
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

          {/* Mobile Menu Toggle (Only for public/logged out users) */}
          {!user && (
            <button 
              className="md:hidden flex items-center justify-center h-9 w-9 rounded text-zinc-600 hover:bg-zinc-100 transition-colors"
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
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-5 shadow-lg">
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
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-7 w-7 overflow-hidden items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="max-w-[100px] truncate text-xs font-semibold hidden sm:inline-block">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-zinc-900">{displayName}</p>
            <p className="truncate text-xs font-medium text-zinc-500 capitalize">{displayRole}</p>
          </div>
          
          <div className="py-1">
            {userProfile?.role === "candidate" && (
              <Link href="/candidate/profile" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setOpen(false)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            )}
            
            <Link 
              href={isAdmin ? "/admin" : (userProfile?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard")} 
              className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900" 
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            
            <Link href="/settings" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900" onClick={() => setOpen(false)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </div>
          
          <div className="border-t border-zinc-100 py-1">
            <button 
              onClick={() => {
                setOpen(false);
                handleSignOut();
              }} 
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
