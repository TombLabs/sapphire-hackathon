import OpenAI from "openai";
import { AiEngine } from "../types/index";
import { storeImage } from "./common";
import { addPublicGeneration, getUserAccount, updateUserOnGeneration } from "./mongo";

require("dotenv").config()

const DALLE_KEY = process.env.OPEN_AI_KEY;

const openai = new OpenAI({
    apiKey: DALLE_KEY,
});

export async function generateDalleImage(prompt: string, discordId: string, isPublic: boolean) {
    const user = await getUserAccount(discordId)
    if (!user) return { error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" }

    try {
        const image = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        const image_url = image.data[0].url;

        //store the image on nft.storage
        const storageUrl = await storeImage(image_url!);

        //create the generation data for db storage
        const generationData = {
            image: storageUrl,
            sapphireCost: 2,
            aiEngine: "dalle" as AiEngine,
            prompt: prompt,
            isPublic: isPublic,
            img2Img: false,
            promptAssist: false,
            likes: 0,
            createdAt: Date.now(),
        };

        //update User
        const result = await updateUserOnGeneration(generationData, user);


        //update public generations
        if (isPublic) {
            const publicGeneration = await addPublicGeneration(generationData, user._id, user.name!);
        }
        return { isError: false, image: storageUrl }
    } catch (e) {
        console.log(e)
        return { isError: true, error: "Something went wrong" }
    }

}