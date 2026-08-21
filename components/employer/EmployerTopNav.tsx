"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Network, Command } from "lucide-react";
import { usePathname } from "next/navigation";

export function EmployerTopNav() {
  const { user, handleSignOut } = useAuth();
  const pathname = usePathname();
  const avatarUrl = user?.photoURL || "";

  return (
    <header className="hidden lg:flex h-20 shrink-0 items-center justify-end px-12 border-b border-[#272a2f] bg-[#0b0c0e]">
      <div className="flex items-center gap-6 text-[#8e928f] pr-4">
        <Bell className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
        <Network className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
        <div className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] flex items-center justify-center overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" onClick={handleSignOut}>
          {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <Command className="h-4 w-4" />}
        </div>
      </div>
    </header>
  );
}
