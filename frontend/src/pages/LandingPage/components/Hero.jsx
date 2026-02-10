import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
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

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80)",
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">
            Trekr — track progress, every day
          </h1>
          <p className="mb-5">
            One self-improvement hub: workouts, weight & nutrition, finances &
            budgeting, investing, and daily discipline tasks. Set goals, log
            consistently, and see your progress in one place.
          </p>
          <Link
            className="btn btn-primary !text-white"
            to={isAuthed ? "/dashboard" : "/register"}
          >
            {isAuthed ? "Go to dashboard" : "Get started"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
