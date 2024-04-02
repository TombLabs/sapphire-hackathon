import { Button, Card, Image } from "@nextui-org/react";
import { RenderImageProps } from "react-photo-gallery";
import LazyLoad from "react-lazy-load";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useState } from "react";
import { MyButton } from "../ui/button";

const PhotoGallery = dynamic(() => import("react-photo-gallery"), {
  ssr: false,
});

const photos = [
  {
    src: "/images/gallery/0.webp",
    width: 4,
    height: 3,
  },
  {
    src: "/images/gallery/1.webp",
    width: 2,
    height: 3,
  },
  {
    src: "/images/gallery/2.webp",
    width: 3,
    height: 2,
  },
  {
    src: "/images/gallery/3.webp",
    width: 1,
    height: 1,
  },
  {
    src: "/images/gallery/4.webp",
    width: 3,
    height: 4,
  },
  {
    src: "/images/gallery/5.webp",
    width: 2,
    height: 3,
  },
  {
    src: "/images/gallery/6.webp",
    width: 2,
    height: 3,
  },
  {
    src: "/images/gallery/7.webp",
    width: 3,
    height: 4,
  },
  {
    src: "/images/gallery/8.webp",
    width: 1,
    height: 1,
  },
  {
    src: "/images/gallery/9.webp",
    width: 4,
    height: 3,
  },
  {
    src: "/images/gallery/10.webp",
    width: 3,
    height: 4,
  },
  {
    src: "/images/gallery/11.webp",
    width: 1,
    height: 1,
  },
  {
    src: "/images/gallery/12.webp",
    width: 3,
    height: 4,
  },
  {
    src: "/images/gallery/13.webp",
    width: 1,
    height: 2,
  },
  {
    src: "/images/gallery/14.webp",
    width: 4,
    height: 3,
  },
  {
    src: "/images/gallery/15.webp",
    width: 3,
    height: 4,
  },
  {
    src: "/images/gallery/16.webp",
    width: 1,
    height: 1,
  },
];

export function Gallery() {
  const [isLoadMore, setIsLoadMore] = useState(false);

  return (
    <section className="mx-auto flex max-w-screen-2xl flex-col gap-8 p-8 py-24 sm:py-32">
      <h2 className="text-center text-3xl text-white sm:text-4xl">
        Explore Gallery
      </h2>

      <div className=" hidden flex-col gap-6 md:flex">
        <div className="-m-2">
          <PhotoGallery
            photos={!isLoadMore ? photos.slice(0, 8) : photos}
            direction="column"
            margin={8}
            columns={(container) => Math.ceil(container / 350)}
            renderImage={(props) => (
              <PhotoGalleryCard
                key={"photo_gallety_item_" + props.index}
                {...props}
              />
            )}
          />
        </div>
        <MyButton
          color="primary"
          variant="shadow"
          size="lg"
          className="mx-auto"
          onClick={() => setIsLoadMore(!isLoadMore)}
        >
          {isLoadMore ? "Less" : "More"}
        </MyButton>
      </div>

      <div className="block md:hidden">
        <Swiper
          centeredSlides={true}
          slidesPerView={1}
          loop={true}
          speed={600}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={true}
          modules={[Pagination, Autoplay]}
          grabCursor={true}
          className="max-w-md pb-10"
        >
          {photos.map((_photo, i) => (
            <SwiperSlide key={`mobile-gallery-${i}`}>
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <LazyLoad className="absolute inset-0 opacity-40">
                  <Image
                    removeWrapper
                    src={_photo.src}
                    alt={""}
                    fallbackSrc="/w"
                    className="h-full w-full scale-110 rounded-none object-cover blur"
                  />
                </LazyLoad>
                <LazyLoad className="absolute inset-0">
                  <Image
                    removeWrapper
                    src={_photo.src}
                    alt={""}
                    fallbackSrc="/w"
                    className="h-full w-full rounded-none object-contain"
                  />
                </LazyLoad>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

const PhotoGalleryCard = ({
  index,
  photo,
  margin,
  top,
  left,
}: RenderImageProps) => {
  return (
    <Card
      style={{
        margin,
        height: photo.height,
        width: photo.width,
        position: "absolute",
        left,
        top,
      }}
    >
      <LazyLoad className="absolute inset-0">
        <Image
          removeWrapper
          src={photo.src}
          alt={""}
          fallbackSrc="/w"
          className="h-full w-full object-cover"
          isZoomed
        />
      </LazyLoad>

      <span className="sr-only">gallery image {index + 1}</span>
    </Card>
  );
};
