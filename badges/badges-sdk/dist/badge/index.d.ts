import { PublicKey, Transaction } from "@solana/web3.js";
import { Badges } from "src/base";
import { BadgeState } from "src/types";
export declare class Badge extends Badges {
    createBadge(name: string, metadataUri: string, imageUri: string, royalty: number, collectionAddress: PublicKey): Promise<{
        transaction: string;
        mint: PublicKey;
    } | Error>;
    getCreateBadgeTx(name: string, metadataUri: string, imageUri: string, royalty: number, collectionAddress: PublicKey): Promise<{
        transaction: Transaction;
        mint: PublicKey;
    } | Error>;
    deleteBadge(mint: PublicKey, collectionAddress: PublicKey): Promise<string | Error>;
    getDeleteBadgeTx(mint: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error>;
    addBadgeToUser(authority: PublicKey, initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey): Promise<string | Error>;
    getAddBadgeToUserTx(authority: PublicKey, initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error>;
    withdrawBadge(initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<string | Error>;
    getWithdrawBadgeTx(initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error>;
    getBadgeState(mint: PublicKey, project: PublicKey): Promise<BadgeState | Error>;
    getBadgeMetadataUri(mint: PublicKey): Promise<string | Error>;
    getBadgeImageUri(mint: PublicKey): Promise<string | Error>;
    getProjectBadges(project: PublicKey): Promise<BadgeState[] | Error>;
}
