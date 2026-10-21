"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Mail, Building2, Key, LogOut, ShieldCheck, Bell } from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { Button } from "@/components/ui/Button";

export default function EmployerSettingsPage() {
  const { user, userProfile, handleSignOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="w-full min-h-full bg-transparent pb-24 text-[#101010]">
      {/* ── Flush Header Strip ── */}
      <div className="border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-[10px] font-medium tracking-[0.16em] text-[#737373] uppercase mb-1">
            Account Preferences · Employer Portal
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#101010] tracking-[-0.03em] leading-tight">
            Employer Settings
          </h1>
          <p className="text-[13px] text-[#737373] font-sans mt-0.5">
            Manage your recruiting account, hiring team preferences, and platform credentials.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">

        {/* Organization & Account Info */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#737373]" /> Organization Identity
            </h2>
          </div>
          <div className="p-6 space-y-4 text-[13px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <Mail className="h-4 w-4" /> Recruiter Email
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#101010]">{user?.email || "employer@example.com"}</span>
                {user?.emailVerified ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">VERIFIED</span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">UNVERIFIED</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#101010]" /> Access Role
              </span>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-mono text-[#101010] bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.08]">
                Verified Employer
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="font-medium text-[#737373] flex items-center gap-2">
                <Key className="h-4 w-4" /> Authentication Method
              </span>
              <span className="font-medium text-[#101010] capitalize">
                {userProfile?.authProvider || "Firebase Auth"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010]">Contact Information</h2>
            <p className="mt-1 text-[12px] text-[#737373]">Manage your company contact details for candidates and platform notifications.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-[#101010]">Company Phone Number</span>
                <span className="block text-[12px] text-[#737373]">Add a phone number for direct urgent candidate communication.</span>
              </div>
              <button className="text-xs font-medium px-4 py-2 border border-black/[0.12] hover:bg-black/[0.04] text-[#101010] rounded-full transition-colors cursor-pointer">
                Add Phone
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-[#101010]">Billing Email</span>
                <span className="block text-[12px] text-[#737373]">Add a specific email address for invoices and receipts.</span>
              </div>
              <button className="text-xs font-medium px-4 py-2 border border-black/[0.12] hover:bg-black/[0.04] text-[#101010] rounded-full transition-colors cursor-pointer">
                Add Email
              </button>
            </div>
          </div>
        </div>

        {/* Password & Security */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010]">Password & Security</h2>
            <p className="mt-1 text-[12px] text-[#737373]">Manage your security settings and authentication methods.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-[#101010]">Change Password</span>
                <span className="block text-[12px] text-[#737373]">Update your recruiter account password.</span>
              </div>
              <button className="text-xs font-medium px-4 py-2 border border-black/[0.12] hover:bg-black/[0.04] text-[#101010] rounded-full transition-colors cursor-pointer">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-[#101010]">Two-Factor Authentication</span>
                <span className="block text-[12px] text-[#737373]">Require a security code on sign in for the entire workspace.</span>
              </div>
              <button className="text-xs font-medium px-4 py-2 border border-black/[0.12] hover:bg-black/[0.04] text-[#101010] rounded-full transition-colors cursor-pointer">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Verification Engine Config */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#101010]" /> Technical Evaluation Engine
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#101010]">Code & Provenance Verification</p>
                <p className="text-[12px] text-[#737373] font-sans">
                  Automated architectural code audits, timed test suite proctoring, and GitHub commit graph verification.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#101010] bg-black/[0.04] border border-black/[0.08] px-3 py-1 rounded-full">
                Active Protocol
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#737373]" /> Communications & Notifications
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#101010]">Candidate Message Replies</p>
                <p className="text-[12px] text-[#737373]">
                  Receive email alerts when a candidate responds to your interview invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  emailNotifications ? "bg-[#101010]" : "bg-black/[0.12]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Session Actions */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-black/[0.08] bg-black/[0.02]">
            <h2 className="text-[15px] font-bold text-[#101010]">Session Management</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#101010]">Sign Out</p>
              <p className="text-[12px] text-[#737373]">End your active session securely on this browser.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
