import prisma from "@/database/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PaymentOpts, PricingPackagesTypes } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { tx, selectedPackage, paymentToken } = req.body as {
    tx: string;
    selectedPackage: PricingPackagesTypes;
    paymentToken: PaymentOpts;
  };
  if (!tx || !selectedPackage || !paymentToken) {
    return res.status(404).json({ message: "Missing body object" });
  }

  try {
    const userData = await prisma.user.findUnique({ where: { id: session.user.id }, include: { purchases: true } })
    if (!userData) {
      return res.status(404).json({ message: "Could not find your user data" });
    }

    const newPurchase = await prisma.purchase.create({
      data: {
        paymentToken: paymentToken,
        transaction: tx,
        user: { connect: { id: session.user.id } },
        package: { connect: { name: selectedPackage.name } },
      }
    });

    const updateUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { sapphires: userData.sapphires + selectedPackage.credits },
    });
    res.status(200).json({ message: "Purchase successful" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "Something went wrong" });
  }
}
