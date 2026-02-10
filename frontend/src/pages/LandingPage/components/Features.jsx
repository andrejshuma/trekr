import React from "react";

export const Features = () => {
  const features = [
    {
      icon: "🏋️",
      title: "Fitness tracking",
      description:
        "Log workouts, stay consistent, and see your training trend over time.",
    },
    {
      icon: "⚖️",
      title: "Weight & nutrition",
      description:
        "Track daily weigh-ins and calories so you always know what’s working.",
    },
    {
      icon: "💰",
      title: "Budgeting",
      description:
        "Record income and expenses to stay on top of your money without spreadsheets.",
    },
    {
      icon: "📈",
      title: "Investments",
      description:
        "Monitor assets and returns to keep a clear view of your portfolio.",
    },
    {
      icon: "✅",
      title: "Daily discipline",
      description:
        "Turn intentions into habits with simple daily tasks and check-ins.",
    },
    {
      icon: "📊",
      title: "Insights",
      description:
        "See patterns across categories so you can make better decisions faster.",
    },
  ];

  return (
    <section
      id="features"
      className="px-[5%] py-16 md:py-24 lg:py-28 bg-base-200"
    >
      <div className="container">
        <div className="text-center mb-16 md:mb-20">
          <p className="font-semibold text-sm md:text-base mb-3 md:mb-4">
            What you can track
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Everything in one dashboard
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-80">
            Trekr brings your health, habits, and money together, so you don’t
            lose momentum switching tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow"
            >
              <div className="card-body p-6 md:p-8">
                <div className="text-4xl md:text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="opacity-80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
