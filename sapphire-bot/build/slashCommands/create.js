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
const discord_js_1 = require("discord.js");
const common_1 = require("../helpers/common");
const dalle_1 = require("../helpers/dalle");
const leonardo_1 = require("../helpers/leonardo");
const stability_1 = require("../helpers/stability");
const CreateCommand = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName("create")
        .setDescription("Creates a generation from Sapphire")
        .addSubcommand(subcommand => subcommand.setName("dalle")
        .setDescription("Generates an image with Dalle-2")
        .addBooleanOption(option => option.setName("public")
        .setDescription("Whether or not to make the generation public")
        .setRequired(true))
        .addStringOption(option => option.setName("prompt")
        .setDescription("The prompt to use for generation")
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("leonardo")
        .setDescription("Generates an image with Leonardo")
        .addBooleanOption(option => option.setName("public")
        .setDescription("Whether or not to make the generation public")
        .setRequired(true))
        .addStringOption(option => option.setName("prompt")
        .setDescription("The prompt to use for generation")
        .setRequired(true))
        .addIntegerOption(option => option.setName("prompt-strength")
        .setDescription("How Closely to follow the prompt. 1 is the lowest, 20 is the highest.")
        .setRequired(true)))
        .addSubcommandGroup(subcommandGroup => subcommandGroup.setName("stability")
        .setDescription("Generates an image with Stability Txt 2 Img or Img 2 Img")
        .addSubcommand(subcommand => subcommand.setName("txt2img")
        .setDescription("Generates an image with Stability Txt 2 Img")
        .addBooleanOption(option => option.setName("public")
        .setDescription("Whether or not to make the generation public")
        .setRequired(true))
        .addStringOption(option => option.setName("prompt")
        .setDescription("The prompt to use for generation")
        .setRequired(true))
        .addIntegerOption(option => option.setName("cfg")
        .setDescription("How closely the generator follows the prompt.  0-35. 7 is default")
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("img2img")
        .setDescription("Generates an image with Stability Img 2 Img")
        .addBooleanOption(option => option.setName("public")
        .setDescription("Whether or not to make the generation public")
        .setRequired(true))
        .addStringOption(option => option.setName("prompt")
        .setDescription("The prompt to use for generation")
        .setRequired(true))
        .addIntegerOption(option => option.setName("cfg")
        .setDescription("How closely the generator follows the prompt.  0-35. 7 is default")
        .setRequired(true))
        .addIntegerOption(option => option.setName("init-image-strength")
        .setDescription("How closely the generator follows the initial image.  0-100. 35 is default")
        .setRequired(true))
        .addAttachmentOption(option => option.setName("init-image")
        .setDescription("The initial image to use for generation")
        .setRequired(true))))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages),
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const subcommand = interaction.options.getSubcommand();
        const prompt = (_a = interaction.options.get("prompt")) === null || _a === void 0 ? void 0 : _a.value;
        const promptStrength = (_b = interaction.options.get("prompt-strength")) === null || _b === void 0 ? void 0 : _b.value;
        const cfg = (_c = interaction.options.get("cfg")) === null || _c === void 0 ? void 0 : _c.value;
        const initImageStrength = parseFloat((((_d = interaction.options.get("init-image-strength")) === null || _d === void 0 ? void 0 : _d.value) / 100).toFixed(2));
        const initImage = (_e = interaction.options.getAttachment("init-image")) === null || _e === void 0 ? void 0 : _e.url;
        const isPublic = (_f = interaction.options.get("public")) === null || _f === void 0 ? void 0 : _f.value;
        const discordId = interaction.user.id;
        try {
            if (subcommand === "dalle") {
                yield interaction.reply("Generating an Image with Dalle-2 (Building image...)");
                const image = yield (0, dalle_1.generateDalleImage)(prompt, discordId, isPublic);
                if (image.error) {
                    yield interaction.editReply({ content: image.error });
                }
                else {
                    const funnyResponse = (0, common_1.getRandomImageResponse)();
                    const blob = yield (0, common_1.getBlobFromUrl)(image.image);
                    yield interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` });
                }
            }
            else if (subcommand === "leonardo") {
                yield interaction.reply("Generating an Image with Leonardo AI (Building image...)");
                const image = yield (0, leonardo_1.generateLeonardoImage)(prompt, promptStrength, discordId, isPublic);
                if (image.error) {
                    yield interaction.editReply({ content: image.error });
                }
                else {
                    const funnyResponse = (0, common_1.getRandomImageResponse)();
                    const blob = yield (0, common_1.getBlobFromUrl)(image.image);
                    yield interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` });
                }
            }
            else if (subcommand === "txt2img") {
                yield interaction.reply("Generating an Image with Stability Txt 2 Img (Building image...)");
                const image = yield (0, stability_1.generateStabilityTxt2Img)(prompt, cfg, discordId, isPublic);
                if (image.error) {
                    yield interaction.editReply({ content: image.error });
                }
                else {
                    const funnyResponse = (0, common_1.getRandomImageResponse)();
                    const blob = yield (0, common_1.getBlobFromUrl)(image.image);
                    yield interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` });
                }
            }
            else if (subcommand === "img2img") {
                yield interaction.reply("Generating an Image with Stability Img 2 Img (Building image...)");
                const image = yield (0, stability_1.generateStabilityImg2Img)(prompt, cfg, discordId, isPublic, initImageStrength, initImage);
                if (image.error) {
                    yield interaction.editReply({ content: image.error });
                }
                else {
                    const funnyResponse = (0, common_1.getRandomImageResponse)();
                    const blob = yield (0, common_1.getBlobFromUrl)(image.image);
                    yield interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` });
                }
            }
            else {
                yield interaction.reply({ content: "No valid engine selected, please use '/create leonardo', '/create dalle', '/create stability txt2img' or '/create stability img2img'." });
            }
        }
        catch (e) {
            yield interaction.editReply({ content: "Error Happened Server Side" });
            console.log(e);
        }
    }),
    cooldown: 10
};
exports.default = CreateCommand;
