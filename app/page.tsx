"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    number: "01",
    title: "Build a verified project",
    description: "Show what you can build through a real project that reflects your engineering ability.",
  },
  {
    number: "02",
    title: "Get assessed",
    description: "Complete a focused technical assessment to validate the skills behind your work.",
  },
  {
    number: "03",
    title: "Get discovered",
    description: "Let hiring teams evaluate your proof of skill, not just the college on your resume.",
  },
];

export default function HomePage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const handleCtaClick = (targetRole: "candidate" | "employer") => {
    logFunnelEvent("landing_cta_clicked", { role: targetRole });

    if (user && role) {
      router.push(role === "candidate" ? "/candidate/profile" : "/employer/dashboard");
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="bg-[#fafafa]">
      <section className="border-b border-zinc-200 bg-[#fafafa]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Verified Engineering Talent Platform
          </div>

          <h1 className="mt-8 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-6xl sm:leading-[1.05]">
            Proof of skill beats college pedigree.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg">
            Tier-2 and Tier-3 engineers are often screened out by pedigree filters despite having real ability. Meritlane makes that ability visible through verified, project-based proof.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              onClick={() => handleCtaClick("candidate")}
            >
              I&apos;m a candidate
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleCtaClick("employer")}
            >
              I&apos;m hiring
            </Button>
          </div>

          <p className="mt-6 text-xs text-zinc-500">A clearer signal for candidates. A better filter for teams.</p>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-2 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">How it works</p>
              <h2 id="how-it-works-heading" className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-zinc-950 sm:text-3xl">
                A better signal, step by step.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-500">From a working project to a verified professional profile.</p>
          </div>

          <div className="grid gap-4 pt-8 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-lg border border-zinc-200 bg-[#fafafa] p-6">
                <p className="font-mono text-sm font-medium text-indigo-700">{step.number}</p>
                <h3 className="mt-12 text-lg font-semibold tracking-[-0.02em] text-zinc-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[#fafafa]" aria-label="Call to action">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-zinc-950">Hiring should start with evidence.</p>
            <p className="mt-1 text-sm text-zinc-500">Meet the people who can do the work.</p>
          </div>
          <Link href="/signup" className="text-sm font-medium text-indigo-700 transition-colors hover:text-indigo-900">
            Get started <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
