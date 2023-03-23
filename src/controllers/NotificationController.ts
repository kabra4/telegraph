import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TimeFunctions from "../helpers/TimeFunctions";
import Task from "../models/Task";
import User from "../models/User";
import { commandCtx, actionCtx } from "../models/types";
import { callbackQuery } from "telegraf/filters";

const ls = LocaleService.Instance;

export default class NotificationController {
    private bot: Telegraf<Context<Update>>;

    private interval = 60000;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.init();
        console.log("Notification controller initialized");
    }

    private init(): void {
        let now = new Date();
        let delay = this.interval - now.getSeconds() * 1000 - now.getMilliseconds();
        setTimeout(() => {
            this.sendNotifications();
            setInterval(this.sendNotifications, this.interval);
        }, delay);
    }

    public async sendNotifications(): Promise<void> {
        const now = TimeFunctions.nowWithZeroSeconds();
        const tasks = await Task.getTasksByTriggerTimestampWithUser(now);
        if (!tasks) return;
        for (const task of tasks) {
            const chat_id = task.chat_id;
            const user = task.user_data || (await User.findUser(task.user_id));
            const language = user.language || "ru";

            // TODO: add notification text

            this.bot.telegram.sendMessage(chat_id, "notification" + "\n" + task.name);
        }
    }
}
