// class to control the task command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery, message } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import User from "../models/User";
import CalendarMaker from "../helpers/CalendarMaker";
import TimeFunctions from "../helpers/TimeFunctions";
import CmdHelper from "../helpers/CmdHelper";

import {
    hearsCtx,
    actionCtx,
    hearsRegexCtx,
    commandCtx,
    textMessageCtx,
} from "../models/types";
import {
    chatLanguage,
    userExists,
    userFromCallback,
    userFromCtx,
    userFromTextCtx,
} from "../helpers/UserRegistration";

const ls = LocaleService.Instance;

export default class TaskController {
    // the bot
    private bot: Telegraf<Context<Update>>;
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
        CmdHelper.repeat_cycles.forEach((cycleList) => {
            cycleList.forEach((cycle) =>
                this.bot.action("task.questions.repeat.options." + cycle, (ctx) =>
                    this.processRepeatCycleInput(ctx, cycle)
                )
            );
        });

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
        this.bot.action(/^calendarWeekdays\|(\d)$/, (ctx) =>
            this.processWeekDayInput(ctx)
        );

        // finished selecting weekDays
        this.bot.action("calendarWeekdays|FINISH", (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        // receive "calendarMultiselect" answer
        this.bot.action(/^calendarMultiselect\|(\d{1,2})$/, (ctx) =>
            this.processCalendarMultiselectInput(ctx)
        );

        this.bot.action("calendarMultiselect|FINISH", (ctx) =>
            this.processMultiselectCalendarFinish(ctx)
        );

        // receive "interval_count" answer
        this.bot.action(/^task\|interval_count\|(\d+)$/, (ctx) =>
            this.processIntervalCountInput(ctx)
        );
    }

    // the function to handle the task command
    public async task(ctx: commandCtx): Promise<void> {
        const user = await userFromCtx(ctx);

        const hasArguments = ctx.message.text.split(" ").length > 1;

        if (!hasArguments) {
            this.askTaskName(ctx, user);
        } else {
            // TODO: implement task creation with arguments
            this.askTaskName(ctx, user);
        }
    }

    public async startTaskCreation(ctx: commandCtx, user?: User): Promise<void> {
        user ||= await userFromCtx(ctx);

        user.updateCurrentlyDoing("task.repeat");

        ls.set(ctx, user.language);
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
        const user = await userFromCtx(ctx);

        if (user.currently_doing !== "task.beforehand") {
            ctx.deleteMessage();
            return;
        }

        if (beforehand_is_asked) {
            await user.updateCurrentlyDoing("task.beforehand_time");
            user.updateTaskOptionProperty({
                has_beforehand: true,
            });

            ls.set(ctx, user.language);
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
            });

            this.saveTask(ctx, user);
        }
    }

    private getChatId(ctx: actionCtx | textMessageCtx | hearsCtx): number {
        if (ctx.callbackQuery && ctx.callbackQuery.message) {
            return ctx.callbackQuery.message.chat.id;
        } else if (ctx.message) {
            return ctx.message.chat.id;
        } else if (ctx.chat) {
            return ctx.chat.id;
        }
        return 0;
    }

    private async saveTask(
        ctx: actionCtx | textMessageCtx | hearsCtx,
        user: User,
        deleteMessage = false,
        lang: string | undefined = undefined
    ) {
        const chat_id = this.getChatId(ctx);
        (await user.taskFromSelectedTaskOptions(chat_id)).save();

        await user.resetReminderOptions();
        await user.updateCurrentlyDoing("");

        if (!ctx.message && deleteMessage) {
            ctx.deleteMessage();
        }
        ls.set(ctx, user.language);
        ctx.reply(ls.__("task.created"));
    }

    private async processBeforehandTimeOption(
        ctx: actionCtx | textMessageCtx,
        option: string,
        user?: User
    ) {
        user ||= await userFromCtx(ctx);

        if (user.currently_doing !== "task.beforehand_time") {
            ctx.deleteMessage();
            return;
        }

        const inSeconds = TimeFunctions.calculateSecondsFromString(option);

        await user.updateTaskOptionProperty({
            beforehand_time: inSeconds,
        });

        this.saveTask(ctx, user, ctx.callbackQuery ? true : false);
    }

    private async processBeforehandInput(
        ctx: hearsRegexCtx | textMessageCtx,
        user: User
    ) {
        if (!TimeFunctions.isValidTimePeriod(ctx.message.text)) {
            ls.set(ctx, user.language);
            ctx.reply(ls.__("task.questions.custom_beforehand_time.invalid"));
            return;
        }

        this.processBeforehandTimeOption(ctx, ctx.message.text, user);
    }

    // the function to process time message of the user
    // takes the context of the message
    // returns nothing
    protected async processTimeInput(ctx: hearsRegexCtx | textMessageCtx, user: User) {
        if (!TimeFunctions.isValidTime(ctx.message.text)) {
            ls.set(ctx, user.language);
            ctx.reply(ls.__("task.questions.error.invalid_time"));
            return;
        }
        console.log(ctx.message.text);

        const time = CmdHelper.splitWithComma(ctx.message.text, true);
        console.log(time);

        await user.updateTaskOptionProperty({
            time_list: time,
        });

        if (user.should_ask_beforehand_time()) {
            this.askBeforehand(ctx, user);
        } else {
            this.saveTask(ctx, user);
        }
    }

    public async askBeforehand(ctx: hearsRegexCtx | textMessageCtx, user: User) {
        user.updateCurrentlyDoing("task.beforehand");
        ls.set(ctx, user.language);
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
        user?: User
    ) {
        user ||= await userFromCtx(ctx);
        user.updateCurrentlyDoing("task.name");
        user.resetReminderOptions({ action_type: "task" });
        ls.set(ctx, user.language);
        ctx.reply(ls.__("task.questions.task_name.text"));
    }

    // the function to process the "name" answer
    private async processNameInput(ctx: textMessageCtx, user: User) {
        user.updateTaskOptionProperty({
            name: ctx.message.text,
        });

        this.startTaskCreation(ctx, user);
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
        ls.set(ctx, user.language);
        ctx.reply(ls.__(text));
    }

    // the fn if repeat is yes
    public async processRepeatYes(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

        if (user.currently_doing !== "task.repeat") {
            await ctx.deleteMessage();
            return;
        }

        await user.updateCurrentlyDoing("task.repeat.cycle");
        user.updateTaskOptionProperty({
            repeat: true,
        });
        ls.set(ctx, user.language);
        ctx.editMessageText(
            ls.__("task.questions.repeat.text"),
            CmdHelper.repeatTypesKeyboard("task.questions.repeat.options.", user.language)
        );
    }

    // the fn if repeat is no
    private async processRepeatNo(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

        if (user.currently_doing !== "task.repeat") return;

        await user.updateCurrentlyDoing("task.pattern.date");
        user.updateTaskOptionProperty({
            repeat: false,
        });

        const current_year = new Date().getFullYear();
        ls.set(ctx, user.language);
        ctx.editMessageText(
            ls.__("task.questions.calendar_1"),
            await CalendarMaker.makeMonthsGrid(user.language, current_year, true)
        );
    }

    // the function to process the repeat cycle input
    public async processRepeatCycleInput(ctx: actionCtx, cycle: string) {
        const user = await userFromCtx(ctx);

        // if (user.currently_doing !== "task.repeat.cycle") {
        //     ctx.deleteMessage();
        //     return;
        // }

        user.updateTaskOptionProperty({
            repeat_cycle: cycle,
        });

        if (cycle !== "daily" && cycle !== "interval") {
            user.updateCurrentlyDoing("task.repeat.pattern");
        }
        const language = await chatLanguage(ctx, user.language);
        ls.setLocale(language);
        if (cycle === "yearly") {
            ctx.editMessageText(
                ls.__("task.questions.calendar_1.text"),
                await CalendarMaker.makeMonthsGrid(language)
            );
        } else if (cycle === "monthly") {
            ctx.editMessageText(
                ls.__("task.questions.calendar_multiselect.text"),
                await CalendarMaker.multiselectCalendar(language)
            );
        } else if (cycle === "weekly") {
            ctx.editMessageText(
                ls.__("task.questions.repeat.weekly.text"),
                await CalendarMaker.weekdaysMarkup(language)
            );
        } else if (cycle === "daily") {
            this.askTime(ctx, user, language);
        } else if (cycle === "interval") {
            this.askIntervalTime(ctx, user, language);
        }
        // ctx.deleteMessage();
    }

    public async askIntervalTime(
        ctx: actionCtx,
        user: User,
        lang: string
    ): Promise<void> {
        user.updateCurrentlyDoing("task.interval.time");
        ls.setLocale(lang);
        ctx.reply(ls.__("task.questions.interval.time.text"));
    }

    // the function to process the "calendar" date input
    public async processDateInput(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

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
        const lang = await chatLanguage(ctx, user.language);
        if (!TimeFunctions.isDateInFuture(date)) {
            ls.setLocale(lang);
            ctx.reply(ls.__("task.questions.error.date_in_past"));
            return;
        }

        await user.updateTaskOptionProperty({
            date: date,
        });

        this.askTime(ctx, user, lang);
    }

    // the function to process the "calendar" navigation
    public async processCalendarNavigation(ctx: actionCtx, navigation: string) {
        const user = await userFromCtx(ctx);

        if (user.currently_doing !== "task.pattern.date") {
            ctx.deleteMessage();
            return;
        }

        const query = CmdHelper.getCallbackText(ctx);

        const date: string = query.split("|")[2];
        const lang = await chatLanguage(ctx, user.language);
        if (navigation === "prev") {
            this.processCalendarNavigationPrev(ctx, user, query, date, lang);
        } else if (navigation === "next") {
            this.processCalendarNavigationNext(ctx, user, query, date, lang);
        } else if (navigation === "today") {
            user.updateTaskOptionProperty({
                date: date,
            });
            user.updateCurrentlyDoing("task.pattern.time");

            this.askTime(ctx, user, lang);
        }
    }

    public async processCalendarNavigationNext(
        ctx: actionCtx,
        user: User,
        query: string,
        date: string,
        lang: string
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
                lang,
                year,
                !user.task_options.repeat
            );
        else if (query.includes("month"))
            calendar = await CalendarMaker.makeCalendar(lang, year, month);
        ctx.editMessageReplyMarkup(calendar.reply_markup);
    }

    public async processCalendarNavigationPrev(
        ctx: actionCtx,
        user: User,
        query: string,
        date: string,
        lang: string
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
                lang,
                year,
                !user.task_options.repeat
            );
        else if (query.includes("month"))
            calendar = await CalendarMaker.makeCalendar(lang, year, month);

        ctx.editMessageReplyMarkup(calendar.reply_markup);
    }

    // the function to process month input
    // runs when the user clicks on a month in the month grid
    public async processMonthCalendar(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

        if (
            user.currently_doing !== "task.pattern.date" &&
            user.currently_doing !== "task.repeat.pattern"
        ) {
            ctx.deleteMessage();
            return;
        }

        const date = CmdHelper.getCallbackText(ctx).split("|")[2];
        const lang = await chatLanguage(ctx, user.language);
        ls.set(ctx, lang);
        ctx.editMessageText(
            ls.__("task.questions.calendar_1.text"),
            await CalendarMaker.makeCalendar(
                lang,
                Number(date.split("-")[0]),
                Number(date.split("-")[1])
            )
        );
    }

    public async processWeekDayInput(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

        if (user.currently_doing !== "task.repeat.pattern") {
            ctx.deleteMessage();
            return;
        }

        const weekday = ctx.match[1];

        user.toggleDaysSelection(weekday);

        const updatedMarkup = await await CalendarMaker.weekdaysMarkup(
            await chatLanguage(ctx, user.language),
            user.task_options.checked_days
        );

        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMultiselectCalendarFinish(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

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

        this.askTime(ctx, user, await chatLanguage(ctx, user.language));
    }

    public async askTime(
        ctx: actionCtx,
        user: User | undefined = undefined,
        lang: string = "en"
    ) {
        user ||= await userFromCtx(ctx);
        user.updateCurrentlyDoing("task.pattern.time");

        ctx.deleteMessage();
        ls.setLocale(lang);
        ctx.replyWithMarkdownV2(ls.__("task.questions.send_time.single"));
    }

    public async processCalendarMultiselectInput(ctx: actionCtx) {
        const user = await userFromCtx(ctx);

        if (
            user.currently_doing !== "task.pattern.date" &&
            user.currently_doing !== "task.repeat.pattern"
        ) {
            ctx.deleteMessage();
            return;
        }

        const selected_day = ctx.match[1];

        user.toggleDaysSelection(selected_day);
        const lang = await chatLanguage(ctx, user.language);
        ls.setLocale(lang);
        const updatedMarkup = await CalendarMaker.multiselectCalendar(
            lang,
            user.task_options.checked_days
        );
        ctx.editMessageReplyMarkup(updatedMarkup.reply_markup);
    }

    public async processMessage(ctx: textMessageCtx, user: User) {
        if (!user.currently_doing.includes("task")) {
            return;
        }

        if (user.currently_doing === "task.name") {
            this.processNameInput(ctx, user);
        } else if (user.currently_doing === "task.pattern.time") {
            this.processTimeInput(ctx, user);
        } else if (user.currently_doing === "task.beforehand_time") {
            this.processBeforehandInput(ctx, user);
        } else if (user.currently_doing === "task.interval.time") {
            this.processIntervalTimeInput(ctx, user);
        } else if (user.currently_doing === "task.interval.count") {
            this.processIntervalCountInput(ctx, user);
        }
    }

    public async processIntervalTimeInput(
        ctx: textMessageCtx,
        user: User
    ): Promise<void> {
        const lang = await chatLanguage(ctx, user.language);
        if (!TimeFunctions.isValidTimePeriod(ctx.message.text)) {
            ls.setLocale(lang);
            ctx.reply(ls.__("task.questions.interval.time.invalid"));
            return;
        }

        const inSeconds = TimeFunctions.calculateSecondsFromString(ctx.message.text);
        await user.updateTaskOptionProperty({
            interval_seconds: inSeconds,
        });

        this.askTaskIntervalCount(ctx, user, lang);
    }

    public async processIntervalCountInput(
        ctx: textMessageCtx | actionCtx,
        user?: User
    ): Promise<void> {
        user ||= await userFromCtx(ctx);

        let response = ctx.message ? ctx.message.text : ctx.match[1];

        const lang = await chatLanguage(ctx, user.language);
        if (!Number(response) || Number(response) < 1) {
            ls.setLocale(lang);
            ctx.reply(ls.__("task.questions.interval.count.invalid"));
            return;
        }

        user.updateTaskOptionProperty({
            max_trigger_count: Number(response),
        });

        this.saveTask(ctx, user, true, lang);
    }

    public async askTaskIntervalCount(
        ctx: textMessageCtx,
        user: User,
        lang: string
    ): Promise<void> {
        user.updateCurrentlyDoing("task.interval.count");

        ls.setLocale(lang);
        ctx.reply(
            ls.__("task.questions.interval.count.text"),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("5", "task|interval_count|5"),
                    Markup.button.callback("10", "task|interval_count|10"),
                    Markup.button.callback("20", "task|interval_count|20"),
                ],
                [
                    Markup.button.callback(
                        ls.__("task.questions.interval.count.infinity"),
                        "task|interval_count|100000"
                    ),
                ],
            ])
        );
    }
}
