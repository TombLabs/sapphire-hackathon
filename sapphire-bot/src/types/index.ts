import { ObjectId } from "mongodb";


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
  userId: ObjectId;
  email: string;
  name: string;
  username: string;
  image: string;
  role: string;
  sapphires: number;
  createdAt: number;
  wallets: string[];
  purchases: Purchase[];
  generations: AIGeneration[];
  likedGenerations?: string[];
  emailVerified: boolean | null;
};

export type Account = {
  userId: ObjectId;
  provider: string;
  providerAccountId: string;
};

export type Wallet = {
  address: string;
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
};
export type PublicGeneration = {
  _id: ObjectId;
  name?: string;
  src: string;
  height: number;
  width: number;
  prompt: string;
  img2Img: boolean;
  referenceImage?: string;
  promptAssist: boolean;
  sapphireCost: number;
  isPublic: boolean;
  likes: number;
  createdAt: number;
  aiEngine: AiEngine;
  userId: ObjectId;
  creatorWallet: string;
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

export type AiEngine = "dalle" | "deep" | "leonardo" | "stability" | "img2img";

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
  modelId: "Creative" | "Select" | "Signature";
  isNegativePrompt: boolean;
  negativePrompt?: string;
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
}