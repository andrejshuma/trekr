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
      className="hero min-h-[calc(100vh-4rem)] bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80)",
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-2xl">
          <h1 className="mb-5 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            Trekr — track progress, every day
          </h1>
          <p className="mb-6 text-sm sm:text-base md:text-lg opacity-90">
            One self-improvement hub: workouts, weight & nutrition, finances &
            budgeting, investing, and daily discipline tasks. Set goals, log
            consistently, and see your progress in one place.
          </p>
          <Link
            className="btn btn-primary !text-white btn-sm sm:btn-md md:btn-lg"
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
