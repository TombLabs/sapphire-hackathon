import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "DELETE") {

    try {
      const userId = session.user.id;
      const { genId } = req.body;
      if (!genId) {
        return res.status(404).json({ message: "Missing body object" });
      }
      const newLike = await prisma.like.deleteMany({
        where: {
          likerId: userId,
          generationId: genId
        }
      })

      return res.status(200).json("updated likes");
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Server Error" })
    }
  }



  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
