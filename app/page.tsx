"use client";

import Link from "next/link";
import { ArrowRight, Code2, Cpu, CheckCircle2, ShieldCheck, Briefcase, ChevronRight, Layers, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { logFunnelEvent } from "@/lib/analytics/logEvent";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, targetRole: "candidate" | "employer") => {
    e.preventDefault();
    logFunnelEvent("landing_cta_clicked", { role: targetRole });
    if (user && role) {
      router.push(role === "candidate" ? "/candidate/profile" : "/employer/dashboard");
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="flex flex-col bg-[#fafafa]">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Meritlane
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.1]">
            Proof of skill beats
            <br className="hidden sm:block" />
            college pedigree.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl">
            Meritlane helps engineering talent prove what they can build, so employers can evaluate ability beyond college brand.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/candidate/profile"
              onClick={(e) => handleCtaClick(e, "candidate")}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
            >
              Prove your skills
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/employer/dashboard"
              onClick={(e) => handleCtaClick(e, "employer")}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50"
            >
              Hire with proof
            </Link>
          </div>

          {/* Verification UI Preview */}
          <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm ring-1 ring-zinc-900/5">
            <div className="overflow-hidden rounded-lg border border-zinc-100">
              <img 
                src="/images/verification-preview.jpg" 
                alt="Meritlane Candidate Profile Preview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="border-y border-zinc-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            A resume tells you what someone claims.<br />Proof shows you what they can do.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Hiring teams default to prestigious college filters because resumes are unreliable. Meritlane replaces the pedigree filter with a verified track record, surfacing capable engineers who would otherwise be ignored.
          </p>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">The Meritlane Model</h2>
            <p className="mt-2 text-base text-zinc-600">From unverified graduate to trusted engineering talent.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "01", title: "Build your proof", desc: "Submit your GitHub repositories and real-world projects as foundational evidence of your ability.", icon: Layers },
              { num: "02", title: "Verify your skills", desc: "Complete a standardized, securely monitored technical assessment to validate your competence.", icon: Cpu },
              { num: "03", title: "Get discovered", desc: "Employers evaluate your verified evidence directly, bypassing automated keyword resume screens.", icon: Briefcase },
              { num: "04", title: "Build a track record", desc: "Our long-term vision: your on-the-job hiring outcomes will continuously strengthen your verified signal.", icon: Activity },
            ].map((step, i) => (
              <div key={i} className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-zinc-400">{step.num}</span>
                  <step.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PROOF STACK */}
      <section className="border-t border-zinc-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">The Candidate Proof Stack</h2>
              <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                We combine multiple signals into a single, highly trusted professional record. Hiring managers can review a candidate&apos;s holistic engineering ability in seconds.
              </p>
              <div className="mt-8 space-y-4">
                {['Verified Technical Assessment', 'GitHub Activity & History', 'Production Project Portfolio', 'Core Engineering Skills'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-zinc-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
              <div className="space-y-6">
                <div className="border-b border-zinc-200 pb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-medium text-zinc-900">Verification Active</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Verified Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'Backend Engineering', 'API Design'].map(skill => (
                      <span key={skill} className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 & 6: VALUE PROPS */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900 p-8 sm:p-10 text-white shadow-sm">
              <h3 className="text-xl font-bold">For Candidates</h3>
              <p className="mt-4 text-base text-zinc-400 leading-relaxed">
                Make your ability visible. Show employers exactly what you can build, rather than relying on where you studied. Earn your verification and let your code speak for you.
              </p>
              <Link
                href="/candidate/profile"
                onClick={(e) => handleCtaClick(e, "candidate")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Build your proof <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900">For Employers</h3>
              <p className="mt-4 text-base text-zinc-600 leading-relaxed">
                Evaluate evidence before pedigree. Access a talent pool that has already proven their technical competence through rigorous, standardized assessments.
              </p>
              <Link
                href="/employer/dashboard"
                onClick={(e) => handleCtaClick(e, "employer")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Hire with proof <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TRUST */}
      <section className="border-t border-zinc-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-indigo-600 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900">What does &quot;Verified&quot; mean?</h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            A &quot;Verified&quot; status means the candidate has successfully completed Meritlane&apos;s secure technical assessment for a specific skill (e.g., Python). It is an objective credential demonstrating practical coding competence.
          </p>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Your next hire should be based on what they can do.
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/candidate/profile"
              onClick={(e) => handleCtaClick(e, "candidate")}
            >
              <Button size="lg" variant="primary">Build your proof</Button>
            </Link>
            <Link
              href="/employer/dashboard"
              onClick={(e) => handleCtaClick(e, "employer")}
            >
              <Button size="lg" variant="outline">Find verified talent</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9: FOOTER */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <ShieldCheck className="h-5 w-5" />
              Meritlane
            </div>
            <nav className="flex gap-6 text-sm text-zinc-500">
              <Link href="/candidate/profile" className="hover:text-zinc-900">Candidates</Link>
              <Link href="/employer/dashboard" className="hover:text-zinc-900">Employers</Link>
              <span className="cursor-not-allowed">Privacy</span>
              <span className="cursor-not-allowed">Terms</span>
            </nav>
          </div>
          <div className="mt-8 text-center text-xs text-zinc-400 sm:text-left">
            &copy; {new Date().getFullYear()} Meritlane. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
