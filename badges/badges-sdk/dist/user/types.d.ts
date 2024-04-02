import { PublicKey } from "@solana/web3.js";
export interface UserState {
    pubkey: PublicKey;
    userAuth: PublicKey;
    badges: [PublicKey];
    bumps: [number];
    escrows: [PublicKey];
    dbId: string;
    initializer: PublicKey;
    bump: number;
}
