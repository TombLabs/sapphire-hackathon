import prisma from "@/database/prisma";
import IDL from "@/lib/auction/idl";
import { FEE_WALLET, auctionProgramId, connection } from "@/lib/constants";
import { getNftData } from "@/lib/helpers/web3-helpers";

import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemProgram } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(400).json({ message: "Unauthorized" });
    }

    if (
        !process.env.CRON_SECRET ||
        req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Request method not allowed" });
    }

    //Static Variables
    const authKey = process.env.AUCTION_AUTH_KEY!
    const keypair = Keypair.fromSecretKey(bs58.decode(authKey))
    const creatorKeypair = new anchor.Wallet(keypair);
    const provider = new anchor.AnchorProvider(connection, creatorKeypair, { commitment: 'confirmed' })
    const program = new anchor.Program(IDL, auctionProgramId, provider);

    try {
        const [sapphire_auctions, sapphire_auctionsBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("global_state_sapphire_auctions", 'utf-8'),
                keypair.publicKey.toBuffer(),
                Buffer.from("sapphire_auctions", 'utf-8')
            ],
            program.programId
        )
        const auctions = await program.account.auction.all()

        if (!auctions) {
            return res.status(404).json({ message: "Auctions not found" });
        }

        const auctionsToClose = auctions.filter(auction => (auction.account.endTime as anchor.BN).toNumber() < Date.now())

        if (auctionsToClose.length === 0) {
            return res.status(404).json({ message: "No auctions to close" });
        }

        let closedAuctions = []
        for (const auction of auctionsToClose) {
            try {
                let txid
                //@ts-ignore
                if (auction.account.highestBid.amount.toNumber() > 0) {
                    const closeAuctionTx = await program.methods.closeAuction().accounts({
                        auction: auction.publicKey,
                        sapphireAuctions: sapphire_auctions,
                        authority: creatorKeypair.publicKey,
                        creator: auction.account.creator as anchor.web3.PublicKey,
                        nftMint: auction.account.nftMint as anchor.web3.PublicKey,
                        nftEscrow: auction.account.nftEscrow as anchor.web3.PublicKey,
                        //@ts-ignore
                        winner: auction.account.highestBid.bidder as anchor.web3.PublicKey,
                        feeWallet: FEE_WALLET,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID
                    }).remainingAccounts([
                        {
                            isSigner: false,
                            isWritable: true,
                            //@ts-ignore
                            pubkey: auction.account.highestBid.bidderTokenAccount as anchor.web3.PublicKey
                        }
                    ]).rpc();
                    console.log({
                        closedAuction: auction.publicKey.toBase58(),
                        closeAuctionTx: closeAuctionTx
                    })
                    txid = closeAuctionTx
                    //@ts-ignore
                    const nftData = await getNftData(auction.account.nftMint.toBase58(), "mainnet")

                    const newCompletedAuction = await prisma.pastAuctions.create({
                        data: {
                            auctionId: auction.publicKey.toBase58(),
                            //@ts-ignore
                            winner: auction.account.highestBid.bidder.toBase58(),
                            //@ts-ignore
                            creator: auction.account.creator.toBase58(),
                            //@ts-ignore
                            totalBids: auction.account.highestBid.amount.toNumber() / auction.account.minBid.toNumber(),
                            //@ts-ignore
                            price: auction.account.highestBid.amount.toNumber(),
                            image: nftData.image,
                            name: nftData.name,
                        }
                    })


                } else {
                    const closeAuctionTx = await program.methods.closeAuction().accounts({
                        auction: auction.publicKey,
                        sapphireAuctions: sapphire_auctions,
                        authority: creatorKeypair.publicKey,
                        creator: auction.account.creator as anchor.web3.PublicKey,
                        nftMint: auction.account.nftMint as anchor.web3.PublicKey,
                        nftEscrow: auction.account.nftEscrow as anchor.web3.PublicKey,
                        //@ts-ignore
                        winner: auction.account.highestBid.bidder as anchor.web3.PublicKey,
                        feeWallet: FEE_WALLET,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID
                    }).remainingAccounts([
                        {
                            isSigner: false,
                            isWritable: true,
                            pubkey: auction.account.creatorTokenAccount as anchor.web3.PublicKey
                        }
                    ]).rpc();
                    console.log({
                        closedAuction: auction.publicKey.toBase58(),
                        closeAuctionTx: closeAuctionTx
                    })
                    txid = closeAuctionTx
                    //@ts-ignore
                    const nftData = await getNftData(auction.account.nftMint.toBase58(), "mainnet")

                    const newCompletedAuction = await prisma.pastAuctions.create({
                        data: {
                            auctionId: auction.publicKey.toBase58(),
                            //@ts-ignore
                            winner: auction.account.highestBid.bidder.toBase58(),
                            //@ts-ignore
                            creator: auction.account.creator.toBase58(),
                            //@ts-ignore
                            totalBids: auction.account.highestBid.amount.toNumber() / auction.account.minBid.toNumber(),
                            //@ts-ignore
                            price: auction.account.highestBid.amount.toNumber(),
                            image: nftData.image,
                            name: nftData.name,
                        }
                    })
                }
                closedAuctions.push({ isClosed: true, auction: auction.publicKey.toBase58(), closeAuctionTx: txid })
            } catch (e) {
                console.log(e)
                closedAuctions.push({ isClosed: false, auction: auction.publicKey.toBase58(), closeAuctionTx: e })
            }

        }


        res.status(200).json({ message: closedAuctions });
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Internal Server Error" });
    }
}