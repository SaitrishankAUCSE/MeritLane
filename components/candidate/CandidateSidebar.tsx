"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Fingerprint, LayoutDashboard, Network, ShieldCheck, Settings, HelpCircle, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, handleSignOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || "User";
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
    { name: "Identity", href: "/candidate/profile", icon: Fingerprint },
    { name: "Evidence", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Provenance", href: "/candidate/provenance", icon: Network },
    { name: "Verification", href: "/candidate/assessment", icon: ShieldCheck },
  ];

  return (
    <aside className={`scrollbar-hide hidden lg:flex shrink-0 flex-col border-r border-[#E5E5E5] bg-[#FAFAFA] h-[100dvh] overflow-y-auto transition-all duration-300 ${isCollapsed ? "w-[80px]" : "w-[220px]"}`}>
      {/* Brand */}
      <div className={`flex h-20 items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-8"}`}>
        {isCollapsed ? (
          <img src="/logo-m.png" alt="M" className="h-8 w-auto" />
        ) : (
          <img src="/logo-full.png" alt="Meritlane" className="h-8 w-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Candidate Navigation" className={`flex-1 mt-6 space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (isActive) {
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current="page"
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center py-2 h-10 text-[14px] font-sans text-[#0D0D0D] bg-[#FFFFFF] relative transition-colors ${isCollapsed ? "justify-center px-0 rounded-md mx-1" : "px-4"}`}
              >
                <Icon className={`h-[18px] w-[18px] ${isCollapsed ? "" : "mr-4"}`} aria-hidden="true" />
                {!isCollapsed && item.name}
                <div className={`absolute bg-[#0D0D0D] ${isCollapsed ? "left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r-md" : "right-0 top-0 bottom-0 w-[1px]"}`} />
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center py-2 h-10 text-[14px] font-sans text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF]/50 transition-colors relative ${isCollapsed ? "justify-center px-0 rounded-md mx-1" : "px-4"}`}
            >
              <Icon className={`h-[18px] w-[18px] opacity-70 ${isCollapsed ? "" : "mr-4"}`} aria-hidden="true" />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav / Action */}
      <div className={`py-6 border-t border-[#E5E5E5] shrink-0 ${isCollapsed ? "px-2 flex flex-col items-center" : "px-6"}`}>
        {!isCollapsed ? (
          <button 
            onClick={() => router.push('/candidate/dashboard')}
            className="flex items-center gap-2 w-full text-left py-2 text-[#0D0D0D] hover:text-[#0D0D0D] transition-colors mb-6"
          >
            <span className="font-mono text-[11px] text-[#0D0D0D] font-bold">[+]</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em]">Add evidence</span>
          </button>
        ) : (
          <button 
            onClick={() => router.push('/candidate/dashboard')}
            title="Add evidence"
            className="flex items-center justify-center p-2 mb-6 text-[#0D0D0D] hover:text-[#0D0D0D] hover:bg-[#FFFFFF]/50 rounded-md transition-colors"
          >
            <span className="font-mono text-[11px] text-[#0D0D0D] font-bold">[+]</span>
          </button>
        )}
        
        {/* User Context Menu Container */}
        <div ref={menuRef} className={`relative flex items-center ${isCollapsed ? "justify-center" : "justify-between"} pt-6 border-t border-[#E5E5E5] mb-4`}>
          
          {/* Popover Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`absolute bottom-full mb-3 bg-[#FFFFFF] border border-[#E5E5E5] shadow-lg rounded-xl overflow-hidden py-1 z-50 ${isCollapsed ? "left-0 w-48" : "left-0 right-0"}`}
              >
                <div className="px-4 py-3 border-b border-[#E5E5E5] mb-1">
                  <div className="text-[13px] font-medium text-[#0D0D0D] truncate">{name}</div>
                  <div className="text-[11px] text-[#737373] truncate">{user?.email}</div>
                </div>
                
                <div className="px-2 py-1 space-y-0.5">
                  <Link href="/candidate/profile" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
                    <Fingerprint className="h-3.5 w-3.5 opacity-70" />
                    View Identity
                  </Link>
                  <Link href="/candidate/settings" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
                    <Settings className="h-3.5 w-3.5 opacity-70" />
                    Settings
                  </Link>
                  <Link href="/candidate/support" className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-[#404040] hover:text-[#0D0D0D] hover:bg-[#F3F3F1] rounded-md transition-colors">
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
            aria-label="User account menu"
            className={`flex items-center gap-3 cursor-pointer group p-1.5 -ml-1.5 rounded-lg transition-colors text-left ${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-[#E5E5E5] border border-[#D2D2D2] group-hover:border-[#737373] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="text-[13px] text-[#0D0D0D] font-medium truncate transition-colors">
                {name}
              </div>
            )}
          </button>
          
          {/* Toggle Button */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF] rounded-md transition-colors shrink-0"
              aria-label="Collapse sidebar"
              aria-expanded={!isCollapsed}
            >
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
        </div>
        
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF] rounded-md transition-colors"
              aria-label="Expand sidebar"
              aria-expanded={!isCollapsed}
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}


