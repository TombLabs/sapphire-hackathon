import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from "@solana/web3.js";
import { ObjectId } from "mongodb";
import { NextPage } from "next";
import { AppProps } from "next/app";


// _app
export type MyAppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// layout config
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type PricingPackagesTypes = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  credits: number;
  freeCredits: number;
  totalCredits: number;
  recommend: boolean;
};

export type SapphireUser = {
  id: String;
  email: string;
  name: string;
  image: string;
  role: string;
  sapphires: number;
  createdAt: number;
  updatedAt: number;
  purchases: Purchase[];
  generations: AIGeneration[];
  likedGenerations?: string[];
  wallets: string[];
  emailVerified: boolean | null;
};

export type Account = {
  userId: ObjectId;
  provider: string;
  providerAccountId: string;
};
export type SapphireMintedNft = {
  nftMint: string;
  wallet: string;
  image_reference: string;
  type: string;
  user?: string;
}
export type Wallet = {
  address: string;
  userId?: string;
};

export type Purchase = {
  userId: string;
  package: PurchasePackage;
  createdAt: number;
  transaction: string;
  paymentToken: string;
};

export type PurchasePackage = {
  name: string;
  id: SapphirePackageId;
  priceUsd: number;
  sapphires: number;
  description: string;
};

export type AIGeneration = {
  name?: string;
  image: string;
  prompt: string;
  img2Img: boolean;
  referenceImage?: string;
  promptAssist: boolean;
  sapphireCost: number;
  isPublic: boolean;
  likes: number;
  createdAt: number;
  aiEngine: AiEngine;
  isMintable: boolean;
  id: string;
};
export type PublicGeneration = {
  id: string;
  name?: string | null;
  src: string;
  height: number;
  width: number;
  prompt: string;
  img2Img: boolean;
  referenceImage?: string | null;
  promptAssist: boolean;
  sapphireCost: number;
  isPublic: boolean;
  likesRecieved: Like[];
  createdAt: number;
  aiEngine: AiEngine;
  userId: string;
  creatorWallet: string;
  isMintable: boolean;
};

export type CollectionPerk = {
  name: string;
  mint: string;
  numOfSapphiresPerClaim: number;
  numOfClaims: number;
  claims: {
    claimMint: string;
    claimerWallet: string;
    claimerUserId: string;
  };
};

export type SplToken = {
  name: string;
  image: string;
  symbol: string;
  decimals: number;
  address: string;
  purchasePlan: PurchasePackage;
};

export type AiEngine = "dalle-3" | "deep" | "leonardo" | "stability" | "img2img";

export type MongoUpdateReturn = {
  isError: boolean;
  error?: string;
  data?: any;
};

export type GenerationReturn = {
  isError: boolean;
  error?: string;
  data?: string;
};

export type LeonardoOpts = {
  guidanceScale: number;
  inferenceSteps: number;
  negativePrompt: string;
  alchemy: boolean;
  photoReal: boolean;
  modelId: string | null;
};
export type StabilityOpts = {
  initImageStrength: number;
  initImage: string;
  steps: number;
  cfg: number;
};

export type LeonardoRequest = {
  prompt: string;
  isPublic: boolean;
  promptAssist: boolean;
  cost: number;
  leonardoOptions: LeonardoOpts;
};

export type DeepAiRequest = {
  prompt: string;
  userId: ObjectId;
  isPublic: boolean;
  promptAssist: boolean;
};

export type DalleRequest = {
  prompt: string;
  isPublic: boolean;
  promptAssist: boolean;
};

export type StabilityRequest = {
  prompt: string;
  isPublic: boolean;
  promptAssist: boolean;

  stabilityOptions: StabilityOpts;
};

export type PaymentOpts = "sol" | "usdc";

export type SapphirePackage = {
  id: SapphirePackageId;
  name: string;
  priceUsd: number;
  sapphires: number;
  description: string;
  freeCredits: number;
  total: number;
};

export type SapphirePackageId = "shimmer" | "radiance" | "luminary" | "celestial";

export type NftCreateData = {
  name: string;
  image: string;
  description: string;
  symbol: string;
  sellerFeeBasisPoints: number;
  isMutable?: boolean;
  collection?: string;
};

export type Enhancement = {
  label: string;
  value: string;
  description: string;
};

export type NFT = {
  mint: string;
  name: string;
  uri: string;
  image: string;
};

export type LeonardoModelType = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type VoucherType = {
  id: ObjectId;
  code: string;
  sapphires: number;
  supply: number;
  claimedBy: ObjectId[];
  expiry: number;
};

export type AuctionBumps = {
  auctionStateBump: number;
  nftEscrowBump: number;
}

export type HighestBid = {
  bidder: PublicKey | string;
  amount: number;
  bidderTokenAccount: PublicKey | string;
}

export type AuctionData = {
  account: {
    publicKey: PublicKey | string;
    creator: PublicKey | string;
    nftEscrow: PublicKey | string;
    bumps: AuctionBumps;
    nftMint: PublicKey | string;
    creatorTokenAccount: PublicKey | string;
    startPrice: number;
    minBid: number;
    endTime: number;
    winner: PublicKey | string;
    highestBid: HighestBid;
    previousHighBid: HighestBid;
  };
  nftData: {
    image: string,
    name: string,
    sellerFeeBasisPoints: number,
    uri: string,
    symbol: string,
  }
  userInfo: {
    user: ObjectId;
    name: string;
    image: string;
  }
}
export type UpdatesType = {
  timestamp: number;
  whatsNew: string[];
  comingSoon: string[];
  issuesFixed: string[];
}

export type BurnableNfts = {
  mint: string;
  name: string;
  uri: string;
  image: string;
  type: "standard" | "pnft"
  collection?: string;
}

export type SwappableTokens = {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  tokenAccount: string;
  balance: number;
  decimals: number;
}
export type SapphireTransactionType = "burn nft" | "swap tokens" | "mint public" | "purchase sapphires" | "mint private pnft" | "mint private cnft" | "mint private standard"

export type MemoTransactionData = {
  sapphirePackage?: SapphirePackageId
  type: SapphireTransactionType;
}

export type Like = {
  id: string,
  likerId: string,
  generationId: string,
}