// class to handle commands of the bot

import { Context, Markup, NarrowedContext, Telegraf, Telegram } from "telegraf";
import { Message, Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";
// import { MyContext } from "../models/types";

import LanguageCommand from "../commands/LanguageCommand";
import { ITgUser } from "../models/types";

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
    ctx.reply("Hello");
    const user = new TgUser();
    user.getByTgId(ctx.from.id).then((res) => {
      if (res == null || res == undefined || Object.keys(res).length == 0) {
        const user_data = {
          tg_id: ctx.from.id.toString(),
          tg_username: ctx.from.username || "",
          name: ctx.from.first_name,
          surename: ctx.from.last_name || "",
          language: ctx.from.language_code || "en",
          phone_number: "",
          active: false,
          remainder_options: {},
          superuser: false,
          last_active: new Date(),
          is_currently_doing: "",
        };
        user.create(user_data).then((res) => {
          if (res) {
            if (res) ls.setLocale(res.language);
            ctx.reply(ls.__("start") + "\n" + ls.__("lang_on_start"));
          }
        });
      } else {
        ls.setLocale(res.language);
        ctx.reply(ls.__("start"));
      }
    });
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
