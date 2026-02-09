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
    <div className="navbar bg-neutral shadow-sm">
      <div className="navbar-start">
        <Link className="btn btn-ghost" aria-label="Trekr home" to="/">
          <img src={logo} alt="Trekr" className="h-12 w-auto rounded-2xl" />
        </Link>
      </div>
      <div className="navbar-end">
        {isAuthed ? (
          <div className="flex items-center gap-2 mr-6">
            <Link className="btn btn-primary" to="/dashboard">
              Dashboard
            </Link>
            <button className="btn btn-outline" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link
            className="btn bg-black text-green-200 border-black hover:bg-black/90 hover:border-black px-8 mr-6"
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
