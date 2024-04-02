import { DefaultSeoProps } from "next-seo";

export const DEFAULT_SEO: DefaultSeoProps = {
  defaultOpenGraphImageWidth: 1200,
  defaultOpenGraphImageHeight: 630,
  title: undefined,
  defaultTitle: "Sapphire App",
  titleTemplate: "%s - Sapphire App",
  themeColor: "#020617",
  description:
    "Refining Blockchain Creativity, AI Art Software utilizing algorithmic learning engines to generate high-quality creations by accepting Web3 payments.",
  canonical: "https://app.sapphiretool.io",
  openGraph: {
    url: "https://app.sapphiretool.io",
    type: "website",
    images: [{ url: "https://app.sapphiretool.io/og.webp" }],
    locale: "en_US",
  },
  twitter: {
    handle: "@SapphireTool",
    site: "@SapphireTool",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0, maximum-scale=1",
    },
    {
      name: "keywords",
      content:
        "sapphire, ai, image, generate, generator, solana, web3, tombstoned, tomb, labs, app",
    },
    {
      name: "author",
      content: "Tomb Labs",
    },
  ],
  additionalLinkTags: [
    // {
    //   rel: "icon",
    //   href: "/favicon.ico",
    // },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/android-chrome-192x192.png",
    },
    {
      rel: "android-touch-icon",
      type: "image/png",
      sizes: "192x192",
      href: "/android-chrome-192x192.png",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      sizes: "180x180",
      href: "/apple-chrome-icon.png",
    },
    { rel: "manifest", href: "/manifest.json" },
  ],
};
