"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.PublicGeneration = exports.Accounts = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const db = mongoose_1.default.createConnection(process.env.MONGO_URI + "/" + process.env.MONGO_DATABASE_NAME);
const userSchema = new mongoose_1.default.Schema({
    email: String,
    name: String,
    username: String,
    image: String,
    role: String,
    sapphires: Number,
    createdAt: Number,
    wallets: (Array),
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
const User = db.model("users", userSchema);
exports.User = User;
const publicGenerationSchema = new mongoose_1.default.Schema({
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
exports.PublicGeneration = PublicGeneration;
const accounts = new mongoose_1.default.Schema({
    userId: mongodb_1.ObjectId,
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
exports.Accounts = Accounts;
