import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    if (req.method === "PATCH") {
        const { id } = req.body;
        if (!id) {
            return res.status(404).json({ status: 404, message: "Missing objects" });
        }

        try {
            const updateGeneration = await prisma.generation.update({
                where: {
                    id: id
                },
                data: {
                    isPublic: true
                }
            })
            return res.status(200).json(updateGeneration);
        } catch (e) {
            console.log(e)
            res.status(500).json({ status: 500, message: "Internal server error" });
        }
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({ status: 405, message: "Method not allowed" });
}
