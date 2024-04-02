import { Leonardo } from "@leonardo-ai/sdk";
import {
  CreateGenerationResponse,
  GetGenerationByIdResponse,
} from "@leonardo-ai/sdk/dist/sdk/models/operations";
import { AiEngine } from "../types/index";
import { sleep, storeImage } from "./common";
import { addPublicGeneration, getUserAccount, updateUserOnGeneration } from "./mongo";
require("dotenv").config();

export async function generateLeonardoImage(prompt: string, promptStrength: number, discordId: string, isPublic: boolean) {
  const user = await getUserAccount(discordId)
  if (!user) return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" }

  const LEONARDO_KEY = process.env.LEONARDO_KEY!

  const sdk = new Leonardo({
    bearerAuth: LEONARDO_KEY,
  });
  let generationId: string | undefined = undefined;
  try {
    await sdk.generation
      .createGeneration({
        height: 512,
        guidanceScale: promptStrength,
        numImages: 1,
        numInferenceSteps: 50,
        prompt: prompt,
        promptMagic: true,
      })
      .then((result: CreateGenerationResponse) => {
        if (result.statusCode == 200) {
          // handle response
          generationId =
            result.createGeneration200ApplicationJSONObject?.sdGenerationJob?.generationId;
        }
      })
      .catch((err: any) => {
        // handle error
        console.log(err);
        return { isError: true, error: "Error Happened Server Side" }
      });

    let image_url: string | undefined = undefined;


    let retryCount = 0;
    const fuckLeonardo = async () => {
      await sdk.generation
        .getGenerationById(generationId!)
        .then((result: GetGenerationByIdResponse) => {
          if (result.statusCode == 200) {

            // handle response
            image_url =
              result.getGenerationById200ApplicationJSONObject?.generationsByPk
                ?.generatedImages?.[0].url;
          }
        })
        .catch(async (err: any) => {
          // handle error
          if (retryCount < 6) {
            retryCount++;
            console.log("retrying");
            await sleep(4000);
            await fuckLeonardo();
          } else {
            console.log(err);
            return { isError: true, error: "Error happened server side" }
          }
        });
    };
    await fuckLeonardo();

    if (!image_url) {
      return { isError: true, error: "Error occured Server Side" }
    }

    //store the image on nft.storage
    const storageUrl = await storeImage(image_url!);

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

    if (isPublic) {
      await addPublicGeneration(generationData, user._id, user.name);
    }
    return { isError: false, image: storageUrl }
  } catch (e) {
    console.log(e)
    return { isError: true, error: "Something went wrong" }
  }

}