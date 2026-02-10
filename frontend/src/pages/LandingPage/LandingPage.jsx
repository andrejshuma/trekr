import React from "react";
import NavbarLanding from "./components/NavbarLanding";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { HowItWorks } from "./components/HowItWorks";
import { Who } from "./components/Who";
import { Faq } from "./components/Faq";
import Features from "./components/Features";
import Benefits from "./components/Benefits";
const LandingPage = () => {
  return (
    <div data-theme="forest" className="min-h-screen w-full overflow-x-hidden">
      <NavbarLanding />
      <Hero />
      <HowItWorks />
      <Who />
      <Features />
      <Benefits />
      <Faq />
      <Footer />
    </div>
  );
};

export default LandingPage;
