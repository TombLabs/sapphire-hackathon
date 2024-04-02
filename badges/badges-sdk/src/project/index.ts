import * as anchor from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from "@solana/web3.js";
import { Badges } from "src/base";
import { GLOBAL_STATE_FEE_WALLET, GLOBAL_STATE_PUBKEY, programId } from "src/constants";
import { idl } from "src/idl/idl";
import { BadgeState } from "src/types";
import { deriveBadgeAddress, deriveMetadataAddress, deriveProjectAddress } from "src/utils/utils";
import { ProjectState } from "./types";


export class Project extends Badges {

    /*INSTRUCTIONS */

    /**
    * Get the create a project.
    * Project Authority must be signer
    * Signer must also be the authority of the collection
    * @param {number} - The fee for creating the project.
    * @param {PublicKey} collectionAddress - The address of the collection.
    * @param {string} name - The name of the project.
    * @param {PublicKey} [feeAddress=Signer] - The address to receive the fee. Optional.  Default: Signer
    * @returns {Promise<string | Error>} - The transaction signature from creating a badges project
    */
    async createProject(fee: number, collectionAddress: PublicKey, name: string, feeAddress?: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const createProjectTx = await program.methods.createProject(name, new anchor.BN(fee)).accounts({
                project: project,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress,
                feeWallet: feeAddress || wallet.publicKey,
                globalState: GLOBAL_STATE_PUBKEY,
                globalFeeWallet: GLOBAL_STATE_FEE_WALLET,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
            }).rpc()

            return createProjectTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }

    }
    /**
    * Get the create project transaction.
    * Project Authority must be signer
    * Signer must also be the authority of the collection
    * @param {number} - The fee for creating the project.
    * @param {PublicKey} collectionAddress - The address of the collection.
    * @param {string} name - The name of the project.
    * @param {PublicKey} [feeAddress=Signer] - The address to receive the fee. Optional.  Default: Signer
    * @returns {Promise<Transaction | Error>} - The transaction to create a badges project
    */
    async getCreateProjectTx(fee: number, collectionAddress: PublicKey, name: string, feeAddress?: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const createProjectTx = await program.methods.createProject(name, new anchor.BN(fee)).accounts({
                project: project,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress,
                feeWallet: feeAddress || wallet.publicKey,
                globalState: GLOBAL_STATE_PUBKEY,
                globalFeeWallet: GLOBAL_STATE_FEE_WALLET,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
            }).transaction()

            return createProjectTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }

    }

    /**
     * Changes the name of a project.
     * Project Authority must be signer
     * @param {string} name - The new name of the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<String | Error>} - The transaction signature of submitted transaction to change the name of a badges project
     *  */
    async changeProjectName(name: string, collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateNameTx = await program.methods.changeProjectName(name).accounts({
                project: project,
                projectAuth: wallet.publicKey,
            }).rpc()

            return updateNameTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Get the transaction to change project name.
     * Project Authority must be signer
     * @param {string} name - The new name of the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to change the name of a badges project
     *  */
    async getChangeProjectNameTx(name: string, collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateNameTx = await program.methods.changeProjectName(name).accounts({
                project: project,
                projectAuth: wallet.publicKey,
            }).transaction()

            return updateNameTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Changes the fee Wallet for the project
     * Project Authority must be signer
     * @param {PublicKey} newFeeWallet - The new fee wallet for the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<string | Error>} - The transaction signature for a submitted transaction to change the fee wallet for a badges project
     */
    async changeFeeWallet(newFeeWallet: PublicKey, collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateFeeWalletTx = await program.methods.changeProjectFeeWallet().accounts({
                project: project,
                projectAuth: wallet.publicKey,
                newFeeWallet: newFeeWallet,
            }).rpc()

            return updateFeeWalletTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Get the transaction to change fee wallet for the project
     * Project Authority must be signer
     * @param {PublicKey} newFeeWallet - The new fee wallet for the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to change the fee wallet for a badges project
     */
    async getChangeFeeWalletTx(newFeeWallet: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateFeeWalletTx = await program.methods.changeProjectFeeWallet().accounts({
                project: project,
                projectAuth: wallet.publicKey,
                newFeeWallet: newFeeWallet,
            }).transaction()

            return updateFeeWalletTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Changes the fee for the project
     * Project Authority must be signer
     * @param {number} fee - The new fee for the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<string | Error>} - The transaction signature for a submitted transaction to change the fee for a badges project
     */
    async changeFee(fee: number, collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateFeeTx = await program.methods.changeProjectFee(new anchor.BN(fee)).accounts({
                project: project,
                projectAuth: wallet.publicKey,

            }).rpc()

            return updateFeeTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }
    /**
     * Get the transaction to change fee for the project
     * Project Authority must be signer
     * @param {number} fee - The new fee for the project.
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to change the fee for a badges project
     */
    async getChangeFeeTx(fee: number, collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const updateFeeTx = await program.methods.changeProjectFee(new anchor.BN(fee)).accounts({
                project: project,
                projectAuth: wallet.publicKey,

            }).transaction()

            return updateFeeTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }

    /**
     * Deletes a project
     * Project Authority must be signer
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<string | Error>} - The transaction signature for a submitted transaction to delete a badges project
     * */

    async deleteProject(collectionAddress: PublicKey): Promise<string | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const deleteProjectTx = await program.methods.deleteProject().accounts({
                project: project,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress
            }).rpc()

            return deleteProjectTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }
    /**
     * Get the transaction to delete a project
     * Project Authority must be signer
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<Transaction | Error>} - The transaction to delete a badges project
     * */

    async getDeleteProjectTx(collectionAddress: PublicKey): Promise<Transaction | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);
        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)

            const deleteProjectTx = await program.methods.deleteProject().accounts({
                project: project,
                projectAuth: wallet.publicKey,
                collectionAddress: collectionAddress
            }).transaction()

            return deleteProjectTx
        } catch (error) {
            return new Error(error.message || "An error occurred while building the transaction")
        }
    }


    /*FETCH*/

    /**
     * Fetches the state of a project
     * @param {PublicKey} collectionAddress - The address of the collection.
     * @returns {Promise<ProjectState | Error>} - The state of the project
     * */
    async getProjectState(collectionAddress: PublicKey): Promise<ProjectState | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        try {
            const [project, projectBump] = deriveProjectAddress(wallet.publicKey, collectionAddress)
            const state = await program.account.projectState.fetch(project)

            return {
                publicKey: project,
                badges: state.badges,
                // @ts-ignore
                fee: state.fee.toNumber(),
                feeWallet: state.feeWallet,
                name: state.name,
                // @ts-ignore
                bump: state.bump.toNumber(),
                collectionAddress: state.collectionAddress
            } as ProjectState
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the project state")
        }
    }

    /**
     * Fetches all the projects
     * @returns {Promise<ProjectState[] | Error>} - The state of all badges projects
     * */
    async getAllProjects(): Promise<ProjectState[] | Error> {
        const connection = new Connection(this.rpcUrl || "https://api.mainnet-beta.solana.com", this.commitment || "finalized");
        const wallet = this.wallet instanceof Keypair ? new anchor.Wallet(this.wallet) : this.wallet;
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: this.commitment || "finalized",
        })

        const program = new anchor.Program(idl, programId, provider);

        try {

            const state = await program.account.projectState.all()
            return state.map((s) => {
                return {
                    publicKey: s.publicKey,
                    ...s.account
                }
            }) as ProjectState[]
        } catch (error) {
            return new Error(error.message || "An error occurred while fetching the project state")
        }
    }





}