"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { MobileNav } from "@/components/ui/MobileNav";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans overflow-hidden">
        <MobileNav role="candidate" />
        <CandidateSidebar />
        <main className="flex-1 bg-[#FAFAFA] overflow-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
