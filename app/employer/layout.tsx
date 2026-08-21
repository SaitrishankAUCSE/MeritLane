"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { EmployerTopNav } from "@/components/employer/EmployerTopNav";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="flex h-[100dvh] w-full bg-[#0b0c0e] text-[#e3e2e5] font-sans overflow-hidden">
        <EmployerSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c0e] overflow-hidden">
          <EmployerTopNav />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
