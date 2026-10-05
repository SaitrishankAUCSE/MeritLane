"use client"

import * as React from "react"
import Link from "next/link"

export function Footerdemo() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24 py-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto mb-4" />
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px]">
              The independent examination register and verified technical standard for engineering talent in India.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Register</h3>
            <nav className="space-y-2.5">
              <Link href="/signup" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">For Engineers</Link>
              <Link href="/employer/dashboard" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">For Employers</Link>
              <Link href="/#standards" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Examination Standard</Link>
              <Link href="/how-verification-works" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Methodology</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Institution</h3>
            <nav className="space-y-2.5">
              <Link href="/" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">About Us</Link>
              <a href="mailto:hello@meritlane.app" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Contact Support</a>
              <Link href="/privacy" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Terms of Service</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Contact</h3>
            <div className="space-y-2.5">
              <a href="mailto:hello@meritlane.app" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">hello@meritlane.app</a>
              <a href="https://twitter.com/meritlane" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">Twitter / X</a>
              <a href="https://linkedin.com/company/meritlane" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-foreground hover:text-muted-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
          <p className="text-[12px] font-mono text-muted-foreground">
            © {new Date().getFullYear()} Meritlane Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-[12px] font-mono text-muted-foreground">
            Built with love ❤️ from Vizag
          </p>
        </div>
      </div>
    </footer>
  )
}
