"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { CandidateMessageNotifier } from "@/components/candidate/CandidateMessageNotifier";
import { ProfileCompletionGuard } from "@/components/candidate/ProfileCompletionGuard";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssessment = pathname?.startsWith("/candidate/assessment");

  if (isAssessment) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <ToastProvider>
          <div className="h-[100dvh] w-screen bg-[#F8F6F3] text-[#1C1917] font-sans overflow-hidden fixed inset-0 flex flex-col">
            <main className="flex-1 h-full w-full overflow-hidden flex flex-col min-h-0">
              <ProfileCompletionGuard>
                {children}
              </ProfileCompletionGuard>
            </main>
          </div>
        </ToastProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <ToastProvider>
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans overflow-hidden">
          <MobileNav role="candidate" />
          <CandidateSidebar />
          <main className="flex-1 bg-[#F8F6F3] overflow-y-auto min-h-0 h-full">
            <ProfileCompletionGuard>
              {children}
            </ProfileCompletionGuard>
          </main>
        </div>
        {/* Polls silently for new inbox messages and fires toast notifications */}
        <CandidateMessageNotifier />
      </ToastProvider>
    </ProtectedRoute>
  );
}

