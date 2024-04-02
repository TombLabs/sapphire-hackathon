import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUserHooks";
import { connection, paymentWallet } from "@/lib/constants";
import { fetcher } from "@/lib/helpers/utils";
import { buildBurnTxs } from "@/lib/helpers/web3-helpers";
import { BurnableNfts } from "@/types";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import { sol } from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsTransaction,
} from "@metaplex-foundation/umi-web3js-adapters";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { NextSeo } from "next-seo";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

export default function BurnPage() {
  const wallet = useAnchorWallet();
  const { data: user, mutate } = useUser();
  const { theme } = useTheme();
  const loadIncrement = 10;
  const [loadAmount, setLoadAmount] = useState(loadIncrement);
  const [page, setPage] = useState(0);
  const [prevAmount, setPrevAmount] = useState(10);
  const {
    data: nfts,
    isLoading,
    mutate: mutateNfts,
  } = useSWR<BurnableNfts[]>(
    wallet?.publicKey
      ? `/api/nfts/get/burnable/${wallet.publicKey.toBase58()}?limit=${loadAmount}&page=${page}`
      : null,
    fetcher
  );

  const [selectedBurnable, setSelectedBurnable] = useState<BurnableNfts[]>([]);
  const [isBurning, setIsBurning] = useState(false);

  function handleClickNft(nft: BurnableNfts) {
    if (selectedBurnable.includes(nft)) {
      setSelectedBurnable((prev) => prev.filter((item) => item !== nft));
    } else {
      setSelectedBurnable((prev) => [...prev, nft]);
    }
  }

  async function loadMore() {
    setPage(page + 1);
    setLoadAmount(loadAmount + loadIncrement);
  }

  async function handleBurn() {
    if (!wallet) return toast.error("Please Connect Your Wallet!");
    console.log(selectedBurnable);
    if (selectedBurnable.length === 0)
      return toast.error("Please Select NFTs to Burn!");
    const toastId = toast.loading("Burning NFTs...");
    setIsBurning(true);
    try {
      const { txs, umi } = await buildBurnTxs(wallet, selectedBurnable);
      const blockhash = await connection.getLatestBlockhash();
      const feeTx = transferSol(umi, {
        destination: fromWeb3JsPublicKey(paymentWallet),
        amount: sol(0.005 * selectedBurnable.length),
      });
      txs.push(feeTx);
      let web3JsTxs = [];

      for (const tx of txs) {
        const newTx = await tx.buildWithLatestBlockhash(umi);
        const web3Tx = toWeb3JsTransaction(newTx);
        web3JsTxs.push(web3Tx);
      }

      const signedTxs = await wallet.signAllTransactions(web3JsTxs);
      for (const tx of signedTxs) {
        const txid = await connection.sendRawTransaction(tx.serialize());
        console.log(txid);
      }

      const addSapphireResponse = await axios.patch(
        "/api/user/update/sapphires",
        {
          num: selectedBurnable.length * 2,
        }
      );
      toast.success(
        `NFTs Burned Successfully! ${
          2 * selectedBurnable.length
        } Sapphires Added to your account!`,
        { id: toastId }
      );
      setLoadAmount(loadIncrement);
      setPage(0);
      await mutate();
      await mutateNfts();
      setSelectedBurnable([]);
      setIsBurning(false);
    } catch (err: any) {
      console.log(err);
      toast.error("Error Burning NFTs", { id: toastId });

      setIsBurning(false);
    }
  }

  return (
    <>
      <NextSeo title="Burn for Sapphires" />
      <section className="absolute inset-x-0 top-0 bottom-auto h-80 w-full object-cover">
        <Image
          src={"/images/sapphire_burn.png"}
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
        <h1 className="text-center">Burn for Sapphires</h1>
        <h2 className="text-center text-sm text-neutral-400 -mt-6">
          Earn Sapphires and Sol for burning your standard and programmable NFTS
        </h2>
      </section>
      <section className="flex flex-col gap-8 px-6 pb-16 rounded-lg border-2 border-blue-900/20 mx-auto max-w-5xl w-full relative">
        {!wallet?.publicKey ? (
          <p className="text-center mt-20">Please Connect Your Wallet!</p>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-row justify-start items-center gap-2 border-b-2 border-blue-900/20 rounded-lg px-4 h-16 w-full">
              <Button>Select All</Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={selectedBurnable.length === 0}
              >
                Clear All
              </Button>
              <div className="flex flex-row items-center justify-center gap-2 mx-auto">
                <p>2</p>
                <Image
                  src={
                    theme === "light"
                      ? "/sapphire_blue.png"
                      : "/sapphire_white.png"
                  }
                  height={18}
                  width={18}
                  alt="sapphire"
                  className="-mx-2"
                />
                <p className="text-center text-sm"> / NFT</p>
              </div>

              <Button
                disabled={selectedBurnable.length === 0}
                isLoading={isBurning}
                onClick={handleBurn}
                type="button"
                className="bg-red-600 hover:bg-red-700 ml-auto"
              >
                Burn{" "}
                {selectedBurnable.length > 0
                  ? `(${selectedBurnable.length})`
                  : ""}
              </Button>
            </div>
            <div className="grid sm:grid-cols-6 grid-cols-2 mx-auto items-center justify-center gap-2 mt-6">
              {isLoading ? (
                <>
                  {Array(6)
                    .fill(null)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-36 w-36 rounded-lg" />
                    ))}
                </>
              ) : nfts?.length === 0 ? (
                <p className="text-center">No Burnable NFTs Found</p>
              ) : (
                <>
                  {nfts?.map((nft, i) => (
                    <div
                      className={`flex flex-col h-36 w-36 items-center rounded-lg justify-center relative cursor-pointer ${
                        selectedBurnable.includes(nft) &&
                        "border-2 border-white opacity-50"
                      } hover:border-2 border-blue-900/20`}
                      onClick={() => handleClickNft(nft)}
                      key={i}
                    >
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="rounded-lg h-36 w-36 object-cover hover:opacity-80"
                        key={i}
                      />
                    </div>
                  ))}
                  {!!user && user.generations.length > loadAmount && (
                    <div className="flex items-center justify-center border rounded-xl h-36">
                      <Button onClick={() => loadMore()}>Load More</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
