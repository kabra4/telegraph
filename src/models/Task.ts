import { prisma } from "../helpers/prismaClient";
import {
    Task as TaskType,
    RepeatScheme as RepeatSchemeType,
    User as UserType,
    Chat as ChatType,
} from "@prisma/client";
import { TaskProperties, SelectedTaskOptions, RepeatSchemeProperties } from "./types";
import RepeatSchemeModel from "./RepeatScheme";
import TimeFunctions from "../helpers/TimeFunctions";

import { Logger } from "../helpers/Logger";
const logger = Logger.getInstance();

export default class Task {
    public id: number;
    public created_at: Date = new Date();
    public updated_at: Date = new Date();

    public handler = prisma.task;

    public data: TaskType | null;

    public name: string = "";
    public action_type: string = "";
    public is_beforehand: boolean = false;
    public beforehand_owner_id: number = -1;
    public chat_id: number = -1;
    public user_id: number = -1;
    public group_id: number = -1;
    public goal_id: number = -1;
    public is_active: boolean = true;
    public trigger_timestamp: Date = new Date();
    public last_triggered_timestamp: Date = new Date("1970-01-01");
    public trigger_count: number = 0;
    public max_trigger_count: number = 0;
    public has_beforehand_notification: boolean = false;
    public beforehand_seconds: number = 0;
    public content_text: string = "";

    public user_data: UserType | null = null;
    public chat_data: ChatType | null = null;

    public repeat_scheme: RepeatSchemeModel | null = null;
    public beforehand_task: Task | null = null;
    public beforehand_owner: Task | null = null;

    constructor(id?: number) {
        this.id = id || -1;
        this.data = {} as TaskType;
        if (this.id !== -1) {
            this.getData();
        }
    }

    public static async findTask(id: number): Promise<Task> {
        const task = new Task();
        task.id = id;
        await task.getData();
        return task;
    }

    public static doesTaskExist(id: number): Promise<boolean> {
        return prisma.task
            .findUnique({
                where: {
                    id: id,
                },
            })
            .then((data) => {
                return data !== null;
            });
    }

    public static async deleteById(id: number): Promise<void> {
        try {
            await prisma.task.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            logger.error(error);
        }
    }

    public static getTaskWithParams(
        data: TaskType & {
            repeat_scheme?: RepeatSchemeType | null;
            beforehand_task?: TaskType | null;
            user_data?: UserType | null;
            chat_data?: ChatType | null;
        }
    ): Task {
        const task = new Task();
        task.setAttributes(data);

        if (data.repeat_scheme) {
            task.repeat_scheme = RepeatSchemeModel.getRepeatSchemeWithParams(
                data.repeat_scheme
            );
        }
        if (data.beforehand_task) {
            task.beforehand_task = Task.getTaskWithParams(data.beforehand_task);
        }
        if (data.user_data) {
            task.user_data = data.user_data;
        }
        if (data.chat_data) {
            task.chat_data = data.chat_data;
        }
        return task;
    }

    public setAttributes(data: TaskType): void {
        this.id = data.id;
        this.created_at = data.createdAt;
        this.updated_at = data.updatedAt;
        this.is_beforehand = data.is_beforehand || false;
        this.beforehand_owner_id = data.beforehand_owner_id || -1;
        this.name = data.name || "";
        this.chat_id = data.chat_id || -1;
        this.user_id = data.user_id || -1;
        this.group_id = data.group_id || -1;
        this.trigger_timestamp = data.trigger_timestamp || new Date();
        this.last_triggered_timestamp =
            data.last_triggered_timestamp || new Date("1970-01-01");
        this.is_active = data.is_active || false;
        this.trigger_count = data.trigger_count || 0;
        this.max_trigger_count = data.max_trigger_count || 0;
        this.action_type = data.action_type || "";
        this.has_beforehand_notification = data.has_beforehand_notification || false;
        this.beforehand_seconds = data.beforehand_seconds || 0;
        this.content_text = data.content_text || "";

        this.data = data;
    }

    public async create(): Promise<void> {
        if (this.beforehand_task) {
            await this.createWithBeforehandTask();
            return;
        } else if (this.repeat_scheme) {
            await this.createWithRepeatScheme();
            return;
        }

        const data = this.systemPropertiesRemover(this.data);
        try {
            this.data = await this.handler.create({
                data,
            });
            this.setAttributes(this.data);
            logger.info(
                `Task ${this.id}, name ${this.name} created,, chat: ${this.chat_id}, user: ${this.user_id}`
            );
        } catch (err) {
            logger.error(err);
        }
    }

    public async createWithRepeatScheme(): Promise<void> {
        const data: TaskProperties = this.systemPropertiesRemover(this.data);
        if (!this.repeat_scheme) {
            return;
        }

        this.repeat_scheme.paramsToData();
        const repeatScheme: RepeatSchemeProperties =
            this.repeat_scheme.systemPropertiesRemover(this.repeat_scheme.data) || {};
        try {
            const reqJson = {
                data: {
                    ...data,
                    repeat_scheme: {
                        create: repeatScheme,
                    },
                },
            };
            this.data = await this.handler.create(reqJson);
            this.setAttributes(this.data);
            logger.info(
                `Task ${this.id} - ${this.name} created,, chat: ${this.chat_id}, user: {this.user_id}`
            );
        } catch (err) {
            logger.error(err);
        }
    }

    public async createWithBeforehandTask(): Promise<void> {
        const data: TaskProperties = this.systemPropertiesRemover(this.data);
        if (!this.beforehand_task) {
            return;
        }
        const beforehandTask: TaskProperties =
            this.systemPropertiesRemover(this.beforehand_task.data, true) || {};

        const repeatScheme: RepeatSchemeProperties =
            this.repeat_scheme?.systemPropertiesRemover(this.repeat_scheme.data) || {};
        try {
            const reqJson = {
                data: {
                    ...data,
                    repeat_scheme: {
                        create: repeatScheme,
                    },
                    beforehand_task: {
                        create: beforehandTask,
                    },
                },
            };
            this.data = await this.handler.create(reqJson);
            this.setAttributes(this.data);
            logger.info(
                `Task ${this.id} - ${this.name} created,, chat: ${this.chat_id}, user: {this.user_id}`
            );
        } catch (err) {
            logger.error(err);
        }
    }

    public async getData(): Promise<void> {
        try {
            let res = await this.handler.findUnique({
                where: {
                    id: this.id,
                },
                include: {
                    repeat_scheme: true,
                    beforehand_task: true,

                    beforehand_owner: {
                        include: {
                            repeat_scheme: true,
                        },
                    },
                },
            });
            if (!res) {
                return;
            }
            const { repeat_scheme, beforehand_task, beforehand_owner, ...data } = res;

            this.setAttributes(data);
            if (repeat_scheme) {
                this.repeat_scheme =
                    RepeatSchemeModel.getRepeatSchemeWithParams(repeat_scheme);
            }

            if (beforehand_task) {
                this.beforehand_task = Task.getTaskWithParams(beforehand_task);
            } else if (beforehand_owner) {
                const { repeat_scheme, ...data } = beforehand_owner;
                this.beforehand_owner = Task.getTaskWithParams(data);
                if (repeat_scheme) {
                    this.beforehand_owner.repeat_scheme =
                        RepeatSchemeModel.getRepeatSchemeWithParams(repeat_scheme);
                }
            }
        } catch (err) {
            logger.error(err);
        }
    }

    private attributesToData(): void {
        this.data = {
            id: this.id,
            updatedAt: this.updated_at,
            createdAt: this.created_at,
            name: this.name,
            action_type: this.action_type,
            is_beforehand: this.is_beforehand,
            beforehand_owner_id:
                this.beforehand_owner_id === -1 ? null : this.beforehand_owner_id,
            is_active: this.is_active,
            chat_id: this.chat_id === -1 ? null : this.chat_id,
            user_id: this.user_id === -1 ? null : this.user_id,
            group_id: this.group_id === -1 ? null : this.group_id,
            goal_id: this.goal_id === -1 ? null : this.goal_id,
            trigger_timestamp: this.trigger_timestamp,
            last_triggered_timestamp: this.last_triggered_timestamp,
            trigger_count: this.trigger_count,
            max_trigger_count: this.max_trigger_count,
            has_beforehand_notification: this.has_beforehand_notification,
            beforehand_seconds: this.beforehand_seconds,
            content_text: this.content_text,
        };
    }

    public async update(data: TaskProperties): Promise<void> {
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

    public async delete(): Promise<void> {
        if (this.id === 0) {
            return;
        }
        try {
            await this.handler.delete({
                where: {
                    id: this.id,
                },
            });
            logger.info(`Task ${this.id} - ${this.name} deleted`);
        } catch (err) {
            logger.error(err);
        }
    }

    public async save(): Promise<void> {
        this.attributesToData();
        if (this.id === -1) {
            await this.create();
        } else {
            await this.update(this.systemPropertiesRemover(this.data));
        }
    }

    private systemPropertiesRemover(
        data: TaskType | null,
        remove_owner_id: boolean = false
    ): TaskProperties {
        if (!data) return {} as TaskProperties;
        if (remove_owner_id) {
            const { id, createdAt, updatedAt, beforehand_owner_id, ...rest } = data;
            return rest as TaskProperties;
        }
        const { id, createdAt, updatedAt, ...rest } = data;
        return rest as TaskProperties;
    }

    public static async findTasks(where: any): Promise<Task[] | null> {
        const tasks = await prisma.task.findMany({
            where,
            include: {
                repeat_scheme: true,
            },
        });
        if (tasks.length === 0) {
            return null;
        }

        return tasks.map((task) => Task.getTaskWithParams(task));
    }

    public createBeforehandTask(): Task {
        const task = new Task();
        task.is_beforehand = true;
        task.chat_id = this.chat_id;
        task.user_id = this.user_id;
        task.group_id = this.group_id;
        task.last_triggered_timestamp = new Date("1970-01-01");
        task.trigger_count = this.trigger_count;
        task.max_trigger_count = this.max_trigger_count;
        task.action_type = "beforehand";
        task.has_beforehand_notification = false;
        task.beforehand_seconds = this.beforehand_seconds;
        task.content_text = this.content_text;
        task.name = this.name;

        task.trigger_timestamp = TimeFunctions.dateMinusSeconds(
            this.trigger_timestamp,
            this.beforehand_seconds
        );

        task.attributesToData();
        return task;
    }

    public static async getTasksByChatId(chat_id: number): Promise<Task[] | null> {
        const tasks = await prisma.task.findMany({
            where: {
                chat_id,
                is_beforehand: false,
            },
            include: {
                repeat_scheme: true,
            },
        });
        return tasks.map((task) => Task.getTaskWithParams(task));
    }

    public static async getTasksByChatIdAndTriggerTimestampRange(
        chat_id: number,
        start: Date,
        end: Date
    ): Promise<Task[] | null> {
        const tasks = await prisma.task.findMany({
            where: {
                chat_id,
                trigger_timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                repeat_scheme: true,
            },
        });
        return tasks.map((task) => Task.getTaskWithParams(task));
    }

    public async toggleActive(): Promise<void> {
        this.is_active = !this.is_active;
        await this.update({ is_active: this.is_active });
    }

    public static async getTasksByTriggerTimestampWithChat(
        trigger_timestamp: Date
    ): Promise<Task[] | null> {
        const tasks = await prisma.task.findMany({
            where: {
                trigger_timestamp,
            },
            include: {
                repeat_scheme: true,
                beforehand_task: true,
                user: true,
                chat: true,
            },
        });
        return tasks.map((task) => Task.getTaskWithParams(task));
    }

    public async recalculate(): Promise<void> {
        if (this.repeat_scheme === null || this.is_active === false) {
            return;
        }

        if (this.repeat_scheme.is_repeatable === false || this.is_beforehand === true) {
            this.delete();
            return;
        }
        this.last_triggered_timestamp = this.trigger_timestamp;
        this.trigger_timestamp = await this.repeat_scheme.getNextTrigger();
        this.trigger_count += 1;
        if (this.has_beforehand_notification) {
            this.beforehand_task = this.createBeforehandTask();
            await this.beforehand_task.save();
        }
        await this.save();
    }
}
