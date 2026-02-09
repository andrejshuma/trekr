import { Button } from "@relume_io/relume-ui";
import { RxChevronRight } from "react-icons/rx";

export const Who = (props) => {
  const { tagline, heading, description, buttons, image } = {
    ...WhoDefaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div className="order-2 md:order-1">
            <img
              src={image.src}
              className="w-full object-cover"
              alt={image.alt}
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
            <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              {heading}
            </h2>
            <p className="md:text-md">{description}</p>
            <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
              {buttons.map((button, index) => (
                <Button key={index} {...button}>
                  {button.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WhoDefaults = {
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
