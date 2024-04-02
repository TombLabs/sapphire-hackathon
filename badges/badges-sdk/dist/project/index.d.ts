import { PublicKey, Transaction } from "@solana/web3.js";
import { Badges } from "src/base";
import { ProjectState } from "./types";
export declare class Project extends Badges {
    createProject(fee: number, collectionAddress: PublicKey, name: string, feeAddress?: PublicKey): Promise<string | Error>;
    getCreateProjectTx(fee: number, collectionAddress: PublicKey, name: string, feeAddress?: PublicKey): Promise<Transaction | Error>;
    changeProjectName(name: string, collectionAddress: PublicKey): Promise<string | Error>;
    getChangeProjectNameTx(name: string, collectionAddress: PublicKey): Promise<Transaction | Error>;
    changeFeeWallet(newFeeWallet: PublicKey, collectionAddress: PublicKey): Promise<string | Error>;
    getChangeFeeWalletTx(newFeeWallet: PublicKey, collectionAddress: PublicKey): Promise<Transaction | Error>;
    changeFee(fee: number, collectionAddress: PublicKey): Promise<string | Error>;
    getChangeFeeTx(fee: number, collectionAddress: PublicKey): Promise<Transaction | Error>;
    deleteProject(collectionAddress: PublicKey): Promise<string | Error>;
    getDeleteProjectTx(collectionAddress: PublicKey): Promise<Transaction | Error>;
    getProjectState(collectionAddress: PublicKey): Promise<ProjectState | Error>;
    getAllProjects(): Promise<ProjectState[] | Error>;
}
