import prisma from "@/database/prisma";
import { convertB64toBlob, handleImagePreparation, storeImageBlob } from "@/lib/helpers/api-helpers";
import { AiEngine, GenerationReturn, StabilityRequest } from "@/types";
import axios from "axios";
import FormData from "form-data";

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //fetch and check for session, else error
  const session = await getServerSession(req, res, authOptions);


  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //if request is post continue
  if (req.method === "POST") {
    //get the request body and userid and check if prompt, userid and stability options exist
    const { prompt, isPublic, stabilityOptions, promptAssist } = req.body as StabilityRequest;
    const userId = session.user.id;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    if (!userId) return res.status(400).json({ error: "User Id is required" });
    if (!stabilityOptions)
      return res.status(400).json({ error: "Missing image generation options" });

    //get and check the stability api key from env
    const STABILITY_KEY = process.env.STABILITY_AI_KEY;

    if (!STABILITY_KEY) {
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

      if (userData.sapphires! < 10) {
        return res.status(400).json({ error: "Not enough sapphires" });
      }

      //prep image for stability using b64 and blob converters
      const imageString = await handleImagePreparation(stabilityOptions.initImage);

      //specify engine and api host
      const engineId = "stable-diffusion-xl-1024-v1-0";
      const apiHost = process.env.API_HOST ?? "https://api.stability.ai";

      console.log(req.body)

      //create form data and append the image and stability options
      const formData = new FormData();
      formData.append("init_image", imageString);
      formData.append("init_image_mode", "IMAGE_STRENGTH");
      formData.append("image_strength", stabilityOptions.initImageStrength);
      formData.append("text_prompts[0][text]", prompt);
      formData.append("cfg_scale", stabilityOptions.cfg);
      formData.append("samples", 1);
      formData.append("steps", stabilityOptions.steps);

      //generate the image
      const response = await axios.post(
        `${apiHost}/v1/generation/${engineId}/image-to-image`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Accept: "application/json",
            Authorization: `Bearer ${STABILITY_KEY}`,
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

      const referenceImage = stabilityOptions.initImage;

      //create the generation data for db storage
      const generationData = {
        image: storageUrl,
        sapphireCost: 10,
        aiEngine: "Stability" as AiEngine,
        prompt: prompt,
        isPublic: isPublic,
        img2Img: true,
        referenceImage: referenceImage,
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
          sapphires: userData.sapphires - 10
        }
      })

      return res.status(200).json({
        isError: false,
        data: storageUrl,
      } as GenerationReturn);
    } catch (e: any) {
      console.log(e);
      if (e.response.data.name === 'invalid_prompts') {
        return res
          .status(500)
          .json({ isError: true, error: e, data: "Invalid Prompt or unallowed word. Please check your prompt and try again" } as GenerationReturn);
      } else {
        return res
          .status(500)
          .json({ isError: true, error: e, data: "Error Happened Server Side" } as GenerationReturn);
      }
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
