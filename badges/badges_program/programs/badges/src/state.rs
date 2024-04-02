use anchor_lang::prelude::*;

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub fee_wallet: Pubkey,
    pub project_fee: u64,
    pub user_fee: u64,
    pub bump: u8,
}

#[account]
pub struct Badge {
    pub name: String,
    pub metadata: String,
    pub image: String,
    pub bump: u8,
    pub project: Pubkey,
    pub mint: Pubkey,
}

#[account]
pub struct Project {
    pub project_auth: Pubkey,
    pub collection_address: Pubkey,
    pub name: String,
    pub bump: u8,
    pub fee_wallet: Pubkey,
    pub fee: u64,
    pub badges: Vec<Pubkey>,
}

#[account]
pub struct UserAccount {
    pub user_auth: Pubkey,
    pub badges: Vec<Pubkey>,
    pub bumps: Vec<u8>,
    pub escrows: Vec<Pubkey>,
    pub db_id: Option<String>,
    pub initializer: Pubkey,
    pub bump: u8,
}

impl GlobalState {
    pub const LEN: usize = 8 //descriminator
    + 32 //authority
    + 32 //fee_wallet
    + 8 //fee
    + 8 //fee
    + 8 //fee
    + 1//bump
    + 2; //padding
}

impl Project {
    pub const LEN: usize = 8 //descriminator
    + 32 //project auth
    + 32 //collection address
    + 32 //fee address
    + 8 //fee amount
    + 32 //name max length 28
    + 1 //bump
    + 32 * 20 // Initial allocation of 20 badges
    + 32 * 20 // Initial allocation of 20 escrows
    + 2; //padding
}

impl Badge {
    pub const LEN: usize = 8 //descriminator
    + 32 //name max length 28
    + 32 //escrow
    + 204 //metadata max length 200
    + 2 //bumps
    + 32 //project
    + 32 //mint
    + 2; //padding
}

impl UserAccount {
    pub const LEN: usize = 8 //descriminator
    + 32 //user auth
    + 32 //initializer
    + 32 * 20 // Initial allocation of 20 badges
    + 32 * 20 // Initial allocation of 20 escrows
    + 20 // Initial allocation of 20 bumps
    + 4 + 30 // db_id
    + 2; //padding
}
