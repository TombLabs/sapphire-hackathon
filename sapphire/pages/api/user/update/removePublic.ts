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
        const { id } = req.body;
        if (!id) {
            return res.status(404).json({ status: 404, message: "Missing objects" });
        }

        try {

            const updateGen = await prisma.generation.update({ where: { id: id }, data: { isPublic: false, isMintable: false } })
            return res.status(200).json(updateGen);
        } catch (e: any) {
            console.log(e);
            return res.status(500).json({ message: e.message })
        }
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({ status: 405, message: "Method not allowed" });
}
