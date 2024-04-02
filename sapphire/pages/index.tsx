import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInWallet } from "@/lib/helpers/sign-in-wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import { LuLoader2 } from "react-icons/lu";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState("");
  const { query, push } = useRouter();
  const { setVisible } = useWalletModal();
  const wallet = useWallet();

  const handleOnSignInClick = useCallback(
    async (provider: string) => {
      setIsLoading(provider);
      try {
        if (provider !== "solana") {
          await signIn(provider);
        } else {
          if (!wallet.publicKey) {
            throw new Error("Wallet not connected");
          }
          const signInWalletObject = {
            domain: window.location.host,
            publicKey: wallet.publicKey.toBase58(),
            type: !wallet.signMessage ? "transaction" : "message",
          };
          const signInWallet = new SignInWallet(signInWalletObject);
          const signature = await signInWallet.signIn(wallet);
          await signIn(provider, {
            message: JSON.stringify(signInWallet),
            signature: signature,
          });
        }
      } catch (err: any) {
        console.log(err);
        toast.error(err.message);
        setIsLoading("");
      }
    },
    [wallet]
  );

  return (
    <>
      <div className="fixed inset-0">
        <Image
          unoptimized
          draggable={false}
          src="/images/bg-sign-in.webp"
          alt="background-image"
          fill
          loading="eager"
          className="h-full w-full object-cover"
        />
      </div>
      <main className="relative min-h-screen w-full flex items-center justify-center sm:p-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.65, 0, 0.25, 1] }}
          className="flex flex-col bg-background/60 sm:max-w-xl w-full backdrop-blur-xl sm:min-h-0 min-h-screen sm:rounded-xl overflow-hidden shadow-xl shadow-background/20"
        >
          <div className="gap-12 sm:p-16 p-4 sm:py-32 py-24 flex flex-col grow justify-center">
            <div className="text-center flex flex-col gap-2">
              <Image
                src="/sapphire_white.png"
                alt="sapphire-logo"
                width={120}
                height={158}
                loading="eager"
                className="mx-auto sm:max-w-none max-w-[80px] pb-4"
              />
              <h1>Login to your account</h1>
            </div>

            <div className="grid gap-6">
              {query.q == "all" ? (
                <>
                  {query.error == "OAuthCreateAccount" && (
                    <p className="rounded-xl text-center bg-destructive p-4 text-destructive-foreground">
                      Account does not exist. If you do not have an account,
                      please login with google to create one. If you are trying
                      to login with discord or twitter, please link them to your
                      account first.
                    </p>
                  )}

                  <div key={"all"} className="grid grid-cols-1 gap-4">
                    <Button
                      variant={"default"}
                      size="lg"
                      onClick={() => handleOnSignInClick("google")}
                      className="relative "
                    >
                      <FaGoogle className="absolute left-4" />
                      {isLoading == "google" ? (
                        <LuLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Login with Google"
                      )}
                    </Button>

                    <Button
                      variant={"default"}
                      size="lg"
                      onClick={() => handleOnSignInClick("discord")}
                      className="relative bg-indigo-500 hover:bg-indigo-500/90"
                    >
                      <FaDiscord className="absolute left-4" />
                      {isLoading == "discord" ? (
                        <LuLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Login with Discord"
                      )}
                    </Button>

                    <Button
                      variant={"default"}
                      size="lg"
                      onClick={() => handleOnSignInClick("twitter")}
                      className="relative bg-black hover:bg-black/90 text-white"
                    >
                      <FaXTwitter className="absolute left-4" />
                      {isLoading == "twitter" ? (
                        <LuLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Login with Twitter"
                      )}
                    </Button>

                    <Button
                      variant={"default"}
                      size="lg"
                      className="relative bg-emerald-600 hover:bg-emerald-600/90"
                      onClick={() => push(`/?q=solana-wallet`)}
                    >
                      <Image
                        src="/icons/solana.svg"
                        alt=""
                        width={14}
                        height={11}
                        className="absolute left-4 fill-white"
                      />
                      Login with Solana Wallet
                    </Button>
                  </div>

                  <Button
                    variant={"link"}
                    onClick={() => push("/")}
                    className="underline h-auto w-auto p-0 text-foreground mx-auto"
                  >
                    Show less
                  </Button>
                </>
              ) : query.q == "solana-wallet" ? (
                <>
                  {query.error == "CredentialsSignin" && (
                    <p className="rounded-xl text-center bg-destructive p-4 text-destructive-foreground">
                      Account does not exist. If you do not have an account,
                      please login with google to create one. If you do have an
                      account, Please login with google first and go to the
                      settings page and link your wallet.
                    </p>
                  )}
                  <div key={"solana-wallet"} className="grid grid-cols-1 gap-4">
                    {!wallet.publicKey ? (
                      <Button
                        variant={"secondary"}
                        size="lg"
                        className="grow bg-transparent border text-foreground border-foreground hover:bg-foreground/90 hover:text-background"
                        onClick={() => setVisible(true)}
                      >
                        Connect Wallet
                      </Button>
                    ) : (
                      <>
                        <Input
                          disabled
                          value={
                            wallet.publicKey.toString().slice(0, 4) +
                            "..." +
                            wallet.publicKey.toString().slice(-4)
                          }
                          className="text-center h-12 disabled:opacity-100 bg-background/40"
                        />
                        <div className="flex gap-4 flex-wrap">
                          <Button
                            variant={"secondary"}
                            size="lg"
                            className="grow bg-transparent border text-foreground border-foreground hover:bg-foreground/90 hover:text-background"
                            onClick={wallet.disconnect}
                          >
                            Disconnect
                          </Button>
                          <Button
                            variant={"secondary"}
                            size="lg"
                            className="grow bg-transparent border text-foreground border-foreground hover:bg-foreground/90 hover:text-background"
                            onClick={() => setVisible(true)}
                          >
                            Change
                          </Button>
                        </div>
                      </>
                    )}
                    <Button
                      disabled={!wallet.publicKey}
                      variant={"default"}
                      size="lg"
                      className="relative bg-emerald-600 hover:bg-emerald-600/90"
                      onClick={() => handleOnSignInClick("solana")}
                    >
                      <Image
                        src="/icons/solana.svg"
                        alt=""
                        width={14}
                        height={11}
                        className="absolute left-4 fill-white"
                      />
                      {isLoading == "solana" ? (
                        <LuLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Login with Solana Wallet"
                      )}
                    </Button>
                  </div>
                  <Button
                    variant={"link"}
                    onClick={() => push("/?q=all")}
                    className="underline h-auto w-auto p-0 text-foreground mx-auto"
                  >
                    Back
                  </Button>
                </>
              ) : (
                <>
                  {query.error == "OAuthCreateAccount" && (
                    <p className="rounded-xl text-center bg-destructive p-4 text-destructive-foreground">
                      Something went wrong
                    </p>
                  )}
                  <Button
                    key={"google-register"}
                    variant={"default"}
                    size="lg"
                    onClick={() => handleOnSignInClick("google")}
                    className="relative "
                  >
                    <FaGoogle className="absolute left-4" />
                    {isLoading == "google" ? (
                      <LuLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Login with Google"
                    )}
                  </Button>

                  <div className="flex gap-2 justify-center flex-wrap">
                    <p className="text-center">
                      Connected discord, twitter, or solana wallet?
                    </p>
                    <Button
                      variant={"link"}
                      onClick={() => push("/?q=all")}
                      className="underline h-auto w-auto p-0 text-foreground"
                    >
                      Login here
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-center py-3 border-none mt-auto">
            <p className="w-full">
              @2023 Sapphire | All Rights Reserved. |{" "}
              <Link href="/policy/privacy-policy">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};
