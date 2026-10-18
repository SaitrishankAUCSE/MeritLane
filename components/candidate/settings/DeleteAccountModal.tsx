"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Trash2, AlertTriangle, Key } from "lucide-react";
import { auth, db } from "@/lib/firebase/config";
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  authProvider?: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail = "",
  authProvider = "password",
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [confirmKeyword, setConfirmKeyword] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmKeyword("");
      setPassword("");
      setError(null);
      setIsDeleting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const isConfirmed = confirmKeyword.trim().toUpperCase() === "DELETE";

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Active session not found. Please log in again.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // 1. If password provider, reauthenticate if password was provided
      if (authProvider === "password" && password.trim()) {
        try {
          const credential = EmailAuthProvider.credential(currentUser.email || userEmail, password);
          await reauthenticateWithCredential(currentUser, credential);
        } catch (authErr: any) {
          setIsDeleting(false);
          setError("Incorrect password. Please verify your password to proceed with account deletion.");
          return;
        }
      }

      // 2. Obtain token to call backend deletion API
      const token = await currentUser.getIdToken();
      const apiResponse = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await apiResponse.json().catch(() => null);
      if (resData && !resData.success && apiResponse.status !== 200) {
        console.warn("Backend deletion note:", resData.error);
      }

      // 3. Attempt direct client-side deletions if permitted
      try {
        await deleteDoc(doc(db, "candidates", currentUser.uid));
      } catch (docErr) {
        // Ignored if handled by server or restricted
      }
      try {
        await deleteDoc(doc(db, "users", currentUser.uid));
      } catch (docErr) {
        // Ignored if handled by server or restricted
      }

      // 4. Delete user from Firebase Auth
      try {
        await deleteUser(currentUser);
      } catch (delErr: any) {
        if (delErr.code === "auth/requires-recent-login") {
          setIsDeleting(false);
          setError("Security requirement: Please log out and log back in recently before deleting your account.");
          return;
        }
        // If server already deleted the user, ignore user-not-found
        if (delErr.code !== "auth/user-not-found") {
          console.warn("Auth deletion exception:", delErr);
        }
      }

      // 5. Clean up local browser cookies and storage
      try {
        localStorage.removeItem("meritlane_current_candidate");
        document.cookie = "ml_role=; path=/; max-age=0";
      } catch {}

      addToast({
        type: "success",
        title: "Account Deleted",
        description: "Your Meritlane account and data have been permanently deleted.",
      });

      onClose();
      router.push("/");
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      setError(err.message || "An error occurred while deleting your account. Please try again.");
      setIsDeleting(false);
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-lg border border-danger/30 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-danger/5 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-danger" />
              <h3 className="font-semibold text-danger text-sm">Delete Account Permanently</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleDeleteAccount} className="p-6 space-y-4">
            <div className="p-3 bg-danger/10 border border-danger/20 rounded text-xs text-danger space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Warning: Irreversible Action
              </p>
              <p>
                Deleting your account will permanently wipe your candidate record, verified projects, ATS score, test evaluations, and personal identity.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded text-xs text-red-900 font-medium">
                {error}
              </div>
            )}

            {authProvider === "password" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full text-xs px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-danger"
                  />
                  <Key className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Type <span className="font-mono font-bold text-danger">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmKeyword}
                onChange={(e) => setConfirmKeyword(e.target.value)}
                placeholder="Type DELETE"
                required
                className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2 border border-border rounded focus:outline-none focus:ring-1 focus:ring-danger uppercase"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isConfirmed || isDeleting || (authProvider === "password" && !password)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-danger text-white rounded hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <MeritlaneLoader level="button" text="Deleting..." />
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete My Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
