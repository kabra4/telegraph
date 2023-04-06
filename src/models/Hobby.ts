import { prisma } from "../helpers/prismaClient";
import { Hobby as HobbyType } from "@prisma/client";
import Task from "./Task";
import HobbyLog from "./HobbyLog";
import User from "./User";

export default class Hobby {
    public id = -1;
    public name = "";
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

    public dataToAttributes(data: HobbyType | null): void {
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.task_id = data.task_id;
            this.user_id = data.user_id;
        }
    }

    public async create(name: string, task_id: number, user_id: number): Promise<void> {
        try {
            this.data = await this.handler.create({
                data: {
                    name,
                    task_id,
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
        task_id: number = this.task_id,
        user_id: number = this.user_id
    ): Promise<void> {
        try {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data: {
                    name,
                    task_id,
                    user_id,
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
}
