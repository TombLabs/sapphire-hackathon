
import prisma from "@/database/prisma";
import { formatUserDataForGraph } from "@/lib/data-helpers";
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

        const users = await prisma.user.findMany({ include: { generations: true } })
        const generations = users.map((user) => user.generations).flat()

        const last30DaysThreshold = Date.now() - 1000 * 60 * 60 * 24 * 30; //one month
        const activeDateThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7; //one week
        const generationsLastWeek = generations.filter((generation) => generation.createdAt.getTime() > activeDateThreshold);
        const generationsLast30Days = generations.filter((generation) => generation.createdAt.getTime() > last30DaysThreshold);

        const activeUsers = users.filter((user) => generationsLastWeek.some((generation) => user.generations.some((userGen) => userGen === generation))).length
        const monthlyActiveUsers = users.filter((user) => generationsLast30Days.some((generation) => user.generations.some((userGen) => userGen === generation))).length

        const allTime = {
            totalUsers: users.length,
            activeUsers: activeUsers,
            generations: generations.length,
            dalle: generations.filter((generation) => generation.aiEngine as string === "dalle" || generation.aiEngine as string === "dalle-3").length || 0,
            leonardo: generations.filter((generation) => generation.aiEngine as string === "Leonardo").length || 0,
            stability: generations.filter((generation) => generation.aiEngine as string === "Stability").length || 0,
            promptAssist: generations.filter((generation) => generation.promptAssist).length || 0,
        }

        const last7Days = {
            newUsers: users.filter((user) => user.createdAt.getTime() > activeDateThreshold).length,
            activeUsers: monthlyActiveUsers,
            generations: generationsLastWeek.length,
            dalle: generationsLastWeek.filter((generation) => generation.aiEngine as string === "dalle" || generation.aiEngine as string === "dalle-3").length || 0,
            leonardo: generationsLastWeek.filter((generation) => generation.aiEngine as string === "Leonardo").length || 0,
            stability: generationsLastWeek.filter((generation) => generation.aiEngine as string === "Stability").length || 0,
            promptAssist: generationsLastWeek.filter((generation) => generation.promptAssist).length || 0,
        }

        const last30Days = {
            newUsers: users.filter((user) => user.createdAt.getTime() > last30DaysThreshold).length,
            activeUsers: monthlyActiveUsers,
            generations: generationsLast30Days.length,
            dalle: generationsLast30Days.filter((generation) => generation.aiEngine as string === "dalle" || generation.aiEngine as string === "dalle-3").length || 0,
            leonardo: generationsLast30Days.filter((generation) => generation.aiEngine as string === "Leonardo").length || 0,
            stability: generationsLast30Days.filter((generation) => generation.aiEngine as string === "Stability").length || 0,
            promptAssist: generationsLast30Days.filter((generation) => generation.promptAssist).length || 0,
        }


        const { userByDate, generationsByDate } = formatUserDataForGraph(users)



        return res.status(200).json({ allTime: allTime, last7Days: last7Days, last30Days: last30Days, userGraphData: userByDate, generationGraphData: generationsByDate });
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({});

}
