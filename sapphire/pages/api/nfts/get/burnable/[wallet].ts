import { BurnableNfts } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { wallet, limit, page } = req.query;


        if (!wallet) {
            return res.status(400).json({ error: "Wallet is required" });
        }
        const HELIUS_KEY = process.env.HELIUS_KEY;

        if (!HELIUS_KEY)
            return res
                .status(500)
                .json({ error: "Please contact Tomb Labs team in the TombStoned Discord" });

        try {
            const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "sapphire fetch",
                    method: "getAssetsByOwner",
                    params: {
                        ownerAddress: wallet,
                        page: 1,
                        limit: 1000,
                    },
                    displayOptions: {
                        showUnverifiedCollections: true,
                    },
                }),
            });

            const { result } = await response.json();

            let burnableNfts: BurnableNfts[] = []

            for (const item of result.items) {
                if (item.interface === "Custom") {
                    burnableNfts.push({
                        name: item.content.metadata.name || "No Name",
                        image: item.content.links.image,
                        mint: item.id,
                        type: "pnft",
                        uri: item.content.json_uri,
                        collection: item.grouping.length ? item.grouping[0].group_value : undefined
                    })
                } else if (item.interface === "V1_NFT" && item.compression.compressed === false) {
                    burnableNfts.push({
                        name: item.content.metadata.name || "No Name",
                        image: item.content.links.image,
                        mint: item.id,
                        type: "standard",
                        uri: item.content.json_uri,
                        collection: item.grouping.length ? item.grouping[0].group_value : undefined
                    })
                } else {
                    //do nothing item is a cnft
                }
            }
            console.log(page, limit)

            return res.status(200).json(burnableNfts.slice(parseInt(page as string) * 10, parseInt(limit as string)));
        } catch (e) {
            console.log(e);
            return res
                .status(500)
                .json({ error: "Please contact Tomb Labs team in the TombStoned Discord" });
        }
    }

    // METHOD NOT ALLOWED
    return res.status(405).json({});
}
