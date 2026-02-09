import {
  Button,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";

export const Faq = (props) => {
  const {
    heading,
    description,
    questions,
    footerHeading,
    footerDescription,
    button,
  } = {
    ...Faq1Defaults,
    ...props,
  };
  return (
    <section
      id="relume"
      className="px-[5%] py-16 md:py-24 lg:py-28 flex items-center justify-center"
    >
      <div className="container max-w-lg">
        <div className="rb-12 mb-12 text-center md:mb-18 lg:mb-20">
          <h2 className="rb-5 mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            {heading}
          </h2>
          <p className="md:text-md">{description}</p>
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
          <p className="md:text-md">{footerDescription}</p>
          <div className="mt-6 md:mt-8">
            <Button {...button}>{button.title}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Faq1Defaults = {
  heading: "Frequently asked questions",
  description:
    "Quick answers on how Trekr helps you track self-improvement across multiple areas — in one place.",
  questions: [
    {
      title: "What can I track in Trekr?",
      answer:
        "Workouts (type and duration), weight & nutrition (goal, calories), finances & budgeting (income and expenses), investing (portfolio and returns), and discipline (daily tasks you can check off).",
    },
    {
      title: "Do I need multiple apps to do all this?",
      answer:
        "No — Trekr is designed to unify the most important self-improvement categories so you can get a clear overview without switching between tools.",
    },
    {
      title: "How do goals and progress tracking work?",
      answer:
        "You set a goal (for example: target weight or monthly budget), then log daily/weekly data. Trekr helps you see where you are vs. the goal and how you're trending over time.",
    },
    {
      title: "Where is my data stored?",
      answer:
        "Your entries are stored in a database and linked to your user profile so you can track progress consistently over time.",
    },
    {
      title: "Is Trekr a mobile app?",
      answer:
        "Right now Trekr is a web app. The goal is a fast, simple experience on both mobile and desktop in the browser.",
    },
  ],
  footerHeading: "Still have questions?",
  footerDescription: "Send us a message and we’ll help you get started.",
  button: {
    title: "Contact",
    variant: "secondary",
  },
};
