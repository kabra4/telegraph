import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import User from "../models/User";
import { prisma } from "../helpers/prismaClient";
import {
    actionCtx,
    commandCtx,
    hearsCtx,
    startCtx,
    textMessageCtx,
} from "../models/types";
import Chat from "../models/Chat";

export async function userExists(userId: number): Promise<boolean> {
    let userData = await User.userData(userId);
    if (userData) {
        return true;
    } else {
        return false;
    }
}

export async function userFromTextCtx(
    ctx: commandCtx | textMessageCtx | hearsCtx | startCtx
): Promise<User> {
    const userId = ctx.message.from.id;
    const userData = await User.userData(userId);

    if (!userData) {
        return await User.createUser(
            userId,
            ctx.message.from.first_name,
            ctx.message.from.last_name,
            ctx.message.from.username,
            ctx.message.from.language_code
        );
    } else {
        return User.fromData(userData);
    }
}

export async function userFromCallback(ctx: actionCtx): Promise<User> {
    const userId = ctx.callbackQuery.from.id;
    const userData = await User.userData(userId);

    if (!userData) {
        return await User.createUser(
            userId,
            ctx.callbackQuery.from.first_name,
            ctx.callbackQuery.from.last_name,
            ctx.callbackQuery.from.username,
            ctx.callbackQuery.from.language_code
        );
    } else {
        return User.fromData(userData);
    }
}

export async function userFromCtx(
    ctx: textMessageCtx | actionCtx | hearsCtx | commandCtx | startCtx
): Promise<User> {
    if (ctx.callbackQuery) {
        return await userFromCallback(ctx);
    } else if (ctx.message) {
        return await userFromTextCtx(ctx);
    } else {
        return await new User();
    }
}

export async function chatFromTextCtx(
    ctx: commandCtx | textMessageCtx | hearsCtx | startCtx
): Promise<Chat> {
    const chatId = ctx.message.chat.id;
    const chatData = await prisma.chat.findUnique({
        where: {
            id: chatId,
        },
    });

    if (!chatData) {
        return await Chat.createChat(chatId, ctx.chat.type, ctx.from.language_code);
    } else {
        return Chat.fromData(chatData);
    }
}

export async function chatFromCallback(ctx: actionCtx): Promise<Chat> {
    const chatId = ctx.chat?.id;
    if (!chatId) {
        return await new Chat();
    }

    const chatData = await prisma.chat.findUnique({
        where: {
            id: chatId,
        },
    });

    if (!chatData) {
        return await Chat.createChat(
            chatId,
            ctx.callbackQuery.message?.chat.type,
            ctx.callbackQuery.from.language_code
        );
    } else {
        return Chat.fromData(chatData);
    }
}

export async function chatExists(chatId: number): Promise<boolean> {
    let chatData = await prisma.chat.findUnique({
        where: {
            id: chatId,
        },
    });
    if (chatData) {
        return true;
    } else {
        return false;
    }
}

export async function chatFromCtx(
    ctx: textMessageCtx | actionCtx | hearsCtx | commandCtx | startCtx
): Promise<Chat> {
    if (ctx.callbackQuery) {
        return await chatFromCallback(ctx);
    } else if (ctx.message) {
        return await chatFromTextCtx(ctx);
    } else {
        return await new Chat();
    }
}

export async function chatLanguage(
    ctx: textMessageCtx | actionCtx | hearsCtx | commandCtx | startCtx,
    userLanguage: string | undefined = undefined
): Promise<string> {
    const chatType = ctx.chat?.type;
    if (chatType === "private" && userLanguage) {
        return userLanguage;
    }

    if (ctx.callbackQuery) {
        return chatFromCallback(ctx).then((chat) => chat.language);
    } else if (ctx.message) {
        return chatFromTextCtx(ctx).then((chat) => chat.language);
    } else {
        return "ru";
    }
}
