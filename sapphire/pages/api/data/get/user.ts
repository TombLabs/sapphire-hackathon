import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const { searchBy, searchValue } = req.query as { searchBy: string, searchValue: string }



    if (!searchBy) {
        return res.status(400).json({ error: "Missing required parameters" })
    }

    if (searchBy === "all") {
        try {
            const users = await prisma.user.findMany({ include: { generations: true, wallets: true, purchases: true } })

            return res.status(200).json({
                users: users.map((user) => {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        sapphires: user.sapphires,
                        wallets: user.wallets.map((wallet) => wallet.address),
                        generations: user.generations.length,
                        purchases: user.purchases.length
                    }
                })
            })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    } else if (searchBy === "email") {
        try {
            const user = await prisma.user.findUnique({ where: { email: searchValue }, include: { generations: true, wallets: true, purchases: true } })
            return res.status(200).json({
                users: {
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                    sapphires: user?.sapphires,
                    wallets: user?.wallets.map((wallet) => wallet.address),
                    generations: user?.generations.length,
                    purchases: user?.purchases.length
                }
            })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    } else if (searchBy === "id") {
        try {
            const user = await prisma.user.findUnique({ where: { id: searchValue }, include: { generations: true, wallets: true, purchases: true } })
            return res.status(200).json({
                users: {
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                    sapphires: user?.sapphires,
                    wallets: user?.wallets.map((wallet) => wallet.address),
                    generations: user?.generations.length,
                    purchases: user?.purchases.length
                }
            })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    } else if (searchBy === "wallet") {
        try {
            const user = await prisma.user.findFirst({
                include: { wallets: true, generations: true, purchases: true },
                where: {
                    wallets: {
                        some: {
                            address: searchValue
                        }
                    }
                }
            }
            )

            return res.status(200).json({
                users: {
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                    wallets: user?.wallets.map((wallet) => wallet.address),
                    generations: user?.generations.length,
                    purchases: user?.purchases.length
                }
            })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    } else if (searchBy === "name") {
        try {
            const user = await prisma.user.findUnique({ where: { name: searchValue }, include: { generations: true, wallets: true, purchases: true } })
            return res.status(200).json({ user })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }

    } else {
        return res.status(400).json({ error: "Invalid searchBy parameter" })
    }

}