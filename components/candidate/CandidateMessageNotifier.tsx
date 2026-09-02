"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { auth } from "@/lib/firebase/config";
import { getIdToken } from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const POLL_INTERVAL_MS = 45_000; // 45 seconds
const STORAGE_KEY = "meritlane_last_message_count";

/**
 * Silently polls /api/messages every 45 seconds.
 * If new messages appear since last check, fires a toast notification.
 * Skips polling when the user is already on the inbox page.
 */
export function CandidateMessageNotifier() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCountRef = useRef<number>(
    parseInt(localStorage.getItem(STORAGE_KEY) ?? "-1", 10)
  );

  useEffect(() => {
    if (loading || !user) return;

    const poll = async () => {
      // Skip if already on inbox — they'll see messages directly
      if (pathname?.includes("/candidate/inbox")) return;

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await getIdToken(currentUser, false);
        const res = await fetch("/api/messages", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) return;

        const data = await res.json();
        const messages: { id: string; senderName: string; read: boolean }[] =
          data.messages || [];
        const totalCount = messages.length;
        const unreadMessages = messages.filter((m) => !m.read);
        const prev = lastCountRef.current;

        if (prev >= 0 && totalCount > prev) {
          // New message(s) arrived
          const newest = messages[0]; // sorted newest first by API
          toast({
            type: "message",
            title: "New message",
            description: newest?.senderName
              ? `${newest.senderName} sent you an interview invitation.`
              : `You have ${totalCount - prev} new message${totalCount - prev > 1 ? "s" : ""}.`,
            duration: 6000,
            action: {
              label: "Open inbox →",
              onClick: () => router.push("/candidate/inbox"),
            },
          });
        }

        lastCountRef.current = totalCount;
        localStorage.setItem(STORAGE_KEY, String(totalCount));
      } catch {
        // Silently ignore network errors during background polling
      }
    };

    // Initial poll after a short delay to let auth settle
    const initialDelay = setTimeout(poll, 3000);
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, loading, pathname, toast, router]);

  return null; // Renders nothing — side-effects only
}
