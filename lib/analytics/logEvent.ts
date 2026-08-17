import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/config";

export const logFunnelEvent = (eventName: string, metadata?: Record<string, any>) => {
  try {
    // Fire and forget - do not await
    const uid = auth.currentUser?.uid || null;
    
    addDoc(collection(db, "funnel_events"), {
      event: eventName,
      uid,
      timestamp: serverTimestamp(),
      ...metadata
    }).catch(err => {
      // Silently swallow errors so we don't break the user flow
      console.warn("Failed to log funnel event:", err);
    });
  } catch (err) {
    // Catch any synchronous errors (e.g. auth not initialized)
    console.warn("Failed to initiate funnel event log:", err);
  }
};
