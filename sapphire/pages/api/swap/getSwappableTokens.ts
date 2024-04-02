import { connection } from "@/lib/constants";
import tokenList from "@/lib/jsons/tokenList.json";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ status: 405, message: "Method not allowed" });
    }

    const { wallet } = req.query as { wallet: string };

    if (!wallet) {
        return res.status(400).json({ status: 400, message: "Wallet is required" });
    }

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), { programId: TOKEN_PROGRAM_ID })

    let tokens = []

    for (const token of tokenAccounts.value) {
        if (tokenList.find((t) => t.address === token.account.data.parsed.info.mint) !== undefined && token.account.data.parsed.info.tokenAmount.uiAmount > 0) {
            tokens.push({
                mint: token.account.data.parsed.info.mint,
                name: tokenList.find((t) => t.address === token.account.data.parsed.info.mint)?.name,
                symbol: tokenList.find((t) => t.address === token.account.data.parsed.info.mint)?.symbol,
                image: tokenList.find((t) => t.address === token.account.data.parsed.info.mint)?.logoURI,
                tokenAccount: token.pubkey,
                balance: token.account.data.parsed.info.tokenAmount.uiAmount,
                decimals: token.account.data.parsed.info.tokenAmount.decimals
            })
        }
    }
    res.status(200).json(tokens);
}