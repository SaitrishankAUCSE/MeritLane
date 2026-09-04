"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UnsavedChangesGuardProps {
  isDirty: boolean;
  message?: string;
  onConfirmLeave?: () => void;
}

interface UnsavedChangesModalProps {
  message: string;
  onStay: () => void;
  onLeave: () => void;
}

function UnsavedChangesModal({ message, onStay, onLeave }: UnsavedChangesModalProps) {
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stayRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStay();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onStay]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      aria-describedby="unsaved-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E7E2DA] shadow-2xl overflow-hidden">
        <div className="p-7">
          <h2
            id="unsaved-title"
            className="text-[18px] font-semibold text-[#1C1917] mb-2 leading-tight"
          >
            Unsaved changes
          </h2>
          <p id="unsaved-desc" className="text-[14px] text-[#78716C] leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              ref={stayRef}
              onClick={onStay}
              className="w-full h-11 bg-[#1C1917] text-white text-[14px] font-semibold rounded-xl
                         hover:bg-[#292524] transition-colors focus:outline-none focus:ring-2
                         focus:ring-[#1C1917] focus:ring-offset-2"
            >
              Continue Editing
            </button>
            <button
              onClick={onLeave}
              className="w-full h-11 border border-[#E7E2DA] text-[#78716C] text-[14px] font-semibold rounded-xl
                         hover:border-[#B42318] hover:text-[#B42318] transition-colors focus:outline-none focus:ring-2
                         focus:ring-[#B42318] focus:ring-offset-2"
            >
              Leave Without Saving
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * UnsavedChangesGuard
 *
 * Renders a confirmation modal when the user attempts to navigate away
 * while `isDirty` is true.
 *
 * Usage:
 *   const [isDirty, setIsDirty] = useState(false);
 *   const { guardedNavigate, GuardModal } = useUnsavedChanges(isDirty);
 *
 *   // Replace router.push with guardedNavigate
 *   <button onClick={() => guardedNavigate("/candidate/dashboard")}>Cancel</button>
 *   <GuardModal />
 */

interface UseUnsavedChangesReturn {
  guardedNavigate: (href: string) => void;
  GuardModal: () => React.ReactElement | null;
}

export function useUnsavedChanges(
  isDirty: boolean,
  message = "You have changes that haven't been saved. Do you want to leave without saving?"
): UseUnsavedChangesReturn {
  const router = useRouter();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  // Note: We deliberately avoid window.addEventListener("beforeunload", ...) to prevent
  // the intrusive native browser "Leave site? Changes you made may not be saved." popup on logouts.
  // In-app navigation is safely guarded via guardedNavigate and GuardModal.

  const guardedNavigate = (href: string) => {
    if (isDirty) {
      setPendingHref(href);
    } else {
      router.push(href);
    }
  };

  const handleStay = () => setPendingHref(null);

  const handleLeave = () => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) router.push(href);
  };

  const GuardModal = () => {
    if (!pendingHref) return null;
    return (
      <UnsavedChangesModal
        message={message}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    );
  };

  return { guardedNavigate, GuardModal };
}

export default useUnsavedChanges;
