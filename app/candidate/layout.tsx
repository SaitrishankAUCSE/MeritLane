"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { CandidateTopNav } from "@/components/candidate/CandidateTopNav";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans overflow-hidden">
        <CandidateSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c0e] overflow-hidden">
          <CandidateTopNav />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
