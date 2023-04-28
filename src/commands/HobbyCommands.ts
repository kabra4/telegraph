// class to control the hobby command of the bot for the user

import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { CallbackQuery, Message, Update } from "typegram";
import { callbackQuery, message } from "telegraf/filters";
// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import User from "../models/User";
import CalendarMaker from "../helpers/CalendarMaker";
import TimeFunctions from "../helpers/TimeFunctions";
import CmdHelper from "../helpers/CmdHelper";
import { chatLanguage, userFromCtx } from "../helpers/UserRegistration";

import {
    hearsCtx,
    actionCtx,
    hearsRegexCtx,
    commandCtx,
    textMessageCtx,
} from "../models/types";
import HobbyLog from "../models/HobbyLog";
import Hobby from "../models/Hobby";
import { createNoDataImage, generateStackedBarChart } from "../helpers/ChartMaker";

const ls = LocaleService.Instance;

export default class HobbyController {
    // the bot
    private bot: Telegraf<Context<Update>>;

    // the constructor of the task controller
    // takes the bot
    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.bot.command("hobby", (ctx) => this.hobby(ctx));

        this.registerCallbacks();
    }

    private registerCallbacks(): void {
        // receive answer from hobby
        this.bot.action(/^hobby\|(\d+)\|log\|(.*)\|time\|(\d+)$/, async (ctx) => {
            this.logHobbyAnswer(ctx);
        });

        // show hobby stats
        this.bot.action(/^hobby\|(\d+)\|stats$/, async (ctx) => {
            this.showHobbyStats(ctx);
        });
    }

    private async hobby(ctx: commandCtx): Promise<void> {
        this.askHobbyName(ctx);
    }

    private async askHobbyName(ctx: commandCtx, user?: User): Promise<void> {
        user ||= await userFromCtx(ctx);
        user.updateCurrentlyDoing("hobby.name");
        user.resetReminderOptions({ action_type: "hobby" });
        ls.set(ctx, user.language);
        ctx.reply(ls.__("task.questions.hobby_name.text"));
    }

    public async processMessage(ctx: textMessageCtx, user: User) {
        if (!user.currently_doing.includes("hobby")) {
            return;
        }

        if (user.currently_doing === "hobby.name") {
            this.processNameInput(ctx, user);
        } else if (user.currently_doing === "hobby.answers") {
            this.processHobbyAnswers(ctx, user);
        }
    }

    // the function to process the "name" answer
    private async processNameInput(ctx: textMessageCtx, user: User) {
        user.updateTaskOptionProperty({
            name: ctx.message.text,
        });

        this.startTaskCreation(ctx, user);
    }

    public async startTaskCreation(ctx: commandCtx, user?: User): Promise<void> {
        user ||= await User.findUser(ctx.message.from.id);

        user.updateCurrentlyDoing("hobby.answers");

        ls.set(ctx, user.language);
        ctx.replyWithMarkdownV2(ls.__("hobby.questions.answers.text"));
    }

    private isValidHobbyAnswer(text: string): boolean {
        const reg = /^\w+(\s*\,\s*\w+)*$/;
        return reg.test(text);
    }

    private async processHobbyAnswers(ctx: textMessageCtx, user: User) {
        const language = await chatLanguage(ctx, user.language);
        if (!this.isValidHobbyAnswer(ctx.message.text)) {
            ls.setLocale(language);
            ctx.reply(ls.__("hobby.answers.invalid"));
            return;
        }

        const answers = CmdHelper.splitWithComma(ctx.message.text);

        user.updateTaskOptionProperty({
            repeat: true,
            hobby_answers: answers,
            has_beforehand: false,
        });

        user.updateCurrentlyDoing("task.repeat.cycle");
        ls.setLocale(language);
        ctx.reply(
            ls.__("task.questions.repeat.text"),
            CmdHelper.repeatTypesKeyboard("task.questions.repeat.options.", language)
        );
    }

    private async logHobbyAnswer(ctx: actionCtx): Promise<void> {
        const hobbyId = parseInt(ctx.match[1]);
        const answer = ctx.match[2];
        const time = parseInt(ctx.match[3]);

        HobbyLog.logHobbyAnswer(hobbyId, answer, time);

        const hobby = await Hobby.getHobbyById(hobbyId);

        ls.set(ctx);
        let ctxText = hobby.name + ": " + answer;
        let button = Markup.inlineKeyboard([
            Markup.button.callback(
                ls.__("hobby.show_stats"),
                "hobby|" + hobbyId + "|stats"
            ),
            Markup.button.callback(ls.__("hobby.hide"), "delete|this|message"),
        ]);

        ctx.editMessageText(ctxText, button);
    }

    private async showHobbyStats(ctx: actionCtx): Promise<void> {
        const hobbyId = parseInt(ctx.match[1]);

        const language = await chatLanguage(ctx);

        const logsData = await Hobby.logsDataForStats(hobbyId);

        if (logsData.length === 0) {
            ls.setLocale(language);
            const text = ls.__("hobby.no_logs");
            const imageBuffer = await createNoDataImage(text, 400, 300);
            ctx.replyWithPhoto({ source: imageBuffer });
        } else {
            // reverse the array
            logsData.reverse();
            const imageBuffer = await generateStackedBarChart(logsData, language);
            ctx.replyWithPhoto({ source: imageBuffer });
        }
    }
}
