"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { ToastProvider } from "@/components/ui/Toast";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <ToastProvider>
        <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#F8F6F3] text-[#1C1917] font-sans overflow-hidden">
          <MobileNav role="employer" />
          <EmployerSidebar />
          <main className="flex-1 bg-[#F8F6F3] overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
      </ToastProvider>
    </ProtectedRoute>
  );
}
