"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUserProfile, UserProfile, Role } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  userProfile: null,
  loading: true,
  profileLoading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUserProfile(null);
      setRole(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.uid);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        await loadProfile(currentUser.uid);
      } else {
        setUserProfile(null);
        setRole(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, role, userProfile, loading, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
