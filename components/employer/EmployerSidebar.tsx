"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bookmark, Briefcase, Settings, HelpCircle, LogOut, Activity, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function EmployerSidebar() {
  const pathname = usePathname();
  const { user, handleSignOut } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || "Employer";
  const email = user?.email || "";
  const avatarUrl = user?.photoURL || "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    { name: "Discover",     href: "/employer/dashboard", icon: Search    },
    { name: "Shortlist",    href: "/employer/shortlist", icon: Bookmark  },
    { name: "Job Postings", href: "/employer/jobs",      icon: Briefcase },
  ];

  return (
    <>
      <aside
        className="hidden lg:flex lg:flex-col sticky top-0 h-[100dvh] w-[228px] shrink-0
                   bg-[#FEFCF9] border-r border-[#E7E2DA] overflow-hidden z-40"
      >
        {/* ── Brand ── */}
        <div className="flex h-[64px] items-center px-5 shrink-0">
          <img src="/logo-full.png" alt="Meritlane" className="h-7 w-auto" />
        </div>

        {/* ── Navigation ── */}
        <nav aria-label="Employer Navigation" className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex items-center gap-3 h-9 px-3 rounded-lg
                  text-[13.5px] font-medium tracking-[-0.01em]
                  transition-all duration-150 group
                  ${isActive
                    ? "bg-[#1C1917] text-[#FAFAF9] shadow-sm"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EFE9]"
                  }
                `}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 transition-colors ${
                    isActive ? "text-[#FAFAF9]" : "text-[#A8A29E] group-hover:text-[#1C1917]"
                  }`}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-3 h-px bg-[#E7E2DA]" />

        {/* ── Bottom: user ── */}
        <div className="px-3 py-3 shrink-0">
          <div ref={menuRef} className="relative">
            {/* User context menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className="absolute bottom-full mb-2 left-0 w-52 bg-white border border-[#E7E2DA]
                             rounded-xl shadow-lg overflow-hidden z-50 py-1"
                >
                  <div className="px-4 py-3 border-b border-[#F2EFE9]">
                    <div className="text-[13px] font-semibold text-[#1C1917] truncate">{name}</div>
                    <div className="text-[11px] text-[#A8A29E] truncate mt-0.5">{email}</div>
                  </div>
                  <div className="px-2 py-1.5 space-y-0.5">
                    <Link
                      href="/employer/profile"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#44403C]
                                 hover:bg-[#F2EFE9] hover:text-[#1C1917] rounded-lg transition-colors"
                    >
                      <Activity className="h-3.5 w-3.5 text-[#A8A29E]" />
                      Employer Profile
                    </Link>
                    <Link
                      href="/employer/settings"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#44403C]
                                 hover:bg-[#F2EFE9] hover:text-[#1C1917] rounded-lg transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#A8A29E]" />
                      Settings
                    </Link>
                    <Link
                      href="/employer/support"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#44403C]
                                 hover:bg-[#F2EFE9] hover:text-[#1C1917] rounded-lg transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-[#A8A29E]" />
                      Help & Support
                    </Link>
                  </div>
                  <div className="px-2 pt-1 pb-1 mt-1 border-t border-[#F2EFE9]">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-2.5 py-2
                                 text-[13px] text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar button */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`
                flex items-center gap-2.5 w-full p-1.5 rounded-lg text-left
                transition-colors cursor-pointer overflow-hidden
                ${isUserMenuOpen ? "bg-[#F2EFE9]" : "hover:bg-[#F2EFE9]"}
              `}
            >
              <div className="h-7 w-7 rounded-full bg-[#1C1917] text-[#FAFAF9] flex items-center
                              justify-center text-[11px] font-semibold shrink-0 overflow-hidden border border-[#E7E2DA]">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  : initials
                }
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-1">
                <span className="text-[12.5px] font-medium text-[#44403C] truncate whitespace-nowrap">
                  {name}
                </span>
                <ChevronUp
                  className={`h-3 w-3 text-[#A8A29E] shrink-0 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
