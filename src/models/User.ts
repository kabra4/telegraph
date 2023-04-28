import { prisma } from "../helpers/prismaClient";
import { User as userType } from "@prisma/client";
import { userProperties, UserSelectedOptions, TaskProperties } from "./types";
import RepeatScheme from "./RepeatScheme";
import Task from "./Task";

import { Logger } from "../helpers/Logger";
import Hobby from "./Hobby";
const logger = Logger.getInstance();

export default class User {
    public id: number;
    protected handler = prisma.user;
    private systemLanguages: string[] = ["en", "ru", "uz"];

    // the data of the user
    public data: userType | null;
    public name: string = "";
    public last_name: string = "";
    public username: string = "";
    public language: string = "ru";
    public currently_doing: string = "";

    public task_options: UserSelectedOptions = {};

    // the constructor of the user
    // takes the id of the user
    constructor(id?: number) {
        this.id = id || 0;
        this.data = {} as userType;
        if (this.id !== 0) {
            this.getData();
            this.task_options = this.data.task_options as UserSelectedOptions;
        }
    }

    public static async findUser(id: number): Promise<User> {
        const user = new User();
        user.id = id;
        await user.getData();
        return user;
    }

    // the function to create a new user
    // takes the data of the user
    // created user will be saved in the data property
    public async create(
        id: number,
        name: string,
        last_name: string = "",
        username: string = "",
        language: string = "ru"
    ): Promise<void> {
        if (!this.systemLanguages.includes(language)) {
            language = "ru";
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
            this.setProperty(this.data);
            logger.info(`User ${this.id} created`);
        } catch (err) {
            logger.error(err);
        }
    }

    public static async userData(id: number): Promise<userType | null> {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        return user;
    }

    public setProperty(userData: userType): void {
        this.data = userData;
        this.id = Number(userData.id);
        this.language = userData.language || "ru";
        this.name = userData.name || "";
        this.last_name = userData.last_name || "";
        this.currently_doing = userData.currently_doing || "";
        this.task_options = (userData.task_options as UserSelectedOptions) || {};
    }

    public static fromData(userData: userType): User {
        const user = new User();
        user.setProperty(userData);
        return user;
    }

    public static async createUser(
        id: number,
        name: string,
        last_name: string = "",
        username: string = "",
        language: string = "ru"
    ): Promise<User> {
        const user = new User();
        await user.create(id, name, last_name, username, language);
        logger.info(`User ${user.id} created`);
        return user;
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
                this.task_options = (this.data.task_options as UserSelectedOptions) || {};
            }
        } catch (err) {
            logger.error(err);
        }
    }

    // the function to get the id of the user
    // returns the id of the user
    public getId(): number {
        return this.id;
    }

    // the function to delete the user
    // returns the data of the user
    public async delete(): Promise<void> {
        if (this.id === 0) {
            return;
        }
        try {
            this.data = await this.handler.delete({
                where: {
                    id: this.id,
                },
            });
            logger.info(`User ${this.id} deleted`);
        } catch (err) {
            logger.error(err);
        }
    }

    public getTaskOptions(): UserSelectedOptions {
        return this.task_options;
    }

    public async update(data: userProperties): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data,
            });
        } catch (err) {
            logger.error(err);
        }
    }

    // the function to set the task options of the user
    // takes the task options of the user
    // returns the task options of the user
    public async updateTaskOptionProperty(property: UserSelectedOptions): Promise<void> {
        this.task_options = {
            ...this.task_options,
            ...property,
        };
        await this.update({ task_options: this.task_options });
    }

    public async resetReminderOptions(options?: UserSelectedOptions): Promise<void> {
        await this.update({ task_options: options || {} });
        this.task_options = {};
    }

    public async updateLanguage(language: string): Promise<void> {
        if (!this.systemLanguages.includes(language)) {
            language = "en";
        }
        await this.update({ language });
        this.language = language;
    }

    public async updateCurrentlyDoing(currently_doing: string): Promise<void> {
        await this.update({ currently_doing });
        this.currently_doing = currently_doing;
    }

    public async save(): Promise<void> {
        await this.update(this.systemPropertiesRemover(this.data));
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

    public should_ask_beforehand_time(): boolean {
        /* true when: task_options.repeat is true and repeat_cycle is not "interval" 
            or when: task_options.repeat is false */
        if (this.task_options.action_type === "hobby") {
            return false;
        }
        return (
            (this.task_options.repeat && this.task_options.repeat_cycle !== "interval") ||
            !this.task_options.repeat
        );
    }

    public async taskFromSelectedTaskOptions(chat_id: number): Promise<Task> {
        const task = new Task();
        task.user_id = this.id;
        task.chat_id = chat_id;
        task.name = this.task_options.name
            ? this.task_options.name.replace(".", "\\.")
            : "";
        task.action_type = this.task_options.action_type || "task";
        if (task.action_type === "hobby") {
            const hobby = new Hobby();
            hobby.setAttributes(
                task.name,
                this.id,
                this.task_options.hobby_answers || []
            );
            task.hobby = hobby;
        }
        task.has_beforehand_notification = this.task_options.has_beforehand || false;
        task.beforehand_seconds = this.task_options.beforehand_time || 0;
        task.max_trigger_count = this.task_options.max_trigger_count || 0;

        task.repeat_scheme = RepeatScheme.fromSelectedTaskOptions(this.task_options);

        task.trigger_timestamp = await task.repeat_scheme.getNextTrigger();

        if (task.has_beforehand_notification) {
            task.beforehand_task = task.createBeforehandTask();
        }

        return task;
    }
}
