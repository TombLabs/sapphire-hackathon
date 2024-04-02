import CustomTokenSelect from "@/components/custom-token-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUserHooks";
import { connection } from "@/lib/constants";
import {
  buildTokenTransferTx,
  calculateSapphires,
  getSwapQuoteSol,
} from "@/lib/helpers/jupiter-helpers";
import { fetcher, tryCatchErrorHandler } from "@/lib/helpers/utils";
import { SwappableTokens } from "@/types";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { NextSeo } from "next-seo";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuLoader2 } from "react-icons/lu";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

const SwapPage = () => {
  const wallet = useAnchorWallet();
  const {
    data: tokens,
    isLoading,
    mutate: mutateTokens,
  } = useSWR<SwappableTokens[]>(
    wallet?.publicKey
      ? `/api/swap/getSwappableTokens?wallet=${wallet.publicKey.toBase58()}`
      : null,
    fetcher
  );
  const [selectedToken, setSelectedToken] = useState<SwappableTokens>(null!);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [debounceValue] = useDebounce(tokenAmount, 1000);
  const [sapphireAmount, setSapphireAmount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const { theme } = useTheme();
  const { mutate } = useUser();

  async function findSapphireAmount() {
    if (!tokenAmount || tokenAmount === 0) {
      setSapphireAmount(0);
      setIsCalculating(false);
      return;
    }

    try {
      const quote = await getSwapQuoteSol(
        selectedToken.mint,
        Math.floor(debounceValue * 10 ** selectedToken.decimals)
      );
      const sapphires = await calculateSapphires(quote.outAmount / 10 ** 9);
      setSapphireAmount(Math.floor(sapphires));
      setIsCalculating(false);
    } catch (e) {
      setIsCalculating(false);
      console.log(e);
      toast.error("Error calculating swap");
    }
  }

  useEffect(() => {
    if (!selectedToken) return;
    setIsCalculating(true);
    findSapphireAmount();
  }, [debounceValue, selectedToken]);

  async function swap() {
    if (!wallet?.publicKey) return toast.error("Please Connect Wallet!");
    if (!selectedToken) return toast.error("Please Select Token!");
    if (tokenAmount === 0) return toast.error("Please Enter Amount!");
    setIsSwapping(true);

    try {
      const transferTx = await buildTokenTransferTx(
        wallet,
        selectedToken.mint,
        tokenAmount,
        selectedToken.decimals
      );
      const blockhash = await connection.getLatestBlockhash();
      transferTx.recentBlockhash = blockhash.blockhash;
      transferTx.feePayer = wallet.publicKey;
      const signed = await wallet.signTransaction(transferTx);
      const txid = await connection.sendRawTransaction(signed.serialize());

      const finishTxResponse = await axios.post("/api/swap/finalizeSwap", {
        sapphireAmount: sapphireAmount,
      });
      await mutate();
      await mutateTokens();
      setTokenAmount(0);
      setSelectedToken(null!);

      toast.success(
        `Swap Successful! ${sapphireAmount} Sapphires Credited To Your Account!`
      );
      setIsSwapping(false);
    } catch (err) {
      console.log(err);
      tryCatchErrorHandler(err);
      setIsSwapping(false);
    }
  }

  return (
    <>
      <NextSeo title="Swap for Sapphires" />
      <section className="absolute inset-x-0 top-0 bottom-auto h-80 w-full object-cover">
        <Image
          src={"/images/swap_bg.png"}
          alt=""
          fill
          className="h-full w-full object-cover"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 100%)",
          }}
        />
      </section>
      <section className="flex flex-col gap-8 px-6 sm:pt-40 pt-32 pb-16 mx-auto max-w-5xl w-full relative">
        <h1 className="text-center">Swap for Sapphires</h1>
        <h2 className="text-center text-sm text-neutral-400 -mt-6">
          Swap any SPL Token with a SOL LP for Sapphires!
        </h2>
      </section>
      <section className="flex flex-col gap-4 justify-center items-start max-w-xl w-full rounded-lg border-2 border-blue-900/20 px-6 pt-4 pb-16 mx-auto">
        {isLoading ? (
          <Skeleton className="w-full h-10" />
        ) : !wallet?.publicKey ? (
          <p className="text-center w-full mt-20">Please Connect Wallet</p>
        ) : tokens?.length === 0 ? (
          <p className="text-center w-full mt-20">No Tokens Available</p>
        ) : (
          <div className="flex flex-col justify-center items-start w-full">
            <p className="-mb-2">Select a Token to Swap</p>
            <CustomTokenSelect
              swappableTokens={tokens!}
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              setTokenAmount={setTokenAmount}
              tokenAmount={tokenAmount}
            />
          </div>
        )}
        <div className="flex flex-col justify-center items-start w-full">
          <div className="flex flex-col items-start justify-center mb-2 w-full ">
            {isLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (
              <>
                <p className="text-sm">You Recieve:</p>
                <div className="flex flex-row items-center justify-start border-2 rounded-lg border-blue-900/20 p-2 w-full">
                  {isCalculating ? (
                    <LuLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <p className="text-md">
                        {" "}
                        {sapphireAmount.toLocaleString()} Sapphires
                      </p>
                      <Image
                        src={
                          theme === "light"
                            ? "/sapphire_black.png"
                            : "/sapphire_white.png"
                        }
                        alt="sapphires"
                        height={20}
                        width={20}
                        className=" pb-1"
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <Button
            className="w-full"
            disabled={
              !selectedToken ||
              tokenAmount === 0 ||
              sapphireAmount === 0 ||
              isCalculating
            }
            isLoading={isSwapping}
            onClick={swap}
          >
            Swap
          </Button>
        </div>
      </section>
    </>
  );
};

export default SwapPage;
