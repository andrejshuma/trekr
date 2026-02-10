import React from "react";

export const Benefits = () => {
  const benefits = [
    {
      number: "1",
      title: "Unified tracking",
      description:
        "Stop jumping between 5+ different apps. Everything you need is in one place.",
    },
    {
      number: "2",
      title: "Real-time insights",
      description:
        "See your progress at a glance with clear dashboards and intuitive charts.",
    },
    {
      number: "3",
      title: "Goal-focused",
      description:
        "Set targets, log consistently, and watch trends emerge over time.",
    },
    {
      number: "4",
      title: "Built for habit stacking",
      description:
        "Track related areas and discover how fitness, finances, and discipline connect.",
    },
    {
      number: "5",
      title: "Data security",
      description:
        "Your personal metrics are encrypted and private. Only you control access.",
    },
    {
      number: "6",
      title: "Mobile-friendly",
      description:
        "Fully responsive design works seamlessly on phone, tablet, and desktop.",
    },
  ];

  return (
    <section id="benefits" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="text-center mb-16 md:mb-20">
          <p className="font-semibold text-sm md:text-base mb-3 md:mb-4">
            Why Trekr
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Designed for serious progress
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-80">
            We built Trekr for people who don't settle for half measures. If
            consistency matters to you, Trekr makes it easier to stay on track.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4 md:gap-6">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary text-white font-bold text-lg md:text-xl">
                  {benefit.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {benefit.title}
                </h3>
                <p className="opacity-80 text-sm md:text-base">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
