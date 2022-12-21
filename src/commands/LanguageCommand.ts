// class to control the language of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";

const ls = LocaleService.Instance;

export default class LanguageCommand {
  // the bot
    private bot: Telegraf<Context<Update>>;

  // the constructor of the language controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.bot.command("lang", (ctx) => this.lang(ctx));
    this.bot.action("lang.en", (ctx) => this.changeLanguageTo(ctx, "en"));
    this.bot.action("lang.ru", (ctx) => this.changeLanguageTo(ctx, "ru"));
    this.bot.action("lang.uz", (ctx) => this.changeLanguageTo(ctx, "uz"));
  }

  // the function to handle the lang command
  // takes the context of the bot
  public lang(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  ): void {
    new TgUser().getByTgId(ctx.from.id).then((res) => {
      i18n.setLocale(res.language);
      ctx.reply(
        ls.__("lang.question"),
        Markup.inlineKeyboard([
          Markup.button.callback(ls.__("lang.options.en"), "lang.en"),
          Markup.button.callback(ls.__("lang.options.ru"), "lang.ru"),
          Markup.button.callback(ls.__("lang.options.uz"), "lang.uz"),
        ])
      );
    });
  }

  // the function to handle the callback query
  // takes the context of the bot
  public changeLanguageTo(
    ctx: NarrowedContext<
      Context<Update>,
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    lang: string
  ): void {
    new TgUser().updateLanguageByTgId(ctx.callbackQuery.from.id, lang);
    ls.setLocale(lang);
    // edit the message to success message
    ctx.editMessageText(ls.__("lang.language_changed"));
    // ctx.reply(ls.__("lang.success"));
  }
}
