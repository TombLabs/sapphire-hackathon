import { ease } from "@/pages";
import { Image, Link } from "@nextui-org/react";
import { motion } from "framer-motion";
import { MyButton } from "../ui/button";

export function CTA() {
  return (
    <section className="relative">
      <Image
        src="/images/bg-pattern.png"
        alt="background"
        className="absolute inset-0 z-0 h-full w-full rounded-none object-cover"
        removeWrapper
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-transparent via-black/20 to-black" />

      <div className="relative mx-auto flex max-w-screen-2xl items-center justify-center gap-8 p-6 py-64">
        <motion.div
          initial={{ opacity: 0, y: "40px" }}
          whileInView={{ opacity: 1, y: "0px" }}
          viewport={{ once: false }}
          transition={{ duration: 1, ease }}
          className="relative flex flex-col items-center justify-center gap-6 text-center md:p-8"
        >
          <h2 className="text-4xl text-white sm:text-5xl">
            Transform your images with AI today!
          </h2>
          <div>
            <Link href="https://app.sapphiretool.io" isExternal>
              <MyButton variant="shadow" size="lg" color="primary">
                Start for Free
              </MyButton>
            </Link>
          </div>
          <p className="-mt-2 text-sm text-white">
            Receive free credits when you create an account
          </p>
        </motion.div>
      </div>
    </section>
  );
}
