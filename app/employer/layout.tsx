"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="flex h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans overflow-hidden">
        <EmployerSidebar />
        <main className="flex-1 bg-[#FAFAFA] overflow-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
