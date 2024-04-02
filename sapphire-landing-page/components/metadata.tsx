import Head from "next/head";

const title = "Sapphire - by Tomb Labs";
const description =
  "Refining Blockchain Creativity, AI Art Software utilizing algorithmic learning engines to generate high-quality creations by accepting Web3 payments.";
const url = "https://www.sapphiretool.io";
const ogImage = `${url}/og.webp`;
const manifest = `/site.webmanifest`;
const themeColor = "#000000";

export function Metadata() {
  return (
    <Head>
      <title>{title}</title>

      <meta charSet="UTF-8" />
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5"
      />
      <meta name="robots" content="index, follow" />
      <meta property="theme-color" content={themeColor} />
      <meta
        name="keywords"
        content="ai, generator, solana, tomb, labs, image"
      />
      <meta name="author" content="Tomb Labs" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} key={"og_image"} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} key={"twitter_image"} />
      <meta name="twitter:creator" content="@Tomb_Labs" />

      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" href="/android-chrome-192x192.png" />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="android-touch-icon"
        sizes="192x192"
        href="/android-chrome-192x192.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />

      <link rel="canonical" href={url} />
      <link rel="manifest" href={manifest} />
    </Head>
  );
}
