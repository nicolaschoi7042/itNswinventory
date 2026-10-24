import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AppLayout } from "@/components/layout/app-layout";
import { useAuthStore } from "@/stores/auth-store";
import { auth } from "@/lib/api";

import { AdminUsersPage } from "@/pages/admin-users";
import { AssignmentsPage } from "@/pages/assignments";
import { DashboardPage } from "@/pages/dashboard";
import { EmployeesPage } from "@/pages/employees";
import { HardwarePage } from "@/pages/hardware";
import { LoginPage } from "@/pages/login";
import { PaymentsPage } from "@/pages/payments";
import { SoftwarePage } from "@/pages/software";
import { SubscriptionsPage } from "@/pages/subscriptions";

function SsoHandler({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [ready, setReady] = useState(!searchParams.has("sso_token"));

  useEffect(() => {
    const ssoToken = searchParams.get("sso_token");
    if (!ssoToken) return;

    auth.sso(ssoToken).then(({ token, user }) => {
      setAuth(user, token);
      const lastRoute = localStorage.getItem("inventory_last_route");
      searchParams.delete("sso_token");
      setSearchParams(searchParams, { replace: true });
      setReady(true);
      if (lastRoute && lastRoute !== "/") {
        navigate(lastRoute, { replace: true });
      }
    }).catch(() => {
      searchParams.delete("sso_token");
      setSearchParams(searchParams, { replace: true });
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

function RouteTracker() {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (token && location.pathname !== "/login") {
      try { localStorage.setItem("inventory_last_route", location.pathname); } catch {}
    }
  }, [location.pathname, token]);
  return null;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <SsoHandler>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/hardware" element={<HardwarePage />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
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
      </SsoHandler>
    </BrowserRouter>
  );
}
