
import prisma from "@/database/prisma";
import { formatMintDataForGraph } from "@/lib/data-helpers";
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

        const mints = await prisma.nftMints.findMany({})


        const last30DaysThreshold = Date.now() - 1000 * 60 * 60 * 24 * 30; //one month
        const activeDateThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7; //one week
        const mintsLast7Days = mints.filter((mint) => new Date(mint.createdAt).getTime() > activeDateThreshold);
        const mintsLast30Days = mints.filter((mint) => mint.createdAt.getTime() > last30DaysThreshold);
        const uniqueMinters = Array.from(new Set(mints.map((mint) => mint.wallet)))

        const allTime = {
            totalMints: mints.length,
            uniqueMinters: uniqueMinters.length,
            collectionMints: mints.filter((mint) => mint.type === "Collection").length,
            standardMints: mints.filter((mint) => mint.type === "Standard").length,
            pNftMints: mints.filter((mint) => mint.type === "pNFT").length,
            cNftMints: mints.filter((mint) => mint.type === "cNFT").length,
            publicMints: mints.filter((mint) => mint.type === "public cNFT").length,
        }

        const last7Days = {
            totalMints: mintsLast7Days.length,
            uniqueMinters: Array.from(new Set(mintsLast7Days.map((mint) => mint.wallet))).length,
            collectionMints: mintsLast7Days.filter((mint) => mint.type === "Collection").length,
            standardMints: mintsLast7Days.filter((mint) => mint.type === "Standard").length,
            pNftMints: mintsLast7Days.filter((mint) => mint.type === "pNFT").length,
            cNftMints: mintsLast7Days.filter((mint) => mint.type === "cNFT").length,
            publicMints: mintsLast7Days.filter((mint) => mint.type === "public cNFT").length,
        }

        const last30Days = {
            totalMints: mintsLast30Days.length,
            uniqueMinters: Array.from(new Set(mintsLast30Days.map((mint) => mint.wallet))).length,
            collectionMints: mintsLast30Days.filter((mint) => mint.type === "Collection").length,
            standardMints: mintsLast30Days.filter((mint) => mint.type === "Standard").length,
            pNftMints: mintsLast30Days.filter((mint) => mint.type === "pNFT").length,
            cNftMints: mintsLast30Days.filter((mint) => mint.type === "cNFT").length,
            publicMints: mintsLast30Days.filter((mint) => mint.type === "public cNFT").length,
        }


        const { mintsByDate, mintsByType } = formatMintDataForGraph(mints)



        return res.status(200).json({ allTime: allTime, last7Days: last7Days, last30Days: last30Days, mintsGraphData: mintsByDate, mintsPieGraph: mintsByType });
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({});

}
