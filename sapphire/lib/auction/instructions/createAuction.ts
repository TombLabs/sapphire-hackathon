
import * as anchor from '@coral-xyz/anchor'
import * as token from '@solana/spl-token'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js'
import {
    AUCTION_ESCROW_SEED,
    AUCTION_STATE_SEED, FEE_WALLET,
    PROGRAM_SEED,
    auctionAuthPubkey,
    auctionProgramId,
    connection
} from '../../constants'
import IDL from '../idl/index'



async function createAuctionTxBuilder(
    wallet: AnchorWallet,
    mint: PublicKey,
    startingPrice: number,
    minBid: number,
    endTime: number) {

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" })
    const program = new anchor.Program(IDL, auctionProgramId, provider)

    const [auction, auctionBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(AUCTION_STATE_SEED, 'utf-8'),
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8'),
            mint.toBuffer()
        ],
        program.programId
    )

    const [escrow, escrowBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(AUCTION_ESCROW_SEED, 'utf-8'),
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8'),
            mint.toBuffer(),
            auction.toBuffer()
        ],
        program.programId
    )

    const creatorTokenAccount = await connection.getParsedTokenAccountsByOwner(provider.wallet.publicKey, { mint: mint })
    const creatorTokenAccountPubkey = creatorTokenAccount.value[0].pubkey

    const createAuctionTx = await program.methods
        .initAuction(new anchor.BN(startingPrice),
            new anchor.BN(minBid),
            new anchor.BN(endTime))
        .accounts({
            auction: auction,
            authority: auctionAuthPubkey,
            creator: provider.wallet.publicKey,
            nftEscrow: escrow,
            nftMint: mint,
            creatorTokenAccount: creatorTokenAccountPubkey,
            feeWallet: FEE_WALLET,
            systemProgram: SystemProgram.programId,
            tokenProgram: token.TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .transaction()

    return createAuctionTx

}

export default createAuctionTxBuilder


