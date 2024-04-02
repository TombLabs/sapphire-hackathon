import prisma from "@/database/prisma";
import { sleep, storeImage } from "@/lib/helpers/api-helpers";
import { AiEngine, GenerationReturn, LeonardoRequest } from "@/types";
import { Leonardo } from "@leonardo-ai/sdk";
import {
  CreateGenerationResponse,
  GetGenerationByIdResponse,
} from "@leonardo-ai/sdk/dist/sdk/models/operations";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //get the user session
  const session = await getServerSession(req, res, authOptions);

  //if no session, return unauthorized
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //if request is post continue
  if (req.method === "POST") {
    //get the request body
    const { prompt, isPublic, promptAssist, leonardoOptions, cost } = req.body as LeonardoRequest;

    //get the user id from the session
    const userId = session.user.id;

    //if no prompt, return error
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(leonardoOptions);
    //get and check the Leonardo api key from env
    const LEONARDO_KEY = /* process.env.LEONARDO_KEY; */ process.env.LEONARDO_PRODUCTION_KEY!;

    if (!LEONARDO_KEY) {
      return res
        .status(500)
        .json({ error: "Please contact Tomb Labs team in the TombStoned Discord" });
    }

    try {
      //get user data from db and check if exists and has enough sapphires
      const userData = await prisma.user.findUnique({ where: { id: userId } });

      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      if (userData.sapphires! < cost) {
        return res.status(400).json({ error: "Not enough sapphires" });
      }

      //create and authenticate the Leonardo sdk
      const sdk = new Leonardo({
        security: {
          bearerAuth: LEONARDO_KEY,
        },
      });

      //store genId in variable
      let generationId: string | undefined = undefined;



      //create the generation
      const generationRequest = await sdk.generation
        .createGeneration({
          height: 512,
          guidanceScale: leonardoOptions.guidanceScale,
          modelId: leonardoOptions.modelId === null ? undefined : leonardoOptions.modelId,
          photoReal: leonardoOptions.photoReal,
          alchemy: leonardoOptions.alchemy,
          numImages: 1,
          numInferenceSteps: leonardoOptions.inferenceSteps,
          prompt: prompt,
          promptMagic: true,
        })

      const response = generationRequest as CreateGenerationResponse

      if (response.statusCode !== 200) {
        console.log(response.rawResponse?.data.toString())
        if (JSON.parse(response.rawResponse?.data.toString()).error === "content moderation filter") {
          console.log("Sus prompt")
          return res.status(500).json({ error: "Sus" })
        } else {
          return res.status(500).json({ error: "Error Happened Server Side" });
        }
      }

      generationId =
        response.createGeneration200ApplicationJSONObject?.sdGenerationJob?.generationId;



      //if no generation id, return error
      if (!generationId) {
        console.log("no generation id");
        return res.status(500).json({ error: "Error Happened Server Side" });
      }

      //instantiate image variable
      let image_url: string | undefined = undefined;

      //implement retry logic as generation isn't available right away
      let retryCount = 0;
      const retryLeonardo = async () => {
        await sdk.generation
          .getGenerationById(generationId!)
          .then((result: GetGenerationByIdResponse) => {
            if (result.statusCode == 200) {
              console.log(
                result.getGenerationById200ApplicationJSONObject?.generationsByPk?.generatedImages
              );
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
              await retryLeonardo();
            } else {
              console.log(err);
              return res.status(500).json({ error: "Error Happened Server Side" });
            }
          });
      };
      await retryLeonardo();

      //if no image url, return error
      if (!image_url) {
        return res.status(500).json({ error: "Error Happened Server Side" });
      }

      //store the image on nft.storage
      const storageUrl = await storeImage(image_url!);

      //instantiate generation data for user and public generation
      const generationData = {
        image: storageUrl,
        sapphireCost: cost,
        aiEngine: "Leonardo" as AiEngine,
        prompt: prompt,
        isPublic: isPublic,
        img2Img: false,
        promptAssist: promptAssist,
        isMintable: false,
      };

      //add the generation
      const generation = await prisma.generation.create({
        data: {
          ...generationData,
          user: {
            connect: {
              id: userId
            }
          }
        }
      })

      //charge user
      await prisma.user.update({
        where: { id: userId },
        data: {
          sapphires: userData.sapphires - cost
        }
      })

      return res.status(200).json({
        isError: false,
        data: storageUrl,
      } as GenerationReturn);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ isError: true, error: e, data: "Error Happened Server Side" } as GenerationReturn);
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
