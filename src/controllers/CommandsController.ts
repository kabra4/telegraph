// class to handle commands of the bot

import { Context, Markup, NarrowedContext, Telegraf, Telegram } from "telegraf";
import { Message, Update } from "typegram";
// import { I18n } from "i18n";
import i18n from "../configs/i18n.config";
import { LocaleService } from "../helpers/LocaleService";

const ls = LocaleService.Instance;

export default class CommandsController {
  // the bot
  private bot: Telegraf<Context<Update>>;

  // the constructor of the commands controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.bot.start((ctx) => this.start(ctx));
    this.bot.help((ctx) => this.help(ctx));
  }

  // the function to handle the start command
  // takes the context of the bot
  public start(
    ctx: Context<{
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }> &
      Omit<Context<Update>, keyof Context<Update>> & { startPayload: string }
  ): void {
    // here starts the function
    ctx.reply(ls.__("Hello, im the bot", ctx.from.first_name));
  }

  // the function to handle the help command
  // takes the context of the bot
  public help(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  ): void {
    // here starts the function
    ctx.reply("/start to receive a greeting");
    ctx.reply("/keyboard to receive a message with a keyboard");
    ctx.reply("/quit to stop the bot");
  }

  
}
