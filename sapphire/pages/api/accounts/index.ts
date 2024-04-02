import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get accounts
  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { accounts: true } })
    if (!user) {
      return res.status(404).json({ message: "Could not find your user data" });
    }


    if (!user.accounts) {
      return res.status(404).json({ message: "Could not find your account data" });
    }

    return res.status(200).json(user.accounts);
  }

  // delete account
  if (req.method === "DELETE") {
    const { provider } = req.query;
    if (!provider) {
      return res.status(404).json({ message: "Missing query objects" });
    }

    await prisma.account.deleteMany({ where: { userId: session.user.id, provider: provider as string } });
    return res.status(200).json({ message: "Account unlinked" });
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
