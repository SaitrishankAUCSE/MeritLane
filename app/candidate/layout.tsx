"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { CandidateMessageNotifier } from "@/components/candidate/CandidateMessageNotifier";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <ToastProvider>
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans overflow-hidden">
          <MobileNav role="candidate" />
          <CandidateSidebar />
          <main className="flex-1 bg-[#F8F6F3] overflow-hidden">
            {children}
          </main>
        </div>
        {/* Polls silently for new inbox messages and fires toast notifications */}
        <CandidateMessageNotifier />
      </ToastProvider>
    </ProtectedRoute>
  );
}
