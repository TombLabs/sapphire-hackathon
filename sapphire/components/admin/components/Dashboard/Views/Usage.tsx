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
import React, { useState } from "react";
import { LuBot, LuImage, LuUserCircle2, LuXCircle } from "react-icons/lu";
import { SmallDataBoxNumber } from "../../Shared/SmallDataBoxNumber";
import BarChart from "../../charts/BarChart";

type UsageProps = {
  usageData: any;
  isLoading: boolean;
  timePeriod: "allTime" | "lastMonth" | "lastWeek";
  setTimePeriod: React.Dispatch<
    React.SetStateAction<"allTime" | "lastMonth" | "lastWeek">
  >;
};
const Usage = ({
  usageData,
  isLoading,
  timePeriod,
  setTimePeriod,
}: UsageProps) => {
  const [isFullScreen, setIsFullScreen] = useState<string | null>(null!);

  return (
    <>
      {isFullScreen === "newUsers" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <BarChart
              key={"newUsers"}
              unformattedData={usageData?.userGraphData}
              label="New Users Per Day"
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
      ) : isFullScreen === "newGenerations" ? (
        <div className="absolute inset-0  h-screen w-screen flex justify-center items-center bg-black/50 backdrop-blur-3xl z-50">
          <div className="w-3/4 h-3/4 bg-primary-800 border-2 border-border p-2 rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent flex justify-center items-center">
            <BarChart
              key={"newGenerations"}
              unformattedData={usageData?.generationGraphData}
              label="Generations Per Day"
              backgroundColor="#ffffff"
              borderColor="#ffffff"
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
      ) : null}
      <section className="w-full flex flex-col justify-start items-center">
        <div className="w-full flex flex-row gap-6 justify-start items-start mb-4">
          <p className="text-lg">Usage</p>
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
                ? usageData?.allTime.totalUsers
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.newUsers
                : usageData?.last7Days.newUsers
            }
            title={
              timePeriod === "allTime"
                ? "Total Users"
                : timePeriod === "lastMonth"
                ? "New Users"
                : "New Users"
            }
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.activeUsers
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.activeUsers
                : usageData?.last7Days.activeUsers
            }
            title="Active Users"
            Icon={LuUserCircle2}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.generations
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.generations
                : usageData?.last7Days.generations
            }
            title="Total Generations"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.dalle
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.dalle
                : usageData?.last7Days.dalle
            }
            title="Dalle"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.leonardo
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.leonardo
                : usageData?.last7Days.leonardo
            }
            title="Leonardo"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.stability
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.stability
                : usageData?.last7Days.stability
            }
            title="Stability"
            Icon={LuImage}
            isLoading={isLoading}
          />
          <SmallDataBoxNumber
            data={
              timePeriod === "allTime"
                ? usageData?.allTime.promptAssist
                : timePeriod === "lastMonth"
                ? usageData?.last30Days.promptAssist
                : usageData?.last7Days.promptAssist
            }
            title="Prompt Assist"
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
                onClick={() => setIsFullScreen("newUsers")}
              >
                <BarChart
                  key={"newUsers"}
                  unformattedData={usageData?.userGraphData}
                  label="New Users Per Day"
                  backgroundColor="#0070f0"
                  borderColor="#0070f0"
                  borderWidth={1}
                />
              </div>
              <div
                className="w-1/2 h-60 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:shadow-xl hover:shadow-accent px-4 flex justify-center items-center cursor pointer"
                onClick={() => setIsFullScreen("newGenerations")}
              >
                <BarChart
                  key={"newGenerations"}
                  unformattedData={usageData?.generationGraphData}
                  label="Generations Per Day"
                  backgroundColor="#ffffff"
                  borderColor="#ffffff"
                  borderWidth={1}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Usage;
