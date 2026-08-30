"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUserProfile, UserProfile, Role } from "@/lib/firebase/users";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: Role | "admin" | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  showAuthModal: boolean;
  authModalMode: "login" | "signup";
  authModalCallback: (() => void) | null;
  authModalInitialRole: "candidate" | "employer" | null;
  openAuthModal: (mode?: "login" | "signup", callback?: () => void, initialRole?: "candidate" | "employer") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  profileLoading: true,
  refreshProfile: async () => {},
  handleSignOut: async () => {},
  showAuthModal: false,
  authModalMode: "login",
  authModalCallback: null,
  authModalInitialRole: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | "admin" | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [authModalCallback, setAuthModalCallback] = useState<(() => void) | null>(null);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<"candidate" | "employer" | null>(null);

  const router = useRouter();

  const openAuthModal = useCallback((mode: "login" | "signup" = "login", callback?: () => void, initialRole?: "candidate" | "employer") => {
    if (mode === "signup") {
      router.push("/signup");
    } else {
      router.push("/login");
    }
  }, [router]);

  const closeAuthModal = useCallback(() => {
    // No-op as we no longer use the modal
  }, []);

  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    try {
      const profile = await fetchUserProfile(uid);
      
      if (profile) {
        setUserProfile(profile);
        setRole(profile.role);
      } else {
        setUserProfile(null);
        setRole(null);
      }
    } catch (error: any) {
      console.error("Failed to load user profile (transient error or sign-out):", error);
      setUserProfile(null);
      setRole(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const ADMIN_EMAIL = "saitrishankb9@gmail.com";

  const refreshProfile = useCallback(async () => {
    if (user) {
      const isSuperadmin = user.email?.toLowerCase() === ADMIN_EMAIL;
      if (isSuperadmin) {
        setIsAdmin(true);
        setRole("admin");
        setUserProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const adminClaim = Boolean(tokenResult.claims.admin);
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

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        
        if (currentUser) {
          const isSuperadmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL;
          if (isSuperadmin) {
            setIsAdmin(true);
            setRole("admin");
            setUserProfile(null);
            setProfileLoading(false);
            return;
          }

          try {
            const tokenResult = await currentUser.getIdTokenResult();
            const adminClaim = Boolean(tokenResult.claims.admin);
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
        console.error("Firebase auth error:", error);
        setAuthError("Firebase authentication error: " + error.message);
        setLoading(false);
        setProfileLoading(false);
      });
    } catch (err: any) {
      console.error("Failed to attach onAuthStateChanged:", err);
      setAuthError("Failed to initialize authentication.");
      setLoading(false);
      setProfileLoading(false);
    }

    return () => {
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
    <AuthContext.Provider value={{ 
      user, 
      role, 
      userProfile, 
      isAdmin, 
      loading, 
      profileLoading, 
      refreshProfile, 
      handleSignOut,
      showAuthModal,
      authModalMode,
      authModalCallback,
      authModalInitialRole,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
