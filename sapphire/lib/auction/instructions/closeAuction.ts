
import { AuctionData } from '@/types'
import * as anchor from '@coral-xyz/anchor'
import * as token from '@solana/spl-token'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import {
    FEE_WALLET,
    PROGRAM_SEED,
    SAPPHIRE_AUCTIONS_SEED,
    auctionAuthPubkey,
    auctionProgramId,
    connection
} from '../../constants'
import IDL from '../idl/index'


async function closeAuctionTxBuilder(
    wallet: AnchorWallet,
    auction: PublicKey,
) {

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" })
    const program = new anchor.Program(IDL, auctionProgramId, provider)
    const auctionData = await program.account.auction.fetch(auction) as AuctionData

    const [globalState, globalStateBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(SAPPHIRE_AUCTIONS_SEED, 'utf-8'),
            auctionAuthPubkey.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        program.programId
    )

    const closeAuctionTx = await program.methods
        .closeAuction()
        .accounts({
            auction: auction,
            sapphireAuctions: globalState,
            authority: auctionAuthPubkey,
            creator: auctionData.account.creator,
            nftMint: auctionData.account.nftMint,
            nftEscrow: auctionData.account.nftEscrow,
            winner: auctionData.account.highestBid.bidder,
            winnerTokenAccount: auctionData.account.highestBid.bidderTokenAccount,
            feeWallet: FEE_WALLET,
            systemProgram: SystemProgram.programId,
            tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .transaction()

    return closeAuctionTx

}

export default closeAuctionTxBuilder


