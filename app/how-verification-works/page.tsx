import React from "react";
import Link from "next/link";
import { CheckCircle2, Shield, ArrowRight, Clock, Award, Users, AlertCircle } from "lucide-react";

export default function HowVerificationWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1C1917] font-sans">
      {/* Navigation */}
      <header className="flex h-[64px] sm:h-[72px] items-center justify-between px-4 sm:px-8 lg:px-16 border-b border-[#E7E2DA] bg-white">
        <Link href="/" className="font-serif text-[22px] sm:text-[26px] font-medium tracking-tight text-[#1C1917]">
          Meritlane
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-[13px] sm:text-[14px] font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1C1917] text-white text-[12px] sm:text-[13px] font-semibold rounded-xl hover:bg-[#292524] transition-colors"
          >
            Get Verified
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-[#E7E2DA] bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[#78716C] mb-4 border border-[#E7E2DA] px-3 py-1 rounded-full bg-[#F8F6F3]">
            <Shield className="h-3 w-3 text-[#16A34A]" /> Verification Methodology
          </div>
          <h1 className="font-serif text-[42px] sm:text-[54px] text-[#1C1917] tracking-tight leading-[1.1] mb-6">
            How MeritLane Verification Works
          </h1>
          <p className="text-[16px] sm:text-[18px] text-[#78716C] leading-relaxed max-w-2xl mx-auto">
            MeritLane verifies candidate technical capabilities through timed, monitored evaluations and authenticated evidence. We replace self-reported resumes with verified skill records.
          </p>
        </div>
      </section>

      {/* Six-step flow */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20 max-w-4xl mx-auto">
        <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1C1917] text-center mb-10 sm:mb-14">
          The Verification Process
        </h2>

        <div className="space-y-6">
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
              title: "Achieve the 80% Threshold",
              desc: "Scores are evaluated automatically against comprehensive test suites. Reaching 80% or higher is required to achieve verification.",
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
              className="flex items-start gap-6 border border-[#E7E2DA] bg-white rounded-2xl p-7 shadow-sm"
            >
              <span className="font-mono text-[18px] font-bold text-[#78716C] shrink-0 mt-0.5">
                {item.step}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1C1917] mb-2">{item.title}</h3>
                <p className="text-[14px] text-[#78716C] leading-relaxed font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Safeguards */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 bg-white border-y border-[#E7E2DA]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1C1917] text-center mb-8 sm:mb-12">
            Assessment Safeguards & Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#E7E2DA] bg-[#F8F6F3] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[#1C1917] mb-3">
                <Clock className="h-4 w-4 text-[#78716C]" /> 45-Minute Server Timer
              </div>
              <p className="text-[13px] text-[#78716C] leading-relaxed">
                The timer is tracked and validated server-side from the moment an assessment begins. Refreshing or navigating away does not extend the allotted duration.
              </p>
            </div>

            <div className="border border-[#E7E2DA] bg-[#F8F6F3] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[#1C1917] mb-3">
                <Shield className="h-4 w-4 text-[#16A34A]" /> Fullscreen & Tab Monitoring
              </div>
              <p className="text-[13px] text-[#78716C] leading-relaxed">
                Assessments require fullscreen mode. Leaving fullscreen, navigating back, or switching browser tabs generates integrity warnings and may terminate the session.
              </p>
            </div>

            <div className="border border-[#E7E2DA] bg-[#F8F6F3] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[#1C1917] mb-3">
                <AlertCircle className="h-4 w-4 text-[#D97706]" /> Cooldown Periods
              </div>
              <p className="text-[13px] text-[#78716C] leading-relaxed">
                Scores below 80% enforce a 14-day study cooldown before a retake. Assessments terminated for integrity infractions enforce a 21-day cooldown.
              </p>
            </div>

            <div className="border border-[#E7E2DA] bg-[#F8F6F3] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 text-[15px] font-semibold text-[#1C1917] mb-3">
                <Award className="h-4 w-4 text-[#1C1917]" /> 80% Threshold Standard
              </div>
              <p className="text-[13px] text-[#78716C] leading-relaxed">
                Verification is not graded on a curve. A consistent 80% passing mark ensures employers that all verified candidates met the same objective technical standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What it means / does not mean */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="border border-[#16A34A]/30 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#16A34A] mb-4">
              <CheckCircle2 className="h-5 w-5" /> What Verification Means
            </div>
            <ul className="space-y-3 text-[13px] text-[#78716C] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#16A34A] mt-0.5">•</span>
                The candidate passed an objective, timed evaluation with score ≥ 80%.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16A34A] mt-0.5">•</span>
                Code was executed and validated against unit tests and hidden test suites.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16A34A] mt-0.5">•</span>
                Evaluation took place under monitored session integrity conditions.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#16A34A] mt-0.5">•</span>
                Public record reflects genuine system evaluations, not self-declarations.
              </li>
            </ul>
          </div>

          <div className="border border-[#E7E2DA] bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#78716C] mb-4">
              <AlertCircle className="h-5 w-5" /> What Verification Does Not Mean
            </div>
            <ul className="space-y-3 text-[13px] text-[#78716C] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#78716C] mt-0.5">•</span>
                It does not guarantee employment or job offers with partner companies.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78716C] mt-0.5">•</span>
                It does not certify every aspect of a candidate&apos;s overall engineering capacity.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78716C] mt-0.5">•</span>
                It does not substitute for an employer&apos;s internal interview and evaluation process.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78716C] mt-0.5">•</span>
                It does not represent a professional licensure or accredited degree.
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/candidate/verification"
            className="inline-flex items-center gap-2 px-6 h-12 bg-[#1C1917] text-white text-[14px] font-semibold rounded-xl hover:bg-[#292524] transition-colors shadow-sm"
          >
            Start Your Verification
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E2DA] bg-white px-4 sm:px-8 lg:px-16 py-8 sm:py-10 text-center text-[13px] text-[#78716C]">
        <p>© {new Date().getFullYear()} MeritLane. All verification records are evaluated under MeritLane integrity standards.</p>
      </footer>
    </div>
  );
}
