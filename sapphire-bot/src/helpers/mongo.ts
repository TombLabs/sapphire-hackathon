import { ObjectId } from 'mongodb';
import mongoose, { HydratedDocument } from "mongoose";
import { Accounts, PublicGeneration, User } from "../schemas/schemas";
import { AIGeneration, MongoUpdateReturn, SapphireUser } from "../types/index";

export async function getUserAccount(discordId: string) {
    const account = await Accounts.findOne({ providerAccountId: discordId })
    if (!account) return null;
    const userId = account?.userId

    const user = await User.findOne({ _id: userId })
    if (!user) return null;
    return user
}

export async function updateUserOnGeneration(
    generationData: AIGeneration,
    user: HydratedDocument<SapphireUser>
) {
    try {
        user.generations!.push({
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
        user.sapphires! -= generationData.sapphireCost;
        await user.save();
        return { isError: false, data: user } as MongoUpdateReturn;
    } catch (e) {
        return { isError: true, error: e } as MongoUpdateReturn;
    }
}

export async function addPublicGeneration(generationData: AIGeneration, userId: ObjectId, username: string) {
    try {
        const newGeneration = new PublicGeneration({
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
        await newGeneration.save();
        return { isError: false, data: newGeneration } as MongoUpdateReturn;
    } catch (e) {
        return { isError: true, error: e } as MongoUpdateReturn;
    }
}

export async function transferSapphires(fromUser: HydratedDocument<SapphireUser>, toUser: HydratedDocument<SapphireUser>, amount: number) {
    try {
        fromUser.sapphires! -= amount
        toUser.sapphires! += amount
        await fromUser.save()
        await toUser.save()
        return { isError: false, data: 'sucess' } as MongoUpdateReturn;
    } catch (e) {
        return { isError: true, error: e } as MongoUpdateReturn;
    }
}