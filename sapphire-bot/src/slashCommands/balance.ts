import { APIApplication, APIApplicationCommand, APIApplicationCommandOptionChoice, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getBlobFromUrl, getRandomImageResponse } from "../helpers/common";
import { generateDalleImage } from "../helpers/dalle";
import { generateLeonardoImage } from "../helpers/leonardo";
import { getUserAccount } from "../helpers/mongo";
import { SlashCommand } from "../types";



const BalanceCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your Sapphire balance")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {

        const discordId = interaction.user.id


        try {
            await interaction.reply({ content: "Checking for user account..." })
            const user = await getUserAccount(discordId)
            if (!user) return await interaction.editReply({ content: `No account found for your Discord Id.  Please connect your discord on https://app.sapphire-tool.com` })
            await interaction.editReply({ content: `You have ${user.sapphires} sapphires` })
        } catch (e) {
            await interaction.editReply({ content: "Error Happened Server Side" })
            console.log(e)
        }
    },
    cooldown: 10
}

export default BalanceCommand;