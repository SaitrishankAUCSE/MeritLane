"use client"

import * as React from "react"
import Link from "next/link"

export function Footerdemo() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#F8F8F6] text-[#101010] font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 md:px-12 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#101010] flex items-center justify-center text-white font-bold text-[13px]">
                M
              </div>
              <span className="font-sans font-semibold text-[17px] tracking-[-0.025em] text-[#101010]">
                MeritLane
              </span>
            </div>
            <p className="text-[13px] text-[#71717A] leading-relaxed max-w-[280px]">
              The skill-verified hiring platform for fresh graduates and early technical talent. Pure proof of work.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-medium text-[#101010] tracking-tight">Platform</h3>
            <nav className="space-y-2.5">
              <Link href="/signup" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">For Candidates</Link>
              <Link href="/employer/dashboard" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">For Employers</Link>
              <Link href="/#tracks" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Skill Tracks</Link>
              <Link href="/how-verification-works" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Verification Methodology</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-medium text-[#101010] tracking-tight">Company</h3>
            <nav className="space-y-2.5">
              <Link href="/about" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">About Us</Link>
              <a href="mailto:saitrishankb9@gmail.com" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Contact Support</a>
              <Link href="/privacy" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Terms of Service</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-medium text-[#101010] tracking-tight">Connect</h3>
            <div className="space-y-2.5">
              <a href="mailto:saitrishankb9@gmail.com" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors font-mono">saitrishankb9@gmail.com</a>
              <a href="https://x.com/saitrishank" target="_blank" rel="noopener noreferrer" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">Twitter / X</a>
              <a href="https://www.linkedin.com/in/saitrishank/" target="_blank" rel="noopener noreferrer" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">LinkedIn</a>
              <a href="https://github.com/SaitrishankAUCSE" target="_blank" rel="noopener noreferrer" className="block text-[13.5px] text-[#71717A] hover:text-[#101010] transition-colors">GitHub</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/[0.08] pt-8 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-[#71717A]">
            © {new Date().getFullYear()} Meritlane Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-[12.5px] text-[#71717A]">
            Built with love from Vizag
          </p>
        </div>
      </div>
    </footer>
  )
}
