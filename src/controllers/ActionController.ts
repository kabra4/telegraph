import { Context, Markup, NarrowedContext, Telegraf, Telegram } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import TgUser from "../models/TgUser";
import i18n from "../configs/i18n.config";
import { LocaleService } from "../helpers/LocaleService";
// import LanguageController from "../commands/Language";
import LanguageCommand from "../commands/LanguageCommand";

// const ls = LocaleService.Instance;

export default class ActionController {
  // the bot
  private bot: Telegraf<Context<Update>>;
  private telegram: Telegram;

  // the constructor of the callback query controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.telegram = this.bot.telegram;
    // this.bot.action("lang.en", (ctx) => this.changeLanguageTo(ctx, "en"));
    // this.bot.action("lang.ru", (ctx) => this.changeLanguageTo(ctx, "ru"));
    // this.bot.action("lang.uz", (ctx) => this.changeLanguageTo(ctx, "uz"));
  }
}
