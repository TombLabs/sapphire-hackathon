import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Transaction, TransactionInstruction } from "@solana/web3.js";
import { default as base58, default as bs58 } from "bs58";
import nacl from "tweetnacl";
import { MEMO_PROGRAM_ID } from "../constants";

type SignInWalletConstructor = {
  domain: string;
  publicKey: string;
  type: string;
};

export class SignInWallet {
  domain: any;
  publicKey: any;
  type: any;

  constructor({ domain, publicKey, type }: SignInWalletConstructor) {
    this.domain = domain;
    this.publicKey = publicKey;
    this.type = type;
  }

  prepare() {
    return `Sapphire

Wallet: ${this.publicKey}
    
Sign/Approve this message to verify that that you own this wallet!

This will not cost any gas fee or send anything from your wallet.`;
  }

  async validate(signature: string) {
    const type = this.type;
    const msg = this.prepare();

    if (type == "message") {
      const msgUint8 = new TextEncoder().encode(msg);
      const signatureUint8 = bs58.decode(signature);
      const pubKeyUint8 = bs58.decode(this.publicKey);

      return nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
    }

    if (type == "transaction") {
      const recoveredTransaction = Transaction.from(Buffer.from(signature, "base64"));
      if (!recoveredTransaction.verifySignatures()) return false;

      const instruction = recoveredTransaction.instructions.find(
        (instruction) =>
          instruction.programId.toString() == "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
      );
      if (!instruction) return false;
      if (instruction.data.toString() != msg) return false;
      if (!instruction.programId.equals(MEMO_PROGRAM_ID)) return false;

      return true;
    }
    return false;
  }

  async signIn(wallet: WalletContextState) {
    let signature;
    if (this.type == "message") {
      // signature = await signMessage(wallet, this.prepare());
      const data = new TextEncoder().encode(this.prepare());
      // @ts-ignore
      const signedMessage = await wallet.signMessage(data);
      signature = base58.encode(signedMessage);
    } else if (this.type == "transaction") {
      // signature = await signMemo(wallet, this.prepare());
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC as string);
      const tx = new Transaction();
      tx.add(
        new TransactionInstruction({
          programId: MEMO_PROGRAM_ID,
          keys: [],
          data: Buffer.from(this.prepare(), "utf-8"),
        })
      );
      tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
      tx.feePayer = wallet.publicKey!;

      // @ts-ignore
      const signedTx = await wallet.signTransaction(tx);
      signature = signedTx.serialize().toString("base64");
    }
    return signature;
  }
}
