import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@/hooks/useUserHooks";
import bidOnAuctionTxBuilder from "@/lib/auction/instructions/bidOnAuction";
import { connection } from "@/lib/constants";
import { AuctionData } from "@/types";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import toast from "react-hot-toast";
import { KeyedMutator } from "swr";
import { Button } from "../ui/button";
import { Image } from "../ui/image";

type AuctionCardProps = {
  auction: AuctionData;
  mutate: KeyedMutator<AuctionData[]>;
};

export const AuctionCard = ({ auction, mutate }: AuctionCardProps) => {
  const wallet = useAnchorWallet();
  const { data: user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const [bid, setBid] = useState<number>(
    auction.account.highestBid.amount > 0
      ? parseFloat(
          (
            (auction.account.highestBid.amount + auction.account.minBid) /
            10 ** 9
          ).toFixed(2)
        )
      : auction.account.startPrice > 0
      ? parseFloat((auction.account.startPrice / 10 ** 9).toFixed(2))
      : parseFloat((auction.account.minBid / 10 ** 9).toFixed(2))
  );

  useEffect(() => {
    setBid(
      auction.account.highestBid.amount > 0
        ? parseFloat(
            (
              (auction.account.highestBid.amount + auction.account.minBid) /
              10 ** 9
            ).toFixed(2)
          )
        : auction.account.startPrice > 0
        ? parseFloat((auction.account.startPrice / 10 ** 9).toFixed(2))
        : parseFloat(
            (
              (auction.account.startPrice + auction.account.minBid) /
              10 ** 9
            ).toFixed(2)
          )
    );
  }, [auction]);

  const placeBid = async () => {
    if (!wallet) return toast.error("Please connect your wallet first");
    //@ts-ignore
    if (auction.userInfo.name === user?.name) {
      return toast.error("You cannot bid on your own auction");
    }
    //@ts-ignore
    if (wallet?.publicKey?.toBase58() === auction.account.creator) {
      return toast.error("You cannot bid on your own auction");
    }

    let currentBid =
      auction.account.highestBid.amount > 0
        ? auction.account.highestBid.amount
        : auction.account.startPrice;

    if (bid * 10 ** 9 < currentBid)
      return toast.error("Bid must be higher than current bid");
    setIsLoading(true);
    try {
      const bidTx = await bidOnAuctionTxBuilder(
        wallet,
        new PublicKey(auction.account.publicKey),
        bid * 10 ** 9
      );

      const blockhash = await connection.getLatestBlockhash();
      bidTx.recentBlockhash = blockhash.blockhash;
      bidTx.feePayer = wallet.publicKey;
      const signed = await wallet.signTransaction(bidTx);
      const txid = await connection.sendRawTransaction(signed.serialize());
      console.log(txid);
      await mutate();
      setIsLoading(false);
      return toast.success("Bid placed successfully");
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      return toast.error("Error placing bid");
    }
  };

  return (
    <Card
      className="hover:ring-2 ring-primary"
      onClick={() => router.push(`/auctions/${auction.account.publicKey}`)}
    >
      <CardHeader className="p-0 pb-6">
        <div className="aspect-square w-full relative rounded-xl overflow-hidden">
          <Image
            src={auction.nftData.image}
            alt={auction.nftData.name || "NFT Image"}
            sizes="480px"
            fill
          />

          {auction.account.endTime > Date.now() && (
            <div className="absolute bottom-0 inset-x-0 p-4 grid">
              <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full sm:text-sm text-xs mx-auto">
                <span className="pr-1">Ends in</span>
                <Countdown date={auction.account.endTime} />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <h3 className="truncate">{auction.nftData.name}</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-start">
              <p className="text-muted-foreground">Creator</p>

              <div className="flex flex-row justify-start gap-2 items-center w-full">
                <div className="rounded-full shrink-0 overflow-hidden">
                  <Image
                    src={auction.userInfo.image || "/logo_icon.png"}
                    alt={auction.userInfo.name || "user profile picture"}
                    height={24}
                    width={24}
                  />
                </div>

                <h4>
                  {auction.userInfo.name || (auction.account.creator as string)}
                </h4>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-muted-foreground">Current Bid:</p>

              <div className="flex flex-row justify-end gap-2 items-center w-full">
                <h4 className="">
                  {auction.account.highestBid.amount > 0
                    ? (auction.account.highestBid.amount / 10 ** 9).toFixed(
                        2
                      ) /* 
                    .split(".")[0] */
                    : 0}
                  {/* <span className="text-xl">.</span> */}
                  {/*  {(auction.account.highestBid.amount / 10 ** 9)
                    .toFixed(2)
                  .split(".")[1] || "00"} */}
                </h4>

                <Image
                  src="/icons/solana.svg"
                  height={16}
                  width={16}
                  alt="Solana"
                />
              </div>
            </div>
          </div>

          <Button
            variant={
              Date.now() > auction.account.endTime ? "secondary" : "default"
            }
            onClick={() =>
              router.push(`/auctions/${auction.account.publicKey}`)
            }
          >
            {Date.now() > auction.account.endTime
              ? "View Results"
              : "View Auction"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  // return (
  //   <Card
  //     key={auction.nftMint}
  //     className={`w-full relative group pt-2 ${Date.now() > auction.account.endTime && "opacity-60"}
  //   `}
  //   >
  //     <CardContent>
  //       <div className="relative">
  //         <Image
  //           src={auction.nftData.image}
  //           alt={auction.nftData.name || "NFT Image"}
  //           height={300}
  //           width={300}
  //           className="rounded-lg shadow-md shadow-blue-800 mx-auto object-cover"
  //         />
  //         <div className="absolute top-2 right-2 flex flex-col justify-center items-center bg-background/60 border-[1px] border-blue-900/20 rounded-lg p-2">
  //           {auction.account.endTime < Date.now() ? (
  //             <p>Ended</p>
  //           ) : (
  //             <Countdown date={auction.account.endTime} className="text-sm" />
  //           )}
  //         </div>
  //       </div>
  //       <div className="w-[300px] flex flex-col justify-start items-start gap-4">
  //         <p className="mt-2 font-bold text-lg mx-auto">{auction.nftData.name}</p>
  //         <div className="flex flex-row justify-between items-center w-full">
  //           <div className="flex flex-col justify-start items-start">
  //             <p className="text-xs">Artist:</p>
  //             <div className="flex flex-row justify-start items-center w-full">
  //               <Image
  //                 src={auction.userInfo.image || "/logo_icon.png"}
  //                 height={25}
  //                 width={25}
  //                 className="rounded-full"
  //                 alt={auction.userInfo.name || "user profile picture"}
  //               />
  //               <p className="text-sm text-center overflow-hidden text-ellipsis w-24">
  //                 {auction.userInfo.name || (auction.account.creator as string)}
  //               </p>
  //             </div>
  //           </div>
  //           <div className="flex flex-col justify-start items-start">
  //             <p className="text-xs">Current Bid:</p>
  //             <div className="p-2 rounded-lg border-[1px] border-blue-900/20 flex flex-row justify-between items-center gap-2">
  //               <Image src="/icons/solana.svg" height={15} width={15} alt="Solana" />
  //               <p className="text-md font-roboto">
  //                 {auction.account.highestBid.amount > 0
  //                   ? (auction.account.highestBid.amount / 10 ** 9).toFixed(2) /*
  //                       .split(".")[0] */
  //                   : 0}
  //                 {/* <span className="text-xl">.</span> */}
  //                 {/*  {(auction.account.highestBid.amount / 10 ** 9)
  //                   .toFixed(2)
  //                   .split(".")[1] || "00"} */}
  //                 {" SOL"}
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         {/* <div className="flex flex-row justify-between items-center gap-2">
  //           <div className="flex flex-col justify-start items-start gap-1">
  //             <p className="text-xs">Enter Bid:</p>
  //             <div className="flex flex-row w-full justify-between items-center gap-2">
  //               <Input
  //                 placeholder="Enter Bid"
  //                 className="w-1/2 font-roboto"
  //                 type="number"
  //                 step={parseFloat(
  //                   (auction.account.minBid / 10 ** 9).toFixed(2)
  //                 )}
  //                 onChange={(e) => setBid(parseFloat(e.target.value))}
  //                 value={bid.toFixed(2)}
  //               ></Input>
  //               <Button
  //                 type="button"
  //                 onClick={placeBid}
  //                 isLoading={isLoading}
  //                 disabled={Date.now() > auction.account.endTime}
  //               >
  //                 Place Bid
  //               </Button>
  //             </div>
  //             <p className="text-xs w-1/2">
  //               Bid must be{" "}
  //               {(
  //                 (auction.account.highestBid.amount > 0
  //                   ? auction.account.highestBid.amount + auction.account.minBid
  //                   : auction.account.minBid) /
  //                 10 ** 9
  //               ).toFixed(2)}{" "}
  //               SOL or more in increments of{" "}
  //               {(auction.account.minBid / 10 ** 9).toFixed(2)}{" "}
  //             </p>
  //           </div>
  //         </div>
  //         <p className="text-xs -mb-4">
  //           {auction.account.endTime < Date.now() ? "Winner" : "Highest Bidder"}
  //           :
  //         </p>
  //         <p className="text-md w-full p-2 border-[1px] border-blue-900/20 overflow-hidden text-ellipsis">
  //           {auction.account.highestBid.amount > 0
  //             ? (auction.account.highestBid.bidder as string)
  //             : auction.account.endTime < Date.now()
  //             ? "No Winner"
  //             : "No Bids!"}{" "}
  //         </p> */}

  //         <Button
  //           type="button"
  //           onClick={() => router.push(`/auctions/${auction.account.publicKey}`)}
  //           isLoading={isLoading}
  //           disabled={Date.now() > auction.account.endTime}
  //           className="w-full"
  //         >
  //           View Auction
  //         </Button>
  //       </div>
  //     </CardContent>
  //   </Card>
  // );
};
