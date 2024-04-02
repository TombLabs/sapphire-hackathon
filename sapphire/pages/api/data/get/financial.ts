import prisma from "@/database/prisma";
import { User } from "@/mongo/schemas";
import { Purchase } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    //get the user session and validate
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }



    //if request is post continue
    if (req.method === "GET") {


        const users = await prisma.user.findMany({ include: { purchases: true } })
        const packages = await prisma.packages.findMany({})

        const purchases = users.map((user) => user.purchases).flat()
        const uniquePurchasers = Array.from(new Set(purchases.map((purchase) => purchase.userId)))
        const last30DaysThreshold = Date.now() - 1000 * 60 * 60 * 24 * 30; //one month
        const activeDateThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7; //one week
        const purchasesLast7Days = purchases.filter((purchase) => purchase.createdAt.getTime() > activeDateThreshold);
        const purchasesLast30Days = purchases.filter((purchase) => purchase.createdAt.getTime() > last30DaysThreshold);
        const avgNumPurchases = purchases.length / uniquePurchasers.length;



        const allTime = {
            totalPurchases: purchases.length,
            usd: purchases.reduce((acc, curr) => acc + packages.find((item) => item.id === curr.packageId)?.priceUSD!, 0),
            uniquePurchasers: uniquePurchasers.length,
            avgNumPurchases: avgNumPurchases,
            shimmer: purchases.filter((item: any) => item.package.name === "Sapphire Shimmer").length,
            radiance: purchases.filter((item: any) => item.package.name === "Sapphire Radiance").length,
            luminary: purchases.filter((item: any) => item.package.name === "Sapphire Luminary").length,
            celestial: purchases.filter((item: any) => item.package.name === "Sapphire Celestial").length,
        }

        const last7Days = {
            totalPurchases: purchasesLast7Days.length,
            usd: purchasesLast7Days.reduce((acc, curr) => acc + packages.find((item) => item.id === curr.packageId)?.priceUSD!, 0),
            uniquePurchasers: Array.from(new Set(purchasesLast7Days.map((purchase) => purchase.userId))).length,
            avgNumPurchases: purchasesLast7Days.length / Array.from(new Set(purchasesLast7Days.map((purchase) => purchase.userId))).length,
            shimmer: purchasesLast7Days.filter((item: any) => item.package.name === "Sapphire Shimmer").length,
            radiance: purchasesLast7Days.filter((item: any) => item.package.name === "Sapphire Radiance").length,
            luminary: purchasesLast7Days.filter((item: any) => item.package.name === "Sapphire Luminary").length,
            celestial: purchasesLast7Days.filter((item: any) => item.package.name === "Sapphire Celestial").length,
        }

        const last30Days = {
            totalPurchases: purchasesLast30Days.length,
            usd: purchasesLast30Days.reduce((acc, curr) => acc + packages.find((item) => item.id === curr.packageId)?.priceUSD!, 0),
            uniquePurchasers: Array.from(new Set(purchasesLast30Days.map((purchase) => purchase.userId))).length,
            avgNumPurchases: purchasesLast30Days.length / Array.from(new Set(purchasesLast30Days.map((purchase) => purchase.userId))).length,
            shimmer: purchasesLast30Days.filter((item: any) => item.package.name === "Sapphire Shimmer").length,
            radiance: purchasesLast30Days.filter((item: any) => item.package.name === "Sapphire Radiance").length,
            luminary: purchasesLast30Days.filter((item: any) => item.package.name === "Sapphire Luminary").length,
            celestial: purchasesLast30Days.filter((item: any) => item.package.name === "Sapphire Celestial").length,
        }


        let packagesByNumbers: any = []

        for (let i = 0; i < purchases.length; i++) {
            const purchase = purchases.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[i];
            if (packagesByNumbers.length === 0) {
                packagesByNumbers.push({ package: packages.find((item) => item.id === purchase.packageId)?.name!, count: 1 })
            }
            else if (packagesByNumbers.some((item: any) => item.id === packages.find((item) => item.id === purchase.packageId)?.name!)) {
                packagesByNumbers.find((item: any) => item.package === packages.find((item) => item.id === purchase.packageId)?.name!).count++
            } else {
                packagesByNumbers.push({ package: packages.find((item) => item.id === purchase.packageId)?.name!, count: 1 })
            }
        }

        let purchasesByDate: any = []

        for (let i = 0; i < purchases.length; i++) {
            const purchase = purchases.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[i];
            const dayOfMonth = new Date(purchase.createdAt).getUTCDate();
            const month = new Date(purchase.createdAt).getUTCMonth();
            const year = new Date(purchase.createdAt).getUTCFullYear();
            const date = `${month}/${dayOfMonth}/${year}`
            if (purchasesByDate.length === 0) {
                purchasesByDate.push({ date: date, count: 1 })
            }
            else if (purchasesByDate.some((item: any) => item.date === date)) {
                purchasesByDate.find((item: any) => item.date === date).count++
            } else {
                purchasesByDate.push({ date: date, count: 1 })
            }
        }


        return res.status(200).json({
            allTime: allTime, last7Days: last7Days, last30Days: last30Days, packagesByNumbers: packagesByNumbers.map((item: any) => {
                return {
                    package: item.package + " " + (item.count / purchases.length * 100).toFixed(0) + "%",
                    count: item.count
                }
            }), purchasesByDate: purchasesByDate, allPurchases: purchases
        });
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({});

}
