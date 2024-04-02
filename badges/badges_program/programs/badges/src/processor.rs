use anchor_lang::prelude::*;
use anchor_spl::token::Transfer;
use mpl_token_metadata::{
    instructions::{CreateV1CpiBuilder, MintV1CpiBuilder},
    types::{PrintSupply, TokenStandard},
};

pub fn create_sft_accounts<'info>(
    token_metadata_program: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    auth: &AccountInfo<'info>,
    update_auth: &AccountInfo<'info>,
    payer: &AccountInfo<'info>,
    metadata: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    sysvar_ix: &AccountInfo<'info>,
    spl_token_program: &AccountInfo<'info>,
    name: String,
    uri: String,
    royalty: u16,
    signers_seeds: &[&[&[u8]]],
) -> Result<()> {
    let mut binding = CreateV1CpiBuilder::new(token_metadata_program);
    let create_cpi = binding
        .metadata(metadata)
        .mint(mint, true)
        .authority(auth)
        .payer(payer)
        .update_authority(update_auth, false)
        .system_program(system_program)
        .sysvar_instructions(sysvar_ix)
        .spl_token_program(Some(spl_token_program))
        .token_standard(TokenStandard::FungibleAsset)
        .name(name)
        .uri(uri)
        .seller_fee_basis_points(royalty)
        .print_supply(PrintSupply::Unlimited);

    let _ = create_cpi.invoke_signed(signers_seeds);

    Ok(())
}

pub fn mint_sft<'info>(
    token_metadata_program: &AccountInfo<'info>,
    token: &AccountInfo<'info>,
    token_owner: &AccountInfo<'info>,
    metadata: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    payer: &AccountInfo<'info>,
    auth: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    sysvar_ix: &AccountInfo<'info>,
    spl_token_program: &AccountInfo<'info>,
    spl_ata_program: &AccountInfo<'info>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let mut binding = MintV1CpiBuilder::new(token_metadata_program);
    let mint_cpi = binding
        .token(token)
        .token_owner(Some(token_owner))
        .metadata(metadata)
        .mint(mint)
        .authority(auth)
        .payer(payer)
        .authority(auth)
        .system_program(system_program)
        .sysvar_instructions(sysvar_ix)
        .spl_token_program(spl_token_program)
        .spl_ata_program(spl_ata_program)
        .amount(amount);

    let _ = mint_cpi.invoke_signed(signer_seeds);

    Ok(())
}

pub fn transfer_token<'info>(
    sender: AccountInfo<'info>,
    receiver: AccountInfo<'info>,
    user: AccountInfo<'info>,
    amount: u64,
    token_program: AccountInfo<'info>,
    seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let transfer_instruction_account = Transfer {
        from: sender.to_account_info(),
        to: receiver.to_account_info(),
        authority: user.to_account_info(),
    };
    let cpi_ctx;
    match seeds {
        Some(seeds) => {
            cpi_ctx = CpiContext::new_with_signer(
                token_program.to_account_info(),
                transfer_instruction_account,
                seeds,
            );
        }
        None => {
            cpi_ctx = CpiContext::new(
                token_program.to_account_info(),
                transfer_instruction_account,
            );
        }
    }
    anchor_spl::token::transfer(cpi_ctx, amount)?;
    Ok(())
}

pub fn transfer_sol<'info>(
    sender: AccountInfo<'info>,
    receiver: AccountInfo<'info>,
    amount: u64,
    system_program: AccountInfo<'info>,
    seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let transfer_sol_instruction = anchor_lang::system_program::Transfer {
        from: sender.to_account_info(),
        to: receiver.to_account_info(),
    };
    match seeds {
        Some(seeds) => {
            let cpi_ctx_sol = CpiContext::new_with_signer(
                system_program.to_account_info(),
                transfer_sol_instruction,
                seeds,
            );
            anchor_lang::system_program::transfer(cpi_ctx_sol, amount)?;
        }
        None => {
            let cpi_ctx_sol =
                CpiContext::new(system_program.to_account_info(), transfer_sol_instruction);
            anchor_lang::system_program::transfer(cpi_ctx_sol, amount)?;
        }
    }
    return Ok(());
}
