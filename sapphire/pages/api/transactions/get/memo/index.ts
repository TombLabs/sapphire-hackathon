import { MemoTransactionData } from "@/types";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import CryptoJs from "crypto-js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ status: 405, message: "Method not allowed" });
    }

    const { wallet, memoData } = req.body as { wallet: string; memoData: MemoTransactionData };


    if (!wallet) {
        return res.status(400).json({ status: 400, message: "Wallet is required" });
    }
    if (!memoData) {
        return res.status(400).json({ status: 400, message: "Memo data is required" });
    }

    try {
        const userId = session.user.id
        const secretKey = process.env.ENCRYPTION_SECRET_KEY!
        const encrpytedId = CryptoJs.AES.encrypt(userId, secretKey).toString()
        const memoString = `${encrpytedId}/${memoData.type}/${memoData.sapphirePackage || ""}`
        const memoIx = new TransactionInstruction({
            keys: [{ pubkey: new PublicKey(wallet), isSigner: true, isWritable: true }],
            data: Buffer.from(memoString, "utf-8"),
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
        })
        res.status(200).json({ status: 200, message: "success", memoIx: memoIx })
    } catch (err) {
        console.log(err)
        res.status(500).json("error")
    }
}