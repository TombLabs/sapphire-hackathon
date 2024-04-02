import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    // add wallet
    if (req.method === "PATCH") {
        const { num } = req.body;
        if (!num) {
            return res.status(404).json({ status: 404, message: "Missing objects" });
        }
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return res.status(404).json({ status: 404, message: "Could not find your user data" });
        }
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { sapphires: user.sapphires + num },
        });
        return res.status(200).json(updatedUser);
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({ status: 405, message: "Method not allowed" });
}
