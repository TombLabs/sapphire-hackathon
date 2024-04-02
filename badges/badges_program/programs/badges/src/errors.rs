use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Authority does not match expected authority")]
    AuthorityMismatch,
    #[msg("Insufficient Funds")]
    InsufficientFunds,
    #[msg("Incorrect Fee Wallet")]
    InvalidFeeWallet,
    #[msg("Invalid token mint address")]
    InvalidMint,
    #[msg("Invalid account owner, this wallet cannot be used as a fee wallet")]
    InvalidOwner,
    #[msg("All badges must be cleared before deleting a project")]
    BadgesExist,
    #[msg("Badge does not exist")]
    BadgeDoesNotExist,
    #[msg("Incorrect fee address provided")]
    IncorrectFeeAddress,
    #[msg("Incorrect collection address provided")]
    CollectionMismatch,
    #[msg("Incorrect publickey provided")]
    UnexpectedPublicKey,
}
