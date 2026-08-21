"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Fingerprint, LayoutDashboard, Network, ShieldCheck, Settings, HelpCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Identity", href: "/candidate/profile", icon: Fingerprint },
    { name: "Evidence", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Provenance", href: "/candidate/provenance", icon: Network },
    { name: "Verification", href: "/candidate/assessment", icon: ShieldCheck },
  ];

  return (
    <aside className={`hidden lg:flex shrink-0 flex-col border-r border-[#272a2f] bg-[#0b0c0e] h-[100dvh] overflow-y-auto transition-all duration-300 ${isCollapsed ? "w-[80px]" : "w-[260px]"}`}>
      {/* Brand */}
      <div className={`flex h-20 items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-8"}`}>
        {isCollapsed ? (
          <div className="font-serif text-[26px] font-medium tracking-tight text-white">M</div>
        ) : (
          <div>
            <div className="font-serif text-[26px] font-medium tracking-tight text-white mb-1">Meritlane</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#8e928f] uppercase">System of Record</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 mt-6 space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (isActive) {
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center py-3 text-[15px] font-sans text-white bg-[#111316] relative transition-colors ${isCollapsed ? "justify-center px-0 rounded-md mx-1" : "px-4"}`}
              >
                <Icon className={`h-[18px] w-[18px] ${isCollapsed ? "" : "mr-4"}`} />
                {!isCollapsed && item.name}
                <div className={`absolute bg-white ${isCollapsed ? "left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r-md" : "right-0 top-0 bottom-0 w-[1px]"}`} />
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center py-3 text-[15px] font-sans text-[#8e928f] hover:text-[#f4f4f2] hover:bg-[#111316]/50 transition-colors relative ${isCollapsed ? "justify-center px-0 rounded-md mx-1" : "px-4"}`}
            >
              <Icon className={`h-[18px] w-[18px] opacity-70 ${isCollapsed ? "" : "mr-4"}`} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav / Action */}
      <div className={`py-6 border-t border-[#272a2f] shrink-0 ${isCollapsed ? "px-2 flex flex-col items-center" : "px-6"}`}>
        {!isCollapsed ? (
          <button 
            onClick={() => router.push('/candidate/profile')}
            className="flex items-center gap-2 w-full text-left py-2 text-[#e3e2e5] hover:text-white transition-colors mb-6"
          >
            <span className="font-mono text-[11px] text-white font-bold">[+]</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add Evidence</span>
          </button>
        ) : (
          <button 
            onClick={() => router.push('/candidate/profile')}
            title="Add Evidence"
            className="flex items-center justify-center p-2 mb-6 text-[#e3e2e5] hover:text-white hover:bg-[#111316]/50 rounded-md transition-colors"
          >
            <span className="font-mono text-[11px] text-white font-bold">[+]</span>
          </button>
        )}
        
        <div className={`space-y-4 mb-6 ${isCollapsed ? "w-full space-y-2" : ""}`}>
          <Link href="/candidate/settings" title={isCollapsed ? "Settings" : undefined} className={`flex items-center text-[15px] font-sans text-[#8e928f] hover:text-white transition-colors ${isCollapsed ? "justify-center p-2 rounded-md hover:bg-[#111316]/50" : ""}`}>
            <Settings className={`h-[18px] w-[18px] opacity-70 ${isCollapsed ? "" : "mr-4"}`} /> 
            {!isCollapsed && "Settings"}
          </Link>
          <Link href="/candidate/support" title={isCollapsed ? "Support" : undefined} className={`flex items-center text-[15px] font-sans text-[#8e928f] hover:text-white transition-colors ${isCollapsed ? "justify-center p-2 rounded-md hover:bg-[#111316]/50" : ""}`}>
            <HelpCircle className={`h-[18px] w-[18px] opacity-70 ${isCollapsed ? "" : "mr-4"}`} /> 
            {!isCollapsed && "Support"}
          </Link>
        </div>

        {/* Toggle Button */}
        <div className={`flex mt-2 ${isCollapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-[#8e928f] hover:text-white hover:bg-[#111316] rounded-md transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
