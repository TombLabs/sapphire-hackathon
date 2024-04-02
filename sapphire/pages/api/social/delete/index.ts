import type { NextApiRequest, NextApiResponse } from "next";
import { PublicGeneration, User } from "@/mongo/schemas";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(404).json({ message: "Missing query object" });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return res.status(404).json({ message: "Could not find your user data" });
    }

    if (user.role !== "admin") {
      return res.status(404).json({ message: "Unauthorized" });
    }

    await PublicGeneration.findByIdAndDelete(id);
    return res.status(200).json({ message: "Delete successfully" });
  }

  // METHOD NOT ALLOWED
  return res.status(405).json({ message: "Request method not allowed" });
}
