use anchor_lang::prelude::*;
use anchor_spl::token::{CloseAccount, Transfer};

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
pub fn transfer_sol_pda<'info>(
    from_account: &AccountInfo,
    to_account: &AccountInfo,
    amount_of_lamports: u64,
) -> Result<()> {
    // Debit from_account and credit to_account
    **from_account.try_borrow_mut_lamports()? -= amount_of_lamports;
    **to_account.try_borrow_mut_lamports()? += amount_of_lamports;
    Ok(())
}

pub fn close_all_accounts<'info>(
    account_to_close: AccountInfo<'info>,
    user: AccountInfo<'info>,
    state_account: AccountInfo<'info>,
    seed: &[&[&[u8]]],
    token_program: AccountInfo<'info>,
) -> Result<()> {
    let close_associate_account = CloseAccount {
        account: account_to_close.to_account_info(),
        destination: user.to_account_info(),
        authority: state_account.to_account_info(),
    };
    let cpi_close_associate_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        close_associate_account,
        seed,
    );
    anchor_spl::token::close_account(cpi_close_associate_ctx)?;

    Ok(())
}
