"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans overflow-hidden">
        <EmployerSidebar />
        <main className="flex-1 bg-[#0b0c0e] overflow-hidden">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
