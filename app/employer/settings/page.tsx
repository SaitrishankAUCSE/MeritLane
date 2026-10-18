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
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="font-serif text-[26px] sm:text-[32px] font-bold text-foreground leading-tight">
            Employer Settings
          </h1>
          <p className="text-[13px] sm:text-[14px] text-muted-foreground font-sans mt-1">
            Manage your recruiting account, hiring team preferences, and platform credentials.
          </p>
        </div>

        {/* Organization & Account Info */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" /> Organization Identity
            </h2>
          </div>
          <div className="p-6 space-y-4 text-[13px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Recruiter Email
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{user?.email || "employer@example.com"}</span>
                {user?.emailVerified ? (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">VERIFIED</span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">UNVERIFIED</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" /> Access Role
              </span>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-medium text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-sm">
                Verified Employer
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4" /> Authentication Method
              </span>
              <span className="font-medium text-foreground capitalize">
                {userProfile?.authProvider || "Firebase Auth"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-foreground">Contact Information</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">Manage your company contact details for candidates and platform notifications.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-foreground">Company Phone Number</span>
                <span className="block text-[12px] text-muted-foreground">Add a phone number for direct urgent candidate communication.</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-[#FAFAFA] text-foreground rounded-md transition-colors">
                Add Phone
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-foreground">Billing Email</span>
                <span className="block text-[12px] text-muted-foreground">Add a specific email address for invoices and receipts.</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-[#FAFAFA] text-foreground rounded-md transition-colors">
                Add Email
              </button>
            </div>
          </div>
        </div>

        {/* Password & Security */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-foreground">Password & Security</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">Manage your security settings and authentication methods.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-foreground">Change Password</span>
                <span className="block text-[12px] text-muted-foreground">Update your recruiter account password.</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-[#FAFAFA] text-foreground rounded-md transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[14px] font-medium text-foreground">Two-Factor Authentication</span>
                <span className="block text-[12px] text-muted-foreground">Require a security code on sign in for the entire workspace.</span>
              </div>
              <button className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-[#FAFAFA] text-foreground rounded-md transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Verification Engine Config */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-border bg-surface">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-900" /> Technical Evaluation Engine
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-foreground">Code & Provenance Verification</p>
                <p className="text-[12px] text-muted-foreground font-sans">
                  Automated architectural code audits, timed test suite proctoring, and GitHub commit graph verification.
                </p>
              </div>
              <span className="text-[10px] font-medium font-bold uppercase tracking-wider text-emerald-900 bg-emerald-900/10 border border-emerald-900/20 px-2.5 py-1 rounded">
                Active Protocol
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" /> Communications & Notifications
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-foreground">Candidate Message Replies</p>
                <p className="text-[12px] text-muted-foreground">
                  Receive email alerts when a candidate responds to your interview invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 flex items-center rounded p-1 transition-colors ${
                  emailNotifications ? "bg-foreground" : "bg-border"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded shadow-md transform transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Session Actions */}
        <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-[#FAFAFA]">
            <h2 className="text-[15px] font-bold text-foreground">Session Management</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-foreground">Sign Out</p>
              <p className="text-[12px] text-muted-foreground">End your active session securely on this browser.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              className="gap-2 border-border hover:bg-surface-dim text-danger hover:text-danger"
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
