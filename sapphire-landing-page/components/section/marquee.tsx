import { Card, Image } from "@nextui-org/react";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { ease } from "@/pages";

const totalPhotos = 6;

export function Marquee() {
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end start", "start end"],
  });

  const xSpring = useSpring(scrollYProgress, {
    stiffness: 500,
    damping: 100,
  });
  const x = useTransform(xSpring, [0, 1], ["0px", `-${overflow}px`]);

  const onScroll = useCallback(() => {
    if (!contentRef.current) return;
    if (!targetRef.current) return;
    setOverflow(contentRef.current.scrollWidth - targetRef.current.offsetWidth);
  }, [contentRef, targetRef]);

  useEffect(() => {
    onScroll();
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("resize", onScroll);
    };
  }, [contentRef, targetRef]);

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0, y: "10px" }}
      animate={{ opacity: 1, y: "0px" }}
      transition={{ duration: 1, delay: 1, ease }}
    >
      <div
        ref={targetRef}
        className="relative mx-auto w-full max-w-screen-2xl overflow-hidden py-24 sm:py-32"
      >
        <motion.div
          ref={contentRef}
          style={{ x: x }}
          className="relative mx-auto flex flex-nowrap gap-4"
        >
          {Array(totalPhotos)
            .fill("")
            .map((e, i) => (
              <Card
                key={`marquee-${i}`}
                className="relative aspect-square w-64 shrink-0 overflow-hidden sm:w-80"
              >
                <Image
                  src={`/images/marquee/0${i + 1}.webp`}
                  alt=""
                  className="h-full w-full object-cover"
                  removeWrapper
                />
              </Card>
            ))}
        </motion.div>
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg,black,transparent 10%,transparent 90%,black)",
          }}
        />
      </div>
    </motion.section>
  );
}
