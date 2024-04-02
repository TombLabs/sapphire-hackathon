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
exports.generateStabilityImg2Img = exports.generateStabilityTxt2Img = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const common_1 = require("./common");
const mongo_1 = require("./mongo");
function generateStabilityTxt2Img(prompt, cfg, discordId, isPublic) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, mongo_1.getUserAccount)(discordId);
        if (!user)
            return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" };
        const engineId = 'stable-diffusion-xl-1024-v1-0';
        const apiHost = (_a = process.env.API_HOST) !== null && _a !== void 0 ? _a : 'https://api.stability.ai';
        const apiKey = process.env.STABILITY_AI_KEY;
        if (!apiKey)
            return { isError: true, error: "No API key found" };
        const url = `${apiHost}/v1/generation/${engineId}/text-to-image`;
        try {
            const { data } = yield axios_1.default.post(url, JSON.stringify({
                text_prompts: [
                    {
                        "text": prompt,
                    }
                ],
                cfg_scale: cfg,
                height: 1024,
                width: 1024,
                steps: 50,
                samples: 1
            }), {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const base64Image = data.artifacts[0].base64;
            const blob = (0, common_1.convertB64toBlob)(base64Image);
            const storageUrl = yield (0, common_1.storeImageBlob)(blob);
            const generationData = {
                image: storageUrl,
                sapphireCost: 10,
                aiEngine: "Leonardo",
                prompt: prompt,
                isPublic: isPublic,
                img2Img: false,
                promptAssist: false,
                likes: 0,
                createdAt: Date.now(),
            };
            //update User
            yield (0, mongo_1.updateUserOnGeneration)(generationData, user);
            //if public, add public generation
            if (isPublic) {
                yield (0, mongo_1.addPublicGeneration)(generationData, user._id, user.name);
            }
            return { isError: false, image: storageUrl };
        }
        catch (e) {
            console.log(e);
            return { isError: true, error: "Something went wrong" };
        }
    });
}
exports.generateStabilityTxt2Img = generateStabilityTxt2Img;
function generateStabilityImg2Img(prompt, cfg, discordId, isPublic, initImageStrength, initImage) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, mongo_1.getUserAccount)(discordId);
        if (!user)
            return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" };
        const engineId = 'stable-diffusion-xl-1024-v1-0';
        const apiHost = (_a = process.env.API_HOST) !== null && _a !== void 0 ? _a : 'https://api.stability.ai';
        const apiKey = process.env.STABILITY_AI_KEY;
        if (!apiKey)
            return { isError: true, error: "No API key found" };
        const url = `${apiHost}/v1/generation/${engineId}/image-to-image`;
        const imageString = yield (0, common_1.handleImagePreparation)(initImage);
        try {
            const formData = new form_data_1.default();
            formData.append("init_image", imageString);
            formData.append("init_image_mode", "IMAGE_STRENGTH");
            formData.append("image_strength", initImageStrength);
            formData.append("text_prompts[0][text]", prompt);
            formData.append("cfg_scale", cfg);
            formData.append("samples", 1);
            formData.append("steps", 50);
            //generate the image
            const response = yield axios_1.default.post(`${apiHost}/v1/generation/${engineId}/image-to-image`, formData, {
                headers: Object.assign(Object.assign({}, formData.getHeaders()), { Accept: "application/json", Authorization: `Bearer ${apiKey}` }),
            });
            if (response.status !== 200) {
                throw new Error(`Non-200 response: ${yield response.data}`);
            }
            const responseJSON = response.data;
            const base64Image = responseJSON.artifacts[0].base64;
            //convert and store image
            const blob = (0, common_1.convertB64toBlob)(base64Image);
            const storageUrl = yield (0, common_1.storeImageBlob)(blob);
            const referenceImage = initImage;
            //create the generation data for db storage
            const generationData = {
                image: storageUrl,
                sapphireCost: 10,
                aiEngine: "Stability",
                prompt: prompt,
                isPublic: isPublic,
                img2Img: true,
                referenceImage: referenceImage,
                promptAssist: false,
                likes: 0,
                createdAt: Date.now(),
            };
            //update User
            yield (0, mongo_1.updateUserOnGeneration)(generationData, user);
            //update public generations
            if (isPublic) {
                yield (0, mongo_1.addPublicGeneration)(generationData, user._id, user.name);
            }
            return { isError: false, image: storageUrl };
        }
        catch (e) {
            console.log(e);
            return { isError: true, error: "Something went wrong" };
        }
    });
}
exports.generateStabilityImg2Img = generateStabilityImg2Img;
