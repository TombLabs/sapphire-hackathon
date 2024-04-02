import { Client, Collection, GatewayIntentBits, PermissionFlagsBits, } from "discord.js";

import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "./types";
const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits
const client = new Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers] })
require('dotenv').config()

client.slashCommands = new Collection<string, SlashCommand>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    if (!handler.endsWith(".ts")) return;
    require(`${handlersDir}/${handler}`)(client)
})


client.login(process.env.TOKEN)
