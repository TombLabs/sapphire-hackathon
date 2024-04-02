"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImagePreparation = exports.storeImageBlob = exports.convertB64toBlob = exports.getBlobFromUrl = exports.getRandomImageResponse = exports.storeImage = exports.sleep = void 0;
const axios_1 = __importDefault(require("axios"));
const nft_storage_1 = require("nft.storage");
const sharp_1 = __importDefault(require("sharp"));
const randomResponse_json_1 = __importDefault(require("../lib/jsons/randomResponse.json"));
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
const key = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
const client = new nft_storage_1.NFTStorage({ token: key });
{
    /* IMAGE HELPERS */
}
//store image on nft.storage
function storeImage(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgReq = yield fetch(process.env.NEXT_PUBLIC_CORS_PROXY_URL + imageUrl);
        const image = yield imgReq.blob();
        const cid = yield client.storeBlob(image);
        const storageUrl = `https://nftstorage.link/ipfs/${cid}`;
        return storageUrl;
    });
}
exports.storeImage = storeImage;
function getRandomImageResponse() {
    return randomResponse_json_1.default[Math.floor(Math.random() * randomResponse_json_1.default.length)];
}
exports.getRandomImageResponse = getRandomImageResponse;
function getBlobFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgReq = yield fetch(process.env.NEXT_PUBLIC_CORS_PROXY_URL + url);
        const image = yield imgReq.blob();
        return image;
    });
}
exports.getBlobFromUrl = getBlobFromUrl;
function convertB64toBlob(b64) {
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
exports.convertB64toBlob = convertB64toBlob;
function storeImageBlob(imageBlob) {
    return __awaiter(this, void 0, void 0, function* () {
        const cid = yield client.storeBlob(imageBlob);
        const storageUrl = `https://nftstorage.link/ipfs/${cid}`;
        return storageUrl;
    });
}
exports.storeImageBlob = storeImageBlob;
function handleImagePreparation(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(url, {
            responseType: "arraybuffer",
        });
        //resize image
        const resized = yield (0, sharp_1.default)(data).resize(1024, 1024).toBuffer();
        return resized;
    });
}
exports.handleImagePreparation = handleImagePreparation;
