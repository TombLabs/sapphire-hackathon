
import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // get user
    if (req.method === "POST") {
        const { senderId, recipientId, amount } = req.body;
        console.log(req.body)
        if (!senderId || !recipientId || !amount) {
            return res.status(404).json({ message: "Please provide request body" });
        }
        try {
            const sender = await prisma.user.findUnique({ where: { id: senderId } });
            const recipient = await prisma.user.findUnique({ where: { id: recipientId } });

            if (!sender || !recipient) {
                return res.status(404).json({ message: "Could not find your user data" });
            }

            if (sender.sapphires < amount) {
                return res.status(404).json({ message: "Insufficient balance" });
            }

            const updateSender = await prisma.user.update({
                where: { id: senderId },
                data: { sapphires: sender.sapphires - amount },
            });
            const updateRecipient = await prisma.user.update({
                where: { id: recipientId },
                data: { sapphires: recipient.sapphires + amount },
            });

            return res.status(200).json({ message: "Success" });
        }

        catch (err) {
            return res.status(404).json({ message: "Error" });
        }
    }
    return res.status(405).json({ message: "Request method not allowed" });
}
