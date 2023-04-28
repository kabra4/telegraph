// class to control the language of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import { commandCtx, actionCtx, startCtx } from "../models/types";
import User from "../models/User";
import Chat from "../models/Chat";
import { chatFromCtx } from "../helpers/UserRegistration";

const ls = LocaleService.Instance;

export default class LanguageCommand {
    private bot: Telegraf<Context<Update>>;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("lang", (ctx) => this.lang(ctx));
        this.bot.action("lang.en", (ctx) => this.changeLanguageTo(ctx, "en"));
        this.bot.action("lang.ru", (ctx) => this.changeLanguageTo(ctx, "ru"));
        this.bot.action("lang.uz", (ctx) => this.changeLanguageTo(ctx, "uz"));
    }

    public async lang(ctx: commandCtx): Promise<void> {
        const chat = await chatFromCtx(ctx);
        this.askLanguage(ctx, chat.language);
    }

    public async askLanguage(
        ctx: startCtx | commandCtx,
        language: string
    ): Promise<void> {
        ls.setLocale(language);
        ctx.reply(
            ls.__("lang.question"),
            Markup.inlineKeyboard([
                Markup.button.callback(ls.__("lang.options.en"), "lang.en"),
                Markup.button.callback(ls.__("lang.options.ru"), "lang.ru"),
                Markup.button.callback(ls.__("lang.options.uz"), "lang.uz"),
            ])
        );
    }

    // gets callback query from the user and changes the language of the bot
    public async changeLanguageTo(ctx: actionCtx, lang: string): Promise<void> {
        // if chat type is private, chat and user are the same and both have to be updated
        // if chat type is group, only chat has to be updated

        if (ctx.chat?.type === "private") {
            const user = await User.findUser(ctx.callbackQuery.from.id);
            await user.updateLanguage(lang);
            const chat = await Chat.findChat(ctx.chat.id);
            await chat.updateLanguage(lang);
        } else if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
            const chat = await Chat.findChat(ctx.chat.id);
            await chat.updateLanguage(lang);
        }

        ls.setLocale(lang);
        ctx.editMessageText(ls.__("lang.language_changed"));
    }
}
