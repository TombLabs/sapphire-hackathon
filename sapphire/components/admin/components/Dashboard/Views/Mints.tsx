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
import { useState } from "react";
import { LuBot, LuImage, LuUserCircle2, LuXCircle } from "react-icons/lu";
import { SmallDataBoxNumber } from "../../Shared/SmallDataBoxNumber";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";

type UsageProps = {
  usageData: any;
  isLoading: boolean;
  timePeriod: "allTime" | "lastMonth" | "lastWeek";
  setTimePeriod: React.Dispatch<
    React.SetStateAction<"allTime" | "lastMonth" | "lastWeek">
  >;
};

const Mints = ({
  usageData,
  isLoading,
  timePeriod,
  setTimePeriod,
}: UsageProps) => {
  const [isFullScreen, setIsFullScreen] = useState<string | null>(null!);

  return (
    <>
      {isFullScreen === "mintsByDate" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <BarChart
              key={"mintsbyDate"}
              unformattedData={usageData?.mintsGraphData}
              label="Mints Per Day"
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
      ) : isFullScreen === "mintsPerType" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <PieChart
              key={"mintsPerType"}
              unformattedData={usageData?.mintsPieGraph}
              label="Mints Per Type"
              borderWidth={1}
              backgroundColors={[
                "#13C2C7",
                "#13C721",
                "#2050E7",
                "#5713C7",
                "#B913C7",
              ]}
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
          <p className="text-lg">Mints</p>
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
                ? usageData?.allTime.totalMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.totalMints
                : usageData?.last7Days.totalMints
            }
            title="Total Mints"
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.uniqueMinters
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.uniqueMinters
                : usageData?.last7Days.uniqueMinters
            }
            title="Unique Minters"
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.collectionMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.collectionMints
                : usageData?.last7Days.collectionMints
            }
            title="Collection NFTs"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.standardMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.standardMints
                : usageData?.last7Days.standardMints
            }
            title="Standard NFTs"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.pNftMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.pNftMints
                : usageData?.last7Days.pNftMints
            }
            title="pNFTs"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.cNftMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.cNftMints
                : usageData?.last7Days.cNftMints
            }
            title="cNFTs"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.publicMints
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.publicMints
                : usageData?.last7Days.publicMints
            }
            title="Public Mints"
            Icon={LuBot}
            isLoading={isLoading}
          />
        </div>
        <div className="w-full flex flex-row justify-between items-center gap-2 mb-4">
          {isLoading ? (
            <>
              <Skeleton className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4" />
              <Skeleton className="w-1/2 h-60 border-[1px] border-border rounded-full shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4" />
            </>
          ) : (
            <>
              <div
                className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4 flex justify-center items-center "
                onClick={() => setIsFullScreen("mintsByDate")}
              >
                <BarChart
                  key={"mintsbyDate"}
                  unformattedData={usageData?.mintsGraphData}
                  label="Mints Per Day"
                  backgroundColor="#0070f0"
                  borderColor="#0070f0"
                  borderWidth={1}
                />
              </div>
              <div
                className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center"
                onClick={() => setIsFullScreen("mintsPerType")}
              >
                <PieChart
                  key={"mintsPerType"}
                  unformattedData={usageData?.mintsPieGraph}
                  label="Mints Per Type"
                  borderWidth={1}
                  backgroundColors={[
                    "#13C2C7",
                    "#13C721",
                    "#2050E7",
                    "#5713C7",
                    "#B913C7",
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

export default Mints;
