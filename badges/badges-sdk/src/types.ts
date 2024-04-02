import { PublicKey } from "@solana/web3.js";

export interface BadgeState {
    publicKey: PublicKey,
    name: string,
    metadata: string,
    image: string,
    bump: number,
    project: PublicKey,
    royalty: number,
    mint: PublicKey,
}