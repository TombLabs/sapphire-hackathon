use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::Metadata,
    token::{Mint, Token, TokenAccount},
};


use crate::constants::*;
use crate::state::{GlobalState,Project, Badge, UserAccount};

#[derive(Accounts)]
#[instruction(project_fee: u64, user_fee: u64)]
pub struct InitGlobalState<'info> {
    #[account(
        init, 
        payer = authority, 
        space = GlobalState::LEN,
        seeds = [
            GLOBAL_STATE_SEED,
            authority.key().as_ref(),
            PROGRAM_SEED
        ],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK
    pub fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

//change global fee wallet
#[derive(Accounts)]
pub struct ChangeGlobalFeeWallet<'info> {
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK this is safe because we are not reading or writing to this account
    pub new_fee_wallet: AccountInfo<'info>,
}

//change global fee
#[derive(Accounts)]
#[instruction(project_fee: Option<u64>, user_fee: Option<u64>)]
pub struct ChangeGlobalFee<'info> {
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
}


//Create a project
#[derive(Accounts)]
#[instruction(name: String, fee: Option<u64>)]
pub struct CreateProject<'info> {
    #[account(
        init, 
        payer = project_auth, 
        space = Project::LEN,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump
    )]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub project_auth: Signer<'info>,
    pub collection_address: Account<'info, Mint>,
    #[account(mut)]
    ///CHECK Will perform our own check
    pub fee_wallet: AccountInfo<'info>,
    pub global_state: Account<'info, GlobalState>,
    ///CHECK Will perform our own check
    #[account(mut)]
    pub global_fee_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

//change project fee
#[derive(Accounts)]
#[instruction(fee: u64)]
pub struct ChangeProjectFee<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub project_auth: Signer<'info>,
}

//change project fee wallet
#[derive(Accounts)]
pub struct ChangeProjectFeeWallet<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    pub project_auth: Signer<'info>,
    ///CHECK will perform our own check
    #[account(mut)]
    pub new_fee_wallet: AccountInfo<'info>,
}

//change project name
#[derive(Accounts)]
#[instruction(name: String)]
pub struct ChangeProjectName<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    pub project_auth: Signer<'info>,
}

//delete project
#[derive(Accounts)]
pub struct DeleteProject<'info> {
    #[account(mut,
    close = project_auth,
    seeds = [
        PROJECT_STATE_SEED,
        project_auth.key().as_ref(),
        collection_address.key().as_ref(),
        PROGRAM_SEED
    ],
    bump = project.bump)]
    pub project: Account<'info, Project>,
    pub project_auth: Signer<'info>,
    pub collection_address: Account<'info, Mint>,

}

//create a badge
#[derive(Accounts)]
#[instruction(name: String, metadata: String, image: String, royalty: u16)]
pub struct CreateBadge<'info> {
    #[account(
        init, 
        payer = project_auth, 
        space = Badge::LEN,
        seeds = [
            project.key().as_ref(),
            mint.key().as_ref(),
            PROGRAM_SEED
        ],
        bump,
    )]
    pub badge: Account<'info, Badge>,
    #[account(mut)]
    pub project_auth: Signer<'info>,
    pub collection_address: Account<'info, Mint>,
    #[account(init,
        payer = project_auth,
         mint::decimals = 0,
         mint::authority = project,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

//delete badge
#[derive(Accounts)]
pub struct DeleteBadge<'info> {
    #[account(mut,
    close = project_auth,
    seeds = [
        project.key().as_ref(),
        mint.key().as_ref(),
        PROGRAM_SEED
    ],
    bump = badge.bump,
    )]
    pub badge: Account<'info, Badge>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,
    pub mint: Account<'info, Mint>,
    pub collection_address: Account<'info, Mint>,
    #[account(mut)]
    pub project_auth: Signer<'info>,
}

//create user account
#[derive(Accounts)]
#[instruction(db_id: Option<String>)]
pub struct CreateUserAccount<'info> {
    #[account(
        init, 
        payer = project_auth,
        space = UserAccount::LEN,
        seeds = [
            USER_STATE_SEED,
            project_auth.key().as_ref(),
            project.key().as_ref(),
            initializer.key().as_ref(),
            PROGRAM_SEED
        ],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub user_auth: AccountInfo<'info>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub initializer: AccountInfo<'info>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,
    pub collection_address: Account<'info, Mint>,
    #[account(mut)]
    pub project_auth: Signer<'info>,    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

//change user auth
#[derive(Accounts)]
pub struct ChangeUserAuth<'info> {
    #[account(
       mut, 
        seeds = [
            USER_STATE_SEED,
            project_auth.key().as_ref(),
            project.key().as_ref(),
            initializer.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = user_account.bump,
    )]
    pub user_account: Account<'info, UserAccount>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub initializer: AccountInfo<'info>,
    #[account(mut)]
    pub current_user_auth: Signer<'info>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub new_user_auth: AccountInfo<'info>,
    pub collection_address: Account<'info, Mint>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub project_auth: AccountInfo<'info>,    
}

//delete user account
#[derive(Accounts)]
pub struct DeleteUserAccount<'info> {
    #[account(mut,
    close = project_auth,
    seeds = [
        USER_STATE_SEED,
       project_auth.key().as_ref(),
        project.key().as_ref(),
        initializer.key().as_ref(),
        PROGRAM_SEED
    ],
    bump = user_account.bump,
    )]
    pub user_account: Account<'info, UserAccount>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub initializer: AccountInfo<'info>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = project.bump,
    )]
    pub project: Account<'info, Project>,
    pub collection_address: Account<'info, Mint>,
   ///CHECK this is safe because we are not reading or writing to this account
   #[account(mut)]
    pub project_auth: AccountInfo<'info>,
    #[account(mut)]
    pub user_auth: Signer<'info>,
}
//add badge to user account
#[derive(Accounts)]
pub struct AddBadgeToUser<'info> {
    #[account(
        mut, 
         seeds = [
             USER_STATE_SEED,
             project_auth.key().as_ref(),
             project.key().as_ref(),
             initializer.key().as_ref(),
             PROGRAM_SEED
         ],
         bump = user_account.bump,
     )]
     pub user_account: Account<'info, UserAccount>,
     ///CHECK this is safe because we are not reading or writing to this account
     pub initializer: AccountInfo<'info>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub user_auth: AccountInfo<'info>,
    #[account(
        seeds = [
            project.key().as_ref(),
            mint.key().as_ref(),
            PROGRAM_SEED
        ],
    bump = badge.bump
    )]
    pub badge: Account<'info, Badge>,
    #[account(mut,
    seeds = [
        PROJECT_STATE_SEED,
        project_auth.key().as_ref(),
        collection_address.key().as_ref(),
        PROGRAM_SEED
    ], bump = project.bump)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub project_auth: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(init,
        payer = project_auth,
        seeds = [
           initializer.key().as_ref(),
            mint.key().as_ref(),
            PROGRAM_SEED
        ],
        bump,
        token::mint = mint,
        token::authority = user_account,
    )]
    pub escrow: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub collection_address: Account<'info, Mint>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

//withdraw badge from user account
#[derive(Accounts)]
#[instruction(bump_index: u8)]
pub struct WithdrawBadge<'info> {
    #[account(
        mut, 
         seeds = [
             USER_STATE_SEED,
             project_auth.key().as_ref(),
             project.key().as_ref(),
             initializer.key().as_ref(),
             PROGRAM_SEED
         ],
         bump = user_account.bump,
     )]
     pub user_account: Account<'info, UserAccount>,
     ///CHECK this is safe because we are not reading or writing to this account
     pub initializer: AccountInfo<'info>,
    #[account(mut)]
    pub user_auth: Signer<'info>,
    #[account(
        seeds = [
            project.key().as_ref(),
            mint.key().as_ref(),
            PROGRAM_SEED
        ],
    bump = badge.bump
    )]
    pub badge: Account<'info, Badge>,
    #[account(mut,
        seeds = [
            PROJECT_STATE_SEED,
            project_auth.key().as_ref(),
            collection_address.key().as_ref(),
            PROGRAM_SEED
        ], bump = project.bump)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut,
        seeds = [
            user_auth.key().as_ref(),
            mint.key().as_ref(),
            PROGRAM_SEED
        ],
        bump = user_account.bumps[bump_index as usize],)]
    pub escrow: Account<'info, TokenAccount>,
    pub collection_address: Account<'info, Mint>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    ///CHECK this is safe because we are not reading or writing to this account
    pub project_auth: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

