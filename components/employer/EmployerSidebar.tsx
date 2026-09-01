"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bookmark, Settings, HelpCircle, LogOut, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function EmployerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, handleSignOut } = useAuth();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || "Employer";
  const avatarUrl = user?.photoURL || "";

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

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Discover", href: "/employer/dashboard", icon: Search },
    { name: "Shortlist", href: "/employer/shortlist", icon: Bookmark },
  ];

  return (
    <>
    <aside className="transition-all duration-300 ease-in-out border-r bg-[#FAFAFA] h-[100dvh] lg:flex lg:flex-col sticky top-0 hidden border-[#E5E5E5] shrink-0 z-40 w-[220px]">
      
      {/* Logo Area */}
      <div className="w-full flex justify-center mt-6 shrink-0 h-8">
        <div className="w-[188px] flex justify-start px-4">
          <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto" />
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Employer Navigation" className="flex-1 mt-6 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center h-10 text-[14px] font-sans relative overflow-hidden rounded-md transition-colors ${isActive ? "text-[#0D0D0D] bg-[#FFFFFF]" : "text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF]/50"}`}
            >
              <div className="w-12 flex justify-center shrink-0">
                <Icon className={`h-[18px] w-[18px] ${isActive ? "" : "opacity-70"}`} aria-hidden="true" />
              </div>
              <span className="whitespace-nowrap">
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="employerActiveTabIndicator"
                  className="absolute bg-[#0D0D0D] transition-all right-0 top-0 bottom-0 w-[1px]" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav / Action */}
      <div className="py-6 border-t border-[#E5E5E5] shrink-0 px-4">
        
        {/* User Context Menu Container */}
        <div ref={menuRef} className="relative flex items-center justify-between mb-4 h-14">
          
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full mb-3 bg-[#FFFFFF] border border-[#E5E5E5] shadow-lg rounded-xl overflow-hidden py-1 z-50 left-0 w-48"
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
                      setShowLogoutModal(true);
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
            className={`flex items-center cursor-pointer group p-1 rounded-lg transition-colors text-left overflow-hidden flex-1 ${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="w-10 flex justify-center shrink-0">
              <div className="h-8 w-8 rounded-full bg-[#E5E5E5] border border-[#D2D2D2] group-hover:border-[#737373] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">
                {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="text-[13px] text-[#0D0D0D] font-medium truncate whitespace-nowrap ml-1 pr-2">
              {name}
            </div>
          </button>
          
        </div>
        
      </div>
    </aside>
    <LogoutConfirmModal isOpen={showLogoutModal} onConfirm={handleSignOut} onCancel={() => setShowLogoutModal(false)} />
    </>
  );
}
