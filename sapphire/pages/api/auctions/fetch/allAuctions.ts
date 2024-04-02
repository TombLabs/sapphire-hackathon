import prisma from "@/database/prisma";
import IDL from "@/lib/auction/idl";
import { auctionProgramId, connection, } from "@/lib/constants";
import { getNftData } from "@/lib/helpers/web3-helpers";
import { AuctionData } from "@/types";
import * as anchor from "@coral-xyz/anchor";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Request method not allowed" });
    }


    const program = new anchor.Program(IDL, auctionProgramId, { connection: connection });

    if (!program) {
        return res.status(404).json({ message: "Program not found" });
    }

    const auctions = await program.account.auction.all();


    if (!auctions) {
        return res.status(404).json({ message: "Auctions not found" });
    }

    if (auctions.length === 0) {
        return res.status(404).json({ message: "No auctions found" });
    }

    const data = await Promise.all(auctions.map(async (auction: any) => {

        //fetch nft image
        const nftData = await getNftData(auction.account.nftMint, "mainnet")

        //fetch user data
        const user = await prisma.user.findFirst({
            include: { wallets: true },
            where: {
                wallets: {
                    some: {
                        address: auction.account.creator.toString()
                    }
                }
            }
        }
        )

        return {
            account: {
                publicKey: auction.publicKey,
                creator: auction.account.creator,
                nftEscrow: auction.account.nftEscrow,
                bumps: auction.account.bumps,
                nftMint: auction.account.nftMint,
                creatorTokenAccount: auction.account.creatorTokenAccount,
                startPrice: auction.account.startPrice.toNumber(),
                minBid: auction.account.minBid.toNumber(),
                endTime: auction.account.endTime.toNumber(),
                winner: auction.account.winner,
                highestBid: {
                    bidder: auction.account.highestBid.bidder,
                    amount: auction.account.highestBid.amount.toNumber(),
                    bidderTokenAccount: auction.account.highestBid.bidderTokenAccount,
                },
                previousHighBid: {
                    bidder: auction.account.previousHighBid.bidder,
                    amount: auction.account.previousHighBid.amount.toNumber(),
                    bidderTokenAccount: auction.account.previousHighBid.bidderTokenAccount,
                },
            },
            nftData: nftData,
            userInfo: {
                user: user?.id,
                name: user?.name,
                image: user?.image
            }
        } as unknown as AuctionData
    }))

    return res.status(200).json(data)

}