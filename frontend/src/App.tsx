import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AppLayout } from "@/components/layout/app-layout";
import { useAuthStore } from "@/stores/auth-store";

import { AdminUsersPage } from "@/pages/admin-users";
import { AssignmentsPage } from "@/pages/assignments";
import { DashboardPage } from "@/pages/dashboard";
import { EmployeesPage } from "@/pages/employees";
import { HardwarePage } from "@/pages/hardware";
import { LoginPage } from "@/pages/login";
import { SoftwarePage } from "@/pages/software";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/hardware" element={<HardwarePage />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminUsersPage />
              </AdminGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
