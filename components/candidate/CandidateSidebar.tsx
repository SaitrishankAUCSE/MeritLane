"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Fingerprint, LayoutDashboard, Network, ShieldCheck, Settings, HelpCircle, Layers } from "lucide-react";

export function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    { name: "Identity", href: "/candidate/profile", icon: Fingerprint },
    { name: "Evidence", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Provenance", href: "/candidate/provenance", icon: Network },
    { name: "Verification", href: "/candidate/assessment", icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e] h-[100dvh] overflow-y-auto">
      {/* Brand */}
      <div className="flex h-20 items-center px-8 shrink-0">
        <div>
          <div className="font-serif text-[26px] font-medium tracking-tight text-white mb-1">Meritlane</div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#8e928f] uppercase">System of Record</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (isActive) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-[15px] font-sans text-white bg-[#111316] relative transition-colors"
              >
                <Icon className="mr-4 h-[18px] w-[18px]" />
                {item.name}
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white" />
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-[15px] font-sans text-[#8e928f] hover:text-[#f4f4f2] transition-colors relative"
            >
              <Icon className="mr-4 h-[18px] w-[18px] opacity-70" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav / Action */}
      <div className="px-6 py-6 border-t border-[#272a2f] shrink-0">
        <button 
          onClick={() => router.push('/candidate/profile')}
          className="flex items-center gap-2 w-full text-left py-2 text-[#e3e2e5] hover:text-white transition-colors mb-6"
        >
          <span className="font-mono text-[11px] text-white font-bold">[+]</span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add Evidence</span>
        </button>
        
        <div className="space-y-4">
          <Link href="/settings" className="flex items-center text-[15px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <Settings className="mr-4 h-[18px] w-[18px] opacity-70" /> Settings
          </Link>
          <Link href="/support" className="flex items-center text-[15px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <HelpCircle className="mr-4 h-[18px] w-[18px] opacity-70" /> Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
