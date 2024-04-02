import { PublicKey, Transaction } from "@solana/web3.js";
import { Badges } from "src/base";
import { BadgeState } from "src/types";
import { UserState } from "./types";
export declare class User extends Badges {
    createUser(dbId: string, collectionAddress: PublicKey, userWallet: PublicKey): Promise<string | Error>;
    getCreateUserTx(dbId: string, collectionAddress: PublicKey, userWallet: PublicKey): Promise<Transaction | Error>;
    deleteUser(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<string | Error>;
    getDeleteUserTx(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error>;
    getChangeUserAuthTx(initializer: PublicKey, newAuth: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error>;
    changeUserAuth(initializer: PublicKey, newAuth: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<String | Error>;
    getUserAccount(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<UserState | Error>;
    getAllUserAccounts(): Promise<UserState[] | Error>;
    getAllBadgesForUser(): Promise<BadgeState[] | Error>;
}
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
