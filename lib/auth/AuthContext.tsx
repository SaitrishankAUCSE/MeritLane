"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUserProfile, UserProfile, Role } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  role: Role | "admin" | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  profileLoading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | "admin" | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    try {
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore connection timed out. Check your network or adblocker.")), 8000)
      );
      const profile = await Promise.race([fetchUserProfile(uid), timeoutPromise]);
      
      if (profile) {
        setUserProfile(profile);
        setRole(profile.role);
      } else {
        setUserProfile(null);
        setRole(null);
      }
    } catch (error: any) {
      console.error("Failed to load user profile:", error);
      setAuthError("Failed to load user profile: " + error.message);
      setUserProfile(null);
      setRole(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const ADMIN_EMAIL = "saitrishankb9@gmail.com";

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        const tokenResult = await user.getIdTokenResult(true);
        const adminClaim = Boolean(tokenResult.claims.admin) || user.email?.toLowerCase() === ADMIN_EMAIL;
        setIsAdmin(adminClaim);

        if (adminClaim) {
          setRole("admin");
          setUserProfile(null);
          setProfileLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error refreshing token claims:", e);
      }

      await loadProfile(user.uid);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const timer = setTimeout(() => {
      console.error("Firebase auth initialization timed out after 5 seconds.");
      setAuthError("Authentication failed to initialize. Please check your network, adblocker settings, or environment variables.");
      setLoading(false);
      setProfileLoading(false);
    }, 5000);

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        clearTimeout(timer);
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser) {
          try {
            const tokenResult = await currentUser.getIdTokenResult();
            const adminClaim = Boolean(tokenResult.claims.admin) || currentUser.email?.toLowerCase() === ADMIN_EMAIL;
            setIsAdmin(adminClaim);

            if (adminClaim) {
              setRole("admin");
              setUserProfile(null);
              setProfileLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error checking user token claims:", e);
          }

          await loadProfile(currentUser.uid);
        } else {
          setUserProfile(null);
          setRole(null);
          setIsAdmin(false);
          setProfileLoading(false);
        }
      }, (error) => {
        clearTimeout(timer);
        console.error("Firebase auth error:", error);
        setAuthError("Firebase authentication error: " + error.message);
        setLoading(false);
        setProfileLoading(false);
      });
    } catch (err: any) {
      clearTimeout(timer);
      console.error("Failed to attach onAuthStateChanged:", err);
      setAuthError("Failed to initialize authentication.");
      setLoading(false);
      setProfileLoading(false);
    }

    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [loadProfile]);

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-800">Authentication Error</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-600">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, userProfile, isAdmin, loading, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
