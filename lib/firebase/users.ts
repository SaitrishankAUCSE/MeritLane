import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "./config";

export type Role = "candidate" | "employer";

export interface UserProfile {
  email: string;
  role: Role;
  displayName: string;
  authProvider: "password" | "google";
  createdAt?: string | FieldValue;
  lastLoginAt?: string | FieldValue;
}

export async function createUserProfile(uid: string, profile: Omit<UserProfile, "createdAt" | "lastLoginAt">): Promise<void> {
  const userRef = doc(db, "users", uid);
  
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
}

export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
}
