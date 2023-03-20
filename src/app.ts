import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import i18n from "./configs/i18n.config";
import { LocaleService } from "./helpers/LocaleService";
import BasicCommandController from "./controllers/CommandsController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import ReminderCommand from "./commands/ReminderCommand";
import "./helpers/TimeFunctions";

dotenv.config();
// const ls = new LocaleService(i18n);

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

export const commandController = new BasicCommandController(bot);
export const languageCommand = new LanguageCommand(bot);
export const reminderCommand = new ReminderCommand(bot);

console.log("Bot started");

bot.command("quit", (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id);

    // Context shortcut
    ctx.leaveChat();
});

bot.command("test", (ctx) => {
    console.log("test");
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
