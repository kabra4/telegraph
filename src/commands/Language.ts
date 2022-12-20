// class to control the language of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import dotenv from "dotenv";
import i18n from "../configs/i18n.config";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";

const ls = LocaleService.Instance;

export default class LanguageCommand {
  // the bot
  //   private bot: Telegraf<Context<Update>>;

  // the constructor of the language controller
  // takes the bot
  constructor() {}

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
    i18n.setLocale(lang);
    // edit the message to success message
    ctx.editMessageText(ls.__("lang.language_changed"));
    // ctx.reply(ls.__("lang.success"));
  }
}
