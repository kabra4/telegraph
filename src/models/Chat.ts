import { prisma } from "../helpers/prismaClient";
import { Chat as ChatType } from "@prisma/client";
import { ChatProperties, UserSelectedOptions } from "./types";
import { Logger } from "../helpers/Logger";
const logger = Logger.getInstance();

export default class Chat {
    public id: number;
    public language: string = "ru";
    public active: boolean = false;
    public type: string = "private";
    protected handler = prisma.chat;

    // the data of the chat
    public data: ChatType | null;

    // the constructor of the chat
    // takes the id of the chat
    constructor(id?: number) {
        this.id = Number(id) || 0;
        this.data = {} as ChatType;
        this.active = false;
        if (this.id !== 0) {
            this.getData();
        }
    }

    // the function to get the data of the chat
    // returns the data of the chat
    public async getData(): Promise<void> {
        try {
            this.data = await this.handler.findUnique({
                where: {
                    id: this.id,
                },
            });
            if (this.data) {
                this.id = Number(this.data.id);
                this.language = this.data.language || "ru";
                this.active = this.data.active || false;
                this.type = this.data.type || "private";
            }
        } catch (err) {
            return;
        }
    }

    // the function to get the id of the chat
    // returns the id of the chat
    public getId(): number {
        return this.id;
    }

    public dataToAttributes(): void {
        if (this.data) {
            this.id = Number(this.data.id);
            this.language = this.data.language || "ru";
            this.active = this.data.active || false;
            this.type = this.data.type || "private";
        }
    }

    // the function to set the data of the chat
    // takes the data of the chat
    // returns the data of the chat
    public async setData(data: { [key: string]: any }): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data,
            });
            this.dataToAttributes();
        } catch (err) {
            return;
        }
    }

    // the function to create a new chat
    // takes the data of the chat
    // returns the data of the chat
    public async create(
        id: number,
        language: string = "ru",
        active: boolean = false,
        type: string = "private"
    ): Promise<void> {
        try {
            this.data = await this.handler.create({
                data: {
                    id,
                    language,
                    active,
                    type,
                },
            });
            if (this.data) {
                this.id = Number(this.data.id);
                this.language = this.data.language || "ru";
                this.active = this.data.active || false;
                this.type = this.data.type || "private";
            }
        } catch (err) {
            return;
        }
    }

    // the function to delete the chat
    // returns the data of the chat
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

    public static async findChat(id: number): Promise<Chat> {
        const chat = new Chat(id);
        await chat.getData();
        return chat;
    }

    public async save(): Promise<void> {
        await this.update({
            language: this.language,
        });
    }

    public async update(data: ChatProperties): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data,
            });
            if (this.data) {
                this.id = Number(this.data.id);
                this.language = this.data.language || "ru";
                this.active = this.data.active || false;
                this.type = this.data.type || "private";
            }
        } catch (err) {
            return;
        }
    }

    public async updateLanguage(language: string): Promise<void> {
        await this.update({ language });
        this.language = language;
    }

    public async updateActive(active: boolean): Promise<void> {
        await this.update({ active });
        this.active = active;
    }

    private systemPropertiesRemover(data: ChatType | null): ChatProperties {
        if (!data) return {} as ChatProperties;
        const { id, createdAt, updatedAt, ...rest } = data;
        return rest as ChatProperties;
    }

    public static fromData(data: ChatType): Chat {
        const chat = new Chat(Number(data.id));
        chat.data = data;
        chat.dataToAttributes();
        return chat;
    }

    public static async createChat(
        id: number,
        type: string = "private",
        language: string = "ru"
    ): Promise<Chat> {
        const chat = new Chat();
        await chat.create(id, language, true, type);
        logger.info(`Chat ${id} created`);
        return chat;
    }
}
