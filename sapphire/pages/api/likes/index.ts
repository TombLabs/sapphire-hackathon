import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //get likes
  if (req.method === "GET") {
    const likes = await prisma.like.findMany({});
    return res.status(200).json(likes.map((like) => {
      return {
        id: like.id,
        likerId: like.likerId,
        generationId: like.generationId,
      }
    }));
  }

  // add/remove likes
  if (req.method === "PUT") {
    const userId = session.user.id;
    const { url, like, genId } = req.body;

    if (!url) {
      return res.status(404).json({ message: "Missing body objects" });
    }

    try {
      if (like) {
        const addLike = await prisma.like.create({
          data: {
            liker: { connect: { id: userId } },
            generation: { connect: { id: genId } },
          },
        });
      } else {
        const removeLike = await prisma.like.deleteMany({
          where: {
            generationId: genId,
            likerId: userId,
          },
        });
      }
      return res.status(200).json({ message: "Likes updated successfully" });

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
