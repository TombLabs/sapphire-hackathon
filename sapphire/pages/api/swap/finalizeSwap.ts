import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ status: 405, message: "Method not allowed" });
    }

    const { sapphireAmount } = req.body


    if (!sapphireAmount) {
        return res.status(400).json({ status: 400, message: "Sapphire Amount is required" });
    }

    try {
        const userId = session.user.id
        const user = await prisma.user.update({ where: { id: userId }, data: { sapphires: { increment: sapphireAmount } } })
    } catch (err) {
        console.log(err)
        res.status(500).json("error")
    }

    res.status(200).json("success");
}