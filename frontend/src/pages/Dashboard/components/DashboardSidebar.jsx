import React, { useEffect, useMemo, useState } from "react";
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
  MdBook,
  MdFlag,
  MdStar,
  MdBolt,
  MdNoteAlt,
  MdAutoGraph,
} from "react-icons/md";

import logo from "../../../assets/logo.png";

import AddCustomCategoryModal from "./AddCustomCategoryModal.jsx";
import {
  createCustomTrackingCategory,
  getCustomTrackingCategories,
} from "../../../api/discipline.js";

const navItems = [
  { title: "Control Center", to: "/dashboard/control-center", icon: MdTune },
  { title: "Training", to: "/dashboard/training", icon: MdFitnessCenter },
  { title: "Weight", to: "/dashboard/weight", icon: MdMonitorWeight },
  { title: "Finance", to: "/dashboard/finance", icon: MdAccountBalanceWallet },
  { title: "Investing", to: "/dashboard/investing", icon: MdTrendingUp },
  { title: "Discipline", to: "/dashboard/discipline", icon: MdChecklist },
];

const CUSTOM_ICONS = [MdBook, MdFlag, MdStar, MdBolt, MdNoteAlt, MdAutoGraph];

function stableIconForId(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return CUSTOM_ICONS[0];
  return CUSTOM_ICONS[Math.abs(n) % CUSTOM_ICONS.length];
}

const DashboardSidebar = () => {
  const location = useLocation();
  const [customOpen, setCustomOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCustomTrackingCategories();
        const items = res?.items ?? [];
        if (mounted) setCustomCategories(items);
      } catch {
        // If the user isn't authenticated yet or the endpoint fails,
        // keep the sidebar usable (no custom categories).
        if (mounted) setCustomCategories([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const customNavItems = useMemo(() => {
    return (customCategories ?? []).map((c) => {
      const Icon = stableIconForId(c.customTrackingId);
      return {
        title: c.name,
        to: `/dashboard/custom/${c.customTrackingId}`,
        icon: Icon,
      };
    });
  }, [customCategories]);

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

          {customNavItems.length > 0 ? (
            <div className="my-4 border-t border-white/10" />
          ) : null}

          {customNavItems.map((item) => (
            <SidebarMenuItem key={`custom-${item.to}`}>
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
            onClick={() => setCustomOpen(true)}
          >
            <MdAdd className="size-5" />
            <span>Add Custom</span>
          </Button>
        </div>

        <AddCustomCategoryModal
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          onSubmit={async (payload) => {
            const created = await createCustomTrackingCategory(payload);
            setCustomCategories((prev) => [created, ...(prev ?? [])]);
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
