import { LayoutMain } from "@/components/layout/layout-main";
import { Providers } from "@/components/providers";
import { DEFAULT_SEO } from "@/lib/constants/default-seo";
import { MyAppPropsWithLayout } from "@/types";
import { DefaultSeo } from "next-seo";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

export default function MyApp({ Component, pageProps }: MyAppPropsWithLayout) {
  const getLayout =
    Component.getLayout || ((page) => <LayoutMain>{page}</LayoutMain>);

  return (
    <>
      <DefaultSeo {...DEFAULT_SEO} />
      <Providers>{getLayout(<Component {...pageProps} />)}</Providers>
    </>
  );
}
