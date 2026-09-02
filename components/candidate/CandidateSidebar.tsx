"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Fingerprint,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Inbox,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, handleSignOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || "Candidate";
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Identity",     href: "/candidate/profile",      icon: Fingerprint },
    { name: "Evidence",     href: "/candidate/dashboard",    icon: LayoutDashboard },
    { name: "Provenance",   href: "/candidate/provenance",   icon: Network },
    { name: "Verification", href: "/candidate/verification", icon: ShieldCheck },
    { name: "Inbox",        href: "/candidate/inbox",        icon: Inbox },
  ];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 228 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="scrollbar-hide hidden lg:flex shrink-0 flex-col h-[100dvh] overflow-hidden
                   bg-[#FEFCF9] border-r border-[#E7E2DA]"
      >
        {/* ── Brand ── */}
        <div className="flex h-[64px] items-center shrink-0 relative overflow-hidden px-4">
          <AnimatePresence initial={false} mode="wait">
            {isCollapsed ? (
              <motion.img
                key="logo-m"
                src="/logo-m.png"
                alt="M"
                className="h-7 w-auto mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            ) : (
              <motion.img
                key="logo-full"
                src="/logo-full.png"
                alt="Meritlane"
                className="h-7 w-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation ── */}
        <nav aria-label="Candidate Navigation" className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.name : undefined}
                className={`
                  relative flex items-center h-9 rounded text-[13.5px] font-medium
                  transition-all duration-150 group overflow-hidden
                  ${isActive
                    ? "bg-[#F0EDE8] text-[#1C1917] font-semibold border-l-2 border-[#064E3B]"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EFE9]"
                  }
                `}
              >
                <div className={`flex justify-center shrink-0 ${isCollapsed ? "w-full" : "w-10"}`}>
                  <Icon
                    className={`h-[17px] w-[17px] transition-colors ${
                      isActive ? "text-[#FAFAF9]" : "text-[#A8A29E] group-hover:text-[#1C1917]"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="whitespace-nowrap pr-3 tracking-[-0.01em]"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-3 h-px bg-[#E7E2DA]" />

        {/* ── Add evidence shortcut ── */}
        <div className="px-3 py-3">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            title={isCollapsed ? "Add evidence" : undefined}
            className={`
              flex items-center h-9 w-full rounded-lg
              text-[13px] font-medium text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EFE9]
              transition-colors overflow-hidden
            `}
          >
            <div className={`flex justify-center shrink-0 ${isCollapsed ? "w-full" : "w-10"}`}>
              <span className="text-[16px] leading-none font-light text-[#A8A29E] group-hover:text-[#1C1917]">+</span>
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="whitespace-nowrap pr-3 tracking-[-0.01em]"
                >
                  Add evidence
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* ── Bottom: user + collapse toggle ── */}
        <div className="mx-3 h-px bg-[#E7E2DA]" />
        <div className="px-3 py-3 shrink-0">
          <div
            ref={menuRef}
            className={`relative flex items-center gap-2 ${isCollapsed ? "flex-col" : ""}`}
          >
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
                      href="/candidate/profile"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#44403C]
                                 hover:bg-[#F2EFE9] hover:text-[#1C1917] rounded-lg transition-colors"
                    >
                      <Fingerprint className="h-3.5 w-3.5 text-[#A8A29E]" />
                      View Identity
                    </Link>
                    <Link
                      href="/candidate/settings"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-[#44403C]
                                 hover:bg-[#F2EFE9] hover:text-[#1C1917] rounded-lg transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#A8A29E]" />
                      Settings
                    </Link>
                    <Link
                      href="/candidate/support"
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
                flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-lg text-left
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
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="flex items-center gap-1 overflow-hidden"
                  >
                    <span className="text-[12.5px] font-medium text-[#44403C] truncate whitespace-nowrap max-w-[110px]">
                      {name}
                    </span>
                    <ChevronUp
                      className={`h-3 w-3 text-[#A8A29E] shrink-0 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#F2EFE9] rounded-lg
                         transition-colors shrink-0"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed
                ? <PanelLeftOpen className="h-[16px] w-[16px]" aria-hidden="true" />
                : <PanelLeftClose className="h-[16px] w-[16px]" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </motion.aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
