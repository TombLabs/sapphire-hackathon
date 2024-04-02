import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const userId = req.query.userId as string

    if (!userId) {
        return res.status(400).json({ error: "Missing required parameters" })
    }
    try {
        const generations = await prisma.generation.findMany({ where: { userId } })
        return res.status(200).json({ generations })
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }

}