"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Command } from "lucide-react";
import { usePathname } from "next/navigation";

export function CandidateTopNav() {
  const { user, handleSignOut } = useAuth();
  const pathname = usePathname();

  const name = user?.displayName?.split(" ")[0] || "User";
  const avatarUrl = user?.photoURL || "";

  return (
    <header className="hidden lg:flex h-20 shrink-0 items-center justify-end px-12 border-b border-[#272a2f] bg-[#0b0c0e]">
      <div className="flex items-center gap-6 text-[#8e928f]">
        <Bell className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
        <Command className="h-[18px] w-[18px] hover:text-white cursor-pointer transition-colors" />
        <div 
          className="h-8 w-8 rounded-full bg-[#1b1c1e] border border-[#272a2f] flex items-center justify-center ml-2 overflow-hidden text-xs cursor-pointer hover:border-[#8e928f] transition-colors" 
          onClick={handleSignOut}
        >
          {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
