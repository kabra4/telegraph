import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import i18n from "./configs/i18n.config";
import { LocaleService } from "./helpers/LocaleService";
import BasicCommandController from "./controllers/CommandsController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import TaskCommand from "./commands/TaskCommand";
import ListCommand from "./commands/ListCommand";
import "./helpers/TimeFunctions";
import User from "./models/User";
import Chat from "./models/Chat";

dotenv.config();
// const ls = new LocaleService(i18n);

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

export const commandController = new BasicCommandController(bot);
export const languageCommand = new LanguageCommand(bot);
export const listCommand = new ListCommand(bot);
export const taskCommand = new TaskCommand(bot);

// bot.use(async (ctx, next) => {
//     const chat_id = ctx.chat?.id;
//     const user_id = ctx.from?.id;
//     if (chat_id && user_id) {
//         const chat = await Chat.findChat(chat_id);
//         const user = await User.findUser(user_id);
//         if (!chat.data && user.data) {
//             const chats_language = ctx.from.language_code;
//             await chat.create(chat_id, chats_language);
//             await user.create(
//                 user_id,
//                 ctx.from.first_name,
//                 ctx.from.username,
//                 ctx.from.last_name,
//                 chats_language
//             );
//         }
//     }
//     await next(); // runs next middleware
// });

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
