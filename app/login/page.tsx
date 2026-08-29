"use client";

import AuthForm from "@/components/ui/auth-form";
import { Suspense } from "react";
import { MeritlaneLoader } from "@/components/ui/MeritlaneLoader";

export default function LoginPage() {
  return (
    <Suspense fallback={<MeritlaneLoader level="page" text="Loading..." />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
