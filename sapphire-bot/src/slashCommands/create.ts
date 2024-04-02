import { APIApplication, APIApplicationCommand, APIApplicationCommandOptionChoice, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getBlobFromUrl, getRandomImageResponse } from "../helpers/common";
import { generateDalleImage } from "../helpers/dalle";
import { generateLeonardoImage } from "../helpers/leonardo";
import { generateStabilityImg2Img, generateStabilityTxt2Img } from "../helpers/stability";
import { SlashCommand } from "../types";



const CreateCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Creates a generation from Sapphire")
        .addSubcommand(subcommand =>
            subcommand.setName("dalle")
                .setDescription("Generates an image with Dalle-2")
                .addBooleanOption(option =>
                    option.setName("public")
                        .setDescription("Whether or not to make the generation public")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("prompt")
                        .setDescription("The prompt to use for generation")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("leonardo")
                .setDescription("Generates an image with Leonardo")
                .addBooleanOption(option =>
                    option.setName("public")
                        .setDescription("Whether or not to make the generation public")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("prompt")
                        .setDescription("The prompt to use for generation")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("prompt-strength")
                        .setDescription("How Closely to follow the prompt. 1 is the lowest, 20 is the highest.")
                        .setRequired(true)
                )
        )
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup.setName("stability")
                .setDescription("Generates an image with Stability Txt 2 Img or Img 2 Img")
                .addSubcommand(subcommand =>
                    subcommand.setName("txt2img")
                        .setDescription("Generates an image with Stability Txt 2 Img")
                        .addBooleanOption(option =>
                            option.setName("public")
                                .setDescription("Whether or not to make the generation public")
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName("prompt")
                                .setDescription("The prompt to use for generation")
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option.setName("cfg")
                                .setDescription("How closely the generator follows the prompt.  0-35. 7 is default")
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName("img2img")
                        .setDescription("Generates an image with Stability Img 2 Img")
                        .addBooleanOption(option =>
                            option.setName("public")
                                .setDescription("Whether or not to make the generation public")
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName("prompt")
                                .setDescription("The prompt to use for generation")
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option.setName("cfg")
                                .setDescription("How closely the generator follows the prompt.  0-35. 7 is default")
                                .setRequired(true)
                        )
                        .addIntegerOption(option =>
                            option.setName("init-image-strength")
                                .setDescription("How closely the generator follows the initial image.  0-100. 35 is default")
                                .setRequired(true)
                        )
                        .addAttachmentOption(option =>
                            option.setName("init-image")
                                .setDescription("The initial image to use for generation")
                                .setRequired(true)
                        )

                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async (interaction) => {

        const subcommand = interaction.options.getSubcommand()
        const prompt = interaction.options.get("prompt")?.value as string
        const promptStrength = interaction.options.get("prompt-strength")?.value as number
        const cfg = interaction.options.get("cfg")?.value as number
        const initImageStrength = parseFloat((interaction.options.get("init-image-strength")?.value as number / 100).toFixed(2))
        const initImage = interaction.options.getAttachment("init-image")?.url as string
        const isPublic = interaction.options.get("public")?.value as boolean
        const discordId = interaction.user.id

        try {
            if (subcommand === "dalle") {

                await interaction.reply("Generating an Image with Dalle-2 (Building image...)")
                const image = await generateDalleImage(prompt, discordId, isPublic)

                if (image.error) {
                    await interaction.editReply({ content: image.error })
                } else {
                    const funnyResponse = getRandomImageResponse()
                    const blob = await getBlobFromUrl(image.image!)
                    await interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` })
                }
            } else if (subcommand === "leonardo") {
                await interaction.reply("Generating an Image with Leonardo AI (Building image...)")
                const image = await generateLeonardoImage(prompt, promptStrength, discordId, isPublic)
                if (image.error) {
                    await interaction.editReply({ content: image.error })
                } else {
                    const funnyResponse = getRandomImageResponse()
                    const blob = await getBlobFromUrl(image.image!)
                    await interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` })
                }
            } else if (subcommand === "txt2img") {
                await interaction.reply("Generating an Image with Stability Txt 2 Img (Building image...)")
                const image = await generateStabilityTxt2Img(prompt, cfg, discordId, isPublic)
                if (image.error) {
                    await interaction.editReply({ content: image.error })
                } else {
                    const funnyResponse = getRandomImageResponse()
                    const blob = await getBlobFromUrl(image.image!)
                    await interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` })
                }
            } else if (subcommand === "img2img") {
                await interaction.reply("Generating an Image with Stability Img 2 Img (Building image...)")
                const image = await generateStabilityImg2Img(prompt, cfg, discordId, isPublic, initImageStrength, initImage)
                if (image.error) {
                    await interaction.editReply({ content: image.error })
                } else {
                    const funnyResponse = getRandomImageResponse()
                    const blob = await getBlobFromUrl(image.image!)
                    await interaction.editReply({ content: `${'<@' + interaction.user.id + '>'}... ${funnyResponse}... ${image.image}` })
                }
            } else {
                await interaction.reply({ content: "No valid engine selected, please use '/create leonardo', '/create dalle', '/create stability txt2img' or '/create stability img2img'." })
            }
        } catch (e) {
            await interaction.editReply({ content: "Error Happened Server Side" })
            console.log(e)
        }
    },
    cooldown: 10
}

export default CreateCommand;