import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { wallet } = req.query;


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

      const mapped = result.items.map((item: any) => {
        return {
          mint: item.id,
          name: item.content.metadata.name,
          uri: item.content.json_uri,
          image: item.content.links.image
        }
      })

      return res.status(200).json(mapped);
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
