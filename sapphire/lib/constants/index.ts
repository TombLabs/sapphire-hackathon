import { PricingPackagesTypes } from "@/types";
import { Connection, PublicKey } from "@solana/web3.js";

export const connection = new Connection(process.env.NEXT_PUBLIC_RPC as string, "confirmed");
export const paymentWallet = new PublicKey("TLHEWgEvwMs9sHjwSxy78VR7cqZyJkUTECRW2SejnpP");
export const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const paymentWalletUSDC = new PublicKey("3w69JsajsvaRFNek8MMhvVmgULeFiSTzEnDBHDzYkmnv");
export const merkleTree = new PublicKey("E2JV9eavBQAPU9iy6v7sHXHSDJho8edVg4bwVEipCwps");
export const sapphireCollectionMint = new PublicKey("Eyoug6ZZEoi9LVacXyYFzw8KMccQeL6xxwWftih9Dr6x");
export const sapphirePublicKey = new PublicKey("SappRZt5Lpo9c33cZGj5B9u7H7D3p7zkYbDKfXTPmFo");
export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
export const wSolAddress = "So11111111111111111111111111111111111111112"
export const dogWifHat = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"
export const gecko = "6CNHDCzD5RkvBWxxyokQQNQPjFWgoHF94D7BmC73X6ZK"
export const bonk = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
export const shdw = "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"
export const auctionProgramId = new PublicKey("SAPPozsZ9dApKRx4n4aMipFZ4pvH2QY9JmfLbks1UXo")
export const AUTH_PUBKEY_SEED = "AUTH5Vj5doLVE5VCgin3U459Csofdo6o6x1aGGzCpHcM"
export const auctionAuthPubkey = new PublicKey("AUTH5Vj5doLVE5VCgin3U459Csofdo6o6x1aGGzCpHcM");
export const SAPPHIRE_AUCTIONS_SEED = "global_state_sapphire_auctions"
export const AUCTION_STATE_SEED = "auction_state_sapphire_auctions"
export const AUCTION_ESCROW_SEED = "auction_escrow_sapphire_auctions"
export const PROGRAM_SEED = "sapphire_auctions"
export const FEE_WALLET = new PublicKey("TLHEWgEvwMs9sHjwSxy78VR7cqZyJkUTECRW2SejnpP")
export const privateMerkleTree = new PublicKey("HmsKUv4btineJHnaEn92Po9mRdmrprW8CwwXVDVVtUdM");

export const PricingPackages: PricingPackagesTypes[] = [
  {
    id: "shimmer",
    name: "Sapphire Shimmer",
    description: "Your entry to the world of AI creativity",
    priceUsd: 7,
    credits: 1000,
    freeCredits: 0,
    totalCredits: 1000,
    recommend: false,
  },
  {
    id: "radiance",
    name: "Sapphire Radiance",
    description: "Illuminate your creativity and art with more Sapphires",
    priceUsd: 14,
    credits: 2000,
    freeCredits: 200,
    totalCredits: 2200,
    recommend: false,
  },
  {
    id: "luminary",
    name: "Sapphire Luminary",
    description: "Unlock brilliance and Mastery with our advanced sapphire package.",
    priceUsd: 20,
    credits: 3000,
    freeCredits: 500,
    totalCredits: 3500,
    recommend: true,
  },
  {
    id: "celestial",
    name: "Sapphire Celestial",
    description:
      "Reach for the stars and show your prowess with our best offer on top tier sapphires",
    priceUsd: 25,
    credits: 4000,
    freeCredits: 1000,
    totalCredits: 5000,
    recommend: false,
  },
];