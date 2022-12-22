// class to control the remainder command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";
import CalendarMaker from "../helpers/CalendarMaker";

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
    this.bot.action("rmdr.repeat.yes", (ctx) => this.AskRepeatCycle(ctx));
    // this.bot.action("rmdr.repeat.no", (ctx) => this.remainderRepeatNo(ctx));

    // receive "repeat cycle" answer
    this.repeat_cycles.forEach((cycle) => {
      this.bot.action("remainder.questions.repeat.options." + cycle, (ctx) =>
        this.processRepeatCycleInput(ctx, cycle)
      );
    });

    // receive "date" answer from "calendar"
    // this.bot.action(/IGNORE/, (ctx) => {
    //   return;
    // });

    this.bot.action(/calendar\|DATE\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processDateInput(ctx)
    );

    // calendar navigation buttons
    this.bot.action(/calendar\|PREV\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "prev")
    );
    this.bot.action(/calendar\|NEXT\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "next")
    );
    this.bot.action(/calendar\|TODAY\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "today")
    );
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
        repeat_is_checked: false,
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
        ls.__("remainder.questions.start.text"),
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
      );
    }
  }

  // the fn if repeat is yes
  public async AskRepeatCycle(
    ctx: NarrowedContext<
      Context<Update> & { match: RegExpExecArray },
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);

    if (user.data.is_currently_doing !== "remainder") return;

    user.data.remainder_options.repeat = true;
    user.data.remainder_options.repeat_is_checked = true;
    user.data.is_currently_doing = "remainder.repeat.cycle";
    await user.save();
    ctx.editMessageText(
      ls.__("remainder.questions.repeat.text"),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            ls.__(
              "remainder.questions.repeat.options." + this.repeat_cycles[0]
            ),
            "remainder.questions.repeat.options." + this.repeat_cycles[0]
          ),
          Markup.button.callback(
            ls.__(
              "remainder.questions.repeat.options." + this.repeat_cycles[1]
            ),
            "remainder.questions.repeat.options." + this.repeat_cycles[1]
          ),
        ],
        [
          Markup.button.callback(
            ls.__(
              "remainder.questions.repeat.options." + this.repeat_cycles[2]
            ),
            "remainder.questions.repeat.options." + this.repeat_cycles[2]
          ),
          Markup.button.callback(
            ls.__(
              "remainder.questions.repeat.options." + this.repeat_cycles[3]
            ),
            "remainder.questions.repeat.options." + this.repeat_cycles[3]
          ),
        ],
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

    if (user.data.is_currently_doing !== "remainder.repeat.cycle") return;

    user.data.remainder_options.repeat_cycle = cycle;
    user.data.is_currently_doing = "remainder.repeat.pattern";
    await user.save();

    // cycle options
    if (cycle === "yearly") {
      ls.setLocale(user.data.language);
      ctx.editMessageText(
        ls.__("remainder.questions.calendar_1.text"),
        await CalendarMaker.makeCalendar(user.data.language)
      );
    }
  }

  // the function to process the "calendar" date input
  // takes the context of the bot
  public async processDateInput(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);
    const date = ctx.has(callbackQuery("data"))
      ? ctx.callbackQuery.data.split("|")[2]
      : "";
    if (
      date === "" ||
      (user.data.remainder_options.repeat_cycle !== "yearly" &&
        user.data.remainder_options.repeat) ||
      user.data.is_currently_doing !== "remainder.repeat.pattern"
    ) {
      return;
    }

    user.data.remainder_options.date = date;
    user.data.is_currently_doing = "remainder.repeat.pattern.time";
    await user.save();

    // ask for time
    ls.setLocale(user.data.language);
    ctx.editMessageText(ls.__("remainder.questions.send_time.text"));
  }

  // the function to process the "calendar" navigation
  // takes the context of the bot
  public async processCalendarNavigation(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    navigation: string
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);
    const date = ctx.has(callbackQuery("data"))
      ? ctx.callbackQuery.data.split("|")[2]
      : "";
    if (
      date === "" ||
      (user.data.remainder_options.repeat_cycle !== "yearly" &&
        user.data.remainder_options.repeat) ||
      user.data.is_currently_doing !== "remainder.repeat.pattern"
    ) {
      return;
    }

    ls.setLocale(user.data.language);
    if (navigation === "prev") {
      let year = Number(date.split("-")[0]);
      let month = Number(date.split("-")[1]);
      if (month === 1) {
        year--;
        month = 13;
      }

      ctx.editMessageText(
        ls.__("remainder.questions.calendar_1.text"),
        await CalendarMaker.makeCalendar(user.data.language, year, month - 1)
      );
    } else if (navigation === "next") {
      let year = Number(date.split("-")[0]);
      let month = Number(date.split("-")[1]);
      if (month === 12) {
        year++;
        month = 0;
      }
      ctx.editMessageText(
        ls.__("remainder.questions.calendar_1.text"),
        await CalendarMaker.makeCalendar(user.data.language, year, month + 1)
      );
    } else {
      ctx.editMessageText(
        ls.__("remainder.questions.calendar_1.text"),
        await CalendarMaker.makeCalendar(user.data.language)
      );
    }
  }
}
