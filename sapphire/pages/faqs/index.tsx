import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_QUESTIONS } from "@/lib/constants/faqs";
import { NextSeo } from "next-seo";

export default function FaqPage() {
  return (
    <>
      <NextSeo title="Frequently Asked Questions (FAQs)" />
      <div className="sm:px-6 px-4 flex flex-col gap-6 max-w-5xl mx-auto w-full py-8 sm:py-16">
        <h2>Frequently Asked Questions (FAQs)</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_QUESTIONS.map((_question, i) => (
            <AccordionItem value={`accordion-item-${i}`} key={i}>
              <AccordionTrigger>{_question.title}</AccordionTrigger>
              <AccordionContent className=" text-muted-foreground text-base">
                {_question.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
