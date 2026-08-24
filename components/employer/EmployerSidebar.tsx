"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, FileText, Command, ShieldCheck, Bookmark, Settings, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function EmployerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, handleSignOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || "Employer";
  const avatarUrl = user?.photoURL || "";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Identity", href: "#", icon: Activity, disabled: true },
    { name: "Evidence", href: "#", icon: FileText, disabled: true },
    { name: "Provenance", href: "/employer/dashboard", icon: Command },
    { name: "Shortlist", href: "/employer/shortlist", icon: Bookmark },
  ];

  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[#E5E5E5] bg-[#FAFAFA] h-[100dvh]">
      <div className="flex h-20 items-center px-8 shrink-0">
        <img src="/logo-full.png" alt="Meritlane" className="h-8 w-auto" />
      </div>

      <nav aria-label="Employer Navigation" className="flex-1 px-4 mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (isActive) {
            return (
              <Link 
                key={item.name} 
                href={item.href}
                aria-current="page" 
                className="flex items-center px-4 py-3 text-[14px] font-sans text-[#0D0D0D] bg-[#FFFFFF] relative transition-colors rounded-md"
              >
                <Icon className="mr-4 h-[18px] w-[18px]" aria-hidden="true" />
                {item.name}
                <div className="absolute bg-[#0D0D0D] right-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-l-md" />
              </Link>
            );
          }

          if (item.disabled) {
            return (
              <div key={item.name} aria-disabled="true" className="flex items-center px-4 py-3 text-[14px] font-sans text-[#D2D2D2] cursor-not-allowed transition-colors rounded-md" title="Coming soon">
                <Icon className="mr-4 h-[18px] w-[18px] opacity-30" aria-hidden="true" />
                {item.name}
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex items-center px-4 py-3 text-[14px] font-sans text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF]/50 transition-colors rounded-md">
              <Icon className="mr-4 h-[18px] w-[18px] opacity-70" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-[#E5E5E5] shrink-0">
        <button disabled className="flex items-center gap-2 w-full text-left py-2 text-[#D2D2D2] cursor-not-allowed transition-colors mb-6" title="Coming soon">
          <span className="font-mono text-[11px] text-[#D2D2D2] font-bold">[+]</span>
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">New Request</span>
        </button>
        
        {/* User Context Menu Container */}
        <div ref={menuRef} className="relative flex items-center justify-between pt-6 border-t border-[#E5E5E5] mb-4">
          
          {/* Popover Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-0 right-0 mb-3 bg-[#FFFFFF] border border-[#E5E5E5] shadow-lg rounded-xl overflow-hidden py-1 z-50"
              >
                <div className="px-4 py-3 border-b border-[#E5E5E5] mb-1">
                  <div className="text-[13px] font-medium text-[#0D0D0D] truncate">{name}</div>
                  <div className="text-[11px] text-[#737373] truncate">{user?.email}</div>
                </div>
                
                <div className="px-2 py-1 space-y-0.5">
                  <Link href="/employer/profile" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
                    <Activity className="h-3.5 w-3.5 opacity-70" />
                    Employer Identity
                  </Link>
                  <Link href="/employer/settings" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
                    <Settings className="h-3.5 w-3.5 opacity-70" />
                    Settings
                  </Link>
                  <Link href="/employer/support" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
                    <HelpCircle className="h-3.5 w-3.5 opacity-70" />
                    Help & Support
                  </Link>
                </div>
                
                <div className="px-2 pt-1 mt-1 border-t border-[#E5E5E5]">
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 w-full text-left px-2 py-1.5 text-[13px] text-[#B42318] hover:bg-[#B42318]/10 rounded-md transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 opacity-70" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Button */}
          <button 
            type="button"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            aria-label="Employer account menu"
            className={`flex items-center gap-3 cursor-pointer group p-1.5 -ml-1.5 rounded-lg transition-colors w-full text-left ${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-[#E5E5E5] border border-[#D2D2D2] group-hover:border-[#737373] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
            </div>
            <div className="text-[13px] text-[#0D0D0D] font-medium truncate transition-colors">
              {name}
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

