import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Missing required Firebase environment variable: ${envVar}`);
    // In production, we don't throw to avoid crashing the whole app silently,
    // but we log it loudly so it can be caught by AuthContext's error boundary.
  }
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: any;
let auth: any;
let db: any;

try {
  if (typeof window !== "undefined") {
    console.log("RUNTIME FIREBASE CONFIG:", {
      apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.slice(0, 6) + "..." : "MISSING",
      authDomain: firebaseConfig.authDomain || "MISSING",
      projectId: firebaseConfig.projectId || "MISSING",
      storageBucket: firebaseConfig.storageBucket || "MISSING",
    });
  }

  // Initialize Firebase for SSR and Client-side safety
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app, "default");
} catch (error) {
  console.error("FATAL ERROR: Failed to initialize Firebase App or Auth.", error);
}

export { app, auth, db };
