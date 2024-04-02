
import * as splToken from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { connection, paymentWallet, wSolAddress } from "../constants";

export async function getSwapQuoteSol(inputMint: string, amount: number) {
    const url = "https://quote-api.jup.ag/v6/quote"
    const { data } = await axios.get(url, {
        params: {
            inputMint: inputMint,
            outputMint: wSolAddress,
            amount: amount,
        }
    })
    return data
}

export async function calculateSapphires(solAmount: number) {
    const { data: solPriceReq } = await axios.get(
        "https://price.jup.ag/v4/price?ids=SOL"
    );
    const pricePerSapphire = 0.01;

    const solPrice = solPriceReq.data.SOL.price;
    const usdAmount = solAmount * solPrice;
    const sapphireAmount = usdAmount / pricePerSapphire;
    return sapphireAmount
}

export async function buildSwapTx(wallet: AnchorWallet, mint: string, amount: number) {
    const quote = await axios.get("https://quote-api.jup.ag/v6/quote", {
        params: {
            inputMint: mint,
            outputMint: wSolAddress,
            amount: amount,
        }
    })
    const quoteResponse = quote.data;

    const swap = await axios.post("https://quote-api.jup.ag/v6/swap",
        JSON.stringify({
            quoteResponse: quoteResponse,
            userPublicKey: wallet.publicKey?.toBase58(),
        }), {
        headers: {
            "Content-Type": "application/json",
        }
    })

    const bufferTx = Buffer.from(swap.data.swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(bufferTx)
    return transaction
}

export async function buildTokenTransferTx(wallet: AnchorWallet, mint: string, amount: number, decimals: number) {
    const mintPubkey = new PublicKey(mint)
    const senderTokenAccountInfo = await connection.getTokenAccountsByOwner(wallet.publicKey!, { mint: mintPubkey })
    const senderTokenAccount = senderTokenAccountInfo.value[0].pubkey

    const recipientTokenAccountInfo = await connection.getTokenAccountsByOwner(paymentWallet, { mint: mintPubkey })


    if (recipientTokenAccountInfo.value.length > 0) {
        const tx = new Transaction().add(splToken.createTransferCheckedInstruction(
            senderTokenAccount,
            mintPubkey,
            recipientTokenAccountInfo.value[0].pubkey,
            wallet.publicKey!,
            amount * 10 ** decimals,
            decimals,
            [],
            splToken.TOKEN_PROGRAM_ID
        ))
        return tx
    } else {
        const recipientTokenAccount = splToken.getAssociatedTokenAddressSync(mintPubkey, paymentWallet)
        const ix = [
            splToken.createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                recipientTokenAccount,
                paymentWallet,
                mintPubkey,
                splToken.TOKEN_PROGRAM_ID,
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID
            ),
            splToken.createTransferCheckedInstruction(
                senderTokenAccount,
                mintPubkey,
                recipientTokenAccount,
                wallet.publicKey!,
                amount * 10 ** decimals,
                decimals,
                [],
                splToken.TOKEN_PROGRAM_ID
            )
        ]
        const tx = new Transaction().add(...ix)
        return tx
    }
}

