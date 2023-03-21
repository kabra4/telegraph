// class to control the language of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import { commandCtx, actionCtx } from "../models/types";
import User from "../models/User";

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
        const user = await User.findUser(ctx.from.id);
        this.askLanguage(ctx.from.id, user.language);
    }

    public async askLanguage(chat_id: number, language: string): Promise<void> {
        ls.setLocale(language);
        this.bot.telegram.sendMessage(
            chat_id,
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
        const user = await User.findUser(ctx.callbackQuery.from.id);
        await user.updateLanguage(lang);
        ls.setLocale(lang);
        ctx.editMessageText(ls.__("lang.language_changed"));
    }
}
