import GalleryPastGenerations from "@/components/gallery-past-generations";
import { NextSeo } from "next-seo";

export default function AiGeneratorPage() {
  return (
    <>
      <NextSeo title="My Generations" />
      <GalleryPastGenerations />
    </>
  );
}
