"use client";

import Link from "next/link";
import { ShieldCheck, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const router = useRouter();

  const isResolvingAuth = loading || (user && profileLoading);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-medium tracking-tight text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded border border-zinc-900 bg-zinc-900 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold">Meritlane</span>
        </Link>

        {/* Nav links hidden on mobile to prevent overflow */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link
            href="/candidate/profile"
            className="text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Candidates
          </Link>
          <Link
            href="/employer/dashboard"
            className="text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Employers
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isResolvingAuth ? (
            <div className="flex gap-2">
              <div className="h-8 w-16 animate-pulse rounded bg-zinc-100"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-zinc-100"></div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-medium text-zinc-700 sm:inline-block">
                {userProfile?.displayName || user.email}
              </span>
              <Link
                href="/settings"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 sm:text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
