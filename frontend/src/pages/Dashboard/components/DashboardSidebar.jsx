import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@relume_io/relume-ui";

import {
  MdTune,
  MdFitnessCenter,
  MdMonitorWeight,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdChecklist,
  MdAdd,
} from "react-icons/md";

import logo from "../../../assets/logo.png";

const navItems = [
  { title: "Control Center", to: "/dashboard/control-center", icon: MdTune },
  { title: "Training", to: "/dashboard/training", icon: MdFitnessCenter },
  { title: "Weight", to: "/dashboard/weight", icon: MdMonitorWeight },
  { title: "Finance", to: "/dashboard/finance", icon: MdAccountBalanceWallet },
  { title: "Investing", to: "/dashboard/investing", icon: MdTrendingUp },
  { title: "Discipline", to: "/dashboard/discipline", icon: MdChecklist },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar
      className="py-6"
      closeButtonClassName="fixed top-4 right-4"
      collapsible="none"
    >
      <SidebarHeader className="hidden lg:block">
        <NavLink to="/" className="flex items-center gap-3 px-2">
          <img src={logo} alt="Trekr" className="h-10 w-auto rounded-2xl" />
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="mt-6">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {(() => {
                const isActive =
                  location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`);

                return (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={
                      isActive
                        ? "!bg-green-400 !text-black hover:!bg-green-400 active:!bg-green-400"
                        : ""
                    }
                  >
                    <NavLink
                      to={item.to}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon
                        className={
                          isActive
                            ? "size-6 shrink-0 text-black"
                            : "size-6 shrink-0"
                        }
                      />
                      <span className={isActive ? "text-black" : ""}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                );
              })()}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-6 px-2">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 !bg-green-400 !text-black hover:!bg-green-500"
            type="button"
          >
            <MdAdd className="size-5" />
            <span>Add Custom</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
