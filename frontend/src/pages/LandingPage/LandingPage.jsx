import React from "react";
import NavbarLanding from "./components/NavbarLanding";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { Faq } from "./components/Faq";
import { HowItWorks } from "./components/HowItWorks";
import { Who } from "./components/Who";

const LandingPage = () => {
  return (
    <div data-theme="forest" className="min-h-screen w-full overflow-x-hidden">
      <NavbarLanding />
      <Hero />
      <HowItWorks />
      <Who />
      <Faq />
      <Footer />
    </div>
  );
};

export default LandingPage;
