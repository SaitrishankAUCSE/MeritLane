/**
 * Meritlane Firebase Client Configuration
 * Connected to project: meritlane
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAqoOSesm43txwsnprxhsY4RG7PSVRfeyw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "meritlane.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "meritlane",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "meritlane.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "591024444735",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:591024444735:web:e4c75c2c96cb406d0b6f8a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BS1DB89WPZ",
};
