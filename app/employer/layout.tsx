"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { EmployerProfileCompletionGuard } from "@/components/employer/EmployerProfileCompletionGuard";
import { ProtocolWelcomeExperience } from "@/components/onboarding/ProtocolWelcomeExperience";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <ToastProvider>
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#F8F6F3] text-foreground font-sans overflow-hidden">
          <MobileNav role="employer" />
          <EmployerSidebar />
          <main className="flex-1 bg-[#F8F6F3] min-h-0 h-full overflow-y-auto min-w-0 flex flex-col">
            <EmployerProfileCompletionGuard>
              {children}
            </EmployerProfileCompletionGuard>
          </main>
        </div>
        {/* Protocol Induction Welcome Experience */}
        <ProtocolWelcomeExperience />
      </ToastProvider>
    </ProtectedRoute>
  );
}
