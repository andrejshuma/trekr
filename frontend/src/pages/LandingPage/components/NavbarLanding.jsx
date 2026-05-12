import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

const NavbarLanding = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(() =>
    Boolean(localStorage.getItem("authToken")),
  );

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") {
        setIsAuthed(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsAuthed(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="navbar bg-primary text-primary-content shadow-sm px-4 sm:px-6">
      <div className="navbar-start flex-1 min-w-0">
        <Link
          className="btn btn-ghost text-primary-content"
          aria-label="Trekr home"
          to="/"
        >
          <img src={logo} alt="Trekr" className="h-12 w-auto rounded-2xl" />
        </Link>
      </div>
      <div className="navbar-end flex-none">
        {isAuthed ? (
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              className="btn btn-sm sm:btn-md btn-outline border-primary-content text-primary-content"
              to="/dashboard"
            >
              Dashboard
            </Link>
            <button
              className="btn btn-sm sm:btn-md btn-outline border-primary-content text-primary-content"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            className="btn btn-sm sm:btn-md btn-tertiary text-blue-200! px-6 sm:px-8"
            to="/login"
          >
            Start Tracking
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavbarLanding;
