import Link from "next/link";
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
              Verified Engineering Talent Platform
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl sm:leading-tight">
            Proof of skill beats college pedigree.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-600 sm:text-lg">
            Engineering degrees from Tier-2 and Tier-3 colleges shouldn't cap high-calibre engineers.
            Meritlane verifies real codebase output and matches talent directly with engineering teams.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/candidate/profile"
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
            >
              I&apos;m a candidate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/employer/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 sm:w-auto"
            >
              I&apos;m hiring
            </Link>
          </div>
        </div>
      </section>

      {/* Core Principle Callout */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded border border-zinc-200 bg-white p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                The Problem
              </span>
              <h2 className="mt-2 text-base font-semibold text-zinc-900">
                Pedigree as a proxy filter
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Recruiters filter by brand-name colleges because degree certificates don&apos;t prove technical competence.
                Exceptional builders in non-metro colleges are screened out without code review.
              </p>
            </div>

            <div className="rounded border border-zinc-200 bg-white p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                The Meritlane Model
              </span>
              <h2 className="mt-2 text-base font-semibold text-zinc-900">
                Verified codebase signal
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Engineers submit production-grade repositories and complete benchmark assessments.
                Verified proof replaces resume keywords and unstandardized GPA metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Three steps from unverified graduate to benchmarked engineer.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  01
                </span>
                <Code2 className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">
                Build a verified project
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Connect your GitHub and submit real-world full-stack or systems projects with clean git history and architecture.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  02
                </span>
                <Cpu className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">
                Get assessed
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Undergo rigorous code analysis, test-suite evaluations, and technical audits to earn an objective Skill Verification score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  03
                </span>
                <CheckCircle2 className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">
                Get discovered
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Engineering leads view your verified repository metrics and invite you directly for technical interviews without pedigree filters.
              </p>
            </div>
          </div>

          {/* Bottom CTA Block */}
          <div className="mt-16 rounded border border-zinc-200 bg-zinc-50 p-8 text-center sm:p-10">
            <h3 className="text-lg font-semibold text-zinc-900">
              Ready to verify your engineering capabilities?
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Create your project-first profile and get ready for assessment.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/candidate/profile"
                className="rounded border border-zinc-900 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Set up Candidate Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
