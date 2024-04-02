import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Badges } from "src/base";
import { programId } from "src/constants";
import { idl } from "src/idl/idl";
import { BadgeState } from "src/types";
import { deriveProjectAddress, deriveUserAccount } from "src/utils/utils";
import { UserState } from "./types";


export class User extends Badges {

    /**
     * Creates a new badges User for a specific project
     * Account is created and paid for by the project authority
     * @param {string} dbId - The database ID of the user.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} userWallet - The wallet of the user.
     * @returns {Promise<string | Error>} - The transaction signature of a successful user account creation.
    */
    async createUser(dbId: string, collectionAddress: PublicKey, userWallet: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [user, userBump] = deriveUserAccount(wallet.publicKey, project, userWallet)

            const createUserAccountTx = await program.methods.createUserAccount(dbId).accounts({
                userAccount: user,
                userAuth: userWallet,
                initializer: userWallet,
                project: project,
                collectionAddress: collectionAddress,
                projectAuth: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).rpc()

            return createUserAccountTx
        } catch (e) {
            return new Error(e.message || "Error creating user account transaction")
        }
    }
    /**
     * Get the transaction to create a new badges User for a specific project
     * Account is created and paid for by the project authority
     * @param {string} dbId - The database ID of the user.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} userWallet - The wallet of the user.
     * @returns {Promise<Transaction | Error>} Transaction - The transaction to create the user account.
    */
    async getCreateUserTx(dbId: string, collectionAddress: PublicKey, userWallet: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [user, userBump] = deriveUserAccount(wallet.publicKey, project, userWallet)

            const createUserAccountTx = await program.methods.createUserAccount(dbId).accounts({
                userAccount: user,
                userAuth: userWallet,
                initializer: userWallet,
                project: project,
                collectionAddress: collectionAddress,
                projectAuth: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).transaction()

            return createUserAccountTx
        } catch (e) {
            return new Error(e.message || "Error creating user account transaction")
        }
    }

    /**
     * Deletes a user account
     * User Authority must be the signer
     * @param {PublicKey} initializer - The authority of the user account at the time of initialization.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The wallet of the project authority.
     * @returns {Promise<string | Error>}  - The transaction signature of a successful user account deletion.
     */

    async deleteUser(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<string | Error> {

        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)

            const deleteUserAccountTx = await program.methods.deleteUserAccount().accounts({
                userAccount: user,
                initializer: initializer,
                project: project,
                collectionAddress: collectionAddress,
                projectAuth: projectAuth,
                userAuth: wallet.publicKey
            }).rpc()

            return deleteUserAccountTx
        } catch (e) {
            return new Error(e.message || "Error deleting user account transaction")
        }

    }
    /**
     * Get the transaction to delete a user account
     * User Authority must be the signer
     * @param {PublicKey} initializer - The authority of the user account at the time of initialization.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The wallet of the project authority.
     * @returns {Promise<Transaction | Error>} - The Transaction to delete the user account.
     */

    async getDeleteUserTx(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error> {

        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)

            const deleteUserAccountTx = await program.methods.deleteUserAccount().accounts({
                userAccount: user,
                initializer: initializer,
                project: project,
                collectionAddress: collectionAddress,
                projectAuth: projectAuth,
                userAuth: wallet.publicKey
            }).transaction()

            return deleteUserAccountTx
        } catch (e) {
            return new Error(e.message || "Error deleting user account transaction")
        }

    }

    /**
     * Get the transaction to change the authority of a user account
     * Current User Authority must be the signer
     * @param {PublicKey} initializer - The authority of the user account at the time of initialization.
     * @param {PublicKey} newAuth - The new authority of the user account.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The wallet of the project authority.
     * @returns {Promise<Transaction | Error>} Transaction - The transaction to change the user account authority.
     */
    async getChangeUserAuthTx(initializer: PublicKey, newAuth: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)

            const changeUserAuthTx = await program.methods.changeUserAuth().accounts({
                userAccount: user,
                initializer: initializer,
                currentUserAuth: wallet.publicKey,
                project: project,
                newUserAuth: newAuth,
                collectionAddress: collectionAddress,
                projectAuth: projectAuth,
            }).transaction()

            return changeUserAuthTx
        } catch (e) {
            return new Error(e.message || "Error changing user authority transaction")
        }
    }
    /**
     * Change the authority of a user account
     * Current User Authority must be the signer
     * @param {PublicKey} initializer - The authority of the user account at the time of initialization.
     * @param {PublicKey} newAuth - The new authority of the user account.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The wallet of the project authority.
     * @returns {Promise<String | Error>} - The transaction signature of a successful user account authority update.
     */
    async changeUserAuth(initializer: PublicKey, newAuth: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<String | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)

            const changeUserAuthTx = await program.methods.changeUserAuth().accounts({
                userAccount: user,
                initializer: initializer,
                currentUserAuth: wallet.publicKey,
                project: project,
                newUserAuth: newAuth,
                collectionAddress: collectionAddress,
                projectAuth: projectAuth,
            }).rpc()

            return changeUserAuthTx
        } catch (e) {
            return new Error(e.message || "Error changing user authority transaction")
        }
    }

    /*FETCH*/

    /**
     * Fetches a user account
     * @param {PublicKey} initializer - The authority of the user account at the time of initialization.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The wallet of the project authority.
     * @returns {Promise<UserState | Error>} UserState - The user account state.
     */

    async getUserAccount(initializer: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<UserState | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)

            const userAccount = await program.account.userAccount.fetch(user)

            return {
                pubkey: user,
                badges: userAccount.badges,
                userAuth: userAccount.userAuth,
                //@ts-ignore
                bumps: userAccount.bumps.map((b: any) => b.toNumber()),
                escrows: userAccount.escrows,
                dbId: userAccount.dbId,
                initializer: userAccount.initializer,
                //@ts-ignore
                bump: userAccount.bump.toNumber(),
            } as UserState
        } catch (e) {
            return new Error(e.message || "Error fetching user account")
        }
    }

    /**
     * Fetches all user accounts
     * @returns {Promise<UserState[] | Error>} UserState[] - The user account states.
     */

    async getAllUserAccounts(): Promise<UserState[] | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        try {
            const userAccounts = await program.account.userAccount.all()
            return userAccounts.map(userAccount => {
                return {
                    pubkey: userAccount.publicKey,
                    badges: userAccount.account.badges,
                    userAuth: userAccount.account.userAuth,
                    //@ts-ignore
                    bumps: userAccount.account.bumps.map((b: any) => b.toNumber()),
                    escrows: userAccount.account.escrows,
                    dbId: userAccount.account.dbId,
                    initializer: userAccount.account.initializer,
                    //@ts-ignore
                    bump: userAccount.bump.toNumber(),
                } as UserState
            })
        } catch (e) {
            return new Error(e.message || "Error fetching user accounts")
        }
    }

    async getAllBadgesForUser(): Promise<BadgeState[] | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider)

        const userAccounts = await program.account.userAccount.all()
        const requestedUser = userAccounts.find(userAccount => userAccount.account.userAuth === wallet.publicKey)
        if (!requestedUser) {
            return new Error("User account not found")
        }

        const badges = requestedUser?.account.badges as unknown as PublicKey[]

        if (!badges || !badges.length) {
            return new Error("No badges found for user")
        }

        try {

            const badgeStates = await Promise.all(badges.map(async badge => {
                const badgeState = await program.account.badge.fetch(badge)
                return {
                    publicKey: badge,
                    name: badgeState.name,
                    metadata: badgeState.metadata,
                    image: badgeState.image,
                    //@ts-ignore
                    bump: badgeState.bump.toNumber(),
                    project: badgeState.project,
                    //@ts-ignore
                    royalty: badgeState.royalty.toNumber(),
                    mint: badgeState.mint,
                } as BadgeState
            }
            ))
            return badgeStates
        } catch (e) {
            return new Error(e.message || "Error fetching badges for user")

        }
    }

}


/**
 * Applies the properties and methods of the base classes to the derived class
 * @param derivedCtor - The derived class
 * @param baseCtors - An array of base classes
 */
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
            );
        });
    });
}