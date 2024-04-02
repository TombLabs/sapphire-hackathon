import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetcher } from "@/lib/helpers/utils";
import { AuctionData } from "@/types";
import useSWR, { KeyedMutator } from "swr";
import { Skeleton } from "../ui/skeleton";
import { AuctionCard } from "./auction-card";
const LiveAuctions = ({
  liveAuctions,
  error,
  mutate,
}: {
  liveAuctions: AuctionData[];
  error: any;
  mutate: KeyedMutator<AuctionData[]>;
}) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 sm:gap-6">
      {error ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              There was an error while fetching the list of available auctions.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !liveAuctions ? (
        [...Array(8)].map((_, i) => (
          <Card key={`skeleton-auction-card-${i}`}>
            <CardHeader className="p-0 pb-6">
              <Skeleton className="aspect-square w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex gap-2 justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                  <div className="flex gap-2 justify-between">
                    <Skeleton className="w-12 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
                <Skeleton className="w-full h-10" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : liveAuctions.length <= 0 ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>There are no Auctions available</CardTitle>
            <CardDescription>
              Check back again later or create an your own auction.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        liveAuctions
          .toSorted((a, b) => a.account.endTime - b.account.endTime)
          .map((_auction) => (
            <AuctionCard
              key={_auction.nftData.name}
              auction={_auction}
              mutate={mutate}
            />
          ))
      )}
    </div>
  );
};

export default LiveAuctions;
