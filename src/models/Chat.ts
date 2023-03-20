import { prisma } from "../helpers/prismaClient";
import { Chat as chatType } from "@prisma/client";
import { chatProperties, TaskOptions } from "./types";

export default class Chat {
    public id: number;
    protected handler = prisma.chat;

    // the data of the chat
    public data: chatType | null;

    // the constructor of the chat
    // takes the id of the chat
    constructor(id?: number) {
        this.id = id || 0;
        this.data = {} as chatType;
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
        } catch (err) {
            return;
        }
    }

    // the function to get the id of the chat
    // returns the id of the chat
    public getId(): number {
        return this.id;
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
        } catch (err) {
            return;
        }
    }

    // the function to create a new chat
    // takes the data of the chat
    // returns the data of the chat
    public async create(id: number) {
        try {
            this.data = await this.handler.create({
                data: {
                    id,
                },
            });
            this.id = this.data.id;
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

    private systemPropertiesRemover(data: chatType | null): chatProperties {
        if (!data) return {} as chatProperties;
        const { id, createdAt, updatedAt, ...rest } = data;
        return rest as chatProperties;
    }
}
