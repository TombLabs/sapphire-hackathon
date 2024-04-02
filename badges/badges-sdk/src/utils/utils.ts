import { PublicKey } from "@solana/web3.js";
import { GLOBAL_STATE_SEED, PROGRAM_SEED, programId } from "../constants";


export function getGlobalStateAccount(authority: PublicKey) {
    const [globalState, globalStateBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(GLOBAL_STATE_SEED, 'utf-8'),
            authority.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        new PublicKey(programId)
    )
    return globalState
}

export function deriveProjectAddress(authority: PublicKey, collection: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_state_sapphire_badges", 'utf-8'),
            authority.toBuffer(),
            collection.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        new PublicKey(programId)
    )

}
export function deriveBadgeAddress(project: PublicKey, mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            project.toBuffer(),
            mint.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        new PublicKey(programId)
    )

}

export function deriveMetadataAddress(mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
            mint.toBuffer()
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    )
}

export function deriveUserAccount(projectAuth: PublicKey, projectState: PublicKey, user: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_state_sapphire_badges", 'utf-8'),
            projectAuth.toBuffer(),
            projectState.toBuffer(),
            user.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        new PublicKey(programId)
    )
}

export function deriveEscrowAccount(initializer: PublicKey, mint: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            initializer.toBuffer(),
            mint.toBuffer(),
            Buffer.from(PROGRAM_SEED, 'utf-8')
        ],
        new PublicKey(programId)
    )
}