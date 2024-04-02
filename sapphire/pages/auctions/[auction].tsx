import CustomCountdown from "@/components/auctions/CustomCountdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountdown } from "@/hooks/useCountdown";
import { useUser } from "@/hooks/useUserHooks";
import bidOnAuctionTxBuilder from "@/lib/auction/instructions/bidOnAuction";
import { connection } from "@/lib/constants";
import { fetcher } from "@/lib/helpers/utils";

import { AuctionData } from "@/types";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import toast from "react-hot-toast";
import useSWR, { KeyedMutator } from "swr";

const AuctionPage = () => {
  const router = useRouter();
  const { auction } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: auctionData,
    isLoading: isAuctionDataLoading,
    mutate,
  } = useSWR<AuctionData>(
    auction ? `/api/auctions/fetch/${auction}` : null,
    fetcher
  );
  const {
    data: otherAuctions,
    isLoading: isOtherAuctionsLoading,
    mutate: mutateOtherAuctions,
  } = useSWR<{ data: AuctionData[]; isUserAuctions: boolean }>(
    auction && auctionData?.userInfo?.user
      ? `/api/auctions/fetch/otherAuctions?auctionId=${auction}&creator=${auctionData?.userInfo?.user}`
      : null,
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  useEffect(() => {
    if (auctionData) {
      setIsLoading(false);
    }
  }, [auctionData]);

  return (
    <>
      <NextSeo title="Sapphire Auctions - Auction Details" />
      <div className="px-4 sm:px-6 py-16 flex flex-col gap-6">
        <h2>Auction Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col justify-start items-center">
            {isAuctionDataLoading || isLoading ? (
              <Skeleton className="w-full h-96 rounded-lg" />
            ) : (
              <>
                <img
                  src={auctionData?.nftData.image}
                  alt="nft-image"
                  className="w-5/6 rounded-t-lg border border-border"
                />

                <div className="flex flex-col justify-start items-start w-5/6 px-4 border border-border rounded-b-lg">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`accordion-item-1`}>
                      <AccordionTrigger className="text-md font-bold uppercase text-[#0369DE]">
                        Terms And Conditions
                      </AccordionTrigger>
                      <AccordionContent>
                        <TermsAndConditions />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col w-full gap-4">
            {isAuctionDataLoading ? (
              <Skeleton className="w-full h-96" />
            ) : (
              <>
                <AuctionDetails
                  auctionData={auctionData!}
                  mutate={mutate}
                  isAuctionDataLoading={isAuctionDataLoading}
                />
                <OtherAutions
                  isOtherAuctionsLoading={isOtherAuctionsLoading}
                  otherAuctions={otherAuctions!}
                  mutateOtherAuctions={mutateOtherAuctions}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionPage;

const TermsAndConditions = () => {
  return (
    <div className="flex flex-col gap-6">
      <ul className="px-4">
        <li className="text-sm list-disc">
          All bids are final and cannot be cancelled or reduced.
        </li>
        <li className="text-sm list-disc">
          Your bid will be automatically returned to you if you are outbid.
        </li>
        <li className="text-sm list-disc">
          The highest bidder when the auction expires will be automatically sent
          the NFT.
        </li>
        <li className="text-sm list-disc">
          The Auction creator will receive the highest bid amount minus a 1%
          fee.
        </li>
        <li className="text-sm list-disc">
          In the event of no bids, the nft will be returned to the creator.
        </li>
        <li className="text-sm list-disc">
          Please allow up to 15 minutes upon auction completion for the NFT or
          Funds to be sent.
        </li>
        <li className="text-sm list-disc">
          Auctions may be cancelled by creator IF and ONLY IF there are NO bids.
        </li>
      </ul>
    </div>
  );
};

const AuctionDetails = ({
  auctionData,
  mutate,
  isAuctionDataLoading,
}: {
  auctionData: AuctionData;
  mutate: KeyedMutator<AuctionData>;
  isAuctionDataLoading: boolean;
}) => {
  const wallet = useAnchorWallet();
  const { data: user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const [bid, setBid] = useState<number>(
    auctionData?.account?.highestBid.amount > 0
      ? parseFloat(
          (
            (auctionData?.account.highestBid.amount +
              auctionData?.account.minBid) /
            10 ** 9
          ).toFixed(2)
        )
      : auctionData?.account?.startPrice > 0
      ? parseFloat((auctionData?.account?.startPrice / 10 ** 9).toFixed(2))
      : parseFloat((auctionData?.account?.minBid / 10 ** 9).toFixed(2))
  );

  useEffect(() => {
    setBid(
      auctionData?.account?.highestBid.amount > 0
        ? parseFloat(
            (
              (auctionData?.account?.highestBid.amount +
                auctionData?.account?.minBid) /
              10 ** 9
            ).toFixed(2)
          )
        : auctionData?.account?.startPrice > 0
        ? parseFloat((auctionData?.account?.startPrice / 10 ** 9).toFixed(2))
        : parseFloat(
            (
              (auctionData?.account.startPrice + auctionData?.account?.minBid) /
              10 ** 9
            ).toFixed(2)
          )
    );
  }, [auctionData]);

  const placeBid = async () => {
    if (!wallet) return toast.error("Please connect your wallet first");
    //@ts-ignore
    if (auctionData?.userInfo.name === user?.name) {
      return toast.error("You cannot bid on your own auction");
    }
    //@ts-ignore
    if (wallet?.publicKey?.toBase58() === auctionData?.account?.creator) {
      return toast.error("You cannot bid on your own auction");
    }

    let currentBid =
      auctionData?.account?.highestBid.amount > 0
        ? auctionData?.account?.highestBid.amount
        : auctionData?.account?.startPrice;

    if (bid * 10 ** 9 < currentBid)
      return toast.error("Bid must be higher than current bid");
    setIsLoading(true);
    try {
      const bidTx = await bidOnAuctionTxBuilder(
        wallet,
        new PublicKey(auctionData?.account?.publicKey),
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
  const [days, hours, minutes, seconds] = useCountdown(
    auctionData?.account?.endTime
  );

  return (
    <div className="flex flex-col gap-6 w-full min-h-96 p-4 rounded-lg border border-border relative">
      <div className="flex flex-row w-full justify-between p-2 items-center border-b border-b-border gap-4">
        <div className="flex flex-col justify-start">
          <p className="text-xs font-bold text-muted-foreground uppercase">
            Nft Name
          </p>
          <p className="text-2xl font-bold">{auctionData?.nftData?.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full items-center">
        <div className="flex flex-col justify-start items-start w-full">
          <p className="text-md font-bold text-primary uppercase">
            {auctionData?.account.endTime > Date.now()
              ? "Time Remaining:"
              : "Ended:"}
          </p>
          {auctionData?.account.endTime > Date.now() ? (
            <CustomCountdown
              days={days}
              hours={hours}
              minutes={minutes}
              seconds={seconds}
              fontSize="lg"
              pulse={true}
            />
          ) : (
            <p className="text-xl font-bold ">
              {new Date(auctionData?.account?.endTime).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-start items-start w-full">
          <p className="text-md font-bold text-primary uppercase">
            Current Bid
          </p>
          <p className="text-xl font-bold">
            {auctionData?.account?.highestBid.amount > 0
              ? (auctionData?.account?.highestBid.amount / 10 ** 9).toFixed(2)
              : auctionData?.account?.startPrice > 0
              ? (auctionData?.account?.startPrice / 10 ** 9).toFixed(2)
              : (auctionData?.account?.minBid / 10 ** 9).toFixed(2)}{" "}
            SOL
          </p>
        </div>
        <div className="flex flex-col justify-start items-start w-full">
          <p className="text-md font-bold text-primary uppercase">
            Highest Bidder
          </p>
          <p className="text-xl font-bold">
            {auctionData?.account?.highestBid.amount > 0
              ? (auctionData?.account?.highestBid?.bidder as string)
              : "No bids yet"}
          </p>
        </div>
        <div className="flex flex-col justify-end items-start w-full">
          <p className="text-md font-bold text-primary uppercase">Bid:</p>
          <div className="flex flex-row w-full justify-start items-end gap-2">
            <Input
              placeholder="Enter Bid"
              className="w-1/2 font-roboto"
              type="number"
              step={parseFloat(
                (auctionData?.account?.minBid / 10 ** 9).toFixed(2)
              )}
              onChange={(e) => setBid(parseFloat(e.target.value))}
              value={bid.toFixed(2)}
            />
            <Button
              type="button"
              onClick={placeBid}
              isLoading={isLoading}
              className="mt-auto"
              disabled={Date.now() > auctionData?.account?.endTime}
            >
              Place Bid
            </Button>
          </div>
          <p className="text-xs w-full">
            Bid must be{" "}
            {(
              (auctionData?.account?.highestBid.amount > 0
                ? auctionData?.account?.highestBid.amount +
                  auctionData?.account?.minBid
                : auctionData?.account?.minBid) /
              10 ** 9
            ).toFixed(2)}{" "}
            SOL or more in increments of{" "}
            {(auctionData?.account?.minBid / 10 ** 9).toFixed(2)}{" "}
          </p>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center border-t py-2 mt-2 border-t-border ">
        <div className="flex flex-col justify-start">
          <p className="text-md font-bold text-primary uppercase">Creator</p>
          <div className="flex flex-row justify-start items-center gap-2 -mb-4">
            <img
              src={auctionData?.userInfo?.image}
              alt="user-image"
              className="w-8 h-8 rounded-full border-2 border-border"
            />
            <p className="text-xl font-bold">{auctionData?.userInfo?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OtherAutions = ({
  otherAuctions,
  isOtherAuctionsLoading,
  mutateOtherAuctions,
}: {
  otherAuctions: { data: AuctionData[]; isUserAuctions: boolean };
  isOtherAuctionsLoading: boolean;
  mutateOtherAuctions: KeyedMutator<{
    data: AuctionData[];
    isUserAuctions: boolean;
  }>;
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 w-full p-4 rounded-lg border border-border relative min-h-60">
      <p className="text-md font-bold text-primary uppercase">
        {otherAuctions && otherAuctions.isUserAuctions
          ? `More Auctions by Creator`
          : "Check Out Other Auctions"}
      </p>
      <div className="w-full grid grid-cols-3 p-2 gap-4 items-center">
        {isOtherAuctionsLoading ? (
          <>
            {Array(3).map((_, i) => (
              <Skeleton key={`skeleton-auction-card-${i}`} className="w-full" />
            ))}
          </>
        ) : (
          <>
            {otherAuctions?.data
              ?.sort((a, b) => a.account.endTime + 1 - b.account.endTime + 2)
              .map((_auction: AuctionData) => (
                <Card
                  className="hover:ring-2 ring-primary cursor-pointer"
                  key={_auction.account.publicKey.toString()}
                  onClick={() =>
                    router.push(`/auctions/${_auction.account.publicKey}`)
                  }
                >
                  <CardHeader className="p-0 pb-3">
                    <div className="aspect-square w-full relative rounded-xl overflow-hidden">
                      <Image
                        src={_auction.nftData.image}
                        alt={_auction.nftData.name || "NFT Image"}
                        sizes="150px"
                        fill
                      />

                      <div className="absolute bottom-0 inset-x-0 p-2 grid">
                        <div className="px-2 py-1 bg-primary text-primary-foreground rounded-full sm:text-sm text-xs mx-auto">
                          <Countdown date={_auction.account.endTime} />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-center">
                      <h3 className="truncate text-sm -mt-2">
                        {_auction.nftData.name}
                      </h3>
                    </div>
                    <Button
                      type="button"
                      className="w-full h-6 mt-2"
                      onClick={() =>
                        router.push(`/auctions/${_auction.account.publicKey}`)
                      }
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </>
        )}
      </div>
    </div>
  );
};
