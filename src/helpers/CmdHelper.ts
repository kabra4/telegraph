// class to handle reminders: add, remove, update, send

import { Context, Markup, NarrowedContext } from "telegraf";
import { Update, Message, CallbackQuery } from "typegram";
import { UserSelectedOptions } from "../models/types";

import {
    hearsCtx,
    actionCtx,
    hearsRegexCtx,
    commandCtx,
    textMessageCtx,
} from "../models/types";
import User from "../models/User";
import { callbackQuery } from "telegraf/filters";
import { LocaleService } from "./LocaleService";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";

const ls = LocaleService.Instance;

export default class CmdHelper {
    constructor() {
        return;
    }

    public static repeat_cycles: string[][] = [
        ["daily", "weekly"],
        ["monthly", "yearly"],
        ["interval"],
    ];

    public static async userFromCtx(
        ctx: textMessageCtx | actionCtx | hearsCtx | commandCtx
    ): Promise<User> {
        if (ctx.callbackQuery) {
            return await User.findUser(ctx.callbackQuery.from.id);
        } else if (ctx.message) {
            return await User.findUser(ctx.message.from.id);
        } else {
            return await new User();
        }
    }

    public static getCallbackText(ctx: actionCtx) {
        if (ctx.has(callbackQuery("data"))) {
            return ctx.callbackQuery.data;
        } else {
            return "";
        }
    }

    public static splitWithComma(text: string, spaces: boolean = false): string[] {
        if (spaces) {
            return text.split(/[\s,]+/).map((t) => t.trim());
        }
        return text.split(",").map((t) => t.trim());
    }

    public static keyboardFromMatrix(
        matrix: string[][] | number[][],
        lsPrefix: string,
        callbackPrefix: string,
        language: string
    ): Markup.Markup<InlineKeyboardMarkup> {
        ls.setLocale(language);
        const keyboard = Markup.inlineKeyboard(
            matrix.map((cycleList) =>
                cycleList.map((cycle) =>
                    Markup.button.callback(
                        ls.__(lsPrefix + cycle),
                        callbackPrefix + cycle
                    )
                )
            )
        );
        return keyboard;
    }

    public static repeatTypesKeyboard(
        prefix: string,
        language: string
    ): Markup.Markup<InlineKeyboardMarkup> {
        return CmdHelper.keyboardFromMatrix(
            CmdHelper.repeat_cycles,
            prefix,
            prefix,
            language
        );
    }
}
