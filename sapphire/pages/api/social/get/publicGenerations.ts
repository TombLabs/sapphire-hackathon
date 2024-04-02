import { PublicGeneration } from "@/mongo/schemas";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const generations = await PublicGeneration.find({}).sort({ createdAt: -1 });
    console.log(generations);
    return res.status(200).json(generations);
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
