
import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
const DEFAULT_LIMIT_AMOUNT = 20;
const DEFAULT_SKIP_AMOUNT = 0;
const generatorOptions = ["dalle-3", "stability", "leonardo"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const limit = Number(req.query.limit) || DEFAULT_LIMIT_AMOUNT;
    const skip = Number(req.query.skip) || DEFAULT_SKIP_AMOUNT;
    const generator = req.query.generator;
    const isMintable = req.query.isMintable;
    const order = req.query.order;
    const sortBy = req.query.sortBy;

    let filter: any = {};
    if (generatorOptions.includes(generator as string) && isMintable == "true") {
      filter = { isPublic: true, aiEngine: generator, isMintable: true };
    } else if (generatorOptions.includes(generator as string)) {
      filter = { isPublic: true, aiEngine: generator };
    } else if (isMintable == "true") {
      filter = { isPublic: true, isMintable: true };
    } else {
      filter = { isPublic: true };
    }


    const sort: any = {};
    if (sortBy == "likes") {
      sort.likesRecieved = order == "desc" ? { _count: "asc" } : { _count: "desc" };
    } else {
      sort.createdAt = order == "desc" ? "asc" : "desc";
    }

    const generations = await prisma.generation.findMany({ where: filter, skip: skip, take: limit, orderBy: sort, include: { likesRecieved: true } })


    const map = generations.map((generation) => {
      return {
        ...generation,
        likes: generation.likesRecieved.map((like) => {
          return {
            id: like.id,
            likerId: like.likerId,
            generationId: like.generationId,
          }
        })
      }
    })

    return res.status(200).json(generations);
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({});
}
