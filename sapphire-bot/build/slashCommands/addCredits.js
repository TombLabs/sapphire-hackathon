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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongo_1 = require("../helpers/mongo");
const admin_json_1 = __importDefault(require("../lib/jsons/admin.json"));
const AddCreditsCommand = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName("add-credits")
        .setDescription("Give Sapphires to a user")
        .addUserOption(option => option.setName("recipient")
        .setDescription("The user to give sapphires to")
        .setRequired(true))
        .addIntegerOption(option => option.setName("amount")
        .setDescription("How many sapphires to give")
        .setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.MentionEveryone | discord_js_1.PermissionFlagsBits.BanMembers | discord_js_1.PermissionFlagsBits.ManageChannels),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const discordId = interaction.user.id;
            const recipientId = (_a = interaction.options.get("recipient")) === null || _a === void 0 ? void 0 : _a.value;
            const amount = (_b = interaction.options.get("amount")) === null || _b === void 0 ? void 0 : _b.value;
            if (!admin_json_1.default.includes(discordId))
                return yield interaction.reply({ content: "You do not have permission to use this command" });
            try {
                yield interaction.reply({ content: "Checking for user account..." });
                const user = yield (0, mongo_1.getUserAccount)(recipientId);
                if (!user)
                    return yield interaction.editReply({ content: `No account found for recipient Discord Id. They must connect their discord on https://app.sapphire-tool.com` });
                user.sapphires += amount;
                yield user.save();
                yield interaction.editReply({ content: `You have given ${amount} sapphires to <@${recipientId}>` });
            }
            catch (e) {
                yield interaction.editReply({ content: "Error Happened Server Side" });
                console.log(e);
            }
        });
    },
    cooldown: 10
};
exports.default = AddCreditsCommand;
