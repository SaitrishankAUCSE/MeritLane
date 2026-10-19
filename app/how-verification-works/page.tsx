import React from "react";
import Link from "next/link";
import { CheckCircle2, Shield, ArrowRight, Clock, Award, AlertCircle, ArrowLeft } from "lucide-react";

export default function HowVerificationWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans theme-public">
      <div className="w-full max-w-5xl mx-auto px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">How Verification Works</span>
        </Link>
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-8 lg:px-16 pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-border bg-background text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-800 mb-4 border border-border px-3.5 py-1 rounded bg-surface">
            <Shield className="h-3.5 w-3.5 text-emerald-700" /> Verification Methodology
          </div>
          <h1 className="font-serif text-[38px] sm:text-[52px] text-foreground tracking-tight leading-[1.12] mb-6">
            How MeritLane Verification Works
          </h1>
          <p className="text-[16px] sm:text-[18px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            MeritLane verifies candidate technical capabilities through timed, monitored evaluations and authenticated evidence. We replace self-reported resumes with verified skill records.
          </p>
        </div>
      </section>

      {/* Six-step flow */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20 max-w-4xl mx-auto">
        <h2 className="text-[22px] sm:text-[26px] font-serif font-semibold text-foreground text-center mb-10 sm:mb-14">
          The Verification Process
        </h2>

        <div className="space-y-5">
          {[
            {
              step: "01",
              title: "Establish Identity",
              desc: "Create your profile with basic technical identity details: graduation year, degree, institution, and declared skills.",
            },
            {
              step: "02",
              title: "Select a Skill to Verify",
              desc: "Choose a skill listed in your technical identity profile that you want to substantiate with evaluation evidence.",
            },
            {
              step: "03",
              title: "Complete the Timed Assessment",
              desc: "Take a 45-minute technical evaluation consisting of multiple-choice concept checks and a hands-on coding challenge.",
            },
            {
              step: "04",
              title: "Achieve the Component Thresholds",
              desc: "Scores are evaluated automatically against comprehensive test suites. Reaching the required threshold for each component is required to achieve verification.",
            },
            {
              step: "05",
              title: "Receive Verified Status",
              desc: "Once verified, an authenticated public proof record is issued, showing the verified skill, score, evaluation date, and code review.",
            },
            {
              step: "06",
              title: "Discoverable to Eligible Employers",
              desc: "Employers searching for your verified domain can review your code evidence, shortlist your profile, and initiate direct outreach.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-6 border border-border bg-surface rounded-xl p-6 sm:p-7 shadow-sm transition-colors hover:border-foreground/30"
            >
              <span className="font-mono text-[18px] font-bold text-muted-foreground shrink-0 mt-0.5">
                {item.step}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Safeguards */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 bg-surface/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[22px] sm:text-[26px] font-serif font-semibold text-foreground text-center mb-8 sm:mb-12">
            Assessment Safeguards &amp; Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border bg-surface rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" /> 45-Minute Server Timer
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                The timer is tracked and validated server-side from the moment an assessment begins. Refreshing or navigating away does not extend the allotted duration.
              </p>
            </div>

            <div className="border border-border bg-surface rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground mb-3">
                <Shield className="h-4 w-4 text-emerald-700" /> Fullscreen &amp; Tab Monitoring
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Assessments require fullscreen mode. Leaving fullscreen, navigating back, or switching browser tabs generates integrity warnings and may terminate the session.
              </p>
            </div>

            <div className="border border-border bg-surface rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground mb-3">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Cooldown Periods
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Failing to meet component thresholds enforces a 14-day study cooldown before a retake. Assessments terminated for integrity infractions enforce a 21-day cooldown.
              </p>
            </div>

            <div className="border border-border bg-surface rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground mb-3">
                <Award className="h-4 w-4 text-foreground" /> Component Threshold Standard
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Verification is not graded on a curve. A consistent passing standard for each component ensures employers that all verified candidates met the same objective technical standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it means / does not mean */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="border border-emerald-600/30 bg-surface rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-emerald-800 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" /> What Verification Means
            </div>
            <ul className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 mt-0.5">•</span>
                The candidate passed an objective, timed evaluation by meeting all component thresholds.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 mt-0.5">•</span>
                Code was executed and validated against unit tests and hidden test suites.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 mt-0.5">•</span>
                Evaluation took place under monitored session integrity conditions.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 mt-0.5">•</span>
                Public record reflects genuine system evaluations, not self-declarations.
              </li>
            </ul>
          </div>

          <div className="border border-border bg-surface rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-muted-foreground mb-4">
              <AlertCircle className="h-5 w-5" /> What Verification Does Not Mean
            </div>
            <ul className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                It does not guarantee employment or job offers with partner companies.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                It does not certify every aspect of a candidate&apos;s overall engineering capacity.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                It does not substitute for an employer&apos;s internal interview and evaluation process.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                It does not represent a professional licensure or accredited degree.
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 h-12 bg-foreground text-background text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Start Your Verification — Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
