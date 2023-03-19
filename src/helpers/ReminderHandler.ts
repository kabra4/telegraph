// class to handle reminders: add, remove, update, send

import { Context, NarrowedContext } from "telegraf";
import { Update, Message, CallbackQuery } from "typegram";
import { ReminderOptions } from "../models/types";
import TgUser from "../models/TgUser";

// export default class ReminderHandler {
