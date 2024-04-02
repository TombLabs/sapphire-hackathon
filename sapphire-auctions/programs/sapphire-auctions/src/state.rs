use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AuctionBumps {
    pub auction_state_bump: u8,
    pub nft_escrow_bump: u8,
}

#[account]
pub struct SapphireAuctions {
    pub authority: Pubkey,
    pub fee_wallet: Pubkey,
    pub fee: u8,
    pub bump: u8,
}

#[account]
pub struct Auction {
    pub creator: Pubkey,
    pub nft_escrow: Pubkey,
    pub bumps: AuctionBumps,
    pub nft_mint: Pubkey,
    pub creator_token_account: Pubkey,
    pub start_price: u64,
    pub min_bid: u64,
    pub end_time: i64,
    pub winner: Pubkey,
    pub highest_bid: HighestBid,
    pub previous_high_bid: ReplacedBidder,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HighestBid {
    pub bidder: Pubkey,
    pub amount: u64,
    pub bidder_token_account: Pubkey,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ReplacedBidder {
    pub bidder: Pubkey,
    pub amount: u64,
    pub bidder_token_account: Pubkey,
}

impl SapphireAuctions {
    pub const LEN: usize = 8 //descriminator
    + 32 //authority
    + 32 //fee_wallet
    + 1 //fee
    +1//bump
    + 2; //padding
}

impl Auction {
    pub const LEN: usize = 8 //descriminator
    + 32 //creator
    + 32 //nft_escrow
    + 2 //bumps
    + 32 //nft_mint
    + 8 //start_price
    + 8 //bid_increment
    + 8 //end_time
    + 32 //creator_token_account
    + 32 //winner
    + 72 //highest_bid
    + 72; //previous_high_bid
}
