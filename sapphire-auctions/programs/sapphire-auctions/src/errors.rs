use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    InvalidStage,
    #[msg("Insufficient Funds")]
    InsufficientFunds,
    #[msg("Invalid Nft")]
    InvalidNFT,
    #[msg("Invalid Creator")]
    InvalidCreator,
    #[msg("Invalid Bid")]
    InvalidBid,
    #[msg("Incorrect Fee Wallet")]
    InvalidFeeWallet,
    #[msg("Invalid Authority")]
    InvalidAuthority,
    #[msg("Invalid token mint address")]
    InvalidMint,
    #[msg("Bid was below the minimum bid")]
    BidTooLow,
}
