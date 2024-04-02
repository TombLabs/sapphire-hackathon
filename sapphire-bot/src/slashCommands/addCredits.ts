import { APIApplication, APIApplicationCommand, APIApplicationCommandOptionChoice, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getBlobFromUrl, getRandomImageResponse } from "../helpers/common";
import { generateDalleImage } from "../helpers/dalle";
import { generateLeonardoImage } from "../helpers/leonardo";
import { getUserAccount } from "../helpers/mongo";
import admin from '../lib/jsons/admin.json';
import { SlashCommand } from "../types";



const AddCreditsCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("add-credits")
        .setDescription("Give Sapphires to a user")
        .addUserOption(option =>
            option.setName("recipient")
                .setDescription("The user to give sapphires to")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("How many sapphires to give")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ManageChannels),
    async execute(interaction) {

        const discordId = interaction.user.id
        const recipientId = interaction.options.get("recipient")?.value as string
        const amount = interaction.options.get("amount")?.value as number
        if (!admin.includes(discordId)) return await interaction.reply({ content: "You do not have permission to use this command" })

        try {
            await interaction.reply({ content: "Checking for user account..." })
            const user = await getUserAccount(recipientId)
            if (!user) return await interaction.editReply({ content: `No account found for recipient Discord Id. They must connect their discord on https://app.sapphire-tool.com` })
            user.sapphires += amount
            await user.save()
            await interaction.editReply({ content: `You have given ${amount} sapphires to <@${recipientId}>` })
        } catch (e) {
            await interaction.editReply({ content: "Error Happened Server Side" })
            console.log(e)
        }
    },
    cooldown: 10
}

export default AddCreditsCommand;