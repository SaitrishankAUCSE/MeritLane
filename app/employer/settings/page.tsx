"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Mail, Building2, Key, Sparkles, LogOut, ShieldCheck, Bell } from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { Button } from "@/components/ui/Button";

export default function EmployerSettingsPage() {
  const { user, userProfile, handleSignOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-y-auto">
      <div className="p-4 sm:p-8 lg:p-12 max-w-[850px] w-full mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="border-b border-[#E5E5E5] pb-6">
          <h1 className="font-serif text-[26px] sm:text-[32px] font-bold text-[#0D0D0D] leading-tight">
            Employer Settings
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#737373] font-sans mt-1">
            Manage your recruiting account, hiring team preferences, and platform credentials.
          </p>
        </div>

        {/* Organization & Account Info */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-[#0D0D0D] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#737373]" /> Organization Identity
            </h2>
          </div>
          <div className="p-6 space-y-4 text-[13px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <Mail className="h-4 w-4" /> Recruiter Email
              </span>
              <span className="font-semibold text-[#0D0D0D]">{user?.email || "employer@example.com"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" /> Access Role
              </span>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-mono text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-sm">
                Verified Employer
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <Key className="h-4 w-4" /> Authentication Method
              </span>
              <span className="font-medium text-[#0D0D0D] capitalize">
                {userProfile?.authProvider || "Firebase Auth"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Engine Config */}
        <div className="bg-white border border-[#E7E2DA] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-[#E7E2DA] bg-[#FAF8F5]">
            <h2 className="text-[15px] font-bold text-[#1C1917] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#064E3B]" /> Technical Evaluation Engine
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#1C1917]">Evidence & Provenance Synthesis</p>
                <p className="text-[12px] text-[#78716C] font-sans">
                  Automated architectural code audits, timed test suite proctoring, and GitHub commit graph verification.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 px-2.5 py-1 rounded-full">
                Active Protocol
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-[#0D0D0D] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#737373]" /> Communications & Notifications
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#0D0D0D]">Candidate Message Replies</p>
                <p className="text-[12px] text-[#737373]">
                  Receive email alerts when a candidate responds to your interview invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  emailNotifications ? "bg-[#0D0D0D]" : "bg-[#E5E5E5]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Session Actions */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-[#0D0D0D]">Session Management</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#0D0D0D]">Sign Out</p>
              <p className="text-[12px] text-[#737373]">End your active session securely on this browser.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              className="gap-2 border-[#E5E5E5] hover:bg-[#F3F3F1] text-[#B42318] hover:text-[#B42318]"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Button>
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
