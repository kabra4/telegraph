// class to handle commands of the bot

import { Context, Telegraf } from "telegraf";
import { Message, Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";

import { languageCommand } from "../app";
import { startCtx, helpCtx, actionCtx } from "../models/types";
import User from "../models/User";
import Chat from "../models/Chat";
import { commandCtx } from "../models/types";

import {
    chatExists,
    chatFromCtx,
    userExists,
    userFromCtx,
} from "../helpers/UserRegistration";

const ls = LocaleService.Instance;

export default class BasicCommandsController {
    private bot: Telegraf<Context<Update>>;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.start((ctx) => this.start(ctx));
        this.bot.help((ctx) => this.help(ctx));
        this.bot.command("cancel", (ctx) => this.cancel(ctx));
        this.bot.action("delete|this|message", (ctx) => this.deleteThisMessage(ctx));
    }

    public async start(ctx: startCtx): Promise<void> {
        const { user, chat, newUser, newChat } = await this.checkUserAndChat(ctx);

        ls.setLocale(chat.language);
        ctx.replyWithMarkdownV2(ls.__("start"));

        if (newChat) {
            languageCommand.askLanguage(ctx, chat.language);
        }
    }

    public async help(ctx: helpCtx): Promise<void> {
        ls.set(ctx);
        let reply_text = "";
        for (let i = 0; i < 5; i++) {
            reply_text += ls.__("help." + i.toString()) + "\n";
        }
        ctx.reply(reply_text);
    }

    public async cancel(ctx: commandCtx): Promise<void> {
        const user = await User.findUser(ctx.from.id);
        user.updateCurrentlyDoing("");
    }

    public async checkUserAndChat(
        ctx: startCtx
    ): Promise<{ user: User; chat: Chat; newUser: boolean; newChat: boolean }> {
        const newUser = !(await userExists(ctx.from.id));
        const user = await userFromCtx(ctx);

        let newChat = !(await chatExists(ctx.chat.id));
        const chat = await chatFromCtx(ctx);

        return { user, chat, newUser, newChat };
    }

    public async deleteThisMessage(ctx: actionCtx): Promise<void> {
        await ctx.deleteMessage();
    }
}
