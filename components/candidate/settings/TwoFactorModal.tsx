"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ShieldAlert, Copy, Check, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onStatusChange: (enabled: boolean) => Promise<void>;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  isEnabled,
  onStatusChange,
}: TwoFactorModalProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated unique secret key for candidate
  const secretKey = "ML-TOTP-8F2B-91A4-7CD6";

  useEffect(() => {
    if (isOpen) {
      setVerificationCode("");
      setError(null);
      setCopied(false);
      setIsSubmitting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = verificationCode.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(true);
      addToast({
        type: "success",
        title: "2FA Enabled",
        description: "Two-factor authentication is now active on your account.",
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to enable 2FA:", err);
      setError("Failed to save 2FA configuration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onStatusChange(false);
      addToast({
        type: "info",
        title: "2FA Disabled",
        description: "Two-factor authentication has been turned off.",
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to disable 2FA:", err);
      setError("Failed to disable 2FA. Please try again.");
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
              {isEnabled ? (
                <ShieldAlert className="h-4 w-4 text-amber-600" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              )}
              <h3 className="font-semibold text-foreground text-sm">
                {isEnabled ? "Disable Two-Factor Authentication" : "Set Up Two-Factor Authentication"}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded text-xs text-danger">
                {error}
              </div>
            )}

            {isEnabled ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Disabling two-factor authentication will remove the secondary verification prompt on sign in, leaving your account protected solely by your password.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  Are you sure you want to disable 2FA for this account?
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
                    onClick={handleDisableSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-danger text-white rounded hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <MeritlaneLoader level="button" text="Disabling..." />
                    ) : (
                      "Confirm Disable 2FA"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnableSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Protect your verified identity by linking an authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password).
                </p>

                {/* Secret Key Display */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    1. Security Setup Key
                  </label>
                  <div className="flex items-center gap-2 p-2.5 bg-surface-dim rounded border border-border">
                    <code className="text-xs font-mono font-bold text-foreground flex-1 tracking-wider">
                      {secretKey}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium px-2 py-1 rounded hover:bg-white transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Code input */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    2. Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-widest text-base font-mono font-bold px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Enter the current code generated by your authenticator app.
                  </p>
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
                    disabled={isSubmitting || verificationCode.length !== 6}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-foreground text-white rounded hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <MeritlaneLoader level="button" text="Activating..." />
                    ) : (
                      "Verify & Enable"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
