"use client";

import Link from "next/link";
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, targetRole: "candidate" | "employer") => {
    e.preventDefault();
    if (user && role) {
      router.push(role === "candidate" ? "/candidate/profile" : "/employer/dashboard");
    } else {
      router.push("/signup");
    }
  };
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" />
              Verified Engineering Talent
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-[44px] sm:leading-[1.15]">
            Proof of skill beats
            <br className="hidden sm:block" />
            college pedigree.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-[17px]">
            Recruiters filter by brand-name colleges because degrees don&apos;t prove
            competence. Meritlane verifies real engineering output so Tier-2/3
            graduates compete on code, not credentials.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/candidate/profile"
              onClick={(e) => handleCtaClick(e, "candidate")}
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-zinc-900 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
            >
              I&apos;m a candidate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/employer/dashboard"
              onClick={(e) => handleCtaClick(e, "employer")}
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 sm:w-auto"
            >
              I&apos;m hiring
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                The Problem
              </span>
              <h2 className="mt-2 text-sm font-semibold text-zinc-900">
                Pedigree as a proxy filter
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                Hiring teams default to IIT/NIT/BITS shortlists because a
                degree certificate says nothing about whether someone can
                actually build software. Thousands of capable engineers at
                Tier-2/3 colleges never get reviewed.
              </p>
            </div>

            <div className="rounded border border-zinc-200 bg-white p-5 sm:p-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                The Meritlane Model
              </span>
              <h2 className="mt-2 text-sm font-semibold text-zinc-900">
                Verified codebase signal
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                Engineers submit production-grade repositories and pass
                benchmark assessments. Verified proof replaces resume keywords
                and unstandardized GPA metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Three steps from unverified graduate to benchmarked engineer.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  01
                </span>
                <Code2 className="h-4.5 w-4.5 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                Build a verified project
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                Connect your GitHub and submit real-world projects with clean
                architecture and git history.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  02
                </span>
                <Cpu className="h-4.5 w-4.5 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                Get assessed
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                Undergo code analysis, test-suite evaluation, and technical
                audit to earn an objective verification score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col rounded border border-zinc-200 bg-zinc-50/50 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-900">
                  03
                </span>
                <CheckCircle2 className="h-4.5 w-4.5 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                Get discovered
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                Engineering teams view your verified metrics and invite you
                directly — no pedigree filter, no keyword matching.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 rounded border border-zinc-200 bg-zinc-50 p-6 text-center sm:p-8">
            <h3 className="text-base font-semibold text-zinc-900">
              Ready to prove your engineering ability?
            </h3>
            <p className="mt-1.5 text-sm text-zinc-600">
              Create your project-first profile and prepare for assessment.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/candidate/profile"
                onClick={(e) => handleCtaClick(e, "candidate")}
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
