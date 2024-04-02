import { ease } from "@/pages";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LuDiamond } from "react-icons/lu";

const steps = [
  {
    title: "Prompting",
    description:
      "Provide your own creative prompts, inspiring AI to generate unique art based on your ideas and preferences.",
  },
  {
    title: "Generation",
    description:
      "Explore the combination of Artificial Intelligence and Art to create stunning visual masterpieces.",
  },
  {
    title: "Minting",
    description:
      "Creations can be tokenized into an NFT, pNFT, or cNFT directly on the blockchain - securing owernship rights and authenticity.",
  },
  {
    title: "Collections",
    description:
      "Access to a comprehensive control panel for organizing, displaying, and managing your created NFT art collections",
  },
];

export function Guide() {
  return (
    <section>
      <div className="mx-auto grid w-full max-w-screen-2xl gap-12 px-6 py-24 sm:py-32 md:grid-cols-2">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 text-left">
            <motion.h2
              initial={{ opacity: 0, y: "40px" }}
              whileInView={{ opacity: 1, y: "0px" }}
              viewport={{ once: false }}
              transition={{ duration: 1, ease }}
              className="text-3xl text-white sm:text-4xl"
            >
              Discover your Potential
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: "40px" }}
              whileInView={{ opacity: 1, y: "0px" }}
              viewport={{ once: false }}
              transition={{ duration: 1, ease }}
              className="text-sm sm:text-base"
            >
              with the process of blockchain enhanced creativity
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: "40px" }}
            whileInView={{ opacity: 1, y: "0px" }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease }}
            className="aspect-video w-full rounded-xl border-[1px] bg-foreground"
          >
            <video
              className="rounded-xl "
              src="/videos/guide1.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: "40px" }}
            whileInView={{ opacity: 1, y: "0px" }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease }}
            className="aspect-video w-full rounded-xl border-[1px] bg-foreground"
          >
            <video
              className="rounded-xl "
              src="/videos/guide2.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </motion.div>
        </div>

        <div className="flex flex-col gap-6">
          {steps.map((_step) => (
            <Step
              key={`step-${_step.title}`}
              title={_step.title}
              description={_step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const Step = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: scrollYProgressTarget } = useScroll({
    target: targetRef,
    offset: ["start center", "end center"],
  });
  const height = useTransform(scrollYProgressTarget, [0, 1], ["0%", `100%`]);

  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: scrollYProgressContent } = useScroll({
    target: contentRef,
    offset: ["start center", "end center"],
  });
  const opacity = useTransform(scrollYProgressContent, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgressContent, [0, 1], ["20px", "0px"]);

  return (
    <div
      ref={targetRef}
      className="grid grid-cols-[20px,1fr] gap-4 sm:grid-cols-[32px,1fr] sm:gap-6"
    >
      <div className="flex flex-col items-center gap-4">
        <div ref={contentRef}>
          <LuDiamond className="h-6 w-6 shrink-0 text-primary sm:h-8 sm:w-8" />
        </div>

        <motion.div
          style={{ height }}
          className="h-full w-1 rounded-full bg-foreground"
        />
      </div>

      <motion.div className=" pb-16 sm:pb-40" style={{ opacity, y }}>
        <h2 className="text-lg text-white sm:text-xl">{title}</h2>
        <p className="text-sm sm:text-base">{description}</p>
      </motion.div>
    </div>
  );
};
