import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { Update } from "typegram";
import { LocaleService } from "../helpers/LocaleService";
import TimeFunctions from "../helpers/TimeFunctions";
import Task from "../models/Task";
import User from "../models/User";
import { commandCtx, actionCtx } from "../models/types";
import { callbackQuery } from "telegraf/filters";
import Chat from "../models/Chat";
import { Logger } from "../helpers/Logger";
import Hobby from "../models/Hobby";
const logger = Logger.getInstance();

const ls = LocaleService.Instance;

export default class NotificationController {
    private bot: Telegraf<Context<Update>>;

    private interval = 60000;
    private startTime = new Date();

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.init();
    }

    private init(): void {
        let now = new Date();
        let delay = this.interval - now.getSeconds() * 1000 - now.getMilliseconds();
        setTimeout(() => {
            this.sendNotifications();
            setInterval(this.sendNotifications.bind(this), this.interval);
        }, delay);
    }

    public async sendNotifications(): Promise<void> {
        this.startTime = new Date();
        const now = TimeFunctions.nowWithZeroSeconds();
        const tasks = await Task.getTasksByTriggerTimestampWithChat(now);
        if (!tasks || tasks.length === 0) return;

        for (const task of tasks) {
            const chat_id = task.chat_id;
            const chat = task.chat_data || (await Chat.findChat(task.chat_id));
            if (!chat) continue;
            const language = chat.language || "ru";

            const message = await NotificationController.taskToMessage(task, language);

            if (task.action_type === "task") {
                // just task
                this.bot.telegram.sendMessage(chat_id, message);
            } else if (task.action_type === "hobby" && task.hobby_data) {
                // hobby
                const hobby = Hobby.fromData(task.hobby_data);
                const buttons = hobby.answerButtons(ls, language);
                this.bot.telegram.sendMessage(chat_id, message, buttons);
            }
        }
        this.recalculateTasks(tasks);
    }

    public static async taskToMessage(task: Task, language: string): Promise<string> {
        const text = task.name;
        if (text === "") {
            ls.setLocale(language);
            return ls.__("words.notification") + "\n\n" + ls.__("task.no_name");
        }
        return text;
    }

    private recalculateTasks(tasks: Task[]): void {
        for (const task of tasks) {
            task.recalculate();
        }
        const endTime = new Date();
        const time = endTime.getTime() - this.startTime.getTime();
        logger.info(`Sent ${tasks.length} notifications in ${time} ms`);
    }
}
