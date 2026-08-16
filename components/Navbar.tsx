import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-medium tracking-tight text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded border border-zinc-900 bg-zinc-900 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold">Meritlane</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/candidate/profile"
            className="text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Candidate Profile
          </Link>
          <Link
            href="/employer/dashboard"
            className="text-zinc-600 transition-colors hover:text-zinc-950"
          >
            Employer Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Non-functional placeholder auth buttons */}
          <button
            type="button"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 sm:text-sm px-2.5 py-1.5 rounded"
            title="Authentication will be enabled in future phase"
          >
            Sign in
          </button>
          <button
            type="button"
            className="rounded border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 sm:text-sm"
            title="Authentication will be enabled in future phase"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
