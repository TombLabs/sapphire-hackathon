import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    //get the user session and validate
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "POST") {
        const { wallet, mint, uri, type } = req.body;

        if (!wallet) return res.status(400).json({ error: "Wallet is required" });
        if (!mint) return res.status(400).json({ error: "Mint is required" });
        if (!uri) return res.status(400).json({ error: "Uri is required" });


        try {

            const newNft = await prisma.nftMints.create({
                data: {
                    image: uri,
                    mint: mint,
                    wallet: wallet,
                    type: type,
                }
            })
        } catch (e) {
            console.log(e);
            return res
                .status(500)
                .json({ messaage: "Please contact Tomb Labs team in the TombStoned Discord" });
        }
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({});
}
