
import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TimeFunctions from "../helpers/TimeFunctions";
import Task from "../models/Task";
import { commandCtx, actionCtx } from "../models/types";
import User from "../models/User";

const ls = LocaleService.Instance;

export default class ListCommand {
    private bot: Telegraf<Context<Update>>;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("list", (ctx) => this.list(ctx));
        // this.bot.action("list.all", (ctx) => this.listAll(ctx));
        // this.bot.action("list.today", (ctx) => this.listToday(ctx));
        // this.bot.action("list.tomorrow", (ctx) => this.listTomorrow(ctx));
        // this.bot.action("list.week", (ctx) => this.listWeek(ctx));
        // this.bot.action("list.month", (ctx) => this.listMonth(ctx));
    }

    public async list(ctx: commandCtx): Promise<void> {
        const user = await User.findUser(ctx.from.id);
        ls.setLocale(user.language);
        this.bot.telegram.sendMessage(
            ctx.from.id,
            ls.__("list.question"),
            Markup.inlineKeyboard([
                Markup.button.callback(ls.__("list.options.all"), "list.all"),
                Markup.button.callback(ls.__("list.options.today"), "list.today"),
                Markup.button.callback(ls.__("list.options.tomorrow"), "list.tomorrow"),
                Markup.button.callback(ls.__("list.options.week"), "list.week"),
                Markup.button.callback(ls.__("list.options.month"), "list.month"),
            ])
        );
    }

    public async listAll(ctx: actionCtx): Promise<void> {
        if (!ctx.update.callback_query.message) {
            ctx.deleteMessage();
            return;
        }
        const chat_id = ctx.update.callback_query.message.chat.id;

        const all_tasks = await Task.getTasksByChatId(chat_id);

        if (!all_tasks || all_tasks.length === 0) {
            ctx.reply(ls.__("list.no_tasks"));
            return;
        }

        let messages = [];

        for (let i = 0; i < all_tasks.length; i++) {
            const task = all_tasks[i];
            const triggerString = TimeFunctions.formatDate(task.trigger_timestamp);
            // const isActive = task ? ls.__("list.active") : ls.__("list.inactive");
            const name = task.name ? task.name : ls.__("list.no_name");
            const isRepeatable = task.repeat_scheme ? task.repeat_scheme.is_repeatable : false;
            const repeatString = isRepeatable ? ls.__("list.repeatable") : ls.__("list.not_repeatable");

            const deleteInlineButton = Markup.button.callback(
                ls.__("buttons.delete"),
                `delete.task.${task.id}`
            );

            const message = `${name}\n${triggerString}`;

        }
    }

    public static getTaskView(task: Task): string {
            const triggerString = TimeFunctions.formatDate(task.trigger_timestamp);
            // const isActive = task ? ls.__("list.active") : ls.__("list.inactive");
            const name = task.name ? task.name : ls.__("list.no_name");
            const isRepeatable = task.repeat_scheme ? task.repeat_scheme.is_repeatable : false;
            const repeatString = isRepeatable ? ls.__("list.repeatable") : ls.__("list.not_repeatable");
            const repeatPattern = ""
            if (isRepeatable && task.repeat_scheme) {
                const checked_days = task.repeat_scheme.days_of_month ? task.repeat_scheme.days_of_month : task.repeat_scheme.days_of_week;
            }

            const deleteInlineButton = Markup.button.callback(
                ls.__("buttons.delete"),
                `delete.task.${task.id}`
            );

            const message = `${name}\n${triggerString}`;
            return message;
    }
}