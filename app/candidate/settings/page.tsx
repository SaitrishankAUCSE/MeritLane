"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
  Key, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Shield
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { ChangePasswordModal } from "@/components/candidate/settings/ChangePasswordModal";
import { TwoFactorModal } from "@/components/candidate/settings/TwoFactorModal";
import { DeleteAccountModal } from "@/components/candidate/settings/DeleteAccountModal";
import { useToast } from "@/components/ui/Toast";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import { fetchCandidateProfile } from "@/lib/firebase/candidate";
import { sendEmailVerification } from "firebase/auth";

export default function SettingsPage() {
  const { user, userProfile, loading, profileLoading, handleSignOut, refreshProfile } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  // Modal visibility states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [isRefreshingAuth, setIsRefreshingAuth] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Profile contact & security states
  const [phone, setPhone] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Inline edit modes
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [isEditingSecondaryEmail, setIsEditingSecondaryEmail] = useState(false);
  const [secondaryEmailInput, setSecondaryEmailInput] = useState("");
  const [isSavingSecondaryEmail, setIsSavingSecondaryEmail] = useState(false);

  // Protect route
  useEffect(() => {
    if (!loading && !profileLoading && (!user || !userProfile)) {
      router.push("/");
    }
  }, [user, loading, profileLoading, router]);

  // Sync initial email verification status
  useEffect(() => {
    if (user) {
      setIsEmailVerified(Boolean(user.emailVerified));
    }
  }, [user]);

  // Load existing contact and security settings from Firestore
  useEffect(() => {
    const currentUid = user?.uid;
    if (!currentUid) return;

    let isMounted = true;
    async function loadSettings(targetUid: string) {
      setIsLoadingSettings(true);
      try {
        // 1. Fetch from candidates collection
        const candData = await fetchCandidateProfile(targetUid);
        
        // 2. Fetch from users collection fallback
        const userDocSnap = await getDoc(doc(db, "users", targetUid));
        const userData = userDocSnap.exists() ? userDocSnap.data() : null;

        if (isMounted) {
          const resolvedPhone = candData?.phone || userData?.phone || "";
          const resolvedSecondaryEmail = candData?.secondaryEmail || userData?.secondaryEmail || "";
          const resolved2FA = Boolean(candData?.twoFactorEnabled ?? userData?.twoFactorEnabled ?? false);

          setPhone(resolvedPhone);
          setPhoneInput(resolvedPhone);
          setSecondaryEmail(resolvedSecondaryEmail);
          setSecondaryEmailInput(resolvedSecondaryEmail);
          setTwoFactorEnabled(resolved2FA);
        }
      } catch (err) {
        console.warn("Failed to load settings:", err);
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    }

    loadSettings(currentUid);
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Handle email cooldown timer
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // ── Actions ────────────────────────────────────────────────────────────────

  // 1. Send Email Verification
  const handleVerifyEmail = async () => {
    if (!user || isVerifyingEmail || emailCooldown > 0) return;
    setIsVerifyingEmail(true);

    try {
      await sendEmailVerification(user);
      setEmailCooldown(60);
      addToast({
        type: "success",
        title: "Verification Email Sent",
        description: `A verification link has been sent to ${user.email}. Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      console.error("Email verification error:", err);
      const msg = err.code === "auth/too-many-requests"
        ? "Please wait a moment before requesting another verification email."
        : err.message || "Failed to send verification email.";
      addToast({
        type: "error",
        title: "Verification Failed",
        description: msg,
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Check email verification status in real time
  const handleRefreshEmailStatus = async () => {
    if (!user) return;
    setIsRefreshingAuth(true);
    try {
      await user.reload();
      const updatedUser = auth.currentUser;
      const verified = Boolean(updatedUser?.emailVerified);
      setIsEmailVerified(verified);
      if (verified) {
        addToast({
          type: "success",
          title: "Email Verified",
          description: "Your email address has been verified successfully!",
        });
        refreshProfile();
      } else {
        addToast({
          type: "info",
          title: "Still Unverified",
          description: "Your email is not verified yet. Check the verification link in your inbox.",
        });
      }
    } catch (err) {
      console.error("Failed to reload user auth:", err);
    } finally {
      setIsRefreshingAuth(false);
    }
  };

  // 2. Save Phone Number
  const handleSavePhone = async () => {
    if (!user?.uid) return;
    const cleanPhone = phoneInput.trim();
    if (cleanPhone && cleanPhone.length < 7) {
      addToast({
        type: "error",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with area code.",
      });
      return;
    }

    setIsSavingPhone(true);
    try {
      await Promise.allSettled([
        setDoc(doc(db, "users", user.uid), { phone: cleanPhone }, { merge: true }),
        setDoc(doc(db, "candidates", user.uid), { phone: cleanPhone }, { merge: true }),
      ]);

      setPhone(cleanPhone);
      setIsEditingPhone(false);
      addToast({
        type: "success",
        title: "Phone Number Updated",
        description: cleanPhone ? "Your contact phone number has been saved." : "Phone number removed.",
      });
    } catch (err: any) {
      console.error("Save phone error:", err);
      addToast({
        type: "error",
        title: "Save Failed",
        description: "Failed to update phone number. Please try again.",
      });
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Remove Phone Number
  const handleRemovePhone = async () => {
    if (!user?.uid) return;
    setIsSavingPhone(true);
    try {
      await Promise.allSettled([
        setDoc(doc(db, "users", user.uid), { phone: "" }, { merge: true }),
        setDoc(doc(db, "candidates", user.uid), { phone: "" }, { merge: true }),
      ]);
      setPhone("");
      setPhoneInput("");
      setIsEditingPhone(false);
      addToast({
        type: "info",
        title: "Phone Removed",
        description: "Your phone number has been removed.",
      });
    } catch (err) {
      console.error("Failed to remove phone:", err);
    } finally {
      setIsSavingPhone(false);
    }
  };

  // 3. Save Secondary Email
  const handleSaveSecondaryEmail = async () => {
    if (!user?.uid) return;
    const cleanEmail = secondaryEmailInput.trim().toLowerCase();

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        addToast({
          type: "error",
          title: "Invalid Email",
          description: "Please enter a valid secondary email address.",
        });
        return;
      }
      if (cleanEmail === user.email?.toLowerCase()) {
        addToast({
          type: "error",
          title: "Email Conflict",
          description: "Secondary email must be different from your primary login email.",
        });
        return;
      }
    }

    setIsSavingSecondaryEmail(true);
    try {
      await Promise.allSettled([
        setDoc(doc(db, "users", user.uid), { secondaryEmail: cleanEmail }, { merge: true }),
        setDoc(doc(db, "candidates", user.uid), { secondaryEmail: cleanEmail }, { merge: true }),
      ]);

      setSecondaryEmail(cleanEmail);
      setIsEditingSecondaryEmail(false);
      addToast({
        type: "success",
        title: "Secondary Email Saved",
        description: cleanEmail ? "Your backup email has been configured." : "Secondary email removed.",
      });
    } catch (err) {
      console.error("Save secondary email error:", err);
      addToast({
        type: "error",
        title: "Save Failed",
        description: "Failed to update secondary email. Please try again.",
      });
    } finally {
      setIsSavingSecondaryEmail(false);
    }
  };

  // Remove Secondary Email
  const handleRemoveSecondaryEmail = async () => {
    if (!user?.uid) return;
    setIsSavingSecondaryEmail(true);
    try {
      await Promise.allSettled([
        setDoc(doc(db, "users", user.uid), { secondaryEmail: "" }, { merge: true }),
        setDoc(doc(db, "candidates", user.uid), { secondaryEmail: "" }, { merge: true }),
      ]);
      setSecondaryEmail("");
      setSecondaryEmailInput("");
      setIsEditingSecondaryEmail(false);
      addToast({
        type: "info",
        title: "Secondary Email Removed",
        description: "Your backup email has been removed.",
      });
    } catch (err) {
      console.error("Failed to remove secondary email:", err);
    } finally {
      setIsSavingSecondaryEmail(false);
    }
  };

  // 4. Update 2FA status
  const handleUpdate2FA = async (enabled: boolean) => {
    if (!user?.uid) return;
    await Promise.allSettled([
      setDoc(doc(db, "users", user.uid), { twoFactorEnabled: enabled }, { merge: true }),
      setDoc(doc(db, "candidates", user.uid), { twoFactorEnabled: enabled }, { merge: true }),
    ]);
    setTwoFactorEnabled(enabled);
  };

  if (loading || (user && profileLoading)) {
    return <div className="min-h-[50vh] flex items-center justify-center"><MeritlaneLoader level="section" text="Loading settings..." /></div>;
  }

  if (!user) {
    return null;
  }

  const isGoogleAccount = userProfile?.authProvider === "google";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-full overflow-y-auto scrollbar-hide">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your verified candidate identity, security preferences, and session credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Profile & Credentials */}
        <div className="border border-border bg-white rounded overflow-hidden shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-base font-bold text-foreground">Profile &amp; Credentials</h2>
            <p className="mt-1 text-xs text-muted-foreground">Your verified identity details on Meritlane.</p>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4 text-xs">
              {/* Email Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Primary Email Address
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{user.email}</span>
                    {isEmailVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> VERIFIED
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          UNVERIFIED
                        </span>
                        <button
                          type="button"
                          onClick={handleRefreshEmailStatus}
                          disabled={isRefreshingAuth}
                          title="Refresh verification status"
                          className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        >
                          <RefreshCw className={`h-3 w-3 ${isRefreshingAuth ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail || emailCooldown > 0}
                    className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    {isVerifyingEmail ? (
                      <MeritlaneLoader level="button" text="Sending..." />
                    ) : emailCooldown > 0 ? (
                      `Resend in ${emailCooldown}s`
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                )}
              </div>
              
              {/* Workspace Role */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-4">
                <span className="font-semibold text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Workspace Role
                </span>
                <span className="capitalize font-semibold text-foreground">
                  {userProfile?.role || "Candidate"}
                </span>
              </div>
              
              {/* Authentication Method */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <span className="font-semibold text-muted-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" /> Authentication Method
                </span>
                <span className="capitalize font-medium text-foreground">
                  {isGoogleAccount ? "Google OAuth" : "Email & Password"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="border border-border bg-white rounded overflow-hidden shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-base font-bold text-foreground">Contact Information</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage how employers and MeritLane can reach you.</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Phone Number Row */}
            <div className="border-b border-border pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="block text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Add a phone number for SMS notifications and employer outreach.
                  </p>
                  {!isEditingPhone && (
                    <div className="pt-1 text-xs font-medium text-foreground">
                      {phone ? (
                        <span className="font-mono text-xs">{phone}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No phone number added</span>
                      )}
                    </div>
                  )}
                </div>

                {!isEditingPhone && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {phone && (
                      <button
                        type="button"
                        onClick={handleRemovePhone}
                        disabled={isSavingPhone}
                        className="text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-danger rounded transition-colors"
                        title="Remove phone number"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneInput(phone);
                        setIsEditingPhone(true);
                      }}
                      className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors"
                    >
                      {phone ? "Update Phone" : "Add Phone"}
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Phone Edit Form */}
              {isEditingPhone && (
                <div className="mt-3 p-3 bg-surface-dim/40 border border-border rounded-md space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Phone Number (include country code)
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+1 (555) 000-0000 or +91 98765 43210"
                      className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      disabled={isSavingPhone}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={isSavingPhone}
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-foreground text-white rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSavingPhone ? <MeritlaneLoader level="button" text="Saving..." /> : "Save Phone"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary Email Row */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="block text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Secondary Email
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Add a backup email for account recovery and emergency notifications.
                  </p>
                  {!isEditingSecondaryEmail && (
                    <div className="pt-1 text-xs font-medium text-foreground">
                      {secondaryEmail ? (
                        <span>{secondaryEmail}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No backup email added</span>
                      )}
                    </div>
                  )}
                </div>

                {!isEditingSecondaryEmail && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {secondaryEmail && (
                      <button
                        type="button"
                        onClick={handleRemoveSecondaryEmail}
                        disabled={isSavingSecondaryEmail}
                        className="text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-danger rounded transition-colors"
                        title="Remove secondary email"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSecondaryEmailInput(secondaryEmail);
                        setIsEditingSecondaryEmail(true);
                      }}
                      className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors"
                    >
                      {secondaryEmail ? "Update Email" : "Add Email"}
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Secondary Email Edit Form */}
              {isEditingSecondaryEmail && (
                <div className="mt-3 p-3 bg-surface-dim/40 border border-border rounded-md space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Secondary Email Address
                    </label>
                    <input
                      type="email"
                      value={secondaryEmailInput}
                      onChange={(e) => setSecondaryEmailInput(e.target.value)}
                      placeholder="backup@example.com"
                      className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSecondaryEmail(false)}
                      disabled={isSavingSecondaryEmail}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSecondaryEmail}
                      disabled={isSavingSecondaryEmail}
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-foreground text-white rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSavingSecondaryEmail ? <MeritlaneLoader level="button" text="Saving..." /> : "Save Email"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Password & Security */}
        <div className="border border-border bg-white rounded overflow-hidden shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-base font-bold text-foreground">Password &amp; Security</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage your credentials, login methods, and multi-factor authentication.</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">Change Password</span>
                <span className="block text-xs text-muted-foreground">
                  {isGoogleAccount 
                    ? "Your account uses Google OAuth. Password updates are managed directly through Google."
                    : "Update your account password or send a secure reset link to your email."}
                </span>
              </div>
              {isGoogleAccount ? (
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors self-start sm:self-auto"
                >
                  <span>Google Security</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors self-start sm:self-auto"
                >
                  Update
                </button>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Two-Factor Authentication</span>
                  {twoFactorEnabled ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground bg-surface-dim px-2 py-0.5 rounded border border-border">
                      DISABLED
                    </span>
                  )}
                </div>
                <span className="block text-xs text-muted-foreground">
                  Add an extra layer of security to your verified Meritlane identity.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTwoFactorModal(true)}
                className={`text-xs font-semibold uppercase tracking-widest px-4 py-2 border rounded-md transition-colors self-start sm:self-auto ${
                  twoFactorEnabled
                    ? "border-border text-foreground hover:bg-surface-dim"
                    : "border-border bg-foreground text-white hover:bg-foreground/90"
                }`}
              >
                {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Professional Session Management */}
        <div className="border border-border bg-white rounded overflow-hidden shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              Session Management
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Control your active session or permanently erase your verified identity record.
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            
            {/* Sign Out Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">Sign Out</span>
                <span className="block text-xs text-muted-foreground">Securely end your current session on this device.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-border hover:bg-surface-dim text-foreground rounded-md transition-colors self-start sm:self-auto"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>

            {/* Delete Account Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="block text-sm font-semibold text-danger">Delete Account</span>
                <span className="block text-xs text-muted-foreground">Permanently remove your identity and destroy all project evidence and evaluations.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-danger/40 text-danger hover:bg-danger hover:text-white rounded-md transition-colors self-start sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Modals */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onConfirm={handleSignOut} 
        onCancel={() => setShowLogoutModal(false)} 
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={user.email || ""}
      />

      <TwoFactorModal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        isEnabled={twoFactorEnabled}
        onStatusChange={handleUpdate2FA}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={user.email || ""}
        authProvider={userProfile?.authProvider || "password"}
      />
    </div>
  );
}
