import prisma from "@/database/prisma";
import IDL from "@/lib/auction/idl";
import { auctionProgramId, connection } from "@/lib/constants";
import { getNftData } from "@/lib/helpers/web3-helpers";
import { AuctionData } from "@/types";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Request method not allowed" });
    }

    const { auction } = req.query as { auction: string };
    if (!auction) {
        return res.status(400).json({ message: "Auction is required" });
    }

    const program = new anchor.Program(IDL, auctionProgramId, { connection: connection });

    if (!program) {
        return res.status(404).json({ message: "Program not found" });
    }

    const auctionData = await program.account.auction.fetch(new PublicKey(auction)) as any;


    if (!auctionData) {
        return res.status(404).json({ message: "Auctions not found" });
    }



    //fetch nft image
    const nftData = await getNftData(auctionData.nftMint, "mainnet")

    //fetch user data
    const user = await prisma.user.findFirst({
        include: { wallets: true },
        where: {
            wallets: {
                some: {
                    address: auctionData.creator.toString()
                }
            }
        }
    }
    )
    const data = {
        account: {
            publicKey: new PublicKey(auction),
            creator: auctionData.creator,
            nftEscrow: auctionData.nftEscrow,
            bumps: auctionData.bumps,
            nftMint: auctionData.nftMint,
            creatorTokenAccount: auctionData.creatorTokenAccount,
            startPrice: auctionData.startPrice.toNumber(),
            minBid: auctionData.minBid.toNumber(),
            endTime: auctionData.endTime.toNumber(),
            winner: auctionData.winner,
            highestBid: {
                bidder: auctionData.highestBid.bidder,
                amount: auctionData.highestBid.amount.toNumber(),
                bidderTokenAccount: auctionData.highestBid.bidderTokenAccount,
            },
            previousHighBid: {
                bidder: auctionData.previousHighBid.bidder,
                amount: auctionData.previousHighBid.amount.toNumber(),
                bidderTokenAccount: auctionData.previousHighBid.bidderTokenAccount,
            },
        },
        nftData: nftData,
        userInfo: {
            user: user?.id,
            name: user?.name,
            image: user?.image
        }
    } as unknown as AuctionData

    return res.status(200).json(data);


}