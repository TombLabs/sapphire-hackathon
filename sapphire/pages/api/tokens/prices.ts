import { bonk, dogWifHat, gecko, shdw } from "@/lib/constants";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const url = `https://price.jup.ag/v4/price?ids=${bonk},${dogWifHat},${gecko},${shdw}`

    const { data } = await axios.get(url)

    const bonkPrice = data.data[bonk].price
    const dogWifHatPrice = data.data[dogWifHat].price
    const geckoPrice = data.data[gecko].price
    const shdwPrice = data.data[shdw].price

    res.status(200).json({ bonkPrice: bonkPrice, dogWifHatPrice: dogWifHatPrice, geckoPrice: geckoPrice, shdwPrice: shdwPrice })
}