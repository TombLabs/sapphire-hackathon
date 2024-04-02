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
const HelpCommand = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the bot's commands and how to use it!"),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = new discord_js_1.EmbedBuilder();
            embed.setColor("DarkNavy");
            embed.setTitle("Sapphire Help");
            embed.setDescription(`The Sapphire Bot is your discord connection to the Sapphire App!  Use it to generate images inside discord, check your Sapphire balance and even transfer Sapphires to your friends!\n\nSlash Commands:\n\n\nHELP\n\n/help\n\nUse this command to show this embed with the allowed commands!\n\n\nCREATE\n\n/create leonardo {public} {prompt} {prompt-strength}\n\nUse this command to generate an image using Leonardo AI\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\nprompt-strength - # between 1-30 (Higher is closer to prompt, lower is more creativity)\n\n/create dalle {public} {prompt}\n\nUse this command to generate an image using Dalle-2\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\n\n/create stability txt2img {public} {prompt} {cfg}\n\nUse this command to generate an image using Stability AI\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\ncfg  - # between0-35  (Higher is closer to prompt, lower is more creativity)\n\n/create stability img2img {public} {prompt} {cfg} {init-image-strength} {init-image}\n\nUse this command to generate an image using Stability AI Image to Image\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\ncfg - # between 0-35 (Higher is closer to prompt, lower is more creativity) Default: 7\ninit-image-strength - # between 0-100 (Higher is closer to image, lower for more creativiity) Default: 35\n\nBALANCE\n\n/balance\n\nUse this command to show your current Sapphire balance\n\n\nGIFT\n\n/gift amount recipient\n\nUse this command to gift Sapphires to a fellow account holder (recipient must have connected their discord to receive the sapphires)\n\n\nMore features will be coming soon!\n\n\n\n\n`);
            yield interaction.reply({ embeds: [embed] });
        });
    },
    cooldown: 10
};
exports.default = HelpCommand;
