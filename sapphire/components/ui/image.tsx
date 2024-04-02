import { cn } from "@/lib/helpers/utils";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { forwardRef, useState } from "react";
import LazyLoad from "react-lazy-load";
import { Skeleton } from "./skeleton";

type ImageProps = NextImageProps & {
  disableSkeleton?: boolean;
};

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, className, disableSkeleton = false, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <div className={`${fill ? "absolute inset-0" : ""}`}>
        <LazyLoad className={`${fill ? "absolute inset-0" : ""}`}>
          <NextImage
            ref={ref}
            className={cn(
              "transition-all",
              isLoading ? "opacity-0" : "opacity-100",
              fill ? "h-full w-full object-cover" : "",
              className
            )}
            fill={fill}
            {...props}
            onLoadingComplete={() => setIsLoading(false)}
          />
        </LazyLoad>
        {isLoading && !disableSkeleton && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
      </div>
    );
  }
);
Image.displayName = Image.name;
