import { fetcher } from "@/lib/helpers/utils";
import React, { useState } from "react";
import useSWR from "swr";
import Mints from "./Views/Mints";
import Usage from "./Views/Usage";

const Dashboard = () => {
  const { data: usageData, isLoading } = useSWR("/api/data/get/usage", fetcher);
  const { data: mintsData, isLoading: isLoadingMints } = useSWR(
    "/api/data/get/mints",
    fetcher
  );
  const [mintsTimePeriod, setMintsTimePeriod] = useState<
    "allTime" | "lastMonth" | "lastWeek"
  >("allTime");
  const [timePeriod, setTimePeriod] = useState<
    "allTime" | "lastMonth" | "lastWeek"
  >("allTime");

  return (
    <div className="mx-auto">
      <h1 className="text-xl mb-8">Dashboard</h1>
      <Usage
        usageData={usageData}
        isLoading={isLoading}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />
      <Mints
        usageData={mintsData}
        isLoading={isLoadingMints}
        timePeriod={mintsTimePeriod}
        setTimePeriod={setMintsTimePeriod}
      />
    </div>
  );
};

export default Dashboard;
