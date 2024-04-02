import type { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
export declare abstract class Badges {
    rpcUrl?: string;
    wallet: AnchorWallet | WalletContextState | Keypair;
    commitment?: "processed" | "confirmed" | "finalized";
    constructor(wallet: AnchorWallet | WalletContextState | Keypair, rpcUrl?: string, commitment?: "processed" | "confirmed" | "finalized");
}
