import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { SapphireUser } from "../types/index";
require("dotenv").config();

const db = mongoose.createConnection(process.env.MONGO_URI! + "/" + process.env.MONGO_DATABASE_NAME!);

const userSchema = new mongoose.Schema<SapphireUser>({
  email: String,
  name: String,
  username: String,
  image: String,
  role: String,
  sapphires: Number,
  createdAt: Number,
  wallets: Array<String>,
  purchases: [
    {
      userId: String,
      package: {
        name: String,
        priceUsd: Number,
        sapphires: Number,
        description: String,
        id: String,
      },
      createdAt: Number,
      transaction: String,
      paymentToken: String,
    },
  ],
  generations: [
    {
      name: String,
      description: String,
      image: String,
      prompt: String,
      img2Img: Boolean,
      refereceImage: String,
      promptAssist: Boolean,
      sapphireCost: Number,
      isPublic: Boolean,
      likes: Number,
      createdAt: Number,
      aiEngine: String,
    },
  ],
  likedGenerations: [String],
});
const User = db.model<SapphireUser>("users", userSchema);

const publicGenerationSchema = new mongoose.Schema({
  name: String,
  description: String,
  src: String,
  height: Number,
  width: Number,
  prompt: String,
  img2Img: Boolean,
  refereceImage: String,
  promptAssist: Boolean,
  sapphireCost: Number,
  likes: Number,
  createdAt: Number,
  aiEngine: String,
  userId: String,
  vreatorWallet: String,
});
const PublicGeneration = db.model("publicGenerations", publicGenerationSchema);

const accounts = new mongoose.Schema({
  userId: ObjectId,
  provider: String,
  providerAccountId: String,
  type: String,
  access_token: String,
  expires_at: String,
  scope: String,
  token_type: String,
  id_token: String,
});
const Accounts = db.model("accounts", accounts);

export { Accounts, PublicGeneration, User };

