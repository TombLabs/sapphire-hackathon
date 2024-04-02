
import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get user
  if (req.method === "GET") {
    const { id } = req.query;
    const includeWallets = req.query.includeWallets;
    let sqlQuery: any
    if (includeWallets == "true") {
      sqlQuery = { where: { id: id as string }, include: { wallets: true } }
    } else {
      sqlQuery = { where: { id: id as string } }
    }
    const user = await prisma.user.findUnique(sqlQuery)
    if (!user) {
      return res.status(404).json({ message: "Could not find your user data" });
    }

    return res.status(200).json(user);
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
