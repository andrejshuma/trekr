import { RxChevronRight } from "react-icons/rx";

const WhoDefaults = {
  tagline: "Who it's for",
  heading: "Anyone working on themselves",
  description:
    "Whether you're training regularly, trying to manage weight and nutrition, organizing your budget, tracking investments, or building discipline — Trekr brings your key habits and metrics together in one place.",
  buttons: [
    { title: "Create an account", variant: "secondary" },
    {
      title: "Learn more",
      variant: "link",
      size: "link",
      iconRight: <RxChevronRight />,
    },
  ],
  image: {
    src: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=1600&q=80",
    alt: "Planning habits and routine",
  },
};

export { WhoDefaults };


