import { ease } from "@/pages";
import { motion } from "framer-motion";

import { Link } from "@nextui-org/react";
import { MyButton } from "../ui/button";

export function Hero() {
  return (
    <section className="relative">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease }}
        src="/images/bg-pattern.png"
        alt="background"
        className="absolute inset-0 z-0 h-full w-full rounded-none object-cover"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/40 to-black/0" />

      <div className="relative mx-auto grid min-h-[720px] max-w-screen-2xl gap-6 p-6 py-24 sm:gap-8 md:grid-cols-2 md:p-8">
        <div className="relative order-1 flex flex-col items-start justify-center gap-6 md:order-none md:p-8">
          <motion.h1
            initial={{ opacity: 0, y: "10px" }}
            animate={{ opacity: 1, y: "0px" }}
            transition={{ duration: 1, delay: 0.4, ease }}
            className="text-4xl text-white sm:text-5xl"
          >
            Refining Blockchain Creativity
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: "10px" }}
            animate={{ opacity: 1, y: "0px" }}
            transition={{ duration: 1, delay: 0.6, ease }}
            className="text-lg sm:text-xl"
          >
            AI Art Software utilizing algorithmic learning engines to generate
            high-quality creations to store directly on the blockchain by
            accepting Web3 payments.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: "10px" }}
            animate={{ opacity: 1, y: "0px" }}
            transition={{ duration: 1, delay: 0.8, ease }}
          >
            <Link href="https://app.sapphiretool.io" isExternal>
              <MyButton variant="shadow" size="lg" color="primary">
                Launch Sapphire
              </MyButton>
            </Link>
          </motion.div>
        </div>

        <div className="relative h-full w-full">
          <motion.img
            layoutId="character"
            draggable={false}
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 95%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 95%)",
            }}
            src="/images/hero-splash-art.webp"
            alt="background"
            className="pointer-events-none w-full max-w-md select-none md:max-w-full"
          />
        </div>
      </div>
    </section>
  );
}
