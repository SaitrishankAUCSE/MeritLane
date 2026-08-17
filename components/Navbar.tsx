"use client";

import Link from "next/link";
import { ShieldCheck, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function Navbar() {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isResolvingAuth = loading || (user && profileLoading);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navLinks = () => {
    if (userProfile?.role === "candidate") {
      return (
        <>
          <Link href="/candidate/dashboard" className={`text-sm font-medium transition-colors hover:text-indigo-600 ${pathname === "/candidate/dashboard" ? "text-indigo-600" : "text-zinc-600"}`}>Dashboard</Link>
          <Link href="/candidate/profile" className={`text-sm font-medium transition-colors hover:text-indigo-600 ${pathname === "/candidate/profile" ? "text-indigo-600" : "text-zinc-600"}`}>Profile</Link>
        </>
      );
    }
    if (userProfile?.role === "employer") {
      return (
        <Link href="/employer/dashboard" className={`text-sm font-medium transition-colors hover:text-indigo-600 ${pathname === "/employer/dashboard" ? "text-indigo-600" : "text-zinc-600"}`}>Dashboard</Link>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight text-zinc-900 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Meritlane</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {!isResolvingAuth && user && navLinks()}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isResolvingAuth ? (
            <div className="flex gap-3">
              <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-100"></div>
              <div className="h-9 w-24 animate-pulse rounded-md bg-zinc-100"></div>
            </div>
          ) : (user && userProfile) ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-zinc-900 leading-tight">
                  {userProfile.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-xs text-zinc-500 capitalize">{userProfile.role}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-zinc-300 hover:text-red-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center h-10 w-10 text-zinc-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-4">
          {!isResolvingAuth && (user && userProfile) && (
            <nav className="flex flex-col gap-4">
              {navLinks()}
              <button onClick={handleSignOut} className="text-left text-sm font-medium text-red-600">Sign out</button>
            </nav>
          )}
          {!isResolvingAuth && !(user && userProfile) && (
            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="w-full justify-center">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
