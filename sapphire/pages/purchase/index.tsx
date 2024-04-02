import { LayoutBasic } from "@/components/layout/layout-basic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { useUser } from "@/hooks/useUserHooks";
import { PricingPackages, bonk, connection } from "@/lib/constants";
import { fetcher, tryCatchErrorHandler } from "@/lib/helpers/utils";
import {
  getTokenBalances,
  purchaseInBonk,
  purchaseInGecko,
  purchaseInShdw,
  purchaseInSol,
  purchaseInWif,
} from "@/lib/helpers/web3-helpers";
import { PricingPackagesTypes } from "@/types";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { motion } from "framer-motion";
import { NextSeo } from "next-seo";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuFlame, LuLoader2, LuPartyPopper } from "react-icons/lu";
import { Tooltip as ReactTooltip } from "react-tooltip";
import useSWRImmutable from "swr/immutable";

export default function PurchasePage() {
  const [selected, setSelected] = useState<null | PricingPackagesTypes>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { data: user } = useUser();
  const wallet = useAnchorWallet();
  const { setVisible } = useWalletModal();
  const { data } = useSWRImmutable(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  );
  const {
    data: tokenPricesData,
    isLoading: isTokenPricesLoading,
    error: isTokenPricesError,
  } = useSWRImmutable("/api/tokens/prices", fetcher, {
    refreshInterval: 10000,
  });

  const [tokenBalances, setTokenBalances] = useState({
    sol: 0,
    usdc: 0,
    bonk: 0,
    dogWifHat: 0,
    shdw: 0,
    gecko: 0,
  });

  async function getAndSetTokenBalances() {
    const balances = await getTokenBalances(wallet?.publicKey!);
    setTokenBalances(balances);
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      getAndSetTokenBalances();
    }
  }, [wallet]);

  const handlePurchase = async (
    token: "sol" | "usdc" | "bonk" | "shdw" | "dogwifhat" | "gecko"
  ) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!selected) {
      toast.error("Please select a package");
      return;
    }
    if (!user) return toast.error("Check that your user account is logged in");

    console.log(tokenBalances);
    setIsLoading(true);
    setIsComplete(false);
    try {
      const blockhash = await connection.getLatestBlockhash();

      switch (token) {
        case "sol":
          if (
            tokenBalances.sol <
            (selected.priceUsd / data.solana.usd) * 10 ** 9
          ) {
            toast.error("Insufficient SOL balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const solPurchaseTx = await purchaseInSol(
            selected!,
            wallet!.publicKey.toBase58()
          );

          const memoIxResponse = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const ix = memoIxResponse.data.memoIx;
          solPurchaseTx.add(ix);
          solPurchaseTx.recentBlockhash = blockhash.blockhash;
          solPurchaseTx.feePayer = wallet!.publicKey;

          const solSignedTx = await wallet.signTransaction(solPurchaseTx);
          const solTxId = await connection.sendRawTransaction(
            solSignedTx!.serialize()
          );
          console.log(solTxId);
          await axios
            .post("/api/purchases", {
              tx: solTxId,
              selectedPackage: selected!,
              paymentToken: "sol",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        case "usdc":
          if (tokenBalances.usdc < selected.priceUsd * 10 ** 6) {
            toast.error("Insufficient USDC balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const purchaseInUsdc = (await import("@/lib/helpers/web3-helpers"))
            .purchaseInUsdc;
          const usdcPurchaseTx = await purchaseInUsdc(
            selected!,
            wallet!.publicKey.toBase58()
          );
          const memoIxResponseUSDC = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const ixUSDC = memoIxResponseUSDC.data.memoIx;
          usdcPurchaseTx.add(ixUSDC);
          usdcPurchaseTx.recentBlockhash = blockhash.blockhash;
          usdcPurchaseTx.feePayer = wallet!.publicKey;
          const usdcSignedTx = await wallet.signTransaction(usdcPurchaseTx);
          const usdcTxId = await connection.sendRawTransaction(
            usdcSignedTx!.serialize()
          );
          console.log(usdcTxId);
          await axios
            .post("/api/purchases", {
              tx: usdcTxId,
              selectedPackage: selected!,
              paymentToken: "usdc",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        case "bonk":
          if (
            tokenBalances.bonk <
            (selected.priceUsd / tokenPricesData.bonkPrice) * 10 ** 5
          ) {
            toast.error("Insufficient Bonk balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const bonkPurchaseTx = await purchaseInBonk(
            selected!,
            wallet!.publicKey.toBase58(),
            tokenPricesData?.bonkPrice!
          );

          const bonkMemoResponse = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const bonkix = bonkMemoResponse.data.memoIx;
          bonkPurchaseTx.add(bonkix);
          bonkPurchaseTx.recentBlockhash = blockhash.blockhash;
          bonkPurchaseTx.feePayer = wallet!.publicKey;

          const bonkSignedTx = await wallet.signTransaction(bonkPurchaseTx);
          const bonkTxId = await connection.sendRawTransaction(
            bonkSignedTx!.serialize()
          );
          console.log(bonkTxId);
          await axios
            .post("/api/purchases", {
              tx: bonkTxId,
              selectedPackage: selected!,
              paymentToken: "bonk",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        case "gecko":
          if (
            tokenBalances.gecko <
            (selected.priceUsd / tokenPricesData.geckoPrice) * 10 ** 6
          ) {
            toast.error("Insufficient Gecko balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const geckoPurchaseTx = await purchaseInGecko(
            selected!,
            wallet!.publicKey.toBase58(),
            tokenPricesData?.geckoPrice!
          );

          const geckoMemoResponse = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const geckoix = geckoMemoResponse.data.memoIx;
          geckoPurchaseTx.add(geckoix);
          geckoPurchaseTx.recentBlockhash = blockhash.blockhash;
          geckoPurchaseTx.feePayer = wallet!.publicKey;

          const geckoSignedTx = await wallet.signTransaction(geckoPurchaseTx);
          const geckoTxId = await connection.sendRawTransaction(
            geckoSignedTx!.serialize()
          );
          console.log(geckoTxId);
          await axios
            .post("/api/purchases", {
              tx: geckoTxId,
              selectedPackage: selected!,
              paymentToken: "gecko",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        case "dogwifhat":
          if (
            tokenBalances.dogWifHat <
            (selected.priceUsd / tokenPricesData.dogWifHatPrice) * 10 ** 6
          ) {
            toast.error("Insufficient Dog Wif Hat balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const dogWifHatPurchaseTx = await purchaseInWif(
            selected!,
            wallet!.publicKey.toBase58(),
            tokenPricesData?.dogWifHatPrice!
          );

          const dogWifHatMemoResponse = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const dogWifHatix = dogWifHatMemoResponse.data.memoIx;
          dogWifHatPurchaseTx.add(dogWifHatix);
          dogWifHatPurchaseTx.recentBlockhash = blockhash.blockhash;
          dogWifHatPurchaseTx.feePayer = wallet!.publicKey;

          const dogWifHatSignedTx = await wallet.signTransaction(
            dogWifHatPurchaseTx
          );
          const dogWifHatTxId = await connection.sendRawTransaction(
            dogWifHatSignedTx!.serialize()
          );
          console.log(dogWifHatTxId);
          await axios
            .post("/api/purchases", {
              tx: dogWifHatTxId,
              selectedPackage: selected!,
              paymentToken: "wif",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        case "shdw":
          if (
            tokenBalances.shdw <
            (selected.priceUsd / tokenPricesData.shdwPrice) * 10 ** 9
          ) {
            toast.error("Insufficient SHDW balance");
            setIsLoading(false);
            return;
          }
          // make payment
          const shdwPurchaseTx = await purchaseInShdw(
            selected!,
            wallet!.publicKey.toBase58(),
            tokenPricesData?.shdwPrice!
          );

          const shdwMemoResponse = await axios.post(
            "/api/transactions/get/memo",
            {
              wallet: wallet.publicKey.toBase58(),
              memoData: {
                sapphirePackage: selected.id,
                type: "purchase sapphires",
              },
            }
          );
          const shdwix = shdwMemoResponse.data.memoIx;
          shdwPurchaseTx.add(shdwix);
          shdwPurchaseTx.recentBlockhash = blockhash.blockhash;
          shdwPurchaseTx.feePayer = wallet!.publicKey;

          const shdwSignedTx = await wallet.signTransaction(shdwPurchaseTx);
          const shdwTxId = await connection.sendRawTransaction(
            shdwSignedTx!.serialize()
          );
          console.log(shdwTxId);
          await axios
            .post("/api/purchases", {
              tx: shdwTxId,
              selectedPackage: selected!,
              paymentToken: "shdw",
            })
            .then((res) => {
              console.log("Credit purchase successful");
            })
            .catch((err) => {
              throw new Error(err);
            });
          break;
        default:
          throw new Error("Invalid payment method");
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsComplete(true);
    } catch (err) {
      tryCatchErrorHandler(err);
    }
    setIsLoading(false);
  };

  return (
    <>
      <NextSeo title="Purchase Sapphire" />
      {!!selected ? (
        <>
          {isComplete ? (
            <motion.div
              key={"complete"}
              initial={{ opacity: 0, y: "10px" }}
              animate={{ opacity: 1, y: "0px" }}
              transition={{ duration: 0.75 }}
              className=" flex flex-col gap-8 sm:max-w-md w-full"
            >
              <div className="text-center space-y-2">
                <LuPartyPopper className="mx-auto w-12 h-12" />

                <h1>Purchase Successful</h1>
                <p className="text-muted-foreground">
                  {selected?.totalCredits} Sapphires have been added to your
                  account
                </p>
              </div>

              <Button
                variant={"outline"}
                size={"lg"}
                onClick={() => {
                  setSelected(null);
                  setIsComplete(false);
                }}
              >
                Back
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={"confirm"}
              initial={{ opacity: 0, y: "10px" }}
              animate={{ opacity: 1, y: "0px" }}
              transition={{ duration: 0.75 }}
              className=" flex flex-col gap-8 sm:max-w-md w-full"
            >
              <h1 className="text-center">Payment Method</h1>
              <Card
                key={selected.id}
                className={`grow relative group ${
                  selected.recommend ? "ring-primary ring-2 " : ""
                }`}
              >
                {selected.recommend && (
                  <Badge
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1/2 gap-1"
                    variant={"default"}
                  >
                    <LuFlame className="w-3 h-3 fill-foreground" />
                    Best Deal
                  </Badge>
                )}

                <CardHeader>
                  <div className="relative p-8 py-24 flex-col flex items-center justify-center text-center">
                    <p className="capitalize text-base">
                      {selected.id} Package
                    </p>
                    <h2>{selected.totalCredits} Sapphires</h2>

                    <h3>{selected.priceUsd} USDC</h3>
                  </div>
                </CardHeader>
                <CardFooter className="absolute bottom-0 inset-x-0 p-4">
                  <p className="w-full text-center text-sm text-muted-foreground">
                    {selected.credits} + {selected.freeCredits} Free Sapphires
                  </p>
                </CardFooter>
              </Card>

              {isLoading ? (
                <LuLoader2 className=" animate-spin h-8 w-8 mx-auto" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {!wallet ? (
                    <Button
                      variant={"default"}
                      size={"lg"}
                      className="sm:col-span-2"
                      onClick={() => setVisible(true)}
                    >
                      Connect Wallet
                    </Button>
                  ) : (
                    <>
                      <Button
                        disabled={isLoading}
                        isLoading={isLoading || isTokenPricesLoading}
                        variant={"default"}
                        size={"lg"}
                        className="flex items-center gap-2 border-2 border-[#2775CA] hover:bg-[#2775CA] bg-transparent "
                        onClick={() => handlePurchase("usdc")}
                        data-tooltip-id="usdc"
                      >
                        {isTokenPricesLoading ? (
                          <LuLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <img
                              src="/images/tokens/usdc.png"
                              className="rounded-ful h-8 w-8"
                              alt="usdc"
                            />{" "}
                            {selected.priceUsd} USDC
                          </>
                        )}
                      </Button>

                      <ReactTooltip
                        id="usdc"
                        place="top"
                        content={`Balance: ${
                          (tokenBalances.usdc / 10 ** 6).toLocaleString() ?? 0
                        } USDC`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#2775CA] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />

                      <Button
                        disabled={isLoading}
                        isLoading={isLoading}
                        variant={"default"}
                        className="flex items-center gap-2 border-2 border-[#7E5AEE] hover:bg-[#7E5AEE] bg-transparent"
                        size={"lg"}
                        onClick={() => handlePurchase("sol")}
                        data-tooltip-id="sol"
                      >
                        <img
                          src="/images/tokens/sol.png"
                          className="rounded-full h-8 w-8"
                          alt="sol"
                        />{" "}
                        {!!data
                          ? Math.floor(
                              (selected.priceUsd / data.solana.usd) * 100
                            ) / 100
                          : "-"}{" "}
                        SOL
                      </Button>
                      <ReactTooltip
                        id="sol"
                        place="top"
                        content={`Balance: ${
                          (tokenBalances.sol / 10 ** 9).toLocaleString() ?? 0
                        } SOL`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#7E5AEE] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />
                      <Button
                        disabled={isLoading}
                        isLoading={isLoading || isTokenPricesLoading}
                        variant={"default"}
                        className="flex items-center gap-2 border-2 border-[#FDD001] hover:bg-[#FDD001] hover:text-black bg-transparent"
                        size={"lg"}
                        onClick={() => handlePurchase("bonk")}
                        data-tooltip-id="bonk"
                      >
                        {isTokenPricesLoading ? (
                          <LuLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <img
                              src="/images/tokens/bonk.jpg"
                              className="rounded-full h-8 w-8"
                              alt="bonk"
                            />{" "}
                            {Math.ceil(
                              selected.priceUsd / tokenPricesData.bonkPrice
                            ).toLocaleString()}{" "}
                            Bonk
                          </>
                        )}
                      </Button>
                      <ReactTooltip
                        id="bonk"
                        place="top"
                        content={`Balance: ${
                          (tokenBalances.bonk / 10 ** 5).toLocaleString() ?? 0
                        } BONK`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#FDD001] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />
                      <Button
                        disabled={isLoading}
                        isLoading={isLoading || isTokenPricesLoading}
                        variant={"default"}
                        className="flex items-center gap-2 border-2 border-[#BB950C] hover:bg-[#BB950C] hover:text-black bg-transparent"
                        size={"lg"}
                        onClick={() => handlePurchase("gecko")}
                        data-tooltip-id="gecko"
                      >
                        {isTokenPricesLoading ? (
                          <LuLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <img
                              src="/images/tokens/gecko.png"
                              className="rounded-full h-8 w-8"
                              alt="gecko"
                            />{" "}
                            {Math.ceil(
                              selected.priceUsd / tokenPricesData.geckoPrice
                            ).toLocaleString()}{" "}
                            Gecko
                          </>
                        )}
                      </Button>
                      <ReactTooltip
                        id="gecko"
                        place="top"
                        content={`Balance: ${
                          (tokenBalances.gecko / 10 ** 6).toLocaleString() ?? 0
                        } GECKO`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#BB950C] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />
                      <Button
                        disabled={isLoading}
                        isLoading={isLoading || isTokenPricesLoading}
                        variant={"default"}
                        className="flex items-center gap-2 border-2 border-[#B57C6C] hover:bg-[#B57C6C] hover:text-black bg-transparent"
                        size={"lg"}
                        onClick={() => handlePurchase("dogwifhat")}
                        data-tooltip-id="dogwifhat"
                      >
                        {isTokenPricesLoading ? (
                          <LuLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <img
                              src="/images/tokens/dogwifhat.jpg"
                              className="rounded-full h-8 w-8"
                              alt="dog wif hat"
                            />{" "}
                            {Math.ceil(
                              selected.priceUsd / tokenPricesData.dogWifHatPrice
                            ).toLocaleString()}{" "}
                            Dog Wif Hat
                          </>
                        )}
                      </Button>

                      <ReactTooltip
                        id="dogwifhat"
                        place="top"
                        content={`Balance: ${
                          (
                            tokenBalances.dogWifHat /
                            10 ** 6
                          ).toLocaleString() ?? 0
                        } DOG WIF HAT`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#B57C6C] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />
                      <Button
                        disabled={isLoading}
                        isLoading={isLoading || isTokenPricesLoading}
                        variant={"default"}
                        className="flex items-center gap-2 border-2 border-[#11FA98] hover:bg-[#11FA98] hover:text-black bg-transparent"
                        size={"lg"}
                        onClick={() => handlePurchase("shdw")}
                        data-tooltip-id="shdw"
                      >
                        {isTokenPricesLoading ? (
                          <LuLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <img
                              src="/images/tokens/shdw.png"
                              className="rounded-full h-8 w-8"
                              alt="shdw"
                            />{" "}
                            {Math.ceil(
                              selected.priceUsd / tokenPricesData.shdwPrice
                            ).toLocaleString()}{" "}
                            SHDW
                          </>
                        )}
                      </Button>
                      <ReactTooltip
                        id="shdw"
                        place="top"
                        content={`Balance: ${
                          (tokenBalances.shdw / 10 ** 9).toLocaleString() ?? 0
                        } SHDW`}
                        className="rounded-lg bg-blue-950 border-[1px] border-[#11FA98] tracking-wider"
                        style={{
                          backgroundColor: "#020817",
                        }}
                      />
                    </>
                  )}
                  <Button
                    disabled={isLoading}
                    variant={"outline"}
                    size={"lg"}
                    onClick={() => setSelected(null)}
                    className="sm:col-span-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <div
          key={"selecting"}
          className=" flex flex-col gap-8 max-w-screen-2xl w-full"
        >
          <section className="text-center space-y-2">
            <h1>Get More Sapphires</h1>
            <p className="text-muted-foreground">
              Choose a package that you would like to purchase
            </p>
          </section>

          <div className="flex flex-wrap sm:gap-12 gap-8 z-10">
            {PricingPackages.map((_package, i) => (
              <Card
                key={_package.id}
                onClick={() => {
                  setSelected(_package);
                  setIsComplete(false);
                }}
                className={`grow relative group transition-all cursor-pointer hover:-translate-y-2 ${
                  _package.recommend
                    ? "ring-primary ring-2 hover:shadow-xl hover:shadow-primary/40"
                    : "hover:ring-2 hover:ring-foreground hover:shadow-xl hover:shadow-foreground/20"
                }`}
              >
                {_package.recommend && (
                  <Badge
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-10 -translate-y-1/2 gap-1"
                    variant={"default"}
                  >
                    <LuFlame className="w-3 h-3 fill-foreground" />
                    Best Deal
                  </Badge>
                )}

                <CardHeader>
                  <div className="relative p-8 py-24 flex-col flex items-center justify-center text-center">
                    <p className="capitalize text-base">
                      {_package.id} Package
                    </p>
                    <h2>{_package.totalCredits} Sapphires</h2>

                    <h3>{_package.priceUsd} USDC</h3>
                  </div>
                </CardHeader>
                <CardFooter className="absolute bottom-0 inset-x-0 p-4">
                  <p className="w-full text-center text-sm text-muted-foreground">
                    {_package.credits} + {_package.freeCredits} Free Sapphires
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

PurchasePage.getLayout = function getLayout(page: React.ReactElement) {
  return <LayoutBasic>{page}</LayoutBasic>;
};
