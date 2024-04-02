import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { determineSearchType } from "@/lib/data-helpers";
import { Purchase, SapphireUser } from "@/types";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { LuBanknote, LuEye, LuGem, LuLink } from "react-icons/lu";

type PurchaseStatProps = {
  usageData: any;
  isLoading: boolean;
};

type SelectedPurchaseDetails = {
  user: SapphireUser;
  parsedTx: {
    token: "sol" | "usdc";
    amount: number;
    payingAddress: string;
  };
};
const Purchases = ({ usageData, isLoading }: PurchaseStatProps) => {
  const [searchTerm, setSearchTerm] = useState<string>(null!);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase>(null!);
  /*  const [selectedPurchaseDetails, setSelectedPurchaseDetails] */

  const filteredData = useMemo(() => {
    if (!usageData) return [];
    if (!searchTerm) return usageData?.allPurchases;
    else {
      //determine search type
      const type = determineSearchType(searchTerm);

      switch (type) {
        case "user":
          return usageData?.allPurchases
            .filter((purchase: Purchase) =>
              purchase.userId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a: Purchase, b: Purchase) => b.createdAt - a.createdAt);

        case "package":
          return usageData?.allPurchases
            .filter((purchase: Purchase) =>
              purchase.package.name
                .replace("Sapphire ", "")
                .toLowerCase()
                .includes(searchTerm?.toLowerCase())
            )
            .sort((a: Purchase, b: Purchase) => b.createdAt - a.createdAt);
        case "transaction":
          return usageData?.allPurchases
            .filter((purchase: Purchase) =>
              purchase.transaction
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .sort((a: Purchase, b: Purchase) => b.createdAt - a.createdAt);

        default:
          return [];
      }
    }
  }, [searchTerm, usageData]);

  return (
    <>
      <section className="w-full flex flex-col justify-start items-center">
        <div className="w-full flex flex-row gap-6 justify-start items-start mb-4">
          <p className="text-lg">Purchases</p>
        </div>
        <Input
          placeholder="Search by UserId, Package or Transaction"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="w-full h-96 overflow-y-scroll px-2 border-2 border-border">
          <table className="mt-4 table-fixed w-full">
            <thead>
              <tr>
                <th className="underline text-md text-left">User</th>
                <th className="underline text-md text-left">Package</th>
                <th className="underline text-md text-left">Amount</th>
                <th className="underline text-md text-left">Token</th>
                <th className="underline text-md text-left">Tx</th>
                <th className="underline text-md text-left">Date</th>
                <th className="underline text-md text-left">Options</th>
              </tr>
            </thead>
            <tbody className="gap-4">
              {filteredData
                ?.sort((a: Purchase, b: Purchase) => b.createdAt - a.createdAt)
                .map((purchase: Purchase, i: number) => (
                  <tr
                    className="hover:bg-accent h-12"
                    key={purchase.transaction || i}
                  >
                    <th className="text-left">{purchase.userId}</th>
                    <th className="text-left">
                      {purchase.package.name.replace("Sapphire ", "")}
                    </th>
                    <th className="text-left">{purchase.package.priceUsd}</th>
                    <th className="text-left uppercase">
                      {purchase.paymentToken}
                    </th>
                    <th className="text-left">
                      {purchase.paymentToken === "stripe" ? (
                        "-"
                      ) : (
                        <Link
                          href={`https://solscan.io/tx/${purchase.transaction}`}
                          className="flex flex-row justify-start items-center gap-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p className="text-xs ">Solcan</p>
                          <LuLink size={15} />
                        </Link>
                      )}
                    </th>
                    <th className="text-left">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </th>
                    <th>
                      <div className="flex flex-row justify-start items-center gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <button className="">
                                <LuEye size={20} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-xs">
                              View Details
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <button className="">
                                <LuGem size={20} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-xs">
                              Credit Purchase Sapphires
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <button className="">
                                <LuBanknote size={20} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-xs">
                              Refund Purchase
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Purchases;
