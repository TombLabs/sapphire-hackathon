import prisma from "@/database/prisma";
import { usernameSchema } from "@/lib/zod-schemas/user";
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

    try {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { wallets: true, generations: true } })
      if (!user) {
        return res.status(404).json({ message: "Could not find your user data" });
      }

      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ message: "Server Error" })
    }
  }

  // update user
  if (req.method === "PATCH") {
    const { name, avatar } = req.body;
    if (!name && !avatar) {
      return res.status(404).json({ message: "Missing body objects" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) {
        return res.status(404).json({ message: "Could not find your user data" });
      }

      if (!!name) {
        const parsed = usernameSchema.safeParse({ name: name });
        if (!parsed.success) {
          return res.status(404).json({ message: "Username not valid" });
        }
        user.name = name;
      }

      if (!!avatar) {
        user.image = avatar;
      }

      const updatedUser = await prisma.user.update({ where: { id: session.user.id }, data: user })
      return res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Server Error" })
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
