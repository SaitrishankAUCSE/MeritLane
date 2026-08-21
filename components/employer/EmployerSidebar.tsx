"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, Command, ShieldCheck, Settings, HelpCircle } from "lucide-react";

export function EmployerSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Identity", href: "#", icon: Activity },
    { name: "Evidence", href: "#", icon: FileText },
    { name: "Provenance", href: "/employer/dashboard", icon: Command },
    { name: "Verification", href: "#", icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e] h-[100dvh]">
      <div className="flex h-24 items-center px-8 border-b border-[#272a2f] shrink-0">
        <div>
          <div className="font-serif text-[26px] font-medium tracking-tight text-white mb-1">Meritlane</div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#8e928f] uppercase">System of Record</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (isActive) {
            return (
              <div key={item.name} className="flex items-center px-4 py-3 text-[14px] font-sans text-white bg-[#1b1c1e] rounded-lg border border-[#272a2f]">
                <Icon className="mr-4 h-[18px] w-[18px]" />
                {item.name}
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex items-center px-4 py-3 text-[14px] font-sans text-[#8e928f] hover:text-[#f4f4f2] transition-colors">
              <Icon className="mr-4 h-[18px] w-[18px] opacity-70" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-[#272a2f]">
        <button className="flex items-center justify-center gap-2 w-full bg-[#1b1c1e] border border-[#272a2f] rounded-lg py-3 text-[#e3e2e5] hover:text-white transition-colors mb-6">
          <span className="font-mono text-[11px] text-white font-bold">[+]</span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add Evidence</span>
        </button>
        
        <div className="space-y-4">
          <Link href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <Settings className="mr-4 h-[18px] w-[18px] opacity-70" /> Settings
          </Link>
          <Link href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <HelpCircle className="mr-4 h-[18px] w-[18px] opacity-70" /> Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
