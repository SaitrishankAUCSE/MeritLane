"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Mail, Key, ShieldAlert } from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export default function SettingsPage() {
  const { user, userProfile, loading, profileLoading, handleSignOut } = useAuth();
  const router = useRouter();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!loading && !profileLoading && (!user || !userProfile)) {
      router.push("/login");
    }
  }, [user, loading, profileLoading, router]);

  if (loading || (user && profileLoading)) {
    return <div className="min-h-[50vh]"></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 h-full overflow-y-auto scrollbar-hide">
      <div className="border-b border-[#E5E5E5] pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0D0D0D] sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-sm text-[#737373]">
          Manage your account preferences and session credentials.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D]">Profile &amp; Credentials</h2>
            <p className="mt-1 text-xs text-[#666666]">Your verified identity details on Meritlane.</p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E5E5] pb-4">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </span>
                <span className="font-medium text-[#0D0D0D] sm:text-right">{user.email}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E5E5] pb-4">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Workspace Role
                </span>
                <span className="capitalize font-semibold text-[#0D0D0D]">{userProfile?.role || "Candidate"}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <span className="font-semibold text-[#737373] flex items-center gap-2">
                  <Key className="h-4 w-4" /> Authentication Method
                </span>
                <span className="capitalize font-medium text-[#0D0D0D]">{userProfile?.authProvider || "password"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Security Block */}
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D]">Password &amp; Security</h2>
            <p className="mt-1 text-xs text-[#666666]">Manage your security settings and authentication methods.</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Change Password</span>
                <span className="block text-xs text-[#666666]">Update your account password</span>
              </div>
              <button disabled className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#E5E5E5] bg-[#FAFAFA] text-[#D2D2D2] rounded-md transition-colors cursor-not-allowed" title="Coming soon">
                Coming Soon
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Two-Factor Authentication</span>
                <span className="block text-xs text-[#666666]">Add an extra layer of security to your account</span>
              </div>
              <button disabled className="text-xs font-semibold uppercase tracking-widest px-4 py-2 bg-[#F3F3F1] text-[#D2D2D2] rounded-md transition-colors cursor-not-allowed" title="Coming soon">
                Coming Soon
              </button>
            </div>
          </div>
        </div>



        {/* Professional Session Management Block */}
        <div className="border border-[#E5E5E5] bg-[#FFFFFF] rounded-xl overflow-hidden">
          <div className="border-b border-[#E5E5E5] px-6 py-5">
            <h2 className="text-base font-bold text-[#0D0D0D] flex items-center gap-2">
              Session Management
            </h2>
            <p className="mt-1 text-xs text-[#666666]">
              Control your active session or permanently erase your verified identity record.
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            
            {/* Sign Out Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1 mb-4 sm:mb-0">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Sign Out</span>
                <span className="block text-xs text-[#666666]">Securely end your current session on this device.</span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#E5E5E5] hover:bg-[#F3F3F1] text-[#0D0D0D] rounded-md transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>

            {/* Delete Account Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="space-y-1 mb-4 sm:mb-0">
                <span className="block text-sm font-semibold text-[#0D0D0D]">Delete Account</span>
                <span className="block text-xs text-[#666666]">Permanently remove your identity and destroy all evidence.</span>
              </div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs font-semibold uppercase tracking-widest px-4 py-2 text-[#737373] hover:text-[#0D0D0D] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => alert("Account deletion requires an email request to privacy@meritlane.app during the beta phase.")}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#B42318] bg-[#B42318]/10 text-[#B42318] hover:bg-[#B42318] hover:text-[#FFFFFF] rounded-md transition-colors shadow-sm"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Confirm Deletion
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#E5E5E5] bg-[#FAFAFA] text-[#D2D2D2] rounded-md transition-colors cursor-not-allowed" title="Coming soon"
                >
                  Coming Soon
                </button>
              )}
            </div>
            
          </div>
        </div>
        
      </div>
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onConfirm={handleSignOut} 
        onCancel={() => setShowLogoutModal(false)} 
      />
    </div>
  );
}
