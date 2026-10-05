"use client";

import React, { useState, useRef } from "react";
import { CandidateAvatar, AvatarBadgeType } from "@/components/ui/CandidateAvatar";
import { UploadCloud, Camera, Check, ShieldCheck, Sparkles, AlertCircle, RefreshCw, X, Trash2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useToast } from "@/components/ui/Toast";

interface ProfilePhotoUploaderProps {
  currentAvatarUrl?: string | null;
  name: string;
  isEligibleForJob: boolean;
  verifiedCount: number;
  totalSkillsCount: number;
  currentBadgePreference?: AvatarBadgeType;
  onAvatarUpdated: (newUrl: string | null, badgePref: AvatarBadgeType) => void;
}

export function ProfilePhotoUploader({
  currentAvatarUrl,
  name,
  isEligibleForJob,
  verifiedCount,
  totalSkillsCount,
  currentBadgePreference = "auto",
  onAvatarUpdated,
}: ProfilePhotoUploaderProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [badgePreference, setBadgePreference] = useState<AvatarBadgeType>(currentBadgePreference);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Compress image on client canvas to 256x256 WebP/JPEG data URL (<40KB)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Unable to create canvas context"));
            return;
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          
          // Output compressed WebP (fallback JPEG)
          try {
            const dataUrl = canvas.toDataURL("image/webp", 0.85);
            resolve(dataUrl);
          } catch {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            resolve(dataUrl);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        title: "Invalid file type",
        description: "Please choose an image file (PNG, JPG, JPEG, or WebP).",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: "error",
        title: "File too large",
        description: "Profile image must be under 10MB.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const compressedDataUrl = await processImageFile(file);
      setAvatarUrl(compressedDataUrl);

      // Persist to Firestore & Auth safely
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;

        // Try auth profile update only if under 2048 chars, ignore auth photoURL size limits
        try {
          if (compressedDataUrl.length < 2000) {
            await updateProfile(auth.currentUser, { photoURL: compressedDataUrl });
          }
        } catch {
          // Auth profile length limit - Firestore is primary authority
        }

        // Always save to Firestore candidate profile
        try {
          await updateDoc(doc(db, "candidates", uid), {
            avatarUrl: compressedDataUrl,
            avatarBadge: badgePreference,
            updatedAt: Date.now(),
          });
        } catch {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(
            doc(db, "candidates", uid),
            {
              avatarUrl: compressedDataUrl,
              avatarBadge: badgePreference,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }

        try {
          await updateDoc(doc(db, "users", uid), {
            avatarUrl: compressedDataUrl,
            avatarBadge: badgePreference,
          });
        } catch {
          // Non-blocking
        }
      }

      onAvatarUpdated(compressedDataUrl, badgePreference);
      addToast({
        type: "success",
        title: "Profile photo updated",
        description: "Your official profile picture and verification tag are now live across Meritlane.",
      });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      addToast({
        type: "error",
        title: "Upload failed",
        description: err.message || "Failed to process profile photo. Please try another image.",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setIsProcessing(true);
    try {
      setAvatarUrl(null);
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: "" });
        } catch {}
        const uid = auth.currentUser.uid;
        await Promise.all([
          updateDoc(doc(db, "candidates", uid), {
            avatarUrl: "",
            updatedAt: Date.now(),
          }).catch(() => null),
          updateDoc(doc(db, "users", uid), {
            avatarUrl: "",
            photoURL: "",
          }).catch(() => null),
        ]);
      }
      onAvatarUpdated(null, badgePreference);
      addToast({
        type: "info",
        title: "Photo removed",
        description: "Your avatar has been reset to your initials monogram.",
      });
    } catch (err: any) {
      console.error("Failed to remove photo:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBadgeChange = async (newPref: AvatarBadgeType) => {
    setBadgePreference(newPref);
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await Promise.all([
          updateDoc(doc(db, "candidates", uid), {
            avatarBadge: newPref,
            updatedAt: Date.now(),
          }).catch(() => null),
          updateDoc(doc(db, "users", uid), {
            avatarBadge: newPref,
          }).catch(() => null),
        ]);
      }
      onAvatarUpdated(avatarUrl, newPref);
      addToast({
        type: "success",
        title: "Avatar badge updated",
        description: `Profile badge set to ${
          newPref === "auto"
            ? "Auto-Verified"
            : newPref === "job_ready"
            ? "Eligible for Job"
            : newPref === "in_verification"
            ? "Under Verification"
            : "None"
        }.`,
      });
    } catch (err) {
      console.error("Failed to update badge pref:", err);
    }
  };

  return (
    <div className="border border-[#E7E2DA] bg-white">
      <div className="border-b border-[#E7E2DA] bg-[#F5F1EB] px-5 py-3 flex items-center justify-between">
        <div className="text-[9px] font-medium tracking-[0.18em] text-[#78716C] uppercase">
          Profile Photo
        </div>
        {isEligibleForJob && (
          <span className="text-[9px] font-mono text-[#064E3B] font-semibold uppercase tracking-wider bg-[#064E3B]/10 px-2 py-0.5 rounded border border-[#064E3B]/20">
            Career Badge Active
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar with hover indicator */}
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Click to update headshot"
          >
            <CandidateAvatar
              avatarUrl={avatarUrl}
              name={name}
              size="lg"
              isEligibleForJob={isEligibleForJob}
              badgePreference="auto"
              showBadge={true}
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-serif text-[#1C1917] font-semibold truncate">
              {name}
            </div>
            <div className="text-[11px] font-sans text-[#78716C] mt-0.5">
              Official candidate portrait
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1917] hover:bg-[#064E3B] text-white text-[11px] font-mono font-semibold rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="h-3 w-3" />
                <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FAF8F5] border border-[#E7E2DA] text-[#B42318] hover:border-[#B42318] text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status Note */}
        <div className="pt-3 border-t border-[#F5F1EB]">
          {isEligibleForJob ? (
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#064E3B] bg-[#064E3B]/[0.06] border border-[#064E3B]/20 p-2.5 rounded">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>All {totalSkillsCount} skills verified. Career badge is displayed on your portrait across Meritlane.</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] border border-[#E7E2DA] p-2.5 rounded space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#57534E]">
                <span>Skills Verification Status</span>
                <span className="text-[#064E3B] font-mono font-bold">
                  {verifiedCount}/{totalSkillsCount} Verified
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] font-sans leading-relaxed">
                Career badge is awarded automatically once all {totalSkillsCount} skills assessments are verified (≥75% score).
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
        />
      </div>
    </div>
  );
}
