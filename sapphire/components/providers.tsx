import { fetcher } from "@/lib/helpers/utils";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import NextNProgress from "nextjs-progressbar";
import { useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

const font = localFont({
  src: "../public/fonts/Casper.ttf",
  weight: "400",
  style: "normal",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => "https://api.mainnet-beta.solana.com", []);
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <SWRConfig value={{ fetcher: fetcher, shouldRetryOnError: false }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <SessionProvider>
                    <div className={font.className}>{children}</div>
                  </SessionProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </LocalizationProvider>
        </SWRConfig>
      </ThemeProvider>
      <Toaster
        toastOptions={{
          position: "top-center",
          style: {
            background: "hsl(var(--foreground))",
            color: "hsl(var(--background))",
          },
        }}
      />
      <NextNProgress color={"#0070f0"} options={{ showSpinner: false }} />
    </>
  );
}
