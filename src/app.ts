import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import { LocaleService } from "./helpers/LocaleService";
// const ls = new LocaleService(i18n);
// const ls = LocaleService.Instance;
import BasicCommandController from "./controllers/CommandsController";
import NotificationController from "./controllers/NotificationController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import TaskCommand from "./commands/TaskCommand";
import ListCommand from "./commands/ListCommand";
import { Logger } from "./helpers/Logger";
import { message } from "telegraf/filters";
import User from "./models/User";
import HobbyController from "./commands/HobbyCommands";
import { userFromCtx } from "./helpers/UserRegistration";

dotenv.config();

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
    const user = await userFromCtx(ctx);
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
logger.info(Date.now().toString());

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
