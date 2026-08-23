"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Fingerprint, LayoutDashboard, Network, ShieldCheck, Activity, FileText, Command } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function MobileNav({ role }: { role: "candidate" | "employer" | "admin" }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    disabled?: boolean;
  };

  const candidateItems: NavItem[] = [
    { name: "Identity", href: "/candidate/profile", icon: Fingerprint },
    { name: "Evidence", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Provenance", href: "/candidate/provenance", icon: Network },
    { name: "Verification", href: "/candidate/verification", icon: ShieldCheck },
  ];

  const employerItems: NavItem[] = [
    { name: "Identity", href: "#", icon: Activity, disabled: true },
    { name: "Evidence", href: "#", icon: FileText, disabled: true },
    { name: "Provenance", href: "/employer/dashboard", icon: Command },
    { name: "Verification", href: "#", icon: ShieldCheck, disabled: true },
  ];

  const adminItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard }
  ];

  const items: NavItem[] = role === "candidate" ? candidateItems : role === "employer" ? employerItems : adminItems;

  return (
    <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-[#E5E5E5] bg-[#FAFAFA] shrink-0">
      <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto" />
      
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-[#0D0D0D]"
        aria-label="Open mobile menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5E5E5] shrink-0">
              <img src="/logo-full.png" alt="Meritlane" className="h-6 w-auto" />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-[#0D0D0D]"
                aria-label="Close mobile menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div key={item.name} className="flex items-center px-4 py-4 text-[16px] font-sans text-[#D2D2D2] rounded-md">
                      <Icon className="mr-4 h-[20px] w-[20px] opacity-30" />
                      {item.name}
                    </div>
                  );
                }

                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-4 text-[16px] font-sans rounded-md transition-colors ${
                      isActive 
                        ? "text-[#0D0D0D] bg-[#FFFFFF] border border-[#E5E5E5]" 
                        : "text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF]/50"
                    }`}
                  >
                    <Icon className="mr-4 h-[20px] w-[20px]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
