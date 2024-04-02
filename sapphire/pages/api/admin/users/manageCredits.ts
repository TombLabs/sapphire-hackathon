import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, authOptions)
    console.log(session)
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" })
    }


    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    if (session.user.role === "super admin") {
        const { userId, credits, addOrRemove } = req.body as { userId: string, credits: number, addOrRemove: "add" | "remove" }

        if (!userId || !credits) {
            return res.status(400).json({ error: "Missing required parameters" })
        }

        try {
            const user = await prisma.user.findUnique({ where: { id: userId } })

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            await prisma.user.update({ where: { id: userId }, data: { sapphires: addOrRemove === "add" ? user.sapphires + credits : user.sapphires - credits } })

            return res.status(200).json({ message: "Credits added successfully" })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    } else {
        return res.status(403).json({ error: "Unauthorized" })
    }
}