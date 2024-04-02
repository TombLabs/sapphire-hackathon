import { ThemeProvider } from "next-themes";
// import { fetcher } from "@/lib/utils";
// import NextNProgress from "nextjs-progressbar";
// import { useMemo } from "react";
// import { Toaster } from "react-hot-toast";
// import { SWRConfig } from "swr";
import { Outfit } from "next/font/google";
import { NextUIProvider } from "@nextui-org/react";

const font = Outfit({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <SWRConfig value={{ fetcher: fetcher, shouldRetryOnError: false }}> */}
      <NextUIProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <div className={font.className}>{children}</div>
        </ThemeProvider>
      </NextUIProvider>
      {/* </SWRConfig> */}
      {/* <Toaster
        toastOptions={{
          position: "top-center",
          duration: 2500,
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          },
        }}
      />
      <NextNProgress color={"#808080"} options={{ showSpinner: false }} /> */}
    </>
  );
}
