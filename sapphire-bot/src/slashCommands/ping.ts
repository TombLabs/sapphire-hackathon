import { ChannelType, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's ping")
    ,
    async execute(interaction) {
        await interaction.reply({ content: "Hello, it me." })
    },
    cooldown: 10
}

export default command