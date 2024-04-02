import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { NFTStorage } from "nft.storage";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

const key = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY!;
const client = new NFTStorage({ token: key });

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const fetcherWithWallet = (url: string, wallet: string) => axios.get(url, { params: { wallet: wallet } }).then((res) => res.data);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFormatDate(input: string | number) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function tryCatchErrorHandler(err: any) {
  console.log(err);
  if (err.response?.data?.message) {
    toast.error(err.response.data.message);
  } else {
    toast.error(err.message);
  }
}

/**
 * Converts a base64 string to a blob
 * @param { string } b64
 * @returns {Blob}
 */
export function convertB64toBlob(b64: string): Blob {
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

/**
 * Store an image to nft.storage by passing a blob/file object
 * @param {Blob | File} imageBlob
 * @returns {Promise<string>}
 */
export async function storeImageBlob(imageBlob: Blob): Promise<string> {
  const cid = await client.storeBlob(imageBlob);

  const storageUrl = `https://nftstorage.link/ipfs/${cid}`;
  return storageUrl;
}

export function estimatePromptUpgradeSapphires(prompt: string, promptEngine: string) {
  const askGpt = `Upgrade this prompt: ${prompt} to use with ${promptEngine} image generation`;
  const totalChars = askGpt.length + prompt.length;
  const tokens = Math.ceil(totalChars / 4);
  const sapphireCost = (tokens / 1000) * 2;

  if (sapphireCost < 1) {
    return 2;
  } else {
    return Math.ceil(sapphireCost);
  }
}

export function selectRandomGif() {
  const gifs = [
    "/images/gifs/4k.gif",
    "/images/gifs/dog.gif",
    "/images/gifs/rock.gif",
  ]

  return gifs[Math.floor(Math.random() * gifs.length)]
}
