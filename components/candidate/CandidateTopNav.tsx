"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Command, Settings, HelpCircle, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function CandidateTopNav() {
  const { user, handleSignOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName?.split(" ")[0] || "User";
  const avatarUrl = user?.photoURL || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFeatureClick = () => {
    alert("This feature is currently in development and will be available soon.");
  };

  return (
    <header className="hidden lg:flex h-20 shrink-0 items-center justify-end px-12 border-b border-[#272a2f] bg-[#0b0c0e]">
      <div className="flex items-center gap-6 text-[#8e928f]">
        <button onClick={handleFeatureClick} className="hover:text-white transition-colors" title="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button onClick={handleFeatureClick} className="hover:text-white transition-colors" title="Command Palette">
          <Command className="h-[18px] w-[18px]" />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            className={`h-8 w-8 rounded-full bg-[#1b1c1e] border ${showDropdown ? 'border-white' : 'border-[#272a2f] hover:border-[#8e928f]'} flex items-center justify-center ml-2 overflow-hidden text-xs transition-colors`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : name.charAt(0).toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-[#111316] border border-[#272a2f] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-up">
              <div className="px-4 py-3 border-b border-[#272a2f]">
                <p className="text-[13px] text-white font-medium truncate">{user?.displayName || "User"}</p>
                <p className="text-[11px] text-[#8e928f] truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link 
                  href="/candidate/settings" 
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#c4c7c5] hover:text-white hover:bg-[#1b1c1e] transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link 
                  href="/candidate/support" 
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#c4c7c5] hover:text-white hover:bg-[#1b1c1e] transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  Support
                </Link>
              </div>
              <div className="border-t border-[#272a2f] py-1">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    handleSignOut();
                  }} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ffb4ab] hover:bg-[#2a1111] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
