import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@relume_io/relume-ui";

import DashboardSidebar from "./components/DashboardSidebar.jsx";
import DashboardTopbar from "./components/DashboardTopbar.jsx";

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
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/", { replace: true });
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="pt-16 lg:pt-0">
        <DashboardTopbar username={username} onLogout={onLogout} />
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="container mx-auto px-6 py-8 md:px-8 md:py-10 lg:py-12">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
