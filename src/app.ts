import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { Update } from "typegram";
import dotenv from "dotenv";
// import PocketBase from "pocketbase";
// import { I18n } from "i18n";

import TgUser from "./models/TgUser";
// const pb = new PocketBase("http://127.0.0.1:8090");
dotenv.config();

// I18n.configure({
//   locales: ["en", "ru", "uz"],
//   directory: __dirname + "/locales",
//   defaultLocale: "ru",
//   objectNotation: true,
// });

// const all_users = pb.collection("users");
// console.log(all_users);

// const user_demo = await pb.collection("users").create({
//   telegram_id: 123456789,
//   name: "John",
//   surname: "Doe",
//   language: "ru",
//   last_active: new Date(),
// });
// console.log(user_demo);

const token: string = process.env.TELEGRAM_BOT_TOKEN as string;

const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const chatId: string = process.env.CHAT_ID as string;

bot.start((ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
  // add user to db
  // const user = pb
  //   .collection("tg_users")
  //   .create({
  //     tg_id: ctx.from.id,
  //     name: ctx.from.first_name,
  //     surname: ctx.from.last_name,
  //     language: ctx.from.language_code,
  //     last_active: new Date(),
  //   })
  //   .then((res) => {
  //     // send message to user with his id
  //     ctx.reply("Your id is " + res.id);
  //   });
});

bot.help((ctx) => {
  ctx.reply("Send /start to receive a greeting");
  ctx.reply("Send /keyboard to receive a message with a keyboard");
  ctx.reply("Send /quit to stop the bot");
});

bot.command("quit", (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id);

  // Context shortcut
  ctx.leaveChat();
});

bot.command("test", (ctx) => {
  // pb.collection("tg_users")
  //   .getFullList()
  //   .then((res) => {
  //     console.log(res);
  //     ctx.reply("All users: " + JSON.stringify(res));
  //   });
  const users = new TgUser().getAll().then((res) => {
    console.log(res);
    ctx.reply("All users: " + JSON.stringify(res));
  });
  // console.log(users);
});

bot.command("keyboard", (ctx) => {
  ctx.reply(
    "Keyboard",
    Markup.inlineKeyboard([
      Markup.button.callback("First option", "first"),
      Markup.button.callback("Second option", "second"),
    ])
  );
});

bot.on("text", (ctx) => {
  ctx.reply(
    "You choose the " +
      (ctx.message.text === "first" ? "First" : "Second") +
      " Option!"
  );

  if (chatId) {
    telegram.sendMessage(
      chatId,
      "This message was sent without your interaction!"
    );
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
