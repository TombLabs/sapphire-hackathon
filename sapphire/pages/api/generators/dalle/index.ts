import prisma from "@/database/prisma";
import { storeImage, } from "@/lib/helpers/api-helpers";
import { AiEngine, GenerationReturn } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  //get the user session and validate
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //if request is post continue
  if (req.method === "POST") {

    //get the request body and check if prompt exists
    const { prompt, isPublic } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    //get the user id from the session
    const userId = session.user.id;

    //get and check the dalle api key from env
    const DALLE_KEY = process.env.OPEN_AI_KEY;

    if (!DALLE_KEY) {
      return res
        .status(500)
        .json({ isError: true, error: "Invalid Key.  Server error, please contact Tomb Labs in the Tombstoned Discord" } as GenerationReturn);
    }

    try {

      //create the openai instance
      const openai = new OpenAI({
        apiKey: DALLE_KEY,
      });

      //get user data from db and check if exists and has enough sapphires
      const userData = await prisma.user.findUnique({ where: { id: userId } })

      if (!userData) {
        return res.status(404).json({ isError: true, error: "User not found" } as GenerationReturn);
      }

      if (userData.sapphires! < 24) {
        return res.status(400).json({ isError: true, error: "Not enough sapphires" } as GenerationReturn);
      }



      //generate the image
      const image = await openai.images.generate({
        //@ts-ignore
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd"
      });
      const image_url = image.data[0].url;

      //store the image on nft.storage
      const storageUrl = await storeImage(image_url!);

      //create the generation data for db storage
      const generationData = {
        image: storageUrl,
        sapphireCost: 24,
        aiEngine: "dalle-3" as AiEngine,
        prompt: prompt,
        isPublic: isPublic,
        img2Img: false,
        promptAssist: false,
        isMintable: false
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
          sapphires: userData.sapphires - 24
        }
      })

      return res.status(200).json({
        isError: false,
        data: storageUrl,
      } as GenerationReturn);
    } catch (e: any) {
      console.log(e);
      let error
      if (e.error.code === "content_policy_violation") {
        return res
          .status(500)
          .json({ isError: true, error: "That prompt was sus...  Try again." } as GenerationReturn);

      } else {
        return res
          .status(500)
          .json({ isError: true, error: "Something went wrong.  Please try again or contact Tomb Labs in Tombstoned Discord" } as GenerationReturn);

      }
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
