"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDalleImage = void 0;
const openai_1 = __importDefault(require("openai"));
const common_1 = require("./common");
const mongo_1 = require("./mongo");
require("dotenv").config();
const DALLE_KEY = process.env.OPEN_AI_KEY;
const openai = new openai_1.default({
    apiKey: DALLE_KEY,
});
function generateDalleImage(prompt, discordId, isPublic) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, mongo_1.getUserAccount)(discordId);
        if (!user)
            return { error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" };
        try {
            const image = yield openai.images.generate({
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });
            const image_url = image.data[0].url;
            //store the image on nft.storage
            const storageUrl = yield (0, common_1.storeImage)(image_url);
            //create the generation data for db storage
            const generationData = {
                image: storageUrl,
                sapphireCost: 2,
                aiEngine: "dalle",
                prompt: prompt,
                isPublic: isPublic,
                img2Img: false,
                promptAssist: false,
                likes: 0,
                createdAt: Date.now(),
            };
            //update User
            const result = yield (0, mongo_1.updateUserOnGeneration)(generationData, user);
            //update public generations
            if (isPublic) {
                const publicGeneration = yield (0, mongo_1.addPublicGeneration)(generationData, user._id, user.name);
            }
            return { isError: false, image: storageUrl };
        }
        catch (e) {
            console.log(e);
            return { isError: true, error: "Something went wrong" };
        }
    });
}
exports.generateDalleImage = generateDalleImage;
