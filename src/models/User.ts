import { prisma } from "../helpers/prismaClient";
import { User as userType } from "@prisma/client";
import { userProperties, TaskOptions } from "./types";

export default class User {
    public id: number;
    protected handler = prisma.user;
    private systemLanguages: string[] = ["en", "ru", "uz"];

    // the data of the user
    public data: userType | null;
    public language: string = "ru";
    public currently_doing: string = "";

    public task_options: TaskOptions = {};

    // the constructor of the user
    // takes the id of the user
    constructor(id?: number) {
        this.id = id || 0;
        this.data = {} as userType;
        if (this.id !== 0) {
            this.getData();
            this.task_options = this.data.task_options as TaskOptions;
        }
    }

    // the function to get the data of the user
    // returns the data of the user
    public async getData(): Promise<void> {
        try {
            this.data = await this.handler.findUnique({
                where: {
                    id: this.id,
                },
            });
            if (this.data) {
                this.language = this.data.language || "ru";
                this.currently_doing = this.data.currently_doing || "";
                this.task_options =
                    (this.data.task_options as TaskOptions) || {};
            }
        } catch (err) {
            return;
        }
    }

    // the function to get the id of the user
    // returns the id of the user
    public getId(): number {
        return this.id;
    }

    // the function to set the data of the user
    // takes the data of the user
    // returns the data of the user
    public async setData(data: { [key: string]: any }): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data,
            });
        } catch (err) {
            return;
        }
    }

    // the function to create a new user
    // takes the data of the user
    // created user will be saved in the data property
    public async create(
        id: number,
        name: string,
        last_name: string = "",
        username: string = "",
        language: string = "en"
    ): Promise<void> {
        if (!this.systemLanguages.includes(language)) {
            language = "en";
        }
        try {
            this.data = await this.handler.create({
                data: {
                    id,
                    name,
                    last_name,
                    username,
                    language,
                },
            });
            this.id = this.data.id;
            this.language = language;
        } catch (err) {
            return;
        }
    }

    // the function to delete the user
    // returns the data of the user
    public async delete(): Promise<void> {
        try {
            this.data = await this.handler.delete({
                where: {
                    id: this.id,
                },
            });
        } catch (err) {
            return;
        }
    }

    // the function to get the task options of the user
    // returns the task options of the user
    public getTaskOptions(): TaskOptions {
        return this.task_options;
    }

    // the function to set the task options of the user
    // takes the task options of the user
    // returns the task options of the user
    public async updateTaskOptionProperty(
        property: TaskOptions
    ): Promise<void> {
        this.task_options = {
            ...this.task_options,
            ...property,
        };
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    task_options: this.task_options,
                },
            });
        } catch (err) {
            return;
        }
    }

    public async resetReminderOptions(): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    task_options: {},
                },
            });
            this.task_options = {};
        } catch (err) {
            return;
        }
    }

    public static async findUser(id: number): Promise<User> {
        const user = new User();
        user.id = id;
        await user.getData();
        return user;
    }

    public async updateLanguage(language: string): Promise<void> {
        if (!this.systemLanguages.includes(language)) {
            language = "en";
        }
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    language,
                },
            });
            this.language = language;
        } catch (err) {
            return;
        }
    }

    public async updateCurrentlyDoing(currently_doing: string): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    currently_doing,
                },
            });
            this.currently_doing = currently_doing;
        } catch (err) {
            return;
        }
    }

    public async save(): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    ...this.systemPropertiesRemover(this.data),
                },
            });
        } catch (err) {
            return;
        }
    }

    private systemPropertiesRemover(data: userType | null): userProperties {
        if (!data) return {} as userProperties;
        const { id, createdAt, updatedAt, ...rest } = data;
        return rest as userProperties;
    }

    public toggleDaysSelection(day: string): void {
        const { checked_days } = this.task_options;
        if (!checked_days) {
            this.task_options.checked_days = [day];
            this.save();
            return;
        }
        const index = checked_days.indexOf(day);

        if (index >= 0) {
            // If the day is already in the array, remove it
            checked_days.splice(index, 1);
        } else {
            // If the day is not in the array, add it
            checked_days.push(day);
        }
        this.save();
    }
}
