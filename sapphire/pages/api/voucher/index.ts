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
  if (req.method === "POST") {
    const { code } = req.body;
    if (!code) {
      return res.status(404).json({ message: "Missing objects" });
    }

    try {
      // get voucher data
      const voucher = await prisma.voucher.findUnique({ where: { code: code } });
      if (!voucher) {
        return res.status(404).json({ message: "Invalid Voucher" });
      }

      //@ts-ignore
      if (voucher.claimedBy >= voucher.supply) {
        return res.status(404).json({ message: "Voucher has reached maximum claims" });
      }

      if (voucher.expiresAt.getTime() < Date.now()) {
        return res.status(404).json({ message: "Voucher has expired" });
      }

      // get user data
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) {
        return res.status(404).json({ message: "Could not find your user data" });
      }

      // check if user already redeem voucher
      //@ts-ignore
      if (voucher.claimedBy.includes(user)) {
        return res.status(500).json({ message: "You've already claimed this voucher!" });
      }

      const updateVoucher = await prisma.voucher.update({
        where: { code: code },
        data: {
          claimedBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      //update user sapphires
      const updateUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          sapphires: user.sapphires + voucher.sapphires,
        },
      });

      // // return amount of sapphire redeemed
      return res.status(200).json({ amount: voucher.sapphires });
    } catch (err) {
      console.log(err);
      return res.status(404).json({ message: "Error redeeming voucher" });
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
