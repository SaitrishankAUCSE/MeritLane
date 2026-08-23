"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { PageTransition } from "@/components/ui/PageTransition";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#FAFAFA] text-[#0D0D0D] font-sans overflow-hidden">
        <MobileNav role="employer" />
        <EmployerSidebar />
        <main className="flex-1 bg-[#FAFAFA] overflow-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </ProtectedRoute>
  );
}
