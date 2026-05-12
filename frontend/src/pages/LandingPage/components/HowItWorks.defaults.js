import { RxChevronRight } from "react-icons/rx";

export const HowItWorksDefaults = {
  tagline: "How it works",
  heading: "Log it. Track it. Improve it.",
  description:
    "Log what matters to your goals — workouts, weight/calories, budgets, investments, and daily tasks. Trekr gives you a clear view of trends over time so you can stay consistent and keep moving forward.",
  buttons: [
    { title: "Start free", variant: "secondary" },
    {
      title: "See a quick overview",
      variant: "link",
      size: "link",
      iconRight: <RxChevronRight />,
    },
  ],
  image: {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    alt: "Progress and goals overview on a laptop",
  },
};

