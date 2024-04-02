import prisma from "@/database/prisma";
import { SignInWallet } from "@/lib/helpers/sign-in-wallet";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const wallets = await prisma?.wallet.findMany({ where: { userId: session.user.id } });
    if (!wallets) {
      return res.status(404).json({ message: "No wallets found" });
    }
    return res.status(200).json(wallets?.map((wallet) => wallet.address));
  }

  // delete wallet
  if (req.method === "DELETE") {
    const { wallet } = req.query;
    if (!wallet) {
      return res.status(404).json({ message: "Missing query objects" });
    }
    try {

      const updatedWallet = await prisma.wallet.delete({
        where: { address: wallet as string },
      });


      return res.status(200).json(updatedWallet);
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Server Error" })
    }
  }

  // add wallet
  if (req.method === "PUT") {
    const { message, signature } = req.body;
    if (!message || !signature) {
      return res.status(404).json({ message: "Missing body objects" });
    }

    try {
      const signInWallet = new SignInWallet(message);
      const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
      const isDomainSame = nextAuthUrl.host == signInWallet.domain;
      if (!isDomainSame) {
        return res.status(401).json({ message: "Unauthorized, foreign domain" });
      }

      const validationResult = await signInWallet.validate(signature);
      if (!validationResult) {
        return res.status(401).json({ message: "Unauthorized, validation failed" });
      }

      // remove sign in wallet from all users
      const wallet = await prisma?.wallet.findUnique({ where: { address: signInWallet.publicKey } });

      if (!wallet) {
        const updateWallet = await prisma?.wallet.create({
          data: {
            address: signInWallet.publicKey,
            user: { connect: { id: session.user.id } },
          },
        });
        return res.status(200).json(updateWallet);

      } else {
        const updateWallet = await prisma?.wallet.update({
          where: { address: signInWallet.publicKey },
          data: {
            user: { connect: { id: session.user.id } },
          },
        });
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Server Error" })
    }
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
