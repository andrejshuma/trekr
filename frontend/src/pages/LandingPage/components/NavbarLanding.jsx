import React from "react";
import logo from "../../../assets/logo.png";

const NavbarLanding = () => {
  return (
    <div className="navbar bg-neutral shadow-sm">
      <div className="navbar-start">
        <a className="btn btn-ghost" aria-label="Trekr home">
          <img src={logo} alt="Trekr" className="h-12 w-auto rounded-2xl" />
        </a>
      </div>
      <div className="navbar-end">
        <button className="btn bg-black text-green-200 border-black hover:bg-black/90 hover:border-black px-8 mr-6">
          Start Tracking
        </button>
      </div>
    </div>
  );
};

export default NavbarLanding;
