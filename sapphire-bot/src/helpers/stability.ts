import axios from "axios"
import FormData from 'form-data'
import fetch from 'node-fetch'
import { AiEngine } from "../types/index"
import { convertB64toBlob, handleImagePreparation, storeImageBlob } from "./common"
import { addPublicGeneration, getUserAccount, updateUserOnGeneration } from "./mongo"

export async function generateStabilityTxt2Img(prompt: string, cfg: number, discordId: string, isPublic: boolean) {
    const user = await getUserAccount(discordId)
    if (!user) return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" }

    const engineId = 'stable-diffusion-xl-1024-v1-0'
    const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
    const apiKey = process.env.STABILITY_AI_KEY!

    if (!apiKey) return { isError: true, error: "No API key found" }
    const url = `${apiHost}/v1/generation/${engineId}/text-to-image`

    try {
        const { data } = await axios.post(url, JSON.stringify({
            text_prompts: [
                {
                    "text": prompt,
                }
            ],
            cfg_scale: cfg,
            height: 1024,
            width: 1024,
            steps: 50,
            samples: 1

        }), {

            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        const base64Image = data.artifacts[0].base64;
        const blob = convertB64toBlob(base64Image);
        const storageUrl = await storeImageBlob(blob);
        const generationData = {
            image: storageUrl,
            sapphireCost: 10,
            aiEngine: "Leonardo" as AiEngine,
            prompt: prompt,
            isPublic: isPublic,
            img2Img: false,
            promptAssist: false,
            likes: 0,
            createdAt: Date.now(),
        };

        //update User
        await updateUserOnGeneration(generationData, user);

        //if public, add public generation
        if (isPublic) {
            await addPublicGeneration(generationData, user._id, user.name);
        }
        return { isError: false, image: storageUrl }
    } catch (e) {
        console.log(e)
        return { isError: true, error: "Something went wrong" }
    }

}

export async function generateStabilityImg2Img(prompt: string, cfg: number, discordId: string, isPublic: boolean, initImageStrength: number, initImage: string) {
    const user = await getUserAccount(discordId)
    if (!user) return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" }

    const engineId = 'stable-diffusion-xl-1024-v1-0'
    const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
    const apiKey = process.env.STABILITY_AI_KEY!

    if (!apiKey) return { isError: true, error: "No API key found" }
    const url = `${apiHost}/v1/generation/${engineId}/image-to-image`
    const imageString = await handleImagePreparation(initImage);
    try {
        const formData = new FormData();
        formData.append("init_image", imageString);
        formData.append("init_image_mode", "IMAGE_STRENGTH");
        formData.append("image_strength", initImageStrength);
        formData.append("text_prompts[0][text]", prompt);
        formData.append("cfg_scale", cfg);
        formData.append("samples", 1);
        formData.append("steps", 50);

        //generate the image
        const response = await axios.post(
            `${apiHost}/v1/generation/${engineId}/image-to-image`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Accept: "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (response.status !== 200) {
            throw new Error(`Non-200 response: ${await response.data}`);
        }

        interface GenerationResponse {
            artifacts: Array<{
                base64: string;
                seed: number;
                finishReason: string;
            }>;
        }

        const responseJSON = response.data as GenerationResponse;

        const base64Image = responseJSON.artifacts[0].base64;

        //convert and store image
        const blob = convertB64toBlob(base64Image);
        const storageUrl = await storeImageBlob(blob);
        const referenceImage = initImage;

        //create the generation data for db storage
        const generationData = {
            image: storageUrl,
            sapphireCost: 10,
            aiEngine: "Stability" as AiEngine,
            prompt: prompt,
            isPublic: isPublic,
            img2Img: true,
            referenceImage: referenceImage,
            promptAssist: false,
            likes: 0,
            createdAt: Date.now(),
        }

        //update User
        await updateUserOnGeneration(generationData, user);


        //update public generations
        if (isPublic) {
            await addPublicGeneration(generationData, user._id, user.name);
        }


        return { isError: false, image: storageUrl }
    } catch (e) {
        console.log(e)
        return { isError: true, error: "Something went wrong" }
    }

}