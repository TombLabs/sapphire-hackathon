

import * as anchor from '@coral-xyz/anchor'
import * as token from '@solana/spl-token'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import {
    FEE_WALLET,
    auctionProgramId,
    connection
} from '../../constants'
import IDL from '../idl/index'


async function bidOnAuctionTxBuilder(
    wallet: AnchorWallet,
    auction: PublicKey,
    bid: number
) {
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" })
    const program = new anchor.Program(IDL, auctionProgramId, provider)
    const auctionData = await program.account.auction.fetch(auction) as any
    const bidderTokenAccount = token.getAssociatedTokenAddressSync(new PublicKey(auctionData.nftMint), wallet.publicKey)

    const checkTokenAccount = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new PublicKey(auctionData.nftMint) })

    if (checkTokenAccount.value.length === 0) {
        const createTokenAccountIx = token.createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            bidderTokenAccount,
            wallet.publicKey,
            new PublicKey(auctionData.nftMint),
            token.TOKEN_PROGRAM_ID,
            token.ASSOCIATED_TOKEN_PROGRAM_ID
        )

        const bidOnAuctionIx = await program.methods
            .bidOnAuction(new anchor.BN(bid))
            .accounts({
                auction: auction,
                bidder: wallet.publicKey,
                /*  authority: auctionAuthPubkey, */
                systemProgram: SystemProgram.programId,
                bidderTokenAccount: bidderTokenAccount,
                nftMint: new PublicKey(auctionData.nftMint),
                creator: new PublicKey(auctionData.creator),
                feeWallet: FEE_WALLET
            })
            .remainingAccounts([
                {
                    isSigner: false,
                    isWritable: auctionData.highestBid.amount.toNumber() > 0 ? true : false,
                    pubkey: new PublicKey(auctionData.highestBid.bidder)
                }
            ])
            .instruction()

        const bidOnAuctionTx = new anchor.web3.Transaction().add(createTokenAccountIx, bidOnAuctionIx)

        return bidOnAuctionTx
    } else {
        const bidOnAuctionTx = await program.methods
            .bidOnAuction(new anchor.BN(bid))
            .accounts({
                auction: auction,
                bidder: wallet.publicKey,
                /*  authority: auctionAuthPubkey, */
                systemProgram: SystemProgram.programId,
                bidderTokenAccount: bidderTokenAccount,
                nftMint: new PublicKey(auctionData.nftMint),
                creator: new PublicKey(auctionData.creator),
                feeWallet: FEE_WALLET
            })
            .remainingAccounts([
                {
                    isSigner: false,
                    isWritable: auctionData.highestBid.amount.toNumber() > 0 ? true : false,
                    pubkey: new PublicKey(auctionData.highestBid.bidder)
                }
            ])
            .transaction()
        return bidOnAuctionTx
    }



}

export default bidOnAuctionTxBuilder


