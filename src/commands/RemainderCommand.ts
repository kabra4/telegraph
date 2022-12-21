// class to control the remainder command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";

const ls = LocaleService.Instance;

export default class RemainderController {
  // the bot
  private bot: Telegraf<Context<Update>>;
  private repeat_cycles: string[] = ["daily", "weekly", "monthly", "yearly"];

  // the constructor of the remainder controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.bot.command("rmdr", (ctx) => this.Start(ctx));

    // receive "repeat" answer
    this.bot.action("rmdr.repeat.yes", (ctx) => this.AskRepeatPattern(ctx));
    // this.bot.action("rmdr.repeat.no", (ctx) => this.remainderRepeatNo(ctx));

    // receive "repeat cycle" answer
    this.repeat_cycles.forEach((cycle) => {
      this.bot.action("rmdr.questions.repeat.options." + cycle, (ctx) =>
        this.processRepeatCycleInput(ctx, cycle)
      );
    });
  }

  // the function to handle the remainder command
  // takes the context of the bot
  public async Start(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  ): Promise<void> {
    if (ctx.message.text == "/rmdr") {
      const user = new TgUser();
      await user.setByTgId(ctx.from.id);
      user.data.is_currently_doing = "remainder";
      user.data.remainder_options = {
        repeat: false,
        repeat_cycle: "",
        repeat_pattern: "",
        date: "",
        checked_dates: [],
        time: "",
        beforehand_selected: false,
        has_beforehand: "",
        beforehand_time: "",
      };
      await user.save();
      ctx.reply(
        ls.__(
          "remainder.questions.start.text",
          Markup.inlineKeyboard([
            Markup.button.callback(
              ls.__("remainder.questions.start.options.yes"),
              "rmdr.repeat.yes"
            ),
            Markup.button.callback(
              ls.__("remainder.questions.start.options.no"),
              "rmdr.repeat.no"
            ),
          ])
        )
      );
    }
  }

  // the fn if repeat is yes
  public async AskRepeatPattern(
    ctx: NarrowedContext<
      Context<Update> & { match: RegExpExecArray },
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);
    user.data.remainder_options.repeat = true;
    await user.save();
    ctx.reply(
      ls.__("remainder.questions.repeat.text"),
      Markup.inlineKeyboard([
        this.repeat_cycles.map((item) =>
          Markup.button.callback(
            ls.__("rmdr.questions.repeat.options." + item),
            "rmdr.questions.repeat.options." + item
          )
        ),
      ])
    );
  }

  // the function to process the repeat cycle input
  // takes the context of the bot
  public async processRepeatCycleInput(
    ctx: NarrowedContext<
      Context<Update> & { match: RegExpExecArray },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    cycle: string
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);
    user.data.remainder_options.repeat_cycle = cycle;
    user.data.is_currently_doing = "remainder.repeat.pattern";
    await user.save();
    return;
  }
  // function to print calendar
}
