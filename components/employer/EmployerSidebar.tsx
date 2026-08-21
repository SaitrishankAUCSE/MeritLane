"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, Command, ShieldCheck, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function EmployerSidebar() {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();
  const name = user?.displayName || "Employer";
  const avatarUrl = user?.photoURL || "";

  const navItems = [
    { name: "Identity", href: "#", icon: Activity },
    { name: "Evidence", href: "#", icon: FileText },
    { name: "Provenance", href: "/employer/dashboard", icon: Command },
    { name: "Verification", href: "#", icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e] h-[100dvh]">
      <div className="flex h-20 items-center px-8 shrink-0">
        <div>
          <div className="font-serif text-[26px] font-medium tracking-tight text-white mb-1">Meritlane</div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-[#8e928f] uppercase">System of Record</div>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (isActive) {
            return (
              <div key={item.name} className="flex items-center px-4 py-3 text-[14px] font-sans text-white bg-[#111316] relative transition-colors">
                <Icon className="mr-4 h-[18px] w-[18px]" />
                {item.name}
                <div className="absolute bg-white right-0 top-0 bottom-0 w-[1px]" />
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex items-center px-4 py-3 text-[14px] font-sans text-[#8e928f] hover:text-[#f4f4f2] hover:bg-[#111316]/50 transition-colors">
              <Icon className="mr-4 h-[18px] w-[18px] opacity-70" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-[#272a2f] shrink-0">
        <button className="flex items-center gap-2 w-full text-left py-2 text-[#e3e2e5] hover:text-white transition-colors mb-6">
          <span className="font-mono text-[11px] text-white font-bold">[+]</span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add Evidence</span>
        </button>
        
        <div className="space-y-3 mb-6">
          <Link href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <Settings className="mr-4 h-[18px] w-[18px] opacity-70" /> Settings
          </Link>
          <Link href="#" className="flex items-center text-[14px] font-sans text-[#8e928f] hover:text-white transition-colors">
            <HelpCircle className="mr-4 h-[18px] w-[18px] opacity-70" /> Support
          </Link>
        </div>

        {/* User Profile Button */}
        <div className="flex items-center justify-between pt-6 border-t border-[#272a2f] mb-4">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] group-hover:border-[#8e928f] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] text-[#e3e2e5] font-medium truncate group-hover:text-white transition-colors">{name}</div>
              <div className="text-[10px] text-[#8e928f] font-mono tracking-wider uppercase truncate hover:text-[#ffb4ab] transition-colors" onClick={(e) => { e.stopPropagation(); handleSignOut(); }}>Sign out</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
