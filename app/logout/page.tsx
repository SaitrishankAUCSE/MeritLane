"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function executeSignOut() {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
      router.replace("/");
    }

    executeSignOut();
  }, [router]);

  return <MeritlaneLoader level="page" text="Signing out" />;
}
