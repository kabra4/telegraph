// class to handle commands of the bot

import { Context, Markup, NarrowedContext, Telegraf, Telegram } from "telegraf";
import { Message, Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";

const ls = LocaleService.Instance;

export default class BasicCommandsController {
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
    ctx.reply(ls.__("start"));
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
    new TgUser().getLocaleByTgId(ctx.from.id).then((res) => {
      ls.setLocale(res);
      let reply_text = "";
      for (let i = 0; i < 5; i++) {
        reply_text += ls.__("help." + i.toString()) + "\n";
      }
      ctx.reply(reply_text);
    });
  }
}
