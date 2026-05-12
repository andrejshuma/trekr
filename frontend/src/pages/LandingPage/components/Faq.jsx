import {
  Button,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";

import { FaqDefaults } from "./Faq.defaults";

export const Faq = (props) => {
  const {
    heading,
    description,
    questions,
    footerHeading,
    footerDescription,
    button,
  } = {
    ...FaqDefaults,
    ...props,
  };
  return (
    <section
      id="relume"
      className="px-[5%] py-16 md:py-24 lg:py-28 flex items-center justify-center"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="rb-12 mb-12 text-center md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 font-bold text-4xl sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl leading-tight">
            {heading}
          </h2>
          <p className="text-sm sm:text-base md:text-lg opacity-80">
            {description}
          </p>
        </div>
        <Accordion type="multiple">
          {questions.map((question, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="md:py-5 md:text-md">
                {question.title}
              </AccordionTrigger>
              <AccordionContent className="md:pb-6">
                {question.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto mt-12 max-w-md text-center md:mt-18 lg:mt-20">
          <h4 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            {footerHeading}
          </h4>
          <p className="text-sm sm:text-base md:text-lg opacity-80">
            {footerDescription}
          </p>
          <div className="mt-6 md:mt-8">
            <Button {...button}>{button.title}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
