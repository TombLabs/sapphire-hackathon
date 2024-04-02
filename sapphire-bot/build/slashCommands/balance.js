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
const mongo_1 = require("../helpers/mongo");
const BalanceCommand = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your Sapphire balance")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const discordId = interaction.user.id;
            try {
                yield interaction.reply({ content: "Checking for user account..." });
                const user = yield (0, mongo_1.getUserAccount)(discordId);
                if (!user)
                    return yield interaction.editReply({ content: `No account found for your Discord Id.  Please connect your discord on https://app.sapphire-tool.com` });
                yield interaction.editReply({ content: `You have ${user.sapphires} sapphires` });
            }
            catch (e) {
                yield interaction.editReply({ content: "Error Happened Server Side" });
                console.log(e);
            }
        });
    },
    cooldown: 10
};
exports.default = BalanceCommand;
