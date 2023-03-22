// class to handle commands of the bot

import { Context, Telegraf } from "telegraf";
import { Message, Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";

import { languageCommand } from "../app";
import { startCtx, helpCtx } from "../models/types";
import User from "../models/User";
import Chat from "../models/Chat";

const ls = LocaleService.Instance;

export default class BasicCommandsController {
    private bot: Telegraf<Context<Update>>;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.start((ctx) => this.start(ctx));
        this.bot.help((ctx) => this.help(ctx));
    }

    public async start(ctx: startCtx): Promise<void> {
        let user = await User.findUser(ctx.from.id);
        if (user.data) {
            ls.setLocale(user.language);
            ctx.reply(ls.__("start"));
        } else {
            await user.create(
                ctx.from.id,
                ctx.from.first_name,
                ctx.from.username,
                ctx.from.last_name,
                ctx.from.language_code
            );
            languageCommand.askLanguage(ctx.from.id, user.language);
        }
        let chat = await Chat.findChat(ctx.chat.id);
        if (!chat.data) {
            await chat.create(ctx.chat.id, ctx.from.language_code);
        }
    }

    public async help(ctx: helpCtx): Promise<void> {
        const user = await User.findUser(ctx.from.id);

        ls.setLocale(user.language);
        let reply_text = "";
        for (let i = 0; i < 5; i++) {
            reply_text += ls.__("help." + i.toString()) + "\n";
        }
        ctx.reply(reply_text);
    }
}
