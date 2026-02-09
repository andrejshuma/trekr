import { Button } from "@relume_io/relume-ui";
import { RxChevronRight } from "react-icons/rx";

export const HowItWorks = (props) => {
  const { tagline, heading, description, buttons, image } = {
    ...HowItWorksDefaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div>
            <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
            <h1 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              {heading}
            </h1>
            <p className="md:text-md">{description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              {buttons.map((button, index) => (
                <Button key={index} {...button}>
                  {button.title}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <img
              src={image.src}
              className="w-full object-cover"
              alt={image.alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

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
