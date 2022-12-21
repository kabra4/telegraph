import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
import i18n from "./configs/i18n.config";
import { LocaleService } from "./helpers/LocaleService";
import TgUser from "./models/TgUser";
import BasicCommandController from "./controllers/CommandsController";
// import ActionController from "./controllers/ActionController";
import LanguageCommand from "./commands/LanguageCommand";
import RemainderCommand from "./commands/RemainderCommand";
import CalendarMaker from "./helpers/CalendarMaker";

dotenv.config();
const ls = new LocaleService(i18n);

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

// const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

// const chatId: string = process.env.CHAT_ID as string;

const commandController = new BasicCommandController(bot);
const languageCommand = new LanguageCommand(bot);
const remainderCommand = new RemainderCommand(bot);
// const actionController = new ActionController(bot);

// bot.start((ctx) => {
//   ctx.reply("Hello " + ctx.from.first_name + "!");
//   // add user to db
//   // const user = pb
//   //   .collection("tg_users")
//   //   .create({
//   //     tg_id: ctx.from.id,
//   //     name: ctx.from.first_name,
//   //     surname: ctx.from.last_name,
//   //     language: ctx.from.language_code,
//   //     last_active: new Date(),
//   //   })
//   //   .then((res) => {
//   //     // send message to user with his id
//   //     ctx.reply("Your id is " + res.id);
//   //   });
//   const user = new TgUser().getByTgId(ctx.from.id).then((res) => {
//     if (res === null || res === undefined || Object.keys(res).length === 0) {
//       new TgUser()
//         .create({
//           tg_id: ctx.from.id,
//           name: ctx.from.first_name,
//           surname: ctx.from.last_name,
//           language: ctx.from.language_code,
//           last_active: new Date(),
//           phone_number: "",
//         })
//         .then((res) => {
//           ctx.reply("Your new id is " + res.id);
//         });
//     } else {
//       ctx.reply("Your id is " + res.id);
//     }
//   });
// });

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
  ctx.reply(
    // print text of the message
    "You wrote: " + ctx.message.text
  );
  // const users = new TgUser().getAll().then((res) => {
  //   console.log(res);
  //   ctx.reply("All users: " + JSON.stringify(res));
  // });
  // console.log(users);
  // const user = new TgUser().getByTgId(ctx.from.id).then((res) => {
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
