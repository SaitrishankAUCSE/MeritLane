"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { 
  sendPasswordResetEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { useToast } from "@/components/ui/Toast";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function ChangePasswordModal({ isOpen, onClose, userEmail }: ChangePasswordModalProps) {
  const { addToast } = useToast();
  const [tab, setTab] = useState<"direct" | "reset">("direct");
  
  // Direct change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset inputs when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSendResetEmail = async () => {
    if (!userEmail) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, userEmail);
      setSuccessMessage(`Password reset link sent to ${userEmail}. Follow the instructions in the email.`);
      addToast({
        type: "success",
        title: "Reset Email Sent",
        description: `A password reset link has been dispatched to ${userEmail}.`,
      });
    } catch (err: any) {
      console.error("Password reset error:", err);
      const msg = err.code === "auth/too-many-requests" 
        ? "Too many requests. Please wait a moment before trying again."
        : err.message || "Failed to send password reset email.";
      setError(msg);
      addToast({
        type: "error",
        title: "Request Failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setError("User session not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Reauthenticate current user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Update to new password
      await updatePassword(currentUser, newPassword);

      setSuccessMessage("Your password has been changed successfully.");
      addToast({
        type: "success",
        title: "Password Updated",
        description: "Your account password was updated successfully.",
      });

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error("Update password error:", err);
      let msg = "Failed to update password.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "The current password you entered is incorrect.";
      } else if (err.code === "auth/weak-password") {
        msg = "The new password is too weak. Please use letters and numbers.";
      } else if (err.code === "auth/requires-recent-login") {
        msg = "Please sign in again before changing your password.";
      }
      setError(msg);
      addToast({
        type: "error",
        title: "Password Change Failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-lg border border-border shadow-xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-foreground" />
              <h3 className="font-semibold text-foreground text-sm">Security & Password</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-border bg-surface-dim/40 text-xs font-medium">
            <button
              onClick={() => { setTab("direct"); setError(null); }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                tab === "direct"
                  ? "border-primary font-semibold text-foreground bg-white"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Enter New Password
            </button>
            <button
              onClick={() => { setTab("reset"); setError(null); }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                tab === "reset"
                  ? "border-primary font-semibold text-foreground bg-white"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Email Reset Link
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded text-xs text-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {tab === "direct" ? (
              <form onSubmit={handleDirectPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full text-xs px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      className="w-full text-xs px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full text-xs px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-foreground text-white rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <MeritlaneLoader level="button" text="Updating..." />
                    ) : (
                      "Save Password"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the button below to send a secure password reset link to your verified email address:
                </p>
                <div className="p-3 bg-surface rounded border border-border flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{userEmail}</span>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-foreground text-white rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <MeritlaneLoader level="button" text="Sending..." />
                    ) : (
                      "Send Reset Email"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
