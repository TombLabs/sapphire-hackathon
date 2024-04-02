import * as anchor from "@coral-xyz/anchor";
import type { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { GLOBAL_STATE_AUTH, programId } from "./constants";
import { idl } from "./idl/idl";
import { deriveProjectAddress, getGlobalStateAccount } from "./utils/utils";

/**
 * Badges class
 * 
 * @class
 * 
 * @classdesc
 * 
 * 
 * This class is a wrapper around the badges program and provides a simple interface for interacting with the badges program.
 * 
 * @param {AnchorWallet | WalletContextState | Keypair} wallet - The wallet to use for interacting with the badges.
 * @param {string} rpcUrl - The RPC URL to use for connecting to the blockchain. Optional.  Default "https://api.mainnet-beta.solana.com"
 * @param {string} commitment - The commitment level to use for the blockchain, "processed", "confirmed", or "finalized". Optional. Default "finalized"
 */

/**
 * Represents a Badges instance
 */
export abstract class Badges {
    rpcUrl?: string;
    wallet: AnchorWallet | WalletContextState | Keypair;
    commitment?: "processed" | "confirmed" | "finalized"

    /**
     * Creates a new instance of the Badges class.
     * @param wallet - The wallet to use for interacting with the badges.
     * @param rpcUrl - The RPC URL to use for connecting to the blockchain.
     * @param commitment - The commitment level to use for the blockchain.
     */
    constructor(wallet: AnchorWallet | WalletContextState | Keypair, rpcUrl?: string, commitment?: "processed" | "confirmed" | "finalized") {
        this.wallet = wallet;
        this.rpcUrl = rpcUrl;
        this.commitment = commitment;
    }

}