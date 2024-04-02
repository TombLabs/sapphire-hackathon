import prisma from "@/database/prisma";

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    //get the user session and validate
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "POST") return res.status(400).json({ error: "Method Not Allowes" });

    const userId = session.user.id;

    if (!userId) return res.status(400).json({ error: "Authorized User Not Found" });

    const { prompt, engine } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    if (!engine) return res.status(400).json({ error: "Engine is required" });

    const OPEN_AI_KEY = process.env.OPEN_AI_KEY!;

    if (!OPEN_AI_KEY) return res.status(500).json({ error: "Invalid Key.  Server error, please contact Tomb Labs in the Tombstoned Discord" });

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.sapphires < 2) return res.status(400).json({ error: "Not enough sapphires" });

    try {
        const openai = new OpenAI({
            apiKey: OPEN_AI_KEY,
        });

        const request = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai image generator engineer that helps people with their prompts" },
                { role: "system", content: `Improve this prompt for AI image generation: ${prompt}` },
            ],
            max_tokens: 100,
            n: 4,

        })
        const response = request.choices
        console.log(response)
        //update user
        await prisma.user.update({
            where: { id: userId },
            data: {
                sapphires: user.sapphires - 2
            }
        })
        res.status(200).json({ message: response })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e })
    }
}