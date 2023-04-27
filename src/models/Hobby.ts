import { prisma } from "../helpers/prismaClient";
import { Hobby as HobbyType } from "@prisma/client";
import Task from "./Task";
import HobbyLog from "./HobbyLog";
import User from "./User";
import { HobbyProperties } from "./types";
import { Markup } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { LocaleService } from "../helpers/LocaleService";

const ls = LocaleService.Instance;

type JsonDataItem = {
    datetime: string;
    value: string;
};

export default class Hobby {
    public id = -1;
    public name = "";
    public answers: string[] = [];
    public task_id = -1;
    public task: Task | undefined;
    public user_id = -1;
    public user: User | undefined;
    protected handler = prisma.hobby;
    public logs: HobbyLog[] = [];

    public data: HobbyType | null;

    constructor(id?: number) {
        this.id = id || -1;
        this.data = {} as HobbyType;
        if (this.id !== -1) {
            this.getData();
        }
    }

    public async getData(): Promise<void> {
        try {
            this.data = await this.handler.findUnique({
                where: {
                    id: this.id,
                },
            });
            this.dataToAttributes(this.data);
        } catch (err) {
            return;
        }
    }

    public getId(): number {
        return this.id;
    }

    public static fromData(data: HobbyType): Hobby {
        const hobby = new Hobby(data.id);
        hobby.dataToAttributes(data);
        return hobby;
    }

    public setAttributes(name: string, user_id: number, answers: string[]) {
        this.name = name;
        this.user_id = user_id;
        this.answers = answers;
        this.attributesToData();
    }

    public answerButtons(language: string): Markup.Markup<InlineKeyboardMarkup> {
        const keyboard = [];
        for (let i = 0; i < this.answers.length; i += 3) {
            const row = this.answers
                .slice(i, i + 3)
                .map((answer) =>
                    Markup.button.callback(answer, `hobby|${this.id}|log|${answer}`)
                );
            keyboard.push(row);
        }
        ls.setLocale(language);
        keyboard.push([
            Markup.button.callback(
                ls.__("task.info.repeat_after_1_hour"),
                `task|${this.id}|repeat|60|minutes`
            ),
        ]);
        return Markup.inlineKeyboard(keyboard);
    }

    public dataToAttributes(data: HobbyType | null): void {
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.answers = data.answers;
            this.user_id = data.user_id;
        }
    }

    public async create(name: string, user_id: number, answers: string[]): Promise<void> {
        try {
            this.data = await this.handler.create({
                data: {
                    name,
                    answers,
                    user_id,
                },
            });
            this.dataToAttributes(this.data);
        } catch (err) {
            return;
        }
    }

    public async update(
        name: string,
        user_id: number = this.user_id,
        answers: string[] = this.answers
    ): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    name,
                    user_id,
                    answers,
                },
            });
            this.dataToAttributes(this.data);
        } catch (err) {
            return;
        }
    }

    public async delete(): Promise<void> {
        try {
            await this.handler.delete({
                where: {
                    id: this.id,
                },
            });
        } catch (err) {
            return;
        }
    }

    public async getLogs(): Promise<HobbyLog[]> {
        this.logs = await HobbyLog.getHobbyLogByHobbyId(this.id);
        return this.logs;
    }

    public async getHobbyAnswers() {
        return this.answers;
    }

    public static async getHobbyById(id: number): Promise<Hobby> {
        const hobby = new Hobby(id);
        await hobby.getData();
        return hobby;
    }

    public static async getHobbyByUserId(id: number): Promise<Hobby[]> {
        const hobbies = await prisma.hobby.findMany({
            where: {
                user_id: id,
            },
        });
        return hobbies.map((hobby) => new Hobby(hobby.id));
    }

    public async getTask(): Promise<Task> {
        this.task = await new Task(this.task_id);
        return this.task;
    }

    public async getUser(): Promise<User> {
        this.user = await new User(this.user_id);
        return this.user;
    }

    public async save() {
        if (this.id === -1) {
            await this.create(this.name, this.user_id, this.answers);
            return;
        }

        await this.update(this.name, this.user_id, this.answers);
    }

    public attributesToData() {
        this.data = {
            id: this.id,
            name: this.name,
            answers: this.answers,
            user_id: this.user_id,
        };
        return this.data;
    }

    public static async logsDataForStats(hobbyId: number): Promise<JsonDataItem[]> {
        const logsData = await prisma.hobbyLog.findMany({
            take: 100,
            orderBy: {
                registered: "desc",
            },
            select: {
                registered: true,
                response: true,
            },
            where: {
                hobby_id: hobbyId,
            },
        });

        if (logsData.length === 0) {
            return [];
        }

        const logs = logsData.map((log) => {
            return {
                datetime: log.registered.toString(),
                value: log.response || "",
            };
        });

        return logs;
    }
}
