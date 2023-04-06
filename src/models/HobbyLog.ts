import { prisma } from "../helpers/prismaClient";
import { HobbyLog as HobbyLogType } from "@prisma/client";

export default class HobbyLog {
    public id: number = -1;
    public hobbyId: number = -1;
    public registered: Date = new Date();
    public response: string | null = "";
    protected handler = prisma.hobbyLog;

    // the data of the hobbyLog
    public data: HobbyLogType | null;

    // the constructor of the hobbyLog
    // takes the id of the hobbyLog
    constructor(id?: number) {
        this.id = id || -1;
        this.data = {} as HobbyLogType;
        if (this.id !== -1) {
            this.getData();
        }
    }

    // the function to get the data of the hobbyLog
    // returns the data of the hobbyLog
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

    // the function to get the id of the hobbyLog
    // returns the id of the hobbyLog
    public getId(): number {
        return this.id;
    }

    public dataToAttributes(data: HobbyLogType | null): void {
        if (data) {
            this.id = data.id;
            this.hobbyId = data.hobby_id;
            this.registered = data.registerd;
            this.response = data.response;
        }
    }

    // the function to create the hobbyLog
    // takes the attributes of the hobbyLog
    // returns the data of the hobbyLog
    public async create(
        hobbyId: number,
        registered: Date,
        response: string
    ): Promise<void> {
        try {
            this.data = await this.handler.create({
                data: {
                    hobby_id: hobbyId,
                    registerd: registered,
                    response: response,
                },
            });
            this.dataToAttributes(this.data);
        } catch (err) {
            return;
        }
    }

    public static async create(
        hobbyId: number,
        registered: Date,
        response: string
    ): Promise<HobbyLog | null> {
        try {
            const hobbyLog = await prisma.hobbyLog.create({
                data: {
                    hobby_id: hobbyId,
                    registerd: registered,
                    response: response,
                },
            });
            const hobbyLogModel = new HobbyLog();
            hobbyLogModel.dataToAttributes(hobbyLog);
            return hobbyLogModel;
        } catch (err) {
            return null;
        }
    }

    public static async getHobbyLogByHobbyId(hobbyId: number): Promise<HobbyLog[]> {
        try {
            const hobbyLogs = await prisma.hobbyLog.findMany({
                where: {
                    hobby_id: hobbyId,
                },
            });
            return hobbyLogs.map((hobbyLog) => {
                const hobbyLogModel = new HobbyLog();
                hobbyLogModel.dataToAttributes(hobbyLog);
                return hobbyLogModel;
            });
        } catch (err) {
            return [];
        }
    }
}
