import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo, useState } from "react";
import { LuBot, LuImage, LuUserCircle2, LuXCircle } from "react-icons/lu";
import { SmallDataBoxNumber } from "../../Shared/SmallDataBoxNumber";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";

type PurchaseStatProps = {
  usageData: any;
  isLoading: boolean;
  timePeriod: "allTime" | "lastMonth" | "lastWeek";
  setTimePeriod: React.Dispatch<
    React.SetStateAction<"allTime" | "lastMonth" | "lastWeek">
  >;
};
const PurchaseStats = ({
  usageData,
  isLoading,
  timePeriod,
  setTimePeriod,
}: PurchaseStatProps) => {
  const [isFullScreen, setIsFullScreen] = useState<string | null>(null!);

  return (
    <>
      {isFullScreen === "purchasesByDate" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <BarChart
              key={"purchasesByDate"}
              unformattedData={usageData?.purchasesByDate}
              label="Purchases By Day"
              backgroundColor="#0070f0"
              borderColor="#0070f0"
              borderWidth={1}
            />
            <button
              onClick={() => setIsFullScreen(null!)}
              className="absolute top-4 right-4"
            >
              <LuXCircle size={20} />
            </button>
          </div>
        </div>
      ) : isFullScreen === "packagesByCount" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <PieChart
              key={"packagesByCount"}
              unformattedData={usageData?.packagesByNumbers}
              label="Purchases per Package"
              borderWidth={1}
              backgroundColors={["#13C2C7", "#13C721", "#2050E7", "#5713C7"]}
            />
            <button
              onClick={() => setIsFullScreen(null!)}
              className="absolute top-4 right-4"
            >
              <LuXCircle size={20} />
            </button>
          </div>
        </div>
      ) : null}
      <section className="w-full flex flex-col justify-start items-center">
        <div className="w-full flex flex-row gap-6 justify-start items-start mb-4">
          <p className="text-lg">Purchase Stats</p>
          <Select
            value={timePeriod}
            onValueChange={(v) =>
              setTimePeriod(v as "allTime" | "lastMonth" | "lastWeek")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="allTime">All Time</SelectItem>
                <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                <SelectItem value="lastWeek">Last 7 Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full flex flex-wrap justify-start items-center mb-8 gap-8">
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.totalPurchases
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.totalPurchases
                : usageData?.last7Days.totalPurchases
            }
            title="Total Purchases"
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.usd
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.usd
                : usageData?.last7Days.usd
            }
            title="USD Value"
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.uniquePurchasers
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.uniquePurchasers
                : usageData?.last7Days.uniquePurchasers
            }
            title="Unique Purchasers"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.avgNumPurchases
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.avgNumPurchases
                : usageData?.last7Days.avgNumPurchases
            }
            title="Avg. Purchases Per User"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.shimmer
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.shimmer
                : usageData?.last7Days.shimmer
            }
            title="Shimmer"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.radiance
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.radiance
                : usageData?.last7Days.radiance
            }
            title="Radiance"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.luminary
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.luminary
                : usageData?.last7Days.luminary
            }
            title="Luminary"
            Icon={LuBot}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.celestial
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.celestial
                : usageData?.last7Days.celestial
            }
            title="Celestial"
            Icon={LuBot}
            isLoading={isLoading}
          />
        </div>
        <div className="w-full flex flex-row justify-between items-center gap-2 mb-4">
          {isLoading ? (
            <>
              <Skeleton className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4" />
              <Skeleton className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4" />
            </>
          ) : (
            <>
              <div
                className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4 flex justify-center items-center cursor pointer"
                onClick={() => setIsFullScreen("purchasesByDate")}
              >
                <BarChart
                  key={"purchasesByDate"}
                  unformattedData={usageData?.purchasesByDate}
                  label="Purchases By Day"
                  backgroundColor="#0070f0"
                  borderColor="#0070f0"
                  borderWidth={1}
                />
              </div>
              <div
                className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4 flex justify-center items-center cursor pointer"
                onClick={() => setIsFullScreen("packagesByCount")}
              >
                <PieChart
                  key={"packagesByCount"}
                  unformattedData={usageData?.packagesByNumbers}
                  label="Purchases per Package"
                  borderWidth={1}
                  backgroundColors={[
                    "#13C2C7",
                    "#13C721",
                    "#2050E7",
                    "#5713C7",
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default PurchaseStats;
