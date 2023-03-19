import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import i18n from "./configs/i18n.config";
import { LocaleService } from "./helpers/LocaleService";
import TgUser from "./models/TgUser";
import BasicCommandController from "./controllers/CommandsController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import ReminderCommand from "./commands/ReminderCommand";
import CalendarMaker from "./helpers/CalendarMaker";
import "./helpers/TimeFunctions";
import TimeFunctions from "./helpers/TimeFunctions";

dotenv.config();
const ls = new LocaleService(i18n);

// interface MyContext extends Context<Update> {
//   user_id: string;
//   tg_id: string;
//   user_lang: string;
//   remainderOptions: ReminderOptions;
// }

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

// const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);
// const bot: Telegraf<MyContext> = new Telegraf(token);

const commandController = new BasicCommandController(bot);
const languageCommand = new LanguageCommand(bot);
const reminderCommand = new ReminderCommand(bot);

console.log("Bot started");
console
  .log
  // TimeParser.calculateClosestDateTime("2021-10-10", ["12:00", "13:00"], true)
  ();

// const chatId: string = process.env.CHAT_ID as string;

// const actionController = new ActionController(bot);

// bot.help((ctx) => {
//   ctx.reply("Send /start to receive a greeting");
//   ctx.reply("Send /keyboard to receive a message with a keyboard");
//   ctx.reply("Send /quit to stop the bot");
// });

bot.command("quit", (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id);

  // Context shortcut
  ctx.leaveChat();
});

bot.command("test", (ctx) => {
  // new TgUser()
  //   .getDataByTgId(ctx.from.id)
  //   .then((res) => ctx.reply("Your id is " + JSON.stringify(res.id)));
  console
    .log
    // TimeParser.calculateClosestDateTime("2023-10-10", ["12:00", "13:00"], false)
    ();
  // const users = new TgUser().getAll().then((res) => {
  //   console.log(res);
  //   ctx.reply("All users: " + JSON.stringify(res));
  // });
  // console.log(users);
  // const user = new TgUser().getDataByTgId(ctx.from.id).then((res) => {
  //   ctx.reply("Your id is " + JSON.stringify(res));
  // });
});

// bot.command("keyboard", (ctx) => {
//   ctx.reply(
//     "Keyboard 111",
//     Markup.inlineKeyboard([
//       Markup.button.callback("First option", "first opiton"),
//       Markup.button.callback("Second option", "second"),
//     ])
//   );
// });

// bot.on("text", (ctx) => {
//   if (ctx.message.text === "set ru") {
//     ls.setLocale("ru");
//     ctx.reply("Language changed to Russian");
//     ctx.reply(ls.__("Hello"));
//   }
//   ctx.reply(
//     "You choose the " +
//       (ctx.message.text === "first" ? "First" : "Second") +
//       " Option!"
//   );

//   if (chatId) {
//     telegram.sendMessage(
//       chatId,
//       "This message was sent without your interaction!"
//     );
//   }
// });

// bot callback query
// bot.on("callback_query", (ctx) => {
//   // log the callback query
//   console.log(ctx.callbackQuery);
//   console.log(ctx.answerCbQuery);

//   ctx.reply("You choose the " + ctx.callbackQuery.message + " Option!");
//   // console.log(ctx.callbackQuery.message);
// });

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
