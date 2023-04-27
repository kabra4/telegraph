import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import BasicCommandController from "./controllers/CommandsController";
import NotificationController from "./controllers/NotificationController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import TaskCommand from "./commands/TaskCommand";
import ListCommand from "./commands/ListCommand";
import "./helpers/TimeFunctions";
import { Logger } from "./helpers/Logger";
import { message } from "telegraf/filters";
import User from "./models/User";
import HobbyController from "./commands/HobbyCommands";

dotenv.config();
// const ls = new LocaleService(i18n);

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const logger = Logger.getInstance();

export const commandController = new BasicCommandController(bot);
export const languageCommand = new LanguageCommand(bot);
export const listCommand = new ListCommand(bot);
export const taskCommand = new TaskCommand(bot);
export const hobbyCommand = new HobbyController(bot);
export const notificationController = new NotificationController(bot);

bot.on(message("text"), async (ctx) => {
    const user = await User.findUser(ctx.message.from.id);
    if (user.currently_doing.includes("task")) {
        taskCommand.processMessage(ctx, user);
    } else if (user.currently_doing.includes("hobby")) {
        hobbyCommand.processMessage(ctx, user);
    }
});

bot.command("quit", (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id);

    // Context shortcut
    ctx.leaveChat();
});

bot.launch();

logger.info("Bot started");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
