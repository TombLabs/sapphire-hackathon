import axios from "axios";
import { NFTStorage } from "nft.storage";
import sharp from "sharp";
import funnyImageResponses from "../lib/jsons/randomResponse.json";

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const key = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY!;
const client = new NFTStorage({ token: key });

{
    /* IMAGE HELPERS */
}

//store image on nft.storage
export async function storeImage(imageUrl: string) {
    const imgReq = await fetch(process.env.NEXT_PUBLIC_CORS_PROXY_URL! + imageUrl);
    const image = await imgReq.blob();

    const cid = await client.storeBlob(image);

    const storageUrl = `https://nftstorage.link/ipfs/${cid}`;
    return storageUrl;
}

export function getRandomImageResponse() {
    return funnyImageResponses[Math.floor(Math.random() * funnyImageResponses.length)]
}

export async function getBlobFromUrl(url: string) {
    const imgReq = await fetch(process.env.NEXT_PUBLIC_CORS_PROXY_URL! + url);
    const image = await imgReq.blob();
    return image
}

export function convertB64toBlob(b64: string) {
    const sliceSize = 1024;
    const byteCharacters = atob(b64);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: "image/png" });
}

export async function storeImageBlob(imageBlob: Blob) {
    const cid = await client.storeBlob(imageBlob);

    const storageUrl = `https://nftstorage.link/ipfs/${cid}`;
    return storageUrl;
}

export async function handleImagePreparation(url: string) {
    const { data } = await axios.get(url, {
        responseType: "arraybuffer",
    });

    //resize image
    const resized = await sharp(data).resize(1024, 1024).toBuffer();

    return resized;
}
