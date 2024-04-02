"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.onGenerationComplete = exports.executeGenerationRequest = exports.buildGenerationRequest = exports.isNSFWFilteredArtifact = exports.isImageArtifact = void 0;
const Generation = __importStar(require("../lib/generations/generation_pb"));
const isImageArtifact = (artifact) => artifact.getType() === Generation.ArtifactType.ARTIFACT_IMAGE &&
    artifact.getFinishReason() === Generation.FinishReason.NULL &&
    artifact.hasBinary();
exports.isImageArtifact = isImageArtifact;
const isNSFWFilteredArtifact = (artifact) => artifact.getType() === Generation.ArtifactType.ARTIFACT_IMAGE &&
    artifact.getFinishReason() === Generation.FinishReason.FILTER;
exports.isNSFWFilteredArtifact = isNSFWFilteredArtifact;
/** Builds a generation request for a specified engine with the specified parameters. */
function buildGenerationRequest(engineID, params) {
    if (params.type === "upscaling") {
        const request = new Generation.Request();
        request.setEngineId(engineID);
        request.setRequestedType(Generation.ArtifactType.ARTIFACT_IMAGE);
        request.setClassifier(new Generation.ClassifierParameters());
        const imageParams = new Generation.ImageParameters();
        if ("width" in params && !!params.width) {
            imageParams.setWidth(params.width);
        }
        else if ("height" in params && !!params.height) {
            imageParams.setHeight(params.height);
        }
        request.setImage(imageParams);
        request.addPrompt(createInitImagePrompt(params.initImage));
        return request;
    }
    const imageParams = new Generation.ImageParameters();
    if (params.type === "text-to-image") {
        params.width && imageParams.setWidth(params.width);
        params.height && imageParams.setHeight(params.height);
    }
    // Set the number of images to generate (Default 1)
    params.samples && imageParams.setSamples(params.samples);
    // Set the steps (Default 30)
    // Represents the amount of inference steps performed on image generation.
    params.steps && imageParams.setSteps(params.steps);
    // Set the seed (Default 0)
    // Including a seed will cause the results to be deterministic.
    // Omitting the seed or setting it to `0` will do the opposite.
    params.seed && imageParams.addSeed(params.seed);
    // Set the sampler (Default 'automatic')
    // Omitting this value enables 'automatic' mode where we choose the best sampler for you based
    // on the current payload. For example, since CLIP guidance only works on ancestral samplers,
    // when CLIP guidance is enabled, we will automatically choose an ancestral sampler for you.
    if (params.sampler) {
        const transformType = new Generation.TransformType();
        transformType.setDiffusion(params.sampler);
        imageParams.setTransform(transformType);
    }
    // Set the Engine
    // At the time of writing, valid engines are:
    //  stable-diffusion-v1,
    //  stable-diffusion-v1-5
    //  stable-diffusion-512-v2-0
    //  stable-diffusion-768-v2-0
    //  stable-diffusion-512-v2-1
    //  stable-diffusion-768-v2-1
    //  stable-inpainting-v1-0
    //  stable-inpainting-512-v2-0
    //  stable-diffusion-xl-beta-v2-2-2
    //  stable-diffusion-xl-1024-v0-9
    //  stable-diffusion-xl-1024-v1-0
    //  esrgan-v1-x2plus
    const request = new Generation.Request();
    request.setEngineId(engineID);
    request.setRequestedType(Generation.ArtifactType.ARTIFACT_IMAGE);
    request.setClassifier(new Generation.ClassifierParameters());
    // Set the CFG scale (Default 7)
    // Influences how strongly your generation is guided to match your prompt.  Higher values match closer.
    const samplerParams = new Generation.SamplerParameters();
    params.cfgScale && samplerParams.setCfgScale(params.cfgScale);
    const stepParams = new Generation.StepParameter();
    stepParams.setScaledStep(0);
    stepParams.setSampler(samplerParams);
    const scheduleParams = new Generation.ScheduleParameters();
    if (params.type === "image-to-image") {
        // If we're doing image-to-image generation then we need to configure
        // how much influence the initial image has on the diffusion process
        scheduleParams.setStart(params.stepScheduleStart);
        if (params.stepScheduleEnd) {
            scheduleParams.setEnd(params.stepScheduleEnd);
        }
    }
    else if (params.type === "image-to-image-masking") {
        // Step schedule start is always 1 for masking requests
        scheduleParams.setStart(1);
    }
    stepParams.setSchedule(scheduleParams);
    // Set CLIP Guidance (Default: None)
    // NOTE: This only works with ancestral samplers. Omitting the sampler parameter above will ensure
    // that we automatically choose an ancestral sampler for you when CLIP guidance is enabled.
    if (params.clipGuidancePreset) {
        const guidanceParameters = new Generation.GuidanceParameters();
        guidanceParameters.setGuidancePreset(params.clipGuidancePreset);
        stepParams.setGuidance(guidanceParameters);
    }
    imageParams.addParameters(stepParams);
    request.setImage(imageParams);
    params.prompts.forEach((textPrompt) => {
        const prompt = new Generation.Prompt();
        prompt.setText(textPrompt.text);
        // If provided, set the prompt's weight (use negative values for negative weighting)
        if (textPrompt.weight) {
            const promptParameters = new Generation.PromptParameters();
            promptParameters.setWeight(textPrompt.weight);
            prompt.setParameters(promptParameters);
        }
        request.addPrompt(prompt);
    });
    // Add image prompts if we're doing some kind of image-to-image generation or upscaling
    if (params.type === "image-to-image") {
        request.addPrompt(createInitImagePrompt(params.initImage));
    }
    else if (params.type === "image-to-image-masking") {
        request.addPrompt(createInitImagePrompt(params.initImage));
        request.addPrompt(createMaskImagePrompt(params.maskImage));
    }
    return request;
}
exports.buildGenerationRequest = buildGenerationRequest;
function createInitImagePrompt(imageBinary) {
    const initImageArtifact = new Generation.Artifact();
    initImageArtifact.setBinary(imageBinary);
    initImageArtifact.setType(Generation.ArtifactType.ARTIFACT_IMAGE);
    const initImageParameters = new Generation.PromptParameters();
    initImageParameters.setInit(true);
    const initImagePrompt = new Generation.Prompt();
    initImagePrompt.setParameters(initImageParameters);
    initImagePrompt.setArtifact(initImageArtifact);
    return initImagePrompt;
}
function createMaskImagePrompt(imageBinary) {
    const maskImageArtifact = new Generation.Artifact();
    maskImageArtifact.setBinary(imageBinary);
    maskImageArtifact.setType(Generation.ArtifactType.ARTIFACT_MASK);
    const maskImagePrompt = new Generation.Prompt();
    maskImagePrompt.setArtifact(maskImageArtifact);
    return maskImagePrompt;
}
/** Executes a GenerationRequest, abstracting the gRPC streaming result behind a Promise */
function executeGenerationRequest(generationClient, request, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stream = generationClient.generate(request, metadata);
            const answers = yield new Promise((resolve, reject) => {
                const answers = new Array();
                stream.on("data", (data) => answers.push(data));
                stream.on("end", () => resolve(answers));
                stream.on("status", (status) => {
                    if (status.code === 0)
                        return;
                    reject(status.details);
                });
            });
            return extractArtifacts(answers);
        }
        catch (err) {
            return err instanceof Error ? err : new Error(JSON.stringify(err));
        }
    });
}
exports.executeGenerationRequest = executeGenerationRequest;
function extractArtifacts(answers) {
    const imageArtifacts = new Array();
    const filteredArtifacts = new Array();
    for (const answer of answers) {
        for (const artifact of answer.getArtifactsList()) {
            if ((0, exports.isImageArtifact)(artifact)) {
                imageArtifacts.push(artifact);
            }
            else if ((0, exports.isNSFWFilteredArtifact)(artifact)) {
                filteredArtifacts.push(artifact);
            }
        }
    }
    return { filteredArtifacts, imageArtifacts };
}
/** Generation completion handler - replace this with your own logic  */
function onGenerationComplete(response) {
    if (response instanceof Error) {
        console.error("Generation failed", response);
        throw response;
    }
    console.log(`${response.imageArtifacts.length} image${response.imageArtifacts.length > 1 ? "s" : ""} were successfully generated.`);
    // Do something with NSFW filtered artifacts
    if (response.filteredArtifacts.length > 0) {
        return {
            error: `${response.filteredArtifacts.length} artifact` +
                `${response.filteredArtifacts.length > 1 ? "s" : ""}` +
                ` were filtered by the NSFW classifier and need to be retried.`
        };
    }
    // Do something with the successful image artifacts
    try {
        return response.imageArtifacts[0].getBinary_asB64();
    }
    catch (error) {
        console.error("Failed to write resulting image to disk", error);
    }
    // For browser implementations: you could use the `artifact.getBinary_asB64()` method to get a
    // base64 encoded string and then create a data URL from that and display it in an <img> tag.
}
exports.onGenerationComplete = onGenerationComplete;
