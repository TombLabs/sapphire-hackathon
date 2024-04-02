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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLeonardoImage = void 0;
const sdk_1 = require("@leonardo-ai/sdk");
const common_1 = require("./common");
const mongo_1 = require("./mongo");
require("dotenv").config();
function generateLeonardoImage(prompt, promptStrength, discordId, isPublic) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, mongo_1.getUserAccount)(discordId);
        if (!user)
            return { isError: true, error: "Sapphire User Account not found! Please connect your discord at https://app.sapphire-tool.com" };
        const LEONARDO_KEY = process.env.LEONARDO_KEY;
        const sdk = new sdk_1.Leonardo({
            bearerAuth: LEONARDO_KEY,
        });
        let generationId = undefined;
        try {
            yield sdk.generation
                .createGeneration({
                height: 512,
                guidanceScale: promptStrength,
                numImages: 1,
                numInferenceSteps: 50,
                prompt: prompt,
                promptMagic: true,
            })
                .then((result) => {
                var _a, _b;
                if (result.statusCode == 200) {
                    // handle response
                    generationId =
                        (_b = (_a = result.createGeneration200ApplicationJSONObject) === null || _a === void 0 ? void 0 : _a.sdGenerationJob) === null || _b === void 0 ? void 0 : _b.generationId;
                }
            })
                .catch((err) => {
                // handle error
                console.log(err);
                return { isError: true, error: "Error Happened Server Side" };
            });
            let image_url = undefined;
            let retryCount = 0;
            const fuckLeonardo = () => __awaiter(this, void 0, void 0, function* () {
                yield sdk.generation
                    .getGenerationById(generationId)
                    .then((result) => {
                    var _a, _b, _c;
                    if (result.statusCode == 200) {
                        // handle response
                        image_url =
                            (_c = (_b = (_a = result.getGenerationById200ApplicationJSONObject) === null || _a === void 0 ? void 0 : _a.generationsByPk) === null || _b === void 0 ? void 0 : _b.generatedImages) === null || _c === void 0 ? void 0 : _c[0].url;
                    }
                })
                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                    // handle error
                    if (retryCount < 6) {
                        retryCount++;
                        console.log("retrying");
                        yield (0, common_1.sleep)(4000);
                        yield fuckLeonardo();
                    }
                    else {
                        console.log(err);
                        return { isError: true, error: "Error happened server side" };
                    }
                }));
            });
            yield fuckLeonardo();
            if (!image_url) {
                return { isError: true, error: "Error occured Server Side" };
            }
            //store the image on nft.storage
            const storageUrl = yield (0, common_1.storeImage)(image_url);
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
exports.generateLeonardoImage = generateLeonardoImage;
