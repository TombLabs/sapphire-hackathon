import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getUserAccount, transferSapphires } from "../helpers/mongo";
import { SlashCommand } from "../types";



const BalanceCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("gift")
        .setDescription("Transfer Sapphires to another user")
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("How many sapphires to transfer")
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName("recipient")
                .setDescription("The user to transfer the sapphires to")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {

        const from = interaction.user.id
        const to = interaction.options.get("recipient")?.value as string


        try {
            await interaction.reply({ content: "Checking for user accounts..." })
            const fromUser = await getUserAccount(from)
            const toUser = await getUserAccount(to)
            if (!fromUser) return await interaction.editReply({ content: `No account found for your Discord Id.  Please connect your discord on https://app.sapphire-tool.com` })
            if (!toUser) return await interaction.editReply({ content: `No account found for the recipient.  They can connect their discord on https://app.sapphire-tool.com` })
            const amount = interaction.options.get("amount")?.value as number
            const transaction = await transferSapphires(fromUser, toUser, amount)
            if (transaction.isError) return await interaction.editReply({ content: `Error transferring sapphires: ${transaction.error}` })
            await interaction.editReply({ content: `Transfer from ${'<@' + from + '>'} to ${'<@' + to + '>'} for ${amount} successful!` })
        } catch (e) {
            await interaction.editReply({ content: "Error Happened Server Side" })
            console.log(e)
        }
    },
    cooldown: 10
}

export default BalanceCommand;