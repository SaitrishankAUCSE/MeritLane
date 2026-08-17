import ProtectedRoute from "@/components/ProtectedRoute";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      {children}
    </ProtectedRoute>
  );
}
