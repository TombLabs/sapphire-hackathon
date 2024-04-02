import { connection } from "@/lib/constants";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair, Transaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Request method not allowed" });
    }
    const { tx } = req.body as {
        tx: string;
    };
    if (!tx) {
        return res.status(400).json({ message: "Missing Tx to sign" });
    }

    try {
        const key = process.env.AUCTION_AUTH_KEY!
        const keypair = Keypair.fromSecretKey(bs58.decode(key))
        const buffer = Transaction.from(Buffer.from(tx, "base64"))

        buffer.partialSign(keypair)
        const txid = await connection.sendRawTransaction(buffer.serialize())
        return res.status(200).json({ txid: txid })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }

}
