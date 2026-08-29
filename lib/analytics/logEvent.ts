import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";
import posthog from "posthog-js";

export const logFunnelEvent = (eventName: string, metadata?: Record<string, any>) => {
  try {
    // Fire and forget - do not await
    const uid = auth.currentUser?.uid || null;
    
    // Log to PostHog
    if (typeof window !== "undefined") {
      posthog.capture(eventName, {
        distinct_id: uid,
        ...metadata
      });
    }
    
    addDoc(collection(db, "funnel_events"), {
      event: eventName,
      uid,
      timestamp: serverTimestamp(),
      ...metadata
    }).catch(err => {
      // Silently swallow errors so we don't break the user flow
      console.warn("Failed to log funnel event to Firestore:", err);
    });
  } catch (err) {
    // Catch any synchronous errors (e.g. auth not initialized)
    console.warn("Failed to initiate funnel event log:", err);
  }
};
