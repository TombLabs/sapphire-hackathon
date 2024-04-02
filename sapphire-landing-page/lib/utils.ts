import axios from "axios";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
