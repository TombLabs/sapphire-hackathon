use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod processor;
pub mod state;

use crate::constants::*;
use crate::errors::ErrorCode;
use crate::instructions::*;
use crate::processor::{transfer_sol, transfer_sol_pda, transfer_token};

declare_id!("SAPPozsZ9dApKRx4n4aMipFZ4pvH2QY9JmfLbks1UXo");

#[program]
pub mod sapphire_auctions {

    use super::*;

    pub fn init_sapphire_auctions(ctx: Context<InitSapphireAuctions>, fee: u8) -> Result<()> {
        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::InvalidAuthority
        );
        let sapphire_auctions = &mut ctx.accounts.sapphire_auctions;
        sapphire_auctions.authority = ctx.accounts.authority.key();
        sapphire_auctions.fee_wallet = ctx.accounts.fee_wallet.key();
        sapphire_auctions.fee = fee;
        sapphire_auctions.bump = ctx.bumps.sapphire_auctions;
        msg!("Sapphire Auctions initialized");
        Ok(())
    }

    pub fn update_fee(ctx: Context<UpdateFee>, fee: u8) -> Result<()> {
        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::InvalidAuthority
        );
        let sapphire_auctions = &mut ctx.accounts.sapphire_auctions;
        sapphire_auctions.fee = fee;
        msg!("Sapphire Auctions fee updated");
        Ok(())
    }

    pub fn update_fee_wallet(ctx: Context<UpdateFeeWallet>) -> Result<()> {
        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::InvalidAuthority
        );
        let sapphire_auctions = &mut ctx.accounts.sapphire_auctions;
        sapphire_auctions.fee_wallet = ctx.accounts.fee_wallet.key();
        msg!("Sapphire Auctions fee wallet updated");
        Ok(())
    }

    pub fn init_auction(
        ctx: Context<InitAuction>,
        start_price: u64,
        min_bid: u64,
        end_time: i64,
    ) -> Result<()> {
        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::InvalidAuthority
        );
        let auction = &mut ctx.accounts.auction;
        auction.creator = ctx.accounts.creator.key();
        auction.nft_escrow = ctx.accounts.nft_escrow.key();
        auction.bumps.auction_state_bump = ctx.bumps.auction;
        auction.bumps.nft_escrow_bump = ctx.bumps.nft_escrow;
        auction.nft_mint = ctx.accounts.nft_mint.key();
        auction.creator_token_account = ctx.accounts.creator_token_account.key();
        auction.start_price = start_price;
        auction.min_bid = min_bid;
        auction.end_time = end_time;
        auction.winner = Pubkey::default();
        auction.highest_bid.bidder = Pubkey::default();
        auction.highest_bid.amount = 0;
        auction.highest_bid.bidder_token_account = Pubkey::default();
        auction.previous_high_bid.bidder = Pubkey::default();
        auction.previous_high_bid.amount = 0;
        auction.previous_high_bid.bidder_token_account = Pubkey::default();
        msg!("Auction initialized");

        transfer_token(
            ctx.accounts.creator_token_account.to_account_info(),
            ctx.accounts.nft_escrow.to_account_info(),
            ctx.accounts.creator.to_account_info(),
            1,
            ctx.accounts.token_program.to_account_info(),
            None,
        )?;

        msg!("NFT transferred to escrow");

        transfer_sol(
            ctx.accounts.creator.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            10000000,
            ctx.accounts.system_program.to_account_info(),
            None,
        )?;
        transfer_sol(
            ctx.accounts.creator.to_account_info(),
            ctx.accounts.fee_wallet.to_account_info(),
            30000000,
            ctx.accounts.system_program.to_account_info(),
            None,
        )?;

        msg!("Auction is live!");
        Ok(())
    }

    pub fn bid_on_auction(ctx: Context<BidOnAuction>, bid: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;

        if auction.highest_bid.amount > 0 {
            require_gte!(
                bid,
                auction.highest_bid.amount + auction.min_bid,
                ErrorCode::BidTooLow
            );
        } else {
            require_gte!(bid, auction.start_price, ErrorCode::BidTooLow);
        }

        if auction.highest_bid.amount != 0 {
            transfer_sol(
                ctx.accounts.bidder.to_account_info(),
                auction.to_account_info(),
                bid,
                ctx.accounts.system_program.to_account_info(),
                None,
            )?;
            msg!("New high bid placed: {}", bid);
            transfer_sol_pda(
                &auction.to_account_info(),
                &ctx.remaining_accounts[0].to_account_info(),
                auction.highest_bid.amount,
            )?;

            msg!("Previous high bidder refunded");
            auction.previous_high_bid.bidder = ctx.remaining_accounts[0].key();
            auction.previous_high_bid.amount = auction.highest_bid.amount;
            auction.previous_high_bid.bidder_token_account =
                auction.highest_bid.bidder_token_account;
            auction.highest_bid.bidder = ctx.accounts.bidder.key();
            auction.highest_bid.amount = bid;
            auction.highest_bid.bidder_token_account = ctx.accounts.bidder_token_account.key();
        } else {
            transfer_sol(
                ctx.accounts.bidder.to_account_info(),
                auction.to_account_info(),
                bid,
                ctx.accounts.system_program.to_account_info(),
                None,
            )?;
            auction.highest_bid.bidder = ctx.accounts.bidder.key();
            auction.highest_bid.amount = bid;
            auction.highest_bid.bidder_token_account = ctx.accounts.bidder_token_account.key();
            auction.previous_high_bid.bidder = ctx.remaining_accounts[0].key();
            auction.previous_high_bid.amount = auction.highest_bid.amount;
            auction.previous_high_bid.bidder_token_account =
                auction.highest_bid.bidder_token_account;
            msg!("Bid Placed: {}", bid);
        };

        Ok(())
    }

    pub fn close_auction<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseAuction<'info>>,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let sapphire_auctions = &mut ctx.accounts.sapphire_auctions;

        let creator_seed = auction.creator.key();
        let nft_mint_seed = auction.nft_mint.key();

        let auction_seeds = &[&[
            AUCTION_STATE_SEED,
            creator_seed.as_ref(),
            PROGRAM_SEED,
            nft_mint_seed.as_ref(),
            bytemuck::bytes_of(&auction.bumps.auction_state_bump),
        ][..]];

        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::InvalidAuthority
        );

        require_eq!(
            auction.creator.to_string(),
            ctx.accounts.creator.key().to_string(),
            ErrorCode::InvalidCreator
        );

        require_eq!(
            auction.nft_mint.to_string(),
            ctx.accounts.nft_mint.key().to_string(),
            ErrorCode::InvalidNFT
        );

        if auction.highest_bid.amount == 0 {
            msg!("No bids placed, returning NFT to creator");
            transfer_token(
                ctx.accounts.nft_escrow.to_account_info(),
                ctx.remaining_accounts[0].to_account_info(),
                auction.to_account_info(),
                1,
                ctx.accounts.token_program.to_account_info(),
                Some(auction_seeds),
            )?;
            msg!("NFT returned to creator");
        } else {
            msg!("Highest bid placed, transferring NFT to winner");
            //transfer nft to winner
            transfer_token(
                ctx.accounts.nft_escrow.to_account_info(),
                ctx.remaining_accounts[0].to_account_info(),
                auction.to_account_info(),
                1,
                ctx.accounts.token_program.to_account_info(),
                Some(auction_seeds),
            )?;

            msg!("NFT transferred to winner");

            let total_as_f64: f64 = auction.highest_bid.amount as f64;
            let fee_percent: f64 = sapphire_auctions.fee as f64 / 100.0;
            let fee_amount: f64 = total_as_f64 * fee_percent;
            let amount_minus_fee: u64 = (total_as_f64 - fee_amount) as u64;

            msg!("Amount minus fee: {}", amount_minus_fee);

            //transfer highest bid to creator
            transfer_sol_pda(
                &auction.to_account_info(),
                &ctx.accounts.creator.to_account_info(),
                amount_minus_fee,
            )?;

            msg!("Highest bid transferred to creator");

            let fee_amount = auction.highest_bid.amount - amount_minus_fee;

            msg!("Fee amount: {}", fee_amount);
            //transfer fee to fee wallet
            transfer_sol_pda(
                &auction.to_account_info(),
                &ctx.accounts.fee_wallet.to_account_info(),
                fee_amount as u64,
            )?;
        }
        Ok(())
    }
}
