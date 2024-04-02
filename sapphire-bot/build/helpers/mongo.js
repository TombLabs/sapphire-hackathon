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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSapphires = exports.addPublicGeneration = exports.updateUserOnGeneration = exports.getUserAccount = void 0;
const schemas_1 = require("../schemas/schemas");
function getUserAccount(discordId) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield schemas_1.Accounts.findOne({ providerAccountId: discordId });
        if (!account)
            return null;
        const userId = account === null || account === void 0 ? void 0 : account.userId;
        const user = yield schemas_1.User.findOne({ _id: userId });
        if (!user)
            return null;
        return user;
    });
}
exports.getUserAccount = getUserAccount;
function updateUserOnGeneration(generationData, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            user.generations.push({
                image: generationData.image,
                sapphireCost: generationData.sapphireCost,
                createdAt: Date.now(),
                likes: 0,
                aiEngine: generationData.aiEngine,
                prompt: generationData.prompt,
                isPublic: generationData.isPublic,
                img2Img: generationData.aiEngine === "img2img" ? true : false,
                promptAssist: generationData.promptAssist,
                name: generationData.name ? generationData.name : "",
                referenceImage: generationData.referenceImage ? generationData.referenceImage : undefined,
            });
            user.sapphires -= generationData.sapphireCost;
            yield user.save();
            return { isError: false, data: user };
        }
        catch (e) {
            return { isError: true, error: e };
        }
    });
}
exports.updateUserOnGeneration = updateUserOnGeneration;
function addPublicGeneration(generationData, userId, username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newGeneration = new schemas_1.PublicGeneration({
                src: generationData.image,
                height: 512,
                width: 512,
                sapphireCost: generationData.sapphireCost,
                createdAt: Date.now(),
                likes: 0,
                aiEngine: generationData.aiEngine,
                prompt: generationData.prompt,
                isPublic: generationData.isPublic,
                img2Img: generationData.aiEngine === "img2img" ? true : false,
                promptAssist: generationData.promptAssist,
                name: generationData.name ? generationData.name : "",
                userId: userId,
                referenceImage: generationData.referenceImage ? generationData.referenceImage : undefined,
            });
            yield newGeneration.save();
            return { isError: false, data: newGeneration };
        }
        catch (e) {
            return { isError: true, error: e };
        }
    });
}
exports.addPublicGeneration = addPublicGeneration;
function transferSapphires(fromUser, toUser, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            fromUser.sapphires -= amount;
            toUser.sapphires += amount;
            yield fromUser.save();
            yield toUser.save();
            return { isError: false, data: 'sucess' };
        }
        catch (e) {
            return { isError: true, error: e };
        }
    });
}
exports.transferSapphires = transferSapphires;
