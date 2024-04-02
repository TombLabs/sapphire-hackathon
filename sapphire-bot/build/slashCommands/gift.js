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
        .setName("gift")
        .setDescription("Transfer Sapphires to another user")
        .addIntegerOption(option => option.setName("amount")
        .setDescription("How many sapphires to transfer")
        .setRequired(true))
        .addUserOption(option => option.setName("recipient")
        .setDescription("The user to transfer the sapphires to")
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const from = interaction.user.id;
            const to = (_a = interaction.options.get("recipient")) === null || _a === void 0 ? void 0 : _a.value;
            try {
                yield interaction.reply({ content: "Checking for user accounts..." });
                const fromUser = yield (0, mongo_1.getUserAccount)(from);
                const toUser = yield (0, mongo_1.getUserAccount)(to);
                if (!fromUser)
                    return yield interaction.editReply({ content: `No account found for your Discord Id.  Please connect your discord on https://app.sapphire-tool.com` });
                if (!toUser)
                    return yield interaction.editReply({ content: `No account found for the recipient.  They can connect their discord on https://app.sapphire-tool.com` });
                const amount = (_b = interaction.options.get("amount")) === null || _b === void 0 ? void 0 : _b.value;
                const transaction = yield (0, mongo_1.transferSapphires)(fromUser, toUser, amount);
                if (transaction.isError)
                    return yield interaction.editReply({ content: `Error transferring sapphires: ${transaction.error}` });
                yield interaction.editReply({ content: `Transfer from ${'<@' + from + '>'} to ${'<@' + to + '>'} for ${amount} successful!` });
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
