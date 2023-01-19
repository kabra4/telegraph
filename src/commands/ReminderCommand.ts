// class to control the reminder command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";
import CalendarMaker from "../helpers/CalendarMaker";

const ls = LocaleService.Instance;

export default class ReminderController {
  // the bot
  private bot: Telegraf<Context<Update>>;
  private repeat_cycles: string[] = ["daily", "weekly", "monthly", "yearly"];
  private beforehand_options: string[] = [
    "1 hour",
    "1 day",
    "3 days",
    "1 week",
    "1 month",
    "custom",
  ];

  // the constructor of the reminder controller
  // takes the bot
  constructor(bot: Telegraf<Context<Update>>) {
    this.bot = bot;
    this.bot.command("rmdr", (ctx) => this.Start(ctx));

    // receive "repeat" answer
    this.bot.action("rmdr.repeat.yes", (ctx) => this.AskRepeatCycle(ctx));
    this.bot.action("rmdr.repeat.no", (ctx) => this.processRepeatNo(ctx));

    // receive "repeat cycle" answer
    this.repeat_cycles.forEach((cycle) => {
      this.bot.action("reminder.questions.repeat.options." + cycle, (ctx) =>
        this.processRepeatCycleInput(ctx, cycle)
      );
    });

    // this.bot.command("rmdrtest", (ctx) => this.test(ctx));

    // receive "date" answer from "calendar"
    // this.bot.action(/IGNORE/, (ctx) => {
    //   return;
    // });

    this.bot.action(/calendar\|DATE\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processDateInput(ctx)
    );

    // calendar navigation buttons
    this.bot.action(/calendar\|PREV(month)?\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "prev")
    );
    this.bot.action(/calendar\|NEXT(month)?\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "next")
    );
    this.bot.action(/calendar\|TODAY(month)?\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processCalendarNavigation(ctx, "today")
    );

    // month calendar
    this.bot.action(/calendar\|MONTH\|\d{4}-\d{2}-\d{2}/, (ctx) =>
      this.processMonthCalendar(ctx)
    );

    // receive "time" answer
    this.bot.hears(
      /^((0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])(,\s*(0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])*$/,
      (ctx) => this.processTimeInput(ctx)
    );

    // receive "beforehand" answer
    this.bot.action("rmdr.beforehand.yes", (ctx) =>
      this.processBeforehand(ctx, true)
    );
    this.bot.action("rmdr.beforehand.no", (ctx) =>
      this.processBeforehand(ctx, false)
    );

    // receive "beforehand time" answer
    this.beforehand_options.forEach((option) => {
      this.bot.action(
        "reminder.questions.select_beforehand_time.options." + option,
        (ctx) => this.processBeforehandTimeButtonInput(ctx, option)
      );
    });
  }

  // the function to process the "beforehand" answer
  // takes the context of the message
  // returns nothing
  protected async processBeforehand(
    ctx: NarrowedContext<
      Context<Update> & { match: RegExpExecArray },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    beforehand: boolean
  ) {
    if (ctx.from) {
      const user = new TgUser();
      user.setByTgId(ctx.from.id).then(() => {
        if (user.data.is_currently_doing !== "reminder.beforehand") return;

        if (beforehand) {
          // if user answered "yes" to "beforehand" question
          user.data.is_currently_doing = "reminder.beforehand_time";
          user.save().then(() => {
            ls.setLocale(user.data.language);
            ctx.reply(
              ls.__("reminder.questions.select_beforehand_time.text"),
              Markup.inlineKeyboard([
                this.beforehand_options.map((option) =>
                  Markup.button.callback(
                    ls.__(
                      "reminder.questions.select_beforehand_time.options." +
                        option
                    ),
                    "reminder.questions.select_beforehand_time.options." +
                      option
                  )
                ),
              ])
            );
          });
        } else {
          // if user answered "no" to "beforehand" question
          user.data.is_currently_doing = "none";
          user.data.reminder_options.has_beforehand = beforehand;
          user.data.reminder_options.beforehand_selected = true;
          user.save().then(() => {
            this.saveReminder(user);
            ctx.reply("Reminder saved!");
          });
        }
      });
    }
  }

  private saveReminder(user: TgUser) {}

  private async processBeforehandTimeButtonInput(
    ctx: NarrowedContext<
      Context<Update> & {
        // takes the bot
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    option: string
  ) {
    const user = new TgUser();
    if (!ctx.from) return;

    user.setByTgId(ctx.from.id).then(() => {
      if (user.data.is_currently_doing !== "reminder.beforehand_time") return;

      if (option === "custom") {
        user.data.is_currently_doing = "reminder.beforehand_time.custom";
        user.save().then(() => {
          ls.setLocale(user.data.language);
          ctx.reply(ls.__("reminder.questions.custom_beforehand_time.text"));
        });
      } else {
        let time = 0; // time in minutes
        if (option === "1 ") time = 1; // TODO: fix this
        user.data.is_currently_doing = "none";
        user.data.reminder_options.has_beforehand = true;
        user.data.reminder_options.beforehand_selected = true;
        // user.data.reminder_options.beforehand_time = time;
        user.save().then(() => {});
      }
    });
  }

  // the function to process time message of the user
  // takes the context of the message
  // returns nothing
  protected async processTimeInput(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  ) {
    const user = new TgUser();
    user.setByTgId(ctx.from.id).then(() => {
      if (user.data.is_currently_doing !== "reminder.pattern.time") return;
      user.data.is_currently_doing = "reminder.beforehand";
      user.data.reminder_options.time_list = this.getTimesFromMessage(
        ctx.message.text // "12:00, 13:00"
      );
      user.save().then(() => {
        ls.setLocale(user.data.language);
        ctx.reply(
          ls.__("reminder.questions.has_it_beforehand.text"),
          Markup.inlineKeyboard([
            Markup.button.callback(
              ls.__("reminder.questions.has_it_beforehand.options.yes"),
              "rmdr.beforehand.yes"
            ),
            Markup.button.callback(
              ls.__("reminder.questions.has_it_beforehand.options.no"),
              "rmdr.beforehand.no"
            ),
          ])
        );
      });
    });
  }
  // the function to get list of times from the message of the user
  // takes the message of the user with regex match: /^((0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])(,\s*(0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])*$/;
  // returns the list of times: string[]
  protected getTimesFromMessage(message: string): string[] {
    return message.split(",").map((time) => time.trim());
  }

  protected async test(ctx: Context<Update>) {
    ctx.reply("test", await CalendarMaker.makeMonthGrid());
  }

  // the function to handle the reminder command
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
      user.data.is_currently_doing = "reminder";
      user.resetReminderOptions();
      await user.save();
      ctx.reply(
        ls.__("reminder.questions.start.text"),
        Markup.inlineKeyboard([
          Markup.button.callback(
            ls.__("reminder.questions.start.options.yes"),
            "rmdr.repeat.yes"
          ),
          Markup.button.callback(
            ls.__("reminder.questions.start.options.no"),
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

    if (user.data.is_currently_doing !== "reminder") return;

    user.data.reminder_options.repeat = true;
    user.data.reminder_options.repeat_is_checked = true;
    user.data.is_currently_doing = "reminder.repeat.cycle";
    await user.save();
    ctx.editMessageText(
      ls.__("reminder.questions.repeat.text"),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            ls.__("reminder.questions.repeat.options." + this.repeat_cycles[0]),
            "reminder.questions.repeat.options." + this.repeat_cycles[0]
          ),
          Markup.button.callback(
            ls.__("reminder.questions.repeat.options." + this.repeat_cycles[1]),
            "reminder.questions.repeat.options." + this.repeat_cycles[1]
          ),
        ],
        [
          Markup.button.callback(
            ls.__("reminder.questions.repeat.options." + this.repeat_cycles[2]),
            "reminder.questions.repeat.options." + this.repeat_cycles[2]
          ),
          Markup.button.callback(
            ls.__("reminder.questions.repeat.options." + this.repeat_cycles[3]),
            "reminder.questions.repeat.options." + this.repeat_cycles[3]
          ),
        ],
      ])
    );
  }

  // the fn if repeat is no
  private async processRepeatNo(
    ctx: NarrowedContext<
      Context<Update> & { match: RegExpExecArray },
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    const user = new TgUser();
    await user.setByTgId(ctx.callbackQuery.from.id);

    if (user.data.is_currently_doing !== "reminder") return;

    user.data.reminder_options.repeat = false;
    user.data.reminder_options.repeat_is_checked = true;
    user.data.is_currently_doing = "reminder.pattern.time";
    user.save();

    const locale_ = user.data.language;
    const current_year = new Date().getFullYear();
    ls.setLocale(locale_);
    ctx.editMessageText(
      ls.__("reminder.questions.calendar_1"),
      await CalendarMaker.makeMonthGrid(locale_, current_year, "day")
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

    if (user.data.is_currently_doing !== "reminder.repeat.cycle") return;

    user.data.reminder_options.repeat_cycle = cycle;
    user.data.is_currently_doing = "reminder.repeat.pattern";
    await user.save();

    // cycle options
    if (cycle === "yearly") {
      ls.setLocale(user.data.language);
      ctx.editMessageText(
        ls.__("reminder.questions.calendar_1.text"),
        await CalendarMaker.makeMonthGrid(user.data.language)
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
      date === ""
      // (user.data.is_currently_doing === "reminder.repeat.pattern" && user.data.is_currently_doing === "reminder.repeat.pattern")
    ) {
      return;
    }

    user.data.reminder_options.date = date;
    user.data.is_currently_doing = "reminder.pattern.time";
    await user.save();

    // ask for time
    ls.setLocale(user.data.language);
    if (user.data.reminder_options.repeat) {
      ctx.editMessageText(ls.__("reminder.questions.send_time.single"));
    } else {
      ctx.editMessageText(ls.__("reminder.questions.send_time.multiple"));
    }
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
    const query = ctx.has(callbackQuery("data")) ? ctx.callbackQuery.data : "";
    console.log(query);
    // if (
    //   date === "" ||
    //   (user.data.reminder_options.repeat_cycle !== "yearly" &&
    //     user.data.reminder_options.repeat) ||
    //   user.data.is_currently_doing !== "reminder.repeat.pattern"
    // ) {
    //   return;
    // }

    ls.setLocale(user.data.language);
    if (navigation === "prev") {
      this.processCalendarNavigationPrev(ctx, user, query, date);
    } else if (navigation === "next") {
      this.processCalendarNavigationNext(ctx, user, query, date);
    } else if (navigation === "today") {
      // if "TODAY"

      user.data.reminder_options.date = date;
      user.save();

      if (user.data.reminder_options.repeat) {
        ctx.editMessageText(
          ls.__("reminder.questions.calendar_1.text"),
          await CalendarMaker.makeCalendar(user.data.language)
        );
      } else {
        // no repeat
        ctx.editMessageText(ls.__("reminder.questions.send_time.multiple"));
      }
    }
  }

  public async processCalendarNavigationNext(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    user: TgUser,
    query: string,
    date: string
  ) {
    let year = Number(date.split("-")[0]);
    let month = Number(date.split("-")[1]);

    if (month === 13 && !query.includes("month")) {
      year++;
      month = 1;
    }
    const calendar = query.includes("month")
      ? await CalendarMaker.makeMonthGrid(user.data.language, year)
      : query.includes("weekdays")
      ? await CalendarMaker.makeCalendar(user.data.language, year, month) // TODO: fix this
      : await CalendarMaker.makeCalendar(user.data.language, year, month);
    ls.setLocale(user.data.language);
    ctx.editMessageText(ls.__("reminder.questions.calendar_1.text"), calendar);
  }

  public async processCalendarNavigationPrev(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >,
    user: TgUser,
    query: string,
    date: string
  ) {
    let year = Number(date.split("-")[0]);
    let month = Number(date.split("-")[1]);
    if (month === 0 && !query.includes("month")) {
      year--;
      month = 12;
    }
    const calendar = query.includes("month")
      ? await CalendarMaker.makeMonthGrid(user.data.language, year)
      : query.includes("weekdays")
      ? await CalendarMaker.makeCalendar(user.data.language, year, month) // TODO: fix this
      : await CalendarMaker.makeCalendar(user.data.language, year, month);

    ls.setLocale(user.data.language);
    ctx.editMessageText(ls.__("reminder.questions.calendar_1.text"), calendar);
  }

  // the function to process month input
  // takes the context of the bot
  // runs when the user clicks on a month in the month grid
  public async processMonthCalendar(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      Update.CallbackQueryUpdate<CallbackQuery>
    >
  ) {
    // log the callback query
    const date = ctx.has(callbackQuery("data"))
      ? ctx.callbackQuery.data.split("|")[2]
      : "";
    const locale_date = ctx.has(callbackQuery("data"))
      ? ctx.callbackQuery.data.split("|")[3]
      : "";

    ls.setLocale(locale_date);
    ctx.editMessageText(
      ls.__("reminder.questions.calendar_1.text"),
      // ctx.update,
      await CalendarMaker.makeCalendar(
        locale_date,
        Number(date.split("-")[0]),
        Number(date.split("-")[1])
      )
    );
  }

  // private async askMonth(ctx) {
  //   const user = new TgUser();
  //   await user.setByTgId(ctx.callbackQuery.from.id);
  //   ls.setLocale(user.data.language);
  //   ctx.editMessageText(
  //     ls.__("reminder.questions.calendar_1.text"),
  //     await CalendarMaker.makeMonthGrid(user.data.language)
  //   );
  // }
}
