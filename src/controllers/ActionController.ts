import { Context, Markup, NarrowedContext, Telegraf, Telegram } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import TgUser from "../models/TgUser";
import i18n from "../configs/i18n.config";
import { LocaleService } from "../helpers/LocaleService";
// import LanguageController from "../commands/Language";
import LanguageCommand from "../commands/LanguageCommand";

// const ls = LocaleService.Instance;

export default class CallbackController {
  // the bot
  private bot: Telegraf<Context<Update>>;
  private telegram: Telegram;

  // the constructor of the callback query controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.telegram = this.bot.telegram;
    // this.bot.on("callback_query", async (ctx) => {
    //   if (ctx.callbackQuery.message) {
    //     ctx.reply(ctx.callbackQuery.data);
    //   }
    // });
    // this.bot.action(new RegExp("\w+"), (ctx) => this.callback(ctx));
  }
}
