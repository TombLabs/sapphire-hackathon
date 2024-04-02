import { ease } from "@/pages";
import { User } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import testimonials from "@/lib/testimonials.json";
import Link from "next/link";

export function Testimonial() {
  return (
    <section>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 py-24 sm:py-32">
        <div className="flex flex-col gap-2 px-6 text-left">
          <motion.h2
            initial={{ opacity: 0, y: "40px" }}
            whileInView={{ opacity: 1, y: "0px" }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease }}
            className="text-3xl text-white sm:text-4xl"
          >
            Beta Tester Testimonials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: "40px" }}
            whileInView={{ opacity: 1, y: "0px" }}
            viewport={{ once: false }}
            transition={{ duration: 1, ease }}
          >
            See how the Solana community feels about Sapphire!
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: "40px" }}
          whileInView={{ opacity: 1, y: "0px" }}
          viewport={{ once: false }}
          transition={{ duration: 1, ease }}
        >
          <Swiper
            spaceBetween={24}
            slidesPerView={"auto"}
            grabCursor={true}
            className="w-full px-6"
          >
            {testimonials.map((_testimonial, i) => (
              <SwiperSlide
                key={`testimonial-${i}`}
                className="flex w-[80vw] max-w-md shrink-0 flex-col items-start gap-8 rounded-xl bg-gradient-to-br from-primary/80 to-primary/10 p-6"
              >
                <blockquote className="text-xl font-semibold italic text-gray-900 dark:text-white">
                  <p>&quot;{_testimonial.quote}&quot;</p>
                </blockquote>

                <User
                  name={_testimonial.name}
                  description={
                    <Link
                      href={`https://x.com/${_testimonial.twitterHandle}`}
                      className="transition-all hover:text-foreground"
                    >
                      {_testimonial.twitterHandle}
                    </Link>
                  }
                  avatarProps={{
                    src: _testimonial.image,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
