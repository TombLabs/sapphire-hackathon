import { PublicKey } from "@solana/web3.js";

export interface ProjectState {
    publicKey: PublicKey,
    projectAuth: PublicKey,
    collectionAddress: PublicKey,
    name: string,
    bump: number,
    feeWallet: PublicKey,
    fee: number,
    badges: [PublicKey]
}

