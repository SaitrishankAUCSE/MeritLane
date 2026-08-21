"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Network, Command, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export function EmployerTopNav() {
  const { user, handleSignOut } = useAuth();
  const pathname = usePathname();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName?.split(" ")[0] || "Employer";
  const avatarUrl = user?.photoURL || "";

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

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length <= 1) return null;
    
    const formatName = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
      <div className="flex items-center text-[12px] font-mono tracking-widest uppercase">
        <span className="text-[#8e928f] px-2">/</span>
        <span className="text-white font-medium">{formatName(paths[1])}</span>
      </div>
    );
  };

  return (
    <header className="hidden lg:flex h-20 shrink-0 items-center justify-between px-12 border-b border-[#272a2f] bg-[#0b0c0e]">
      <div className="flex items-center min-w-[120px]">
        {getBreadcrumbs()}
      </div>

      <div className="flex-1 flex justify-center px-8">
        <div 
          onClick={handleFeatureClick}
          className="flex items-center w-full max-w-md bg-[#111316] hover:bg-[#1b1c1e] border border-[#272a2f] hover:border-[#444846] transition-colors rounded-lg px-3 py-2 cursor-pointer"
        >
          <Command className="h-3.5 w-3.5 text-[#8e928f] mr-3" />
          <span className="text-[12px] text-[#8e928f] font-sans">Search candidates, proofs...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="bg-[#0b0c0e] text-[#8e928f] px-1.5 py-0.5 rounded text-[10px] border border-[#272a2f] font-sans">⌘</kbd>
            <kbd className="bg-[#0b0c0e] text-[#8e928f] px-1.5 py-0.5 rounded text-[10px] border border-[#272a2f] font-sans">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-[#8e928f] pr-4 min-w-[120px] justify-end">
        <button onClick={handleFeatureClick} className="hover:text-white transition-colors" title="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button onClick={handleFeatureClick} className="hover:text-white transition-colors" title="Network">
          <Network className="h-[18px] w-[18px]" />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            className={`h-8 w-8 rounded-full bg-[#1b1c1e] border ${showDropdown ? 'border-white' : 'border-[#272a2f] hover:border-[#8e928f]'} flex items-center justify-center ml-2 overflow-hidden text-xs transition-colors`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <Command className="h-4 w-4" />}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-[#111316] border border-[#272a2f] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-up">
              <div className="px-4 py-3 border-b border-[#272a2f]">
                <p className="text-[13px] text-white font-medium truncate">{user?.displayName || "Employer"}</p>
                <p className="text-[11px] text-[#8e928f] truncate">{user?.email}</p>
              </div>
              <div className="py-1">
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
