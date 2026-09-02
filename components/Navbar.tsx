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
  const { user, userProfile, isAdmin, loading, profileLoading, handleSignOut, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide the global top navbar entirely for authenticated dashboard environments,
  // as they provide their own custom side-navigation and internal layout wrappers.
  if (
    pathname?.startsWith("/candidate") || 
    pathname?.startsWith("/employer") || 
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/proof") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  const isPublicHome = pathname === "/";
  const isCandidateDashboard = pathname === "/candidate/dashboard";
  const isCandidateProfile = pathname === "/candidate/profile";
  const isPublicProfile = pathname?.startsWith("/p/") ?? false;
  const isEmployerDashboard = pathname === "/employer/dashboard";

  if (isCandidateDashboard || isCandidateProfile || isPublicProfile || isEmployerDashboard) return null;

  const isUserAdmin = isAdmin || user?.email?.toLowerCase() === "saitrishankb9@gmail.com";
  const isResolvingAuth = loading || (!isUserAdmin && user && profileLoading);

  const dashboardHref = isUserAdmin
    ? "/admin"
    : userProfile?.role === "employer"
      ? "/employer/dashboard"
      : "/candidate/dashboard";

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${isPublicHome ? "theme-public border-[var(--color-border)] bg-[var(--color-background)]/95" : "border-border bg-background/85"}`}>
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8 md:px-10 lg:px-12">
        <Link
          href={isUserAdmin ? "/admin" : user ? "/dashboard" : "/"}
          className="flex items-center shrink-0"
        >
          <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto" />
          {isUserAdmin && (
            <span className="ml-2 align-middle font-data text-[10px] text-muted-foreground">Admin</span>
          )}
        </Link>

        {!isResolvingAuth && user && (
          <nav className="hidden items-center gap-6 sm:flex">
            {isUserAdmin ? (
              <>
                <NavLink href="/admin" current={pathname}>Admin</NavLink>
              </>
            ) : userProfile?.role === "employer" ? (
              <>
                <NavLink href="/employer/dashboard" current={pathname}>Dashboard</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/candidate/dashboard" current={pathname}>Dashboard</NavLink>
                <NavLink href="/candidate/assessment" current={pathname}>Assessment</NavLink>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isResolvingAuth ? (
            <div className="h-8 w-8 animate-pulse bg-surface-high" />
          ) : user ? (
            <>
              {/* Mobile menu handled by hamburger icon below */}
              <ProfileDropdown
                user={user}
                userProfile={userProfile}
                isAdmin={isUserAdmin}
                onSignOutClick={() => setShowLogoutModal(true)}
              />
            </>
          ) : (
            <div className="hidden items-center gap-6 md:flex">
              <button onClick={() => openAuthModal("login")} className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors font-medium">
                Log in
              </button>
              <button onClick={() => openAuthModal("signup", undefined, "candidate")} className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors font-medium">
                Register
              </button>
              <button 
                onClick={() => openAuthModal("signup", undefined, "employer")}
                className="px-5 h-9 bg-[#064E3B] text-white hover:bg-[#022c22] rounded text-[13px] font-sans font-medium transition-colors shadow-xs"
              >
                Hire Talent
              </button>
            </div>
          )}

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
          {!isResolvingAuth && !user ? (
            <div className="flex flex-col gap-2">
              <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("login"); }} variant="secondary" className="w-full justify-center">Log in</Button>
              <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("signup", undefined, "candidate"); }} variant="secondary" className="w-full justify-center">Register</Button>
              <Button onClick={() => { setMobileMenuOpen(false); openAuthModal("signup", undefined, "employer"); }} variant="primary" className="w-full justify-center">Hire Talent</Button>
            </div>
          ) : !isResolvingAuth && user ? (
            <div className="flex flex-col gap-4">
              {isUserAdmin ? (
                <>
                  <Link href="/admin" className="text-sm text-foreground">Admin</Link>
                </>
              ) : userProfile?.role === "employer" ? (
                <>
                  <Link href="/employer/dashboard" className="text-sm text-foreground">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/candidate/dashboard" className="text-sm text-foreground">Dashboard</Link>
                  <Link href="/candidate/assessment" className="text-sm text-foreground">Assessment</Link>
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </header>
    <LogoutConfirmModal 
      isOpen={showLogoutModal} 
      onConfirm={handleSignOut} 
      onCancel={() => setShowLogoutModal(false)} 
    />
    </>
  );
}

function ProfileDropdown({ user, userProfile, isAdmin, onSignOutClick }: { user: any, userProfile: any, isAdmin: boolean, onSignOutClick: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  const displayName = isAdmin ? user?.email : (userProfile?.displayName || user?.email?.split("@")[0]);
  const displayRole = isAdmin ? "Administrator" : userProfile?.role;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const photoUrl = user?.photoURL;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 text-sm text-muted-foreground hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden border border-border bg-surface-low text-xs">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="hidden max-w-[120px] truncate font-data sm:inline-block">{displayName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 origin-top-right border border-border bg-surface py-1">
          <div className="border-b border-border px-3.5 py-2.5">
            <p className="truncate text-sm text-foreground">{displayName}</p>
            <p className="truncate font-data text-muted-foreground capitalize">{displayRole}</p>
          </div>
          <div className="py-1">
            {userProfile?.role === "candidate" && (
              <Link href="/candidate/profile" className="flex w-full items-center px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                <User className="mr-2.5 h-4 w-4" />
                Profile
              </Link>
            )}
            {!isAdmin && (
              <Link 
                href={userProfile?.role === "candidate" ? "/candidate/settings" : "/employer/settings"} 
                className="flex w-full items-center px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground" 
                onClick={() => setOpen(false)}
              >
                <Settings className="mr-2.5 h-4 w-4" />
                Settings
              </Link>
            )}
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                onSignOutClick();
              }}
              className="flex w-full items-center px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, current, children }: { href: string; current: string | null; children: React.ReactNode }) {
  const isActive = current === href || (current?.startsWith(href + "/") ?? false);
  return (
    <Link
      href={href}
      className={`relative text-[13px] tracking-wide ${
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {isActive && <span className="absolute -bottom-1 left-0 h-px w-full bg-foreground" />}
    </Link>
  );
}


