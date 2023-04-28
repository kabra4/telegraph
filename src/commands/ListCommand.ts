import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TimeFunctions from "../helpers/TimeFunctions";
import Task from "../models/Task";
import { commandCtx, actionCtx } from "../models/types";
import User from "../models/User";
import { callbackQuery } from "telegraf/filters";

import { Logger } from "../helpers/Logger";
import Chat from "../models/Chat";
import { chatFromCtx, chatLanguage } from "../helpers/UserRegistration";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
const logger = Logger.getInstance();

const ls = LocaleService.Instance;

export default class ListCommand {
    private bot: Telegraf<Context<Update>>;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("list", (ctx) => this.list(ctx));
        this.registerActions();
    }

    private async registerActions(): Promise<void> {
        this.bot.action("list.all", (ctx) => this.listAll(ctx));
        this.bot.action("list.today", (ctx) => this.listToday(ctx));
        this.bot.action("list.tomorrow", (ctx) => this.listTomorrow(ctx));
        this.bot.action("list.week", (ctx) => this.listWeek(ctx));
        this.bot.action("list.month", (ctx) => this.listMonth(ctx));

        this.bot.action(/^delete\.task\.(\d+)$/, (ctx) => this.deleteTask(ctx));

        this.bot.action(/^(de)?activate\.task\.(\d+)$/, (ctx) =>
            this.toggleTaskActive(ctx)
        );

        // `task|${this.id}|repeat|minute|60`
        this.bot.action(/^task\|(\d+)\|repeat\|(\d+)\|(\w+)$/, (ctx) =>
            this.setTaskRepeat(ctx)
        );
    }

    public async list(ctx: commandCtx): Promise<void> {
        const chat = await chatFromCtx(ctx);

        const tasksCount = await Task.countChatTasks(chat.id);

        if (tasksCount === 0) {
            this.noTasks(ctx, chat.language);
            return;
        }

        if (tasksCount < 10) {
            this.listTasks(ctx, await Task.getTasksByChatId(chat.id), chat.language);
            return;
        }

        ls.setLocale(chat.language);
        ctx.reply(
            ls.__("list.question"),
            Markup.inlineKeyboard([
                [Markup.button.callback(ls.__("list.options.all"), "list.all")],
                [
                    Markup.button.callback(ls.__("list.options.today"), "list.today"),
                    Markup.button.callback(
                        ls.__("list.options.tomorrow"),
                        "list.tomorrow"
                    ),
                ],
                [
                    Markup.button.callback(ls.__("list.options.week"), "list.week"),
                    Markup.button.callback(ls.__("list.options.month"), "list.month"),
                ],
            ])
        );
    }

    public async noTasks(ctx: commandCtx | actionCtx, language: string): Promise<void> {
        ls.setLocale(language);
        ctx.reply(ls.__("list.no_tasks"));
    }

    public async listTasks(
        ctx: actionCtx | commandCtx,
        tasks: Task[] | null,
        language = "ru"
    ): Promise<void> {
        if (!tasks || tasks.length === 0) {
            this.noTasks(ctx, language);
            return;
        }

        let messages = [];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            const message = task.getViewString(ls, language);
            const keyboard = this.viewButtons(task, language);
            messages.push({ text: message, buttons: keyboard });
        }

        for (let i = 0; i < messages.length; i++) {
            await ctx.replyWithMarkdownV2(messages[i].text, messages[i].buttons);
        }
        if (ctx.updateType === "callback_query") ctx.deleteMessage();
    }

    public async listAll(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }

        const chatId = ctx.update.callback_query.message.chat.id;
        const language = await chatLanguage(ctx);

        const all_tasks = await Task.getTasksByChatId(chatId);

        this.listTasks(ctx, all_tasks, language);
    }

    public async listToday(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }

        const chat_id = ctx.update.callback_query.message.chat.id;

        const today_tasks = await Task.getTasksByChatIdAndTriggerTimestampRange(
            chat_id,
            new Date(),
            TimeFunctions.getTomorrow(1, true)
        );

        const language = await chatLanguage(ctx);
        this.listTasks(ctx, today_tasks, language);
    }

    public async listTomorrow(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }

        const chat_id = ctx.update.callback_query.message.chat.id;

        const tomorrow_tasks = await Task.getTasksByChatIdAndTriggerTimestampRange(
            chat_id,
            TimeFunctions.getTomorrow(1, true),
            TimeFunctions.getTomorrow(2, true)
        );

        const language = await chatLanguage(ctx);

        this.listTasks(ctx, tomorrow_tasks, language);
    }

    public async listWeek(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }

        const chat_id = ctx.update.callback_query.message.chat.id;

        const week_tasks = await Task.getTasksByChatIdAndTriggerTimestampRange(
            chat_id,
            new Date(),
            TimeFunctions.getTomorrow(7)
        );

        const language = await chatLanguage(ctx);

        this.listTasks(ctx, week_tasks, language);
    }

    public async listMonth(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }

        const chat_id = ctx.update.callback_query.message.chat.id;

        const month_tasks = await Task.getTasksByChatIdAndTriggerTimestampRange(
            chat_id,
            new Date(),
            TimeFunctions.getTomorrow(30)
        );

        const language = await chatLanguage(ctx);

        this.listTasks(ctx, month_tasks, language);
    }

    public async deleteTask(ctx: actionCtx): Promise<void> {
        const task_id = Number(ctx.match[1]);
        ls.set(ctx);
        if (task_id === -1) {
            ctx.replyWithMarkdownV2(ls.__("list.task_not_found"));
            return;
        }
        const is_task = await Task.doesTaskExist(task_id);
        if (is_task) {
            await Task.deleteById(task_id);
            ctx.replyWithMarkdownV2(ls.__("list.task_deleted"));
        }

        ctx.deleteMessage();
    }

    public async toggleTaskActive(ctx: actionCtx): Promise<void> {
        const task_id = Number(ctx.match[2]);
        const language = await chatLanguage(ctx);

        ls.setLocale(language);
        if (task_id === -1) {
            ctx.replyWithMarkdownV2(ls.__("list.task_not_found"));
            return;
        }
        const task = await Task.findTask(task_id);
        await task.toggleActive();

        // edit message with markdownv2
        const newMessage = task.getViewString(ls, language);

        const keyboard = this.viewButtons(task, language);

        ctx.editMessageText(newMessage, {
            parse_mode: "MarkdownV2",
            reply_markup: keyboard.reply_markup,
        });
    }

    public viewButtons(
        task: Task,
        language: string
    ): Markup.Markup<InlineKeyboardMarkup> {
        ls.setLocale(language);
        const keyboard = [];
        let buttons = [];
        if (task.repeat_scheme?.is_repeatable) {
            const activationButton = Markup.button.callback(
                task.is_active ? ls.__("buttons.deactivate") : ls.__("buttons.activate"),
                task.is_active ? "deactivate.task." + task.id : "activate.task." + task.id
            );
            buttons.push(activationButton);
        }

        buttons.push(
            Markup.button.callback(ls.__("buttons.delete"), "delete.task." + task.id)
        );
        keyboard.push(buttons);

        if (task.hobby_data) {
            const hobbyButton = Markup.button.callback(
                ls.__("hobby.show_stats"),
                `hobby|${task.id}|stats`
            );
            keyboard.push([hobbyButton]);
        }
        return Markup.inlineKeyboard(keyboard);
    }

    public async setTaskRepeat(ctx: actionCtx) {
        // /^task\|(\d+)\|repeat\|(\d+)\|(\w+)$/
        const task_id = Number(ctx.match[1]);
        const repeat_value = Number(ctx.match[2]);
        const repeat_unit = ctx.match[3];

        let now = new Date();
        const seconds = TimeFunctions.calculateSecondsFromString(
            `${repeat_unit} ${repeat_value}`
        );
        now = new Date(now.getTime() + seconds * 1000);
        const new_timestamp = TimeFunctions.withZeroSeconds(now);

        const task = await Task.findTask(task_id);
        await task.updateTriggerTimestamp(new_timestamp);

        const newKeyboard = Markup.inlineKeyboard([
            Markup.button.callback(ls.__("buttons.sure"), "IGNORE"),
        ]);

        ctx.editMessageReplyMarkup(newKeyboard.reply_markup);
    }
}
