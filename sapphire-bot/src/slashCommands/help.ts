import { ChannelType, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const HelpCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the bot's commands and how to use it!")
    ,
    async execute(interaction) {
        const embed = new EmbedBuilder()
        embed.setColor("DarkNavy")
        embed.setTitle("Sapphire Help")
        embed.setDescription(`The Sapphire Bot is your discord connection to the Sapphire App!  Use it to generate images inside discord, check your Sapphire balance and even transfer Sapphires to your friends!\n\nSlash Commands:\n\n\nHELP\n\n/help\n\nUse this command to show this embed with the allowed commands!\n\n\nCREATE\n\n/create leonardo {public} {prompt} {prompt-strength}\n\nUse this command to generate an image using Leonardo AI\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\nprompt-strength - # between 1-30 (Higher is closer to prompt, lower is more creativity)\n\n/create dalle {public} {prompt}\n\nUse this command to generate an image using Dalle-2\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\n\n/create stability txt2img {public} {prompt} {cfg}\n\nUse this command to generate an image using Stability AI\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\ncfg  - # between0-35  (Higher is closer to prompt, lower is more creativity)\n\n/create stability img2img {public} {prompt} {cfg} {init-image-strength} {init-image}\n\nUse this command to generate an image using Stability AI Image to Image\n\nOptions: \npublic -true or false (true to display on Sapphire's Web App, false if not)\nprompt -  What you want to generate!\ncfg - # between 0-35 (Higher is closer to prompt, lower is more creativity) Default: 7\ninit-image-strength - # between 0-100 (Higher is closer to image, lower for more creativiity) Default: 35\n\nBALANCE\n\n/balance\n\nUse this command to show your current Sapphire balance\n\n\nGIFT\n\n/gift amount recipient\n\nUse this command to gift Sapphires to a fellow account holder (recipient must have connected their discord to receive the sapphires)\n\n\nMore features will be coming soon!\n\n\n\n\n`)
        await interaction.reply({ embeds: [embed] })
    },
    cooldown: 10
}

export default HelpCommand