// class to control the task command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery, message } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import User from "../models/User";
import Task from "../models/Task";
import RepeatScheme from "../models/RepeatScheme";
import Chat from "../models/Chat";
import CalendarMaker from "../helpers/CalendarMaker";
import TimeFunctions from "../helpers/TimeFunctions";

import {
    hearsCtx,
    actionCtx,
    hearsRegexCtx,
    commandCtx,
    textMessageCtx,
} from "../models/types";

const ls = LocaleService.Instance;

export default class ReminderController {
    // the bot
    private bot: Telegraf<Context<Update>>;
    private repeat_cycles: string[] = ["daily", "weekly", "monthly", "yearly"];
    private beforehand_options: string[][] = [
        ["10 minutes", "30 minutes", "1 hour"],
        ["1 day", "3 days", "7 days"],
    ];

    // the constructor of the task controller
    // takes the bot
    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("task", (ctx) => this.task(ctx));

        this.registerCallbacks();
    }

    public registerCallbacks(): void {
        // receive "repeat" answer
        this.bot.action("task.repeat.yes", (ctx) => this.processRepeatYes(ctx));
        this.bot.action("task.repeat.no", (ctx) => this.processRepeatNo(ctx));

        // receive "repeat cycle" answer
        this.repeat_cycles.forEach((cycle) => {
            this.bot.action("task.questions.repeat.options." + cycle, (ctx) =>
                this.processRepeatCycleInput(ctx, cycle)
            );
        });

        // this.bot.command("rmdrtest", (ctx) => this.test(ctx));

        // receive "date" answer
        this.bot.action(/calendar\|DATE\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processDateInput(ctx)
        );

        // calendar navigation buttons
        this.bot.action(/calendar\|PREV(month|year)?\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processCalendarNavigation(ctx, "prev")
        );
        this.bot.action(/calendar\|NEXT(month|year)?\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processCalendarNavigation(ctx, "next")
        );
        this.bot.action(/calendar\|TODAY\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processCalendarNavigation(ctx, "today")
        );

        // month calendar
        this.bot.action(/calendar\|MONTH\|\d{4}-\d{2}-\d{2}/, (ctx) =>
            this.processMonthCalendar(ctx)
        );

        // receive "beforehand" answer
        this.bot.action("task.beforehand.yes", (ctx) =>
            this.processBeforehand(ctx, true)
        );
        this.bot.action("task.beforehand.no", (ctx) =>
            this.processBeforehand(ctx, false)
        );

        // receive "beforehand time" answer
        this.beforehand_options.forEach((options) => {
            options.forEach((option) => {
                this.bot.action("task.beforehand_time.options." + option, (ctx) =>
                    this.processBeforehandTimeOption(ctx, option)
                );
            });
        });

        // receive weekDay answer
        this.bot.action(/^calendarWeekdays\|\d$/, (ctx) => this.processWeekDayInput(ctx));

        // finished selecting weekDays
        this.bot.action("calendarWeekdays|FINISH", (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        // receive "calendarMultiselect" answer
        this.bot.action(/^calendarMultiselect\|\d{1,2}$/, (ctx) =>
            this.processCalendarMultiselectInput(ctx)
        );

        this.bot.action("calendarMultiselect|FINISH", (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        this.bot.action("task.name.skip", (ctx) => this.processNameSkip(ctx));

        this.bot.on(message("text"), (ctx) => this.processMessage(ctx));
    }

    // the function to handle the task command
    public async task(ctx: commandCtx): Promise<void> {
        const hasArguments = ctx.message.text.split(" ").length > 1;

        if (!hasArguments) {
            this.startTaskCreation(ctx);
        }
    }

    public async startTaskCreation(ctx: commandCtx): Promise<void> {
        const user = await User.findUser(ctx.message.from.id);

        await user.updateCurrentlyDoing("task.repeat");
        user.resetReminderOptions({ action_type: "task" });

        ls.setLocale(user.language);
        ctx.replyWithMarkdownV2(
            ls.__("task.questions.start.text"),
            Markup.inlineKeyboard([
                Markup.button.callback(
                    ls.__("task.questions.start.options.yes"),
                    "task.repeat.yes"
                ),
                Markup.button.callback(
                    ls.__("task.questions.start.options.no"),
                    "task.repeat.no"
                ),
            ])
        );
    }

    // the function to process the "beforehand" answer
    // takes the context of the message
    // returns nothing
    protected async processBeforehand(ctx: actionCtx, beforehand_is_asked: boolean) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.beforehand") {
            ctx.deleteMessage();
            return;
        }

        if (beforehand_is_asked) {
            await user.updateCurrentlyDoing("task.beforehand_time");
            user.updateTaskOptionProperty({
                has_beforehand: true,
                beforehand_selected: true,
            });

            ls.setLocale(user.language);
            ctx.editMessageText(
                ls.__("task.questions.select_beforehand_time.text"),
                Markup.inlineKeyboard(
                    this.beforehand_options.map((options) =>
                        options.map((option) =>
                            Markup.button.callback(
                                ls.__(
                                    "task.questions.select_beforehand_time.options." +
                                        option
                                ),
                                "task.beforehand_time.options." + option
                            )
                        )
                    )
                )
            );
        } else {
            await user.updateCurrentlyDoing("task_name");
            user.updateTaskOptionProperty({
                has_beforehand: false,
                beforehand_selected: true,
            });

            ls.setLocale(user.language);
            this.askTaskName(ctx, user);
        }
    }

    private async saveTask(
        ctx: actionCtx | textMessageCtx | hearsCtx,
        user: User,
        deleteMessage = false
    ) {
        let chat_id: number = 0;
        if (ctx.callbackQuery && ctx.callbackQuery.message) {
            chat_id = ctx.callbackQuery.message.chat.id;
        } else if (ctx.message) {
            chat_id = ctx.message.chat.id;
        } else if (ctx.chat) {
            chat_id = ctx.chat.id;
        }
        const task = await user.taskFromSelectedTaskOptions(chat_id);
        await task.save();

        await user.resetReminderOptions();

        if (deleteMessage) {
            ctx.deleteMessage();
        }
        ls.setLocale(user.language);
        ctx.reply(ls.__("task.created"));
    }

    private async processBeforehandTimeOption(ctx: actionCtx, option: string) {
        if (!ctx.from) return;
        const user = await User.findUser(ctx.from.id);

        if (user.currently_doing !== "task.beforehand_time") {
            ctx.deleteMessage();
            return;
        }

        const inSeconds = TimeFunctions.calculateSecondsFromString(option);

        await user.updateTaskOptionProperty({
            beforehand_time: inSeconds,
            beforehand_selected: true,
        });
        ctx.deleteMessage();

        this.askTaskName(ctx, user);
    }

    private async processBeforehandInput(ctx: hearsRegexCtx | textMessageCtx) {
        const user = await User.findUser(ctx.message.from.id);
        if (user.currently_doing !== "task.beforehand_time.custom") return;

        if (!TimeFunctions.isValidTime(ctx.message.text)) {
            ls.setLocale(user.language);
            ctx.reply(ls.__("task.questions.custom_beforehand_time.invalid"));
            return;
        }

        const inSeconds = TimeFunctions.calculateSecondsFromString(ctx.message.text);
        await user.updateTaskOptionProperty({
            beforehand_time: inSeconds,
            beforehand_selected: true,
        });

        this.askTaskName(ctx, user);
    }

    // the function to process time message of the user
    // takes the context of the message
    // returns nothing
    protected async processTimeInput(ctx: hearsRegexCtx | textMessageCtx) {
        const user = await User.findUser(ctx.message.from.id);
        if (user.currently_doing !== "task.pattern.time") return;

        if (!TimeFunctions.isValidTime(ctx.message.text)) {
            ls.setLocale(user.language);
            ctx.reply(ls.__("task.questions.error.invalid_time"));
            return;
        }

        const time = this.getTimesFromMessage(ctx.message.text);

        if (time.length > 1) {
            this.featureNotImplemented(ctx, user);
            return;
        }

        await user.updateTaskOptionProperty({
            time: ctx.message.text,
        });

        if (user.should_ask_beforehand_time()) {
            this.askBeforehandTime(ctx, user);
        } else {
            this.askTaskName(ctx, user);
        }
    }

    public async askBeforehandTime(ctx: hearsRegexCtx | textMessageCtx, user: User) {
        user.updateCurrentlyDoing("task.beforehand");
        ls.setLocale(user.language);
        ctx.reply(
            ls.__("task.questions.has_it_beforehand.text"),
            Markup.inlineKeyboard([
                Markup.button.callback(
                    ls.__("task.questions.has_it_beforehand.options.yes"),
                    "task.beforehand.yes"
                ),
                Markup.button.callback(
                    ls.__("task.questions.has_it_beforehand.options.no"),
                    "task.beforehand.no"
                ),
            ])
        );
    }

    public async askTaskName(
        ctx: hearsRegexCtx | textMessageCtx | actionCtx,
        user: User
    ) {
        user.updateCurrentlyDoing("task.name");
        ls.setLocale(user.language);
        ctx.reply(
            ls.__("task.questions.task_name.text"),
            Markup.inlineKeyboard([
                Markup.button.callback(ls.__("buttons.skip"), "task.name.skip"),
            ])
        );
    }

    protected async processNameSkip(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.name") {
            ctx.deleteMessage();
            return;
        }

        user.updateCurrentlyDoing("");
        user.updateTaskOptionProperty({
            name: "",
        });

        this.saveTask(ctx, user, true);
    }

    // the function to process the "name" answer
    public async processNameInput(ctx: textMessageCtx) {
        const user = await User.findUser(ctx.message.from.id);

        if (user.currently_doing !== "task.name") return;

        user.updateCurrentlyDoing("");

        user.updateTaskOptionProperty({
            name: ctx.message.text,
        });

        this.saveTask(ctx, user);
    }

    // says that the feature is not implemented
    protected featureNotImplemented(
        ctx: hearsRegexCtx | textMessageCtx,
        user: User,
        feature: string = ""
    ) {
        const text = feature
            ? "task.feature_not_implemented." + feature
            : "task.feature_not_implemented";
        ls.setLocale(user.language);
        ctx.reply(ls.__(text));
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

        if (user.currently_doing !== "task.repeat") {
            await ctx.deleteMessage();
            return;
        }

        await user.updateCurrentlyDoing("task.repeat.cycle");
        user.updateTaskOptionProperty({
            repeat: true,
        });
        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("task.questions.repeat.text"),

            // this is the peak of my engeneering nonsense :D
            Markup.inlineKeyboard(
                [0, 2].map((i) =>
                    [i, i + 1].map((j) =>
                        Markup.button.callback(
                            ls.__(
                                "task.questions.repeat.options." + this.repeat_cycles[j]
                            ),
                            "task.questions.repeat.options." + this.repeat_cycles[j]
                        )
                    )
                )
            )
        );
    }

    // the fn if repeat is no
    private async processRepeatNo(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.repeat") return;

        await user.updateCurrentlyDoing("task.pattern.date");
        user.updateTaskOptionProperty({
            repeat: false,
            repeat_is_checked: true,
        });

        const current_year = new Date().getFullYear();
        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("task.questions.calendar_1"),
            await CalendarMaker.makeMonthsGrid(user.language, current_year, true)
        );
    }

    // the function to process the repeat cycle input
    public async processRepeatCycleInput(ctx: actionCtx, cycle: string) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.repeat.cycle") {
            ctx.deleteMessage();
            return;
        }

        user.updateTaskOptionProperty({
            repeat_cycle: cycle,
        });

        user.updateCurrentlyDoing("task.repeat.pattern");

        ls.setLocale(user.language);
        if (cycle === "yearly") {
            ctx.editMessageText(
                ls.__("task.questions.calendar_1.text"),
                await CalendarMaker.makeMonthsGrid(user.language)
            );
        } else if (cycle === "monthly") {
            ctx.editMessageText(
                ls.__("task.questions.calendar_multiselect.text"),
                await CalendarMaker.multiselectCalendar(user.language)
            );
        } else if (cycle === "weekly") {
            ctx.editMessageText(
                ls.__("task.questions.repeat.weekly.text"),
                await CalendarMaker.weekdaysMarkup(user.language)
            );
        } else if (cycle === "daily") {
            ctx.deleteMessage();
            ctx.replyWithMarkdownV2(ls.__("task.questions.repeat.daily.text"));
        }
    }

    // the function to process the "calendar" date input
    public async processDateInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (
            user.currently_doing !== "task.pattern.date" &&
            user.currently_doing !== "task.repeat.pattern"
        ) {
            ctx.deleteMessage();
            return;
        }

        const date = ctx.has(callbackQuery("data"))
            ? ctx.callbackQuery.data.split("|")[2]
            : "";
        if (date === "") {
            return;
        }
        if (!TimeFunctions.isDateInFuture(date)) {
            ls.setLocale(user.language);
            ctx.reply(ls.__("task.questions.error.date_in_past"));
            return;
        }

        user.updateTaskOptionProperty({
            date: date,
        });
        user.updateCurrentlyDoing("task.pattern.time");

        this.askForTime(ctx);
    }

    // the function to process the "calendar" navigation
    public async processCalendarNavigation(ctx: actionCtx, navigation: string) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.pattern.date") {
            ctx.deleteMessage();
            return;
        }

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
            user.updateCurrentlyDoing("task.pattern.time");

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
            calendar = await CalendarMaker.makeCalendar(user.language, year, month);
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
            calendar = await CalendarMaker.makeCalendar(user.language, year, month);

        ctx.editMessageReplyMarkup(calendar.reply_markup);
    }

    // the function to process month input
    // runs when the user clicks on a month in the month grid
    public async processMonthCalendar(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (
            user.currently_doing !== "task.pattern.date" &&
            user.currently_doing !== "task.repeat.pattern"
        ) {
            ctx.deleteMessage();
            return;
        }

        const date = this.getCallbackText(ctx).split("|")[2];

        ls.setLocale(user.language);
        ctx.editMessageText(
            ls.__("task.questions.calendar_1.text"),
            await CalendarMaker.makeCalendar(
                user.language,
                Number(date.split("-")[0]),
                Number(date.split("-")[1])
            )
        );
    }

    public async processWeekDayInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (user.currently_doing !== "task.repeat.pattern") {
            ctx.deleteMessage();
            return;
        }

        const weekday = this.getCallbackText(ctx).split("|")[1];

        user.toggleDaysSelection(weekday);

        const updatedMarkup = await await CalendarMaker.weekdaysMarkup(
            user.language,
            user.task_options.checked_days
        );

        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMultiselectCalendarFinish(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (
            user.currently_doing !== "task.repeat.pattern" &&
            user.currently_doing !== "task.pattern.date"
        ) {
            ctx.deleteMessage();
            return;
        }

        user.updateTaskOptionProperty({
            checked_days: user.task_options.checked_days,
        });

        this.askForTime(ctx);
    }

    public async askForTime(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);
        user.updateCurrentlyDoing("task.pattern.time");

        ls.setLocale(user.language);
        ctx.deleteMessage();
        ctx.replyWithMarkdownV2(ls.__("task.questions.send_time.single"));
    }

    public async processCalendarMultiselectInput(ctx: actionCtx) {
        const user = await User.findUser(ctx.callbackQuery.from.id);

        if (
            user.currently_doing !== "task.pattern.date" &&
            user.currently_doing !== "task.repeat.pattern"
        ) {
            ctx.deleteMessage();
            return;
        }

        const selected_day: string = this.getCallbackText(ctx).split("|")[1];

        user.toggleDaysSelection(selected_day);

        ls.setLocale(user.language);
        const updatedMarkup = await CalendarMaker.multiselectCalendar(
            user.language,
            user.task_options.checked_days
        );
        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMessage(ctx: textMessageCtx) {
        const user = await User.findUser(ctx.message.from.id);
        if (!user.currently_doing.includes("task")) {
            return;
        }
        if (
            user.currently_doing !== "task.name" &&
            user.currently_doing !== "task.pattern.time" &&
            user.currently_doing !== "task.beforehand"
        ) {
            return;
        }

        if (user.currently_doing === "task.name") {
            this.processNameInput(ctx);
        } else if (user.currently_doing === "task.pattern.time") {
            this.processTimeInput(ctx);
        } else if (user.currently_doing === "task.beforehand") {
            this.processBeforehandInput(ctx);
        }
    }

    private getCallbackText(ctx: actionCtx | commandCtx | hearsCtx) {
        if (ctx.has(callbackQuery("data"))) {
            return ctx.callbackQuery.data;
        } else {
            return "";
        }
    }
}
