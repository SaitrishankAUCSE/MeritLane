"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans overflow-hidden">
        <CandidateSidebar />
        <main className="flex-1 bg-[#FAFAFA] overflow-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
