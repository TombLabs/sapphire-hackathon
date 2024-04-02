use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod processor;
pub mod state;

use crate::constants::*;
use crate::errors::ErrorCode;
use crate::instructions::*;
use crate::processor::*;

declare_id!("J62cS9ndhGc8sREKa4L8GaZTdechFw8zNxQc3SighcHe");

#[program]
pub mod badges {

    use super::*;

    pub fn init_global_state(
        ctx: Context<InitGlobalState>,
        project_fee: u64,
        user_fee: u64,
    ) -> Result<()> {
        //Check that the authority is the expected authority on initialization
        require_eq!(
            ctx.accounts.authority.key().to_string(),
            AUTH_PUBKEY,
            ErrorCode::AuthorityMismatch
        );

        //check that the fee wallet has system program as owner
        if ctx.accounts.fee_wallet.owner.key() != ctx.accounts.system_program.key() {
            return Err(ErrorCode::InvalidOwner.into());
        }

        //set global state values
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.fee_wallet = ctx.accounts.fee_wallet.key();
        global_state.project_fee = project_fee;
        global_state.user_fee = user_fee;
        global_state.bump = ctx.bumps.global_state;

        msg!("Global State initialized for Sapphire Badges");
        msg!("Fee wallet: {}", global_state.fee_wallet.to_string());
        msg!("Project Fee: {}", project_fee / LAMPORTS_PER_SOL);
        msg!("User Fee: {}", user_fee / LAMPORTS_PER_SOL);

        Ok(())
    }

    //change global fee wallet
    pub fn change_global_fee_wallet(ctx: Context<ChangeGlobalFeeWallet>) -> Result<()> {
        //get access to the global state account
        let global_state = &mut ctx.accounts.global_state;

        //check that the authority is the expected authority
        require_eq!(
            global_state.authority,
            *ctx.accounts.authority.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //set the new fee wallet
        global_state.fee_wallet = ctx.accounts.new_fee_wallet.key();

        msg!("Global fee wallet changed");
        msg!(
            "New fee wallet: {}",
            global_state.fee_wallet.key().to_string()
        );

        Ok(())
    }

    //change global fee
    pub fn change_global_fee(
        ctx: Context<ChangeGlobalFee>,
        project_fee: Option<u64>,
        user_fee: Option<u64>,
    ) -> Result<()> {
        //get access to the global state account
        let global_state = &mut ctx.accounts.global_state;

        //check that the authority is the expected authority
        require_eq!(
            global_state.authority,
            *ctx.accounts.authority.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //if the project fee has a value, set the new project fee
        if project_fee.is_some() {
            //to avoid panic on unwrap, if project_fee is None, use the current value check above handles this but added precaution
            global_state.project_fee = project_fee.unwrap_or(global_state.project_fee);
            msg!(
                "Project fee changed to {}",
                project_fee.unwrap() / LAMPORTS_PER_SOL
            );
        } else {
            //do nothing
            msg!("Project fee unchanged");
        }

        //if the user fee has a value, set the new user fee
        if user_fee.is_some() {
            //to avoid panic on unwrap, if user_fee is None, use the current value check above handles this but added precaution
            global_state.user_fee = user_fee.unwrap_or(global_state.user_fee);
            msg!(
                "User fee changed to {}",
                user_fee.unwrap() / LAMPORTS_PER_SOL
            );
        } else {
            //do nothing
            msg!("User fee unchanged");
        }

        Ok(())
    }

    //create a project
    pub fn create_project(
        ctx: Context<CreateProject>,
        name: String,
        fee: Option<u64>,
    ) -> Result<()> {
        //check the account for fee_wallet has system program as owner
        if ctx.accounts.fee_wallet.owner.key() != ctx.accounts.system_program.key() {
            return Err(ErrorCode::InvalidOwner.into());
        }

        //get the project account and store values
        let project = &mut ctx.accounts.project;
        project.project_auth = ctx.accounts.project_auth.key();
        project.collection_address = *ctx.accounts.collection_address.to_account_info().key;
        project.name = name;
        project.fee_wallet = *ctx.accounts.fee_wallet.to_account_info().key;
        project.fee = fee.unwrap_or(0);
        project.bump = ctx.bumps.project;
        project.badges = vec![];

        msg!("Project created");
        msg!("Project name: {}", project.name);
        msg!("Project fee: {}", project.fee);
        msg!("Project fee wallet: {}", project.fee_wallet.to_string());
        msg!(
            "Project collection address: {}",
            project.collection_address.to_string()
        );

        //transfer global fee to fee wallet
        let global_state = &mut ctx.accounts.global_state;
        let fee_recipient = &ctx.accounts.global_fee_wallet;

        //check that correct fee wallet is provided
        require_eq!(
            global_state.fee_wallet,
            *fee_recipient.to_account_info().key,
            ErrorCode::IncorrectFeeAddress
        );

        //use the transfer function
        let _ = transfer_sol(
            ctx.accounts.project_auth.to_account_info(),
            fee_recipient.to_account_info(),
            global_state.project_fee,
            ctx.accounts.system_program.to_account_info(),
            None,
        );

        Ok(())
    }
    //change project fee
    pub fn change_project_fee(ctx: Context<ChangeProjectFee>, fee: u64) -> Result<()> {
        //get access to the project account
        let project = &mut ctx.accounts.project;

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            *ctx.accounts.project_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //set the new fee
        project.fee = fee;

        msg!("Project fee changed");
        msg!("New fee: {}", project.fee);

        Ok(())
    }

    //change project fee wallet
    pub fn change_project_fee_wallet(ctx: Context<ChangeProjectFeeWallet>) -> Result<()> {
        //get access to the project account
        let project = &mut ctx.accounts.project;

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            *ctx.accounts.project_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //set the new fee wallet
        project.fee_wallet = *ctx.accounts.new_fee_wallet.to_account_info().key;

        msg!("Project fee wallet changed");
        msg!("New fee wallet: {}", project.fee_wallet.to_string());

        Ok(())
    }

    //change project name
    pub fn change_project_name(ctx: Context<ChangeProjectName>, name: String) -> Result<()> {
        //get access to the project account
        let project = &mut ctx.accounts.project;

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            *ctx.accounts.project_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //set the new name
        project.name = name;

        msg!("Project name changed");
        msg!("New name: {}", project.name);

        Ok(())
    }

    //delete project
    pub fn delete_project(ctx: Context<DeleteProject>) -> Result<()> {
        //get access to the project account
        let project = &mut ctx.accounts.project;

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            *ctx.accounts.project_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //check that all badges are cleared
        if !project.badges.is_empty() {
            return Err(ErrorCode::BadgesExist.into());
        }

        //set all state to default
        project.project_auth = Pubkey::default();
        project.collection_address = Pubkey::default();
        project.name = "".to_string();
        project.fee_wallet = Pubkey::default();
        project.fee = 0;
        project.badges = vec![];

        msg!("Project deleted");

        Ok(())
    }

    //create a badge
    pub fn create_badge<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateBadge<'info>>,
        name: String,
        metadata: String,
        image: String,
        royalty: u16,
    ) -> Result<()> {
        //get access to the project and badge accounts
        let project = &mut ctx.accounts.project;
        let badge = &mut ctx.accounts.badge;

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            *ctx.accounts.project_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //set badge values
        badge.name = name.clone();
        badge.metadata = metadata.clone();
        badge.image = image;
        badge.project = *project.to_account_info().key;
        badge.mint = *ctx.accounts.mint.to_account_info().key;
        badge.bump = ctx.bumps.badge;

        msg!("Badge information set");

        //create seeds for the badge
        let project_auth_seed = ctx.accounts.project_auth.key();
        let collection_seed = ctx.accounts.collection_address.key();

        //verify collection address matches expected
        require_eq!(
            *ctx.accounts.collection_address.to_account_info().key,
            project.collection_address,
            ErrorCode::CollectionMismatch
        );

        let signer_seeds = &[&[
            PROJECT_STATE_SEED,
            project_auth_seed.as_ref(),
            collection_seed.as_ref(),
            PROGRAM_SEED,
            bytemuck::bytes_of(&project.bump),
        ][..]];

        //get accounts for mint, metadata, token account, and master edition
        let mint = &mut ctx.accounts.mint;
        let metadata_account = &mut ctx.remaining_accounts[1].to_account_info();

        msg!("Mint account {}", mint.to_account_info().key());
        msg!(
            "Metadata account {}",
            metadata_account.to_account_info().key()
        );

        //sysvar instructions passed in using remaining accounts index 0
        let sysvar_ix = &mut ctx.remaining_accounts[0].to_account_info();
        //create the accounts
        let _ = create_sft_accounts(
            &ctx.accounts.token_metadata_program.to_account_info(),
            &mint.to_account_info(),
            &project.to_account_info(),
            &ctx.accounts.project_auth.to_account_info(),
            &ctx.accounts.project_auth.to_account_info(),
            &metadata_account.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            &sysvar_ix,
            &ctx.accounts.token_program.to_account_info(),
            name,
            metadata,
            royalty,
            signer_seeds,
        );

        project.badges.push(badge.key());

        msg!("Badge created");

        Ok(())
    }

    //delete badge
    pub fn delete_badge(ctx: Context<DeleteBadge>) -> Result<()> {
        //get access to the project and badge accounts
        let badge = &mut ctx.accounts.badge;
        let project = &mut ctx.accounts.project;

        //check that the badge is owned by the project
        require_eq!(
            badge.project,
            *project.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //check that the authority is the expected authority
        require_eq!(
            project.project_auth,
            ctx.accounts.project_auth.key(),
            ErrorCode::AuthorityMismatch
        );

        //find the correct badge and remove it from the project
        let index = project
            .badges
            .iter()
            .position(|x| *x == *badge.to_account_info().key);
        project.badges.remove(index.unwrap());

        //reset all badge values to default
        badge.name = "".to_string();
        badge.metadata = "".to_string();
        badge.image = "".to_string();
        badge.project = Pubkey::default();
        badge.mint = Pubkey::default();
        badge.bump = 0;

        msg!("Badge deleted");

        Ok(())
    }

    //create user account
    pub fn create_user_account(
        ctx: Context<CreateUserAccount>,
        db_id: Option<String>,
    ) -> Result<()> {
        //get access to the user account and project accounts
        let user_account = &mut ctx.accounts.user_account;
        let project = &ctx.accounts.project;

        //decision was made to make the project authority the payer and signer for the open account instruction
        //this was purposeful to allow for account abstraction for non-solana users
        //badges will operate on solana with accounts being managed by the project themselves for non-wallet users
        //this also allows accounts to be created retroactively for current users and does not force a transaction signature or the user to pay to open the account
        //if you wish to deploy this yourself and be fully managed on chain, change instruction.rs to use the user_auth as the payer and signer
        //and remove the project auth from signing.
        require_eq!(
            project.project_auth,
            ctx.accounts.project_auth.key(),
            ErrorCode::AuthorityMismatch
        );

        //check that provided user_auth is a system program owned account
        if ctx.accounts.user_auth.owner.key() != ctx.accounts.system_program.key() {
            return Err(ErrorCode::InvalidOwner.into());
        }

        //set user account values
        user_account.user_auth = ctx.accounts.user_auth.key();
        user_account.bump = ctx.bumps.user_account;
        user_account.badges = vec![];
        user_account.escrows = vec![];
        user_account.bumps = vec![];
        user_account.initializer = ctx.accounts.user_auth.key();

        //optional field for a unique identifier for this user for account abstraction management
        if let Some(db_id) = db_id {
            user_account.db_id = Some(db_id);
        } else {
            user_account.db_id = None;
        }

        msg!("User account created");

        Ok(())
    }

    //change user auth
    pub fn change_user_auth(ctx: Context<ChangeUserAuth>) -> Result<()> {
        //get access to the user account
        let user_account = &mut ctx.accounts.user_account;

        //this check is very important as it ensures that the signer is the current authority of the user account
        //the user is the signer for this instruction
        require_eq!(
            user_account.user_auth,
            *ctx.accounts.current_user_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //change the user auth to provided pubkey.
        user_account.user_auth = *ctx.accounts.new_user_auth.to_account_info().key;

        msg!("User auth changed");

        Ok(())
    }

    //delete user account
    pub fn delete_user_account(ctx: Context<DeleteUserAccount>) -> Result<()> {
        //get access to the user account and project accounts
        let user_account = &mut ctx.accounts.user_account;

        //important check to make sure that the signer (user_auth) matches the current entry on the account
        require_eq!(
            user_account.user_auth,
            *ctx.accounts.user_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        //reset all user account values to default
        user_account.user_auth = Pubkey::default();
        user_account.bump = 0;
        user_account.badges = vec![];
        user_account.escrows = vec![];
        user_account.bumps = vec![];
        user_account.db_id = None;
        user_account.initializer = Pubkey::default();

        msg!("User account deleted");

        Ok(())
    }

    //add badge to user account
    pub fn add_badge_to_user<'info>(
        ctx: Context<'_, '_, '_, 'info, AddBadgeToUser<'info>>,
    ) -> Result<()> {
        //get access to the user account and project accounts
        let user_account = &mut ctx.accounts.user_account;
        let project = &ctx.accounts.project;

        //check that the authority is the expected authority
        //project_auth must be the signer to give the badge to a user
        require_eq!(
            project.project_auth,
            ctx.accounts.project_auth.key(),
            ErrorCode::AuthorityMismatch
        );

        //check that the correct user pubkey is being used
        require_eq!(
            user_account.user_auth,
            ctx.accounts.user_auth.key(),
            ErrorCode::AuthorityMismatch
        );

        msg!("Auth verified");

        msg!("Badge escrow account created");

        //create seeds for the badge

        let project_auth_seed = ctx.accounts.project_auth.key();
        let collection_seed = ctx.accounts.collection_address.key();

        //verfiy collection address matches expected
        require_eq!(
            *ctx.accounts.collection_address.to_account_info().key,
            project.collection_address,
            ErrorCode::CollectionMismatch
        );

        let signer_seeds = &[&[
            PROJECT_STATE_SEED,
            project_auth_seed.as_ref(),
            collection_seed.as_ref(),
            PROGRAM_SEED,
            bytemuck::bytes_of(&project.bump),
        ][..]];

        //mint the badge into a user's escrow account
        let _ = mint_sft(
            &ctx.remaining_accounts[2].to_account_info(), //token metadata program
            &ctx.accounts.escrow.to_account_info(),
            &user_account.to_account_info(),
            &ctx.remaining_accounts[3].to_account_info(), //metadata account
            &ctx.accounts.mint.to_account_info(),
            &ctx.accounts.project_auth.to_account_info(),
            &project.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            &ctx.remaining_accounts[0].to_account_info(), //sysvar instruction
            &ctx.accounts.token_program.to_account_info(), //token program
            &ctx.remaining_accounts[1].to_account_info(), //associated token program
            1,
            signer_seeds,
        );

        msg!("Badge minted");

        //add the badge, user and bump to the user account
        user_account.badges.push(ctx.accounts.badge.key());
        user_account.escrows.push(ctx.accounts.escrow.key());
        user_account.bumps.push(ctx.bumps.escrow);

        msg!("Badge added to user account");

        Ok(())
    }

    //withdraw badge from user account
    pub fn withdraw_badge(ctx: Context<WithdrawBadge>, _badge_index: u8) -> Result<()> {
        //get access to the user account and project accounts
        let user_account = &mut ctx.accounts.user_account;

        //check that the authority is the expected authority
        //the user will be the signer
        require_eq!(
            user_account.user_auth,
            *ctx.accounts.user_auth.to_account_info().key,
            ErrorCode::AuthorityMismatch
        );

        msg!("Auth verified");

        //check that badge exists in user account
        let is_user_badge = user_account.badges.contains(&ctx.accounts.badge.key());

        if !is_user_badge {
            return Err(ErrorCode::BadgeDoesNotExist.into());
        }

        //get the user account seeds an
        let project_seed = ctx.accounts.project.key();
        let project_auth_seed = ctx.accounts.project_auth.key();
        let initializer_seed = ctx.accounts.initializer.key();

        //verify project matches expected
        require_eq!(
            *ctx.accounts.project.to_account_info().key,
            ctx.accounts.badge.project.key(),
            ErrorCode::UnexpectedPublicKey
        );

        //verify initializer matches expected
        require_eq!(
            *ctx.accounts.initializer.to_account_info().key,
            user_account.initializer,
            ErrorCode::UnexpectedPublicKey
        );

        let transfer_seeds = &[&[
            USER_STATE_SEED,
            project_auth_seed.as_ref(),
            project_seed.as_ref(),
            initializer_seed.as_ref(),
            PROGRAM_SEED,
            bytemuck::bytes_of(&user_account.bump),
        ][..]];

        //transfer the badge from the user escrow to user token account
        let _ = transfer_token(
            ctx.accounts.escrow.to_account_info(),
            ctx.accounts.user_token_account.to_account_info(),
            user_account.to_account_info(),
            1,
            ctx.accounts.token_program.to_account_info(),
            Some(transfer_seeds),
        );

        msg!("Badge withdrawn");

        Ok(())
    }
}
