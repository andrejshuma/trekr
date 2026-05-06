import React from "react";
import { Link } from "react-router-dom";

import { MdLogout } from "react-icons/md";

import logo from "../../../assets/logo.png";

const DashboardTopbar = ({ username, onLogout }) => {
  return (
    <>
      {/* Desktop */}
      <div className="sticky top-0 z-30 hidden min-h-16 w-full items-center border-b border-white/10 bg-base-100/70 px-6 backdrop-blur-xl lg:flex lg:px-8">
        <div className="mx-auto grid size-full grid-cols-1 items-center justify-end justify-items-end gap-4 lg:grid-cols-[1fr_max-content] lg:justify-between lg:justify-items-stretch">
          <div className="flex items-center gap-3"></div>

          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">{username || "—"}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm hover:bg-white/10 transition"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
            >
              <MdLogout className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="fixed left-0 right-0 top-0 z-30 flex min-h-16 w-full items-center justify-between border-b border-white/10 bg-base-100/70 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            aria-label="Trekr dashboard"
          >
            <img src={logo} alt="Trekr" className="h-10 w-auto rounded-2xl" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">{username || "—"}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm hover:bg-white/10 transition"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
          >
            <MdLogout className="size-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardTopbar;
