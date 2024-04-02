import { fetcher } from "@/lib/helpers/utils";
import { LayoutDashboard } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import type { AdminComponent } from "../../../../pages/admin/";
import { default as PurchaseStats } from "./Views/PurchaseStats";
import Purchases from "./Views/Purchases";

type FinancialsProps = {
  isSuperAdmin: boolean;
  setActiveComponent: Dispatch<SetStateAction<AdminComponent>>;
};
const Financials = ({ isSuperAdmin, setActiveComponent }: FinancialsProps) => {
  const [timePeriod, setTimePeriod] = useState<
    "allTime" | "lastMonth" | "lastWeek"
  >("allTime");
  const { data: financialData, isLoading: isFinancialDataLoading } = useSWR(
    "/api/data/get/financial",
    fetcher
  );

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("You do not have permission to view this page.");
      setActiveComponent({ name: "Dashboard", icon: LayoutDashboard });
    }
  });
  return (
    <div className="mx-auto pb-2">
      <h1 className="text-xl mb-8">Financials</h1>
      <PurchaseStats
        usageData={financialData}
        isLoading={isFinancialDataLoading}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />
      <Purchases usageData={financialData} isLoading={isFinancialDataLoading} />
    </div>
  );
};

export default Financials;
