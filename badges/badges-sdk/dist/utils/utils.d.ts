import { PublicKey } from "@solana/web3.js";
export declare function getGlobalStateAccount(authority: PublicKey): PublicKey;
export declare function deriveProjectAddress(authority: PublicKey, collection: PublicKey): [PublicKey, number];
export declare function deriveBadgeAddress(project: PublicKey, mint: PublicKey): [PublicKey, number];
export declare function deriveMetadataAddress(mint: PublicKey): [PublicKey, number];
export declare function deriveUserAccount(projectAuth: PublicKey, projectState: PublicKey, user: PublicKey): [PublicKey, number];
export declare function deriveEscrowAccount(initializer: PublicKey, mint: PublicKey): [PublicKey, number];
