import { motion } from "framer-motion";
import { ease } from "@/pages";

const parts = [
  {
    title: "Inspire Originality",
    description:
      "Spark your creative genius with our technology. Foster uniqueness in your artistic creations using various AI Art Engines; Dalle-2, DeepAI, Leonardo, and Stability.",
  },
  {
    title: "Effortless Proficiency",
    description:
      "Embrace the process of mastery made simple. Quickly and efficiently craft exquisite content, from novice to expert, and find the joy in perfecting your craft.",
  },
  {
    title: "Accelerated Innovation",
    description:
      "We are committed to continuous improvement. Expect frequent software updates and feature additions to enhance your ideation journey, ensuring you're always at the forefront of innovation.",
  },
];

export function About() {
  return (
    <section>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-6 py-24 lg:py-32">
        {/* <div className="flex flex-col gap-2 text-center">
          <h2 className="text-center text-3xl text-white sm:text-4xl">
            Lorem ipsum dolor
          </h2>
          <p>
            Sed vel scelerisque eros. Etiam vitae tortor ac velit finibus
            mattis. Suspendisse vitae nisi finibus.
          </p>
        </div> */}

        <div className="mx-auto grid sm:max-w-md lg:max-w-full lg:grid-cols-3">
          {parts.map((_info, i) => (
            <div
              key={`about-info-${i}`}
              className={`flex flex-col justify-center gap-2 py-16 sm:items-center sm:px-6 sm:text-center ${
                i == 1
                  ? "border-y border-white/20 lg:border-x lg:border-y-0"
                  : ""
              }`}
            >
              <motion.h1
                initial={{ opacity: 0, y: "40px" }}
                whileInView={{ opacity: 1, y: "0px" }}
                viewport={{ once: false }}
                transition={{ duration: 1, ease }}
                className="text-xl text-primary sm:text-2xl"
              >
                {_info.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: "40px" }}
                whileInView={{ opacity: 1, y: "0px" }}
                viewport={{ once: false }}
                transition={{ duration: 1, ease }}
              >
                {_info.description}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
