"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
          {!loading && (
            user ? (
              <>
                <span className="hidden text-xs text-zinc-500 sm:inline-block">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Sign out
                </button>
              </>
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
            )
          )}
        </div>
      </div>
    </header>
  );
}
