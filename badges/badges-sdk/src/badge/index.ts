import * as anchor from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Badges } from "src/base";
import { programId } from "src/constants";
import { idl } from "src/idl/idl";
import { BadgeState } from "src/types";
import { deriveBadgeAddress, deriveEscrowAccount, deriveMetadataAddress, deriveProjectAddress, deriveUserAccount } from "src/utils/utils";


export class Badge extends Badges {


    /*INSTRUCTIONS */
    /**
    * Creates a new badge
    * Project Authority must be signer
    * @param {string} name - The name of the badge.
    * @param {string} metadataUri - The metadata uri of the badge.
    * @param {string} imageUri - The image uri of the badge.
    * @param {number} royalty - The royalty percentage for the badge.
    * @param {PublicKey} collectionAddress - The address of the collection.
    * @returns {Promise<{transaction: string, mint: PublicKey}  | Error>} - An object with the transaction singature and the mint to create a badge.
    */

    async createBadge(name: string, metadataUri: string, imageUri: string, royalty: number, collectionAddress: PublicKey): Promise<{ transaction: string, mint: PublicKey } | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        const mint = Keypair.generate()

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint.publicKey)
            const [metadata, metadataBump] = deriveMetadataAddress(mint.publicKey)


            const createBadgeTx = await program.methods.createBadge(name, metadataUri, imageUri, royalty).accounts({
                badge: badge,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress,
                mint: mint.publicKey,
                project: project,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).remainingAccounts([
                {
                    pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: metadata,
                    isWritable: true,
                    isSigner: false
                },
            ]).transaction()

            const blockhash = await connection.getLatestBlockhash();
            createBadgeTx.feePayer = wallet.publicKey
            createBadgeTx.recentBlockhash = blockhash.blockhash
            createBadgeTx.partialSign(mint)

            const signedTx = await wallet.signTransaction(createBadgeTx)
            const txid = await connection.sendRawTransaction(signedTx.serialize())

            return { transaction: txid, mint: mint.publicKey }
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }
    /**
    * Get the transaction to create a new badge
    * Project Authority must be signer
    * @param {string} name - The name of the badge.
    * @param {string} metadataUri - The metadata uri of the badge.
    * @param {string} imageUri - The image uri of the badge.
    * @param {number} royalty - The royalty percentage for the badge.
    * @param {PublicKey} collectionAddress - The address of the collection.
    * @returns {Promise<{transaction: Transaction, mint: PublicKey}  | Error>} - An object with the transaction and the mint to create a badge.  This transaction is already partially signed by the mint keypair.
    */

    async getCreateBadgeTx(name: string, metadataUri: string, imageUri: string, royalty: number, collectionAddress: PublicKey): Promise<{ transaction: Transaction, mint: PublicKey } | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        const mint = Keypair.generate()

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint.publicKey)
            const [metadata, metadataBump] = deriveMetadataAddress(mint.publicKey)


            const createBadgeTx = await program.methods.createBadge(name, metadataUri, imageUri, royalty).accounts({
                badge: badge,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress,
                mint: mint.publicKey,
                project: project,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).remainingAccounts([
                {
                    pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: metadata,
                    isWritable: true,
                    isSigner: false
                },
            ]).transaction()

            const blockhash = await connection.getLatestBlockhash();
            createBadgeTx.feePayer = wallet.publicKey
            createBadgeTx.recentBlockhash = blockhash.blockhash
            createBadgeTx.partialSign(mint)

            return { transaction: createBadgeTx, mint: mint.publicKey }
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Deletes a badge
     * Project Authority must be signer
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<string | Error>} - The transaction signature of submitted transaction to delete a badge
     * */
    async deleteBadge(mint: PublicKey, collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)

            const deleteBadgeTx = await program.methods.deleteBadge().accounts({
                badge: badge,
                project: project,
                mint: mint,
                collectionAddress: collectionAddress,
                projectAuth: wallet.publicKey,
            }).rpc()

            return deleteBadgeTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }
    /**
     * Get the transaction to delete a badge
     * Project Authority must be signer
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to delete a badge
     * */
    async getDeleteBadgeTx(mint: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)

            const deleteBadgeTx = await program.methods.deleteBadge().accounts({
                badge: badge,
                project: project,
                mint: mint,
                collectionAddress: collectionAddress,
                projectAuth: wallet.publicKey,
            }).transaction()

            return deleteBadgeTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Adds a badge to a user
     * Project Authority must be signer
     * @param {PublicKey} authority - The user account authority.  If unchanged, will be the same as the initializer.
     * @param {PublicKey} initializer - The user authority at the time of account creation.
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<string | Error>} - The transaction signature of submitted transaction to add a badge to a user
     * */

    async addBadgeToUser(authority: PublicKey, initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)
            const [user, userBump] = deriveUserAccount(wallet.publicKey, project, initializer)
            const [escrow, escrowBump] = deriveEscrowAccount(initializer, mint)
            const [metadata, metadataBump] = deriveMetadataAddress(mint)
            const addBadgeToUserTx = await program.methods.addBadgeToUser().accounts({
                userAccount: user,
                initializer: initializer,
                userAuth: authority,
                badge: badge,
                project: project,
                projectAuth: wallet.publicKey,
                mint: mint,
                escrow: escrow,
                systemProgram: anchor.web3.SystemProgram.programId,
                collectionAddress: collectionAddress,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID
            }).remainingAccounts([
                {
                    pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: metadata,
                    isWritable: true,
                    isSigner: false
                }
            ]).rpc()

            return addBadgeToUserTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Get the transaction to add a badge to a user
     * Project Authority must be signer
     * @param {PublicKey} authority - The user account authority.  If unchanged, will be the same as the initializer.
     * @param {PublicKey} initializer - The user authority at the time of account creation.
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to add a badge to a user
     * */

    async getAddBadgeToUserTx(authority: PublicKey, initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)
            const [user, userBump] = deriveUserAccount(wallet.publicKey, project, initializer)
            const [escrow, escrowBump] = deriveEscrowAccount(initializer, mint)
            const [metadata, metadataBump] = deriveMetadataAddress(mint)
            const addBadgeToUserTx = await program.methods.addBadgeToUser().accounts({
                userAccount: user,
                initializer: initializer,
                userAuth: authority,
                badge: badge,
                project: project,
                projectAuth: wallet.publicKey,
                mint: mint,
                escrow: escrow,
                systemProgram: anchor.web3.SystemProgram.programId,
                collectionAddress: collectionAddress,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID
            }).remainingAccounts([
                {
                    pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
                    isWritable: false,
                    isSigner: false
                },
                {
                    pubkey: metadata,
                    isWritable: true,
                    isSigner: false
                }
            ]).transaction()

            return addBadgeToUserTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Withdraws a badge from a user
     * User Auth must be signer
     * @param {PublicKey} initializer - The user authority at the time of account creation.
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The project authority.
     * @returns {Promise<string | Error>} - The transaction signature of submitted transaction to withdraw a badge from a user
     * */

    async withdrawBadge(initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)
            const [escrow, escrowBump] = deriveEscrowAccount(initializer, mint)

            const userTokenInfo = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: mint })
            let extraIx: TransactionInstruction | false = false
            const userTokenAccount = userTokenInfo.value.length > 0 ? userTokenInfo.value[0].pubkey : getAssociatedTokenAddressSync(mint, wallet.publicKey)
            if (userTokenInfo.value.length === 0) {
                extraIx = createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    userTokenAccount,
                    wallet.publicKey,
                    mint,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            }

            const userAccount = await program.account.userAccount.fetch(user)

            const escrows = userAccount.escrows

            // @ts-ignore
            const escrowIndex = escrows.findIndex((e) => e.toBase58() === escrow.toBase58()) as number

            const withdrawBadgeIx = await program.methods.withdrawBadge(escrowIndex).accounts({
                userAccount: user,
                initializer: initializer,
                userAuth: wallet.publicKey,
                badge: badge,
                project: project,
                mint: mint,
                escrow: escrow,
                collectionAddress: collectionAddress,
                userTokenAccount: userTokenAccount,
                projectAuth: projectAuth,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            }).instruction()

            const withdrawBadgeTx = extraIx ? new Transaction().add(extraIx, withdrawBadgeIx) : new Transaction().add(withdrawBadgeIx)

            const blockhash = await connection.getLatestBlockhash();
            withdrawBadgeTx.feePayer = wallet.publicKey
            withdrawBadgeTx.recentBlockhash = blockhash.blockhash
            const signedTx = await wallet.signTransaction(withdrawBadgeTx)
            const txid = await connection.sendRawTransaction(signedTx.serialize())
            return txid
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }


    /**
     * Get the transaction to withdraw a badge from a user
     * User Auth must be signer
     * @param {PublicKey} initializer - The user authority at the time of account creation.
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @param {PublicKey} projectAuth - The project authority.
     * @returns {Promise<Transaction | Error>} - The transaction to withdraw a badge from a user
     * */

    async getWithdrawBadgeTx(initializer: PublicKey, mint: PublicKey, collectionAddress: PublicKey, projectAuth: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(projectAuth, collectionAddress)
            const [badge, badgeBump] = deriveBadgeAddress(project, mint)
            const [user, userBump] = deriveUserAccount(projectAuth, project, initializer)
            const [escrow, escrowBump] = deriveEscrowAccount(initializer, mint)

            const userTokenInfo = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: mint })
            let extraIx: TransactionInstruction | false = false
            const userTokenAccount = userTokenInfo.value.length > 0 ? userTokenInfo.value[0].pubkey : getAssociatedTokenAddressSync(wallet.publicKey, mint)
            if (userTokenInfo.value.length === 0) {
                extraIx = createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    userTokenAccount,
                    wallet.publicKey,
                    mint,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            }

            const userAccount = await program.account.userAccount.fetch(user)
            // @ts-ignore
            const badgeIndex = userAccount.escrow.findIndex(b => b.toBase58() === escrow.toBase58())
            const withdrawBadgeIx = await program.methods.withdrawBadge(badgeIndex).accounts({
                userAccount: user,
                initializer: initializer,
                userAuth: wallet.publicKey,
                badge: badge,
                project: project,
                mint: mint,
                escrow: escrow,
                collectionAddress: collectionAddress,
                userTokenAccount: userTokenAccount,
                projectAuth: projectAuth,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            }).instruction()

            const withdrawBadgeTx = extraIx ? new Transaction().add(extraIx, withdrawBadgeIx) : new Transaction().add(withdrawBadgeIx)

            return withdrawBadgeTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }



    /*FETCH*/

    /**
     * Fetches the badge state
     * @param {PublicKey} mint - The mint of the badge.
     * @param {PublicKey} project - The address of the project.
     * @returns {Promise<BadgeState | Error>} - The badge state or an error
     * */
    async getBadgeState(mint: PublicKey, project: PublicKey): Promise<BadgeState | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        const [badge, badgeBump] = deriveBadgeAddress(project, mint)

        try {
            const state = await program.account.badgeState.fetch(badge)

            return {
                publicKey: badge,
                mint: state.mint,
                project: state.project,
                metadata: state.metadata,
                image: state.image,
                name: state.name,
                // @ts-ignore
                royalty: state.royalty.toNumber(),
                // @ts-ignore
                bump: state.bump.toNumber()
            } as BadgeState
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the badge state")
        }
    }

    /**
     * Fetches the badge metadata
     * @param {PublicKey} mint - The mint of the badge.
     * @returns {Promise<string | Error>} - The badge metadata uri or an error
     * */

    async getBadgeMetadataUri(mint: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        const badges = await program.account.badge.all()

        const filter = badges.filter(badge => badge.account.mint === mint)

        try {


            return filter[0].account.metadata as string
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the badge metadata")
        }
    }

    /**
     * Fetches the badge image
     * @param {PublicKey} mint - The mint of the badge.
     * @returns {Promise<string | Error>} - The badge metadata uri or an error
     * */

    async getBadgeImageUri(mint: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        const badges = await program.account.badge.all()

        const filter = badges.filter(badge => badge.account.mint === mint)

        try {
            return filter[0].account.image as string
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the badge metadata")
        }
    }

    async getProjectBadges(project: PublicKey): Promise<BadgeState[] | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        try {
            const projectState = await program.account.project.fetch(project)
            const projectBadges = projectState.badges as any[]

            let allBadgeData: BadgeState[] = []

            for (const badge of projectBadges) {
                const state = await program.account.badge.fetch(badge)
                allBadgeData.push({
                    publicKey: badge,
                    mint: state.mint,
                    project: state.project,
                    metadata: state.metadata,
                    image: state.image,
                    name: state.name,
                    // @ts-ignore
                    royalty: state.royalty.toNumber(),
                    // @ts-ignore
                    bump: state.bump.toNumber()
                } as BadgeState)
            }
            return allBadgeData
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the project badges")
        }
    }
}