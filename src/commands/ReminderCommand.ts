// class to control the reminder command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery, message } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import User from "../models/User";
import Chat from "../models/Chat";
import CalendarMaker from "../helpers/CalendarMaker";
import TimeFunctions from "../helpers/TimeFunctions";

import {
    hearsCtx,
    actionCtx,
    hearsRegexCtx,
    commandCtx,
} from "../models/types";
import { inlineKeyboard } from "telegraf/typings/markup";

const ls = LocaleService.Instance;

export default class ReminderController {
    // the bot
    private bot: Telegraf<Context<Update>>;
    private repeat_cycles: string[] = ["daily", "weekly", "monthly", "yearly"];
    private beforehand_options: string[][] = [
        ["10 minutes", "30 minutes", "1 hour"],
        ["1 day", "3 days", "7 days"],
        ["custom"],
    ];

    // the constructor of the reminder controller
    // takes the bot
    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("rmdr", (ctx) => this.Start(ctx));

        // receive "repeat" answer
        this.bot.action("rmdr.repeat.yes", (ctx) => this.processRepeatYes(ctx));
        this.bot.action("rmdr.repeat.no", (ctx) => this.processRepeatNo(ctx));

        // receive "repeat cycle" answer
        this.repeat_cycles.forEach((cycle) => {
            this.bot.action(
                "reminder.questions.repeat.options." + cycle,
                (ctx) => this.processRepeatCycleInput(ctx, cycle)
            );
        });

        // this.bot.command("rmdrtest", (ctx) => this.test(ctx));

        // receive "date" answer
        this.bot.action(/calendar\|DATE\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processDateInput(ctx)
        );

        // calendar navigation buttons
        this.bot.action(
            /calendar\|PREV(month|year)?\|\d{4}-\d{2}-\d{2}/,
            (ctx) => this.processCalendarNavigation(ctx, "prev")
        );
        this.bot.action(
            /calendar\|NEXT(month|year)?\|\d{4}-\d{2}-\d{2}/,
            (ctx) => this.processCalendarNavigation(ctx, "next")
        );
        this.bot.action(/calendar\|TODAY\|\d{4}-\d{2}-\d{2}/, (ctx) =>
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
        this.beforehand_options.forEach((options) => {
            options.forEach((option) => {
                this.bot.action(
                    "reminder.questions.select_beforehand_time.options." +
                        option,
                    (ctx) => this.processBeforehandTimeButtonInput(ctx, option)
                );
            });
        });

        // receive weekDay answer
        this.bot.action(/^calendarWeekdays\|\d$/, (ctx) =>
            this.processWeekDayInput(ctx)
        );

        // finished selecting weekDays
        this.bot.action("calendarWeekdays|FINISH", (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        // receive "calendarMultiselect" answer
        this.bot.action(/^calendarMultiselect\|\d{1,2}$/, (ctx) =>
            this.processCalendarMultiselectInput(ctx)
        );

        this.bot.action(/^calendarMultiselect\|FINISH$/, (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        this.bot.on(message("text"), (ctx) => this.processMessage(ctx));
    }

    // the function to handle the reminder command
    public async Start(ctx: commandCtx): Promise<void> {
        const hasArguments = ctx.message.text.split(" ").length > 1;

        if (!hasArguments) {
            this.startTaskCreation(ctx);
        }
    }

    public async startTaskCreation(ctx: commandCtx): Promise<void> {
        const user = await User.findUser(ctx.message.from.id);

        user.updateCurrentlyDoing("reminder.repeat");
        user.resetReminderOptions();

        ls.setLocale(user.language);
        ctx.replyWithMarkdownV2(
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

    // the function to process the "beforehand" answer
    // takes the context of the message
    // returns nothing
    protected async processBeforehand(ctx: actionCtx, beforehand: boolean) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "reminder.beforehand") return;

        if (beforehand) {
            // if user answered "yes" to "beforehand" question
            user.updateCurrentlyDoing("reminder.beforehand_time");
            ls.setLocale(user.language);
            ctx.editMessageText(
                ls.__("reminder.questions.select_beforehand_time.text"),
                Markup.inlineKeyboard(
                    this.beforehand_options.map((options) =>
                        options.map((option) =>
                            Markup.button.callback(
                                ls.__(
                                    "reminder.questions.select_beforehand_time.options." +
                                        option
                                ),
                                "task.beforehand_time.options." + option
                            )
                        )
                    )
                )
            );
        } else {
            // if user answered "no" to "beforehand" question
            user.currently_doing = "none";
            user.updateTaskOptionProperty({
                has_beforehand: false,
                beforehand_selected: true,
            });
            ctx.reply("Reminder saved!");
        }
    }

    private saveReminder(user: User) {
        //
        // TODO: save reminder
        //
    }

    private async processBeforehandTimeButtonInput(
        ctx: actionCtx,
        option: string
    ) {
        if (!ctx.from) return;
        const user = await User.findUser(ctx.from.id);

        if (user.currently_doing !== "reminder.beforehand_time") return;

        if (option === "custom") {
            user.updateCurrentlyDoing("reminder.beforehand_time.custom");
            ls.setLocale(user.language);
            ctx.reply(ls.__("reminder.questions.custom_beforehand_time.text"));
        } else {
            const selectedTime = this.getCallbackText(ctx).split(".")[-1];
            const inSeconds =
                TimeFunctions.calculateSecondsFromString(selectedTime);
            user.updateTaskOptionProperty({
                beforehand_time: inSeconds,
                beforehand_selected: true,
            });
            user.updateCurrentlyDoing("task_name");
            ls.setLocale(user.language);
            ctx.reply(ls.__("reminder.questions.task_name.text"));
        }
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
        const user = await User.findUser(ctx.message.from.id);
        if (user.currently_doing !== "reminder.pattern.time") return;
        user.updateCurrentlyDoing("reminder.beforehand");
        // user.currently_doing = "reminder.beforehand";
        user.updateTaskOptionProperty({
            time: ctx.message.text,
        });
        ls.setLocale(user.language);
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
    }
    // the function to get list of times from the message of the user
    // takes the message of the user with regex match: /^((0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])(,\s*(0[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])*$/;
    // returns the list of times: string[]
    protected getTimesFromMessage(message: string): string[] {
        return message.split(",").map((time) => time.trim());
    }

    protected async test(ctx: Context<Update>) {
        ctx.reply("test", await CalendarMaker.makeMonthsGrid());
    }

    // the fn if repeat is yes
    public async processRepeatYes(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "reminder.repeat") return;

        user.updateCurrentlyDoing("reminder.repeat.cycle");
        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("reminder.questions.repeat.text"),

            // this is the peak of my engeneering nonsense :D
            Markup.inlineKeyboard(
                [0, 2].map((i) =>
                    [i, i + 1].map((j) =>
                        Markup.button.callback(
                            ls.__(
                                "reminder.questions.repeat.options." +
                                    this.repeat_cycles[j]
                            ),
                            "reminder.questions.repeat.options." +
                                this.repeat_cycles[j]
                        )
                    )
                )
            )
        );
    }

    // the fn if repeat is no
    private async processRepeatNo(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "reminder.repeat") return;

        user.updateCurrentlyDoing("reminder.pattern.date");
        user.updateTaskOptionProperty({
            repeat: false,
            repeat_is_checked: true,
        });

        const current_year = new Date().getFullYear();
        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("reminder.questions.calendar_1"),
            await CalendarMaker.makeMonthsGrid(
                user.language,
                current_year,
                true
            )
        );
    }

    // the function to process the repeat cycle input
    // takes the context of the bot
    public async processRepeatCycleInput(ctx: actionCtx, cycle: string) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "reminder.repeat.cycle") return;

        user.updateTaskOptionProperty({
            repeat_cycle: cycle,
        });

        user.updateCurrentlyDoing("reminder.repeat.pattern");

        ls.setLocale(user.language);
        if (cycle === "yearly") {
            ctx.editMessageText(
                ls.__("reminder.questions.calendar_1.text"),
                await CalendarMaker.makeMonthsGrid(user.language)
            );
        } else if (cycle === "monthly") {
            ctx.editMessageText(
                ls.__("reminder.questions.calendar_multiselect.text"),
                await CalendarMaker.multiselectCalendar(user.language)
            );
        } else if (cycle === "weekly") {
            ctx.editMessageText(
                ls.__("reminder.questions.repeat.weekly.text"),
                await CalendarMaker.weekdaysMarkup(user.language)
            );
        } else if (cycle === "daily") {
            ctx.deleteMessage();
            ctx.replyWithMarkdownV2(
                ls.__("reminder.questions.repeat.daily.text")
            );
        }
    }

    // the function to process the "calendar" date input
    // takes the context of the bot
    public async processDateInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);
        const date = ctx.has(callbackQuery("data"))
            ? ctx.callbackQuery.data.split("|")[2]
            : "";
        if (date === "") {
            return;
        }

        user.updateTaskOptionProperty({
            date: date,
        });
        user.updateCurrentlyDoing("reminder.pattern.time");

        this.askForTime(ctx);
    }

    // the function to process the "calendar" navigation
    // takes the context of the bot
    public async processCalendarNavigation(ctx: actionCtx, navigation: string) {
        const user = await User.findUser(ctx.callbackQuery.from.id);
        const query = this.getCallbackText(ctx);

        const date: string = query.split("|")[2];

        if (navigation === "prev") {
            this.processCalendarNavigationPrev(ctx, user, query, date);
        } else if (navigation === "next") {
            this.processCalendarNavigationNext(ctx, user, query, date);
        } else if (navigation === "today") {
            user.updateTaskOptionProperty({
                date: date,
            });
            user.updateCurrentlyDoing("reminder.pattern.time");

            this.askForTime(ctx);
        }
    }

    public async processCalendarNavigationNext(
        ctx: actionCtx,
        user: User,
        query: string,
        date: string
    ) {
        let year = Number(date.split("-")[0]);
        let month = Number(date.split("-")[1]);

        if (month === 13 && !query.includes("month")) {
            year++;
            month = 1;
        }
        let calendar = Markup.inlineKeyboard([]);
        if (query.includes("year"))
            calendar = await CalendarMaker.makeMonthsGrid(
                user.language,
                year,
                !user.task_options.repeat
            );
        else if (query.includes("month"))
            calendar = await CalendarMaker.makeCalendar(
                user.language,
                year,
                month
            );
        ctx.editMessageReplyMarkup(calendar.reply_markup);
    }

    public async processCalendarNavigationPrev(
        ctx: actionCtx,
        user: User,
        query: string,
        date: string
    ) {
        let year = Number(date.split("-")[0]);
        let month = Number(date.split("-")[1]);

        if (month === 0 && query.includes("month")) {
            year--;
            month = 12;
        }
        let calendar = Markup.inlineKeyboard([]);
        if (query.includes("year"))
            calendar = await CalendarMaker.makeMonthsGrid(
                user.language,
                year,
                !user.task_options.repeat
            );
        else if (query.includes("month"))
            calendar = await CalendarMaker.makeCalendar(
                user.language,
                year,
                month
            );

        ctx.editMessageReplyMarkup(calendar.reply_markup);
    }

    // the function to process month input
    // takes the context of the bot
    // runs when the user clicks on a month in the month grid
    public async processMonthCalendar(ctx: actionCtx) {
        const date = this.getCallbackText(ctx).split("|")[2];

        const user = await User.findUser(ctx.callbackQuery.from.id);

        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("reminder.questions.calendar_1.text"),
            await CalendarMaker.makeCalendar(
                user.language,
                Number(date.split("-")[0]),
                Number(date.split("-")[1])
            )
        );
    }

    public async processWeekDayInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        const weekday = this.getCallbackText(ctx).split("|")[1];

        user.toggleDaysSelection(weekday);

        const updatedMarkup = await await CalendarMaker.weekdaysMarkup(
            user.language,
            user.task_options.checked_days
        );
        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMultiselectCalendarFinish(ctx: actionCtx) {
        this.askForTime(ctx);
    }

    public async askForTime(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);
        user.updateCurrentlyDoing("reminder.pattern.time");

        ls.setLocale(user.language);
        ctx.deleteMessage();
        ctx.replyWithMarkdownV2(ls.__("reminder.questions.send_time.single"));
    }

    public async processCalendarMultiselectInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);
        const selected_day: string = this.getCallbackText(ctx).split("|")[1];

        user.toggleDaysSelection(selected_day);

        ls.setLocale(user.language);
        const updatedMarkup = await CalendarMaker.multiselectCalendar(
            user.language,
            user.task_options.checked_days
        );
        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMessage(
        ctx: NarrowedContext<
            Context<Update>,
            Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
        >
    ) {
        const user = await User.findUser(ctx.message.from.id);
        if (user.currently_doing !== "reminder.name") {
            return;
        }
        user.updateTaskOptionProperty({
            time: ctx.message.text,
        });

        ls.setLocale(user.language);
        ctx.reply(ls.__("reminder.questions.send_time.success"));
    }

    private getCallbackText(ctx: actionCtx | commandCtx | hearsCtx) {
        if (ctx.has(callbackQuery("data"))) {
            return ctx.callbackQuery.data;
        } else {
            return "";
        }
    }
}
