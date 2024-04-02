use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{Mint, Token};
use anchor_spl::associated_token::*;

use crate::constants::*;
use crate::state::{SapphireAuctions, Auction};

#[derive(Accounts)]
#[instruction(fee: u8)]
pub struct InitSapphireAuctions<'info> {
    #[account(
        init, 
        payer = authority, 
        space = SapphireAuctions::LEN,
        seeds = [
            GLOBAL_STATE_SEED,
            authority.key().as_ref(),
            PROGRAM_SEED
        ],
        bump
    )]
    pub sapphire_auctions: Account<'info, SapphireAuctions>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK
    pub fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(fee: u8)]
pub struct UpdateFee<'info> {
    #[account(mut,
        seeds =[GLOBAL_STATE_SEED, authority.key().as_ref(), PROGRAM_SEED], 
        bump = sapphire_auctions.bump
    )]
    pub sapphire_auctions: Account<'info, SapphireAuctions>,
    #[account(mut, constraint = authority.lamports() > 0 && authority.data_is_empty())]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction()]
pub struct UpdateFeeWallet<'info> {
    #[account(mut,
        seeds =[GLOBAL_STATE_SEED, authority.key().as_ref(), PROGRAM_SEED], 
        bump = sapphire_auctions.bump
    )]
    pub sapphire_auctions: Account<'info, SapphireAuctions>,
    #[account(mut, constraint = authority.lamports() > 0 && authority.data_is_empty())]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK
    pub fee_wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(start_price: u64, min_bid: u64, end_time: i64)]
pub struct InitAuction<'info> {
    #[account(
        init,
        payer = authority,
        space = Auction::LEN,
        seeds = [
            AUCTION_STATE_SEED,
            creator.key().as_ref(),
            PROGRAM_SEED,
            nft_mint.key().as_ref()
        ],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        seeds = [
            AUCTION_ESCROW_SEED,
            creator.key().as_ref(),
            PROGRAM_SEED,
            nft_mint.key().as_ref(),
            auction.key().as_ref(),
        ],
        bump,
        token::mint = nft_mint,
        token::authority = auction
    )]
    pub nft_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    ///CHECK
    #[account(mut)]
    pub fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(bid: u64)]
pub struct BidOnAuction<'info>{
    #[account(
        mut,
        seeds = [
            AUCTION_STATE_SEED,
            creator.key().as_ref(),
            PROGRAM_SEED,
            nft_mint.key().as_ref(),
        ],
        bump = auction.bumps.auction_state_bump,
        )]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub bidder_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    ///CHECK
    pub creator: AccountInfo<'info>,
    ///CHECK
    #[account(mut)]
    pub fee_wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction()]
pub struct CloseAuction<'info>{
    #[account(
        mut,
    close = authority,
    seeds = [
        AUCTION_STATE_SEED,
        creator.key().as_ref(),
        PROGRAM_SEED,
        nft_mint.key().as_ref(),
    ],
    bump = auction.bumps.auction_state_bump,
    )]
    pub auction: Account<'info, Auction>,
    #[account(mut,
        seeds =[GLOBAL_STATE_SEED, authority.key().as_ref(), PROGRAM_SEED], 
        bump = sapphire_auctions.bump
    )]
    pub sapphire_auctions: Account<'info, SapphireAuctions>,
    #[account(mut)]
    pub authority: Signer<'info>,
    ///CHECK
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account(mut,
    seeds=[
        AUCTION_ESCROW_SEED,
        creator.key().as_ref(),
        PROGRAM_SEED,
        nft_mint.key().as_ref(),
        auction.key().as_ref(),
    ],
    bump = auction.bumps.nft_escrow_bump,
    token::mint = nft_mint,
    token::authority = auction,
    )]
    pub nft_escrow: Account<'info, TokenAccount>,
    ///CHECK
    pub winner: AccountInfo<'info>,
    ///CHECK
    #[account(mut)]
    ///CHECK
    pub fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
