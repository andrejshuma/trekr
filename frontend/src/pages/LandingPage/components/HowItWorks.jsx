import { Button } from "@relume_io/relume-ui";
import { HowItWorksDefaults } from "./HowItWorks.defaults.jsx";

export const HowItWorks = (props) => {
  const { tagline, heading, description, buttons, image } = {
    ...HowItWorksDefaults,
    ...props,
  };
  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
          <div className="text-center md:text-left">
            <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
            <h1 className="rb-5 mb-5 font-bold text-4xl sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl leading-tight">
              {heading}
            </h1>
            <p className="text-sm sm:text-base md:text-lg opacity-80">
              {description}
            </p>
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
              className="w-full rounded-2xl object-cover"
              alt={image.alt}
            />
          </div>
        </div>
      </div>
    </section>
  );
};


