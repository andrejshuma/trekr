import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@relume_io/relume-ui";

import DashboardSidebar from "./components/DashboardSidebar.jsx";
import DashboardTopbar from "./components/DashboardTopbar.jsx";
import { clearAuthSession } from "../../utils/authSession";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const username = user?.username ?? "";

  const onLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  return (
    <SidebarProvider>
      {/* App shell background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-base-300/10" />
        <div className="absolute inset-0 bg-radial-[circle_at_20%_20%] from-green-400/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-radial-[circle_at_80%_30%] from-blue-400/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/25" />
      </div>

      <DashboardSidebar />

      <SidebarInset className="pt-16 lg:pt-0">
        <DashboardTopbar username={username} onLogout={onLogout} />

        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="rounded-3xl border border-white/10 bg-base-100/60 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="p-4 sm:p-6 lg:p-8">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
