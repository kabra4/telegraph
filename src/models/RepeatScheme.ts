import { prisma } from "../helpers/prismaClient";
import { RepeatScheme as RepeatSchemeType } from "@prisma/client";
import { SelectedTaskOptions, RepeatSchemeProperties } from "./types";
import TimeFunctions from "../helpers/TimeFunctions";

export default class RepeatScheme {
    public id: number;

    protected handler = prisma.repeatScheme;

    public data: RepeatSchemeType | null;

    public repeat_type: string = "";
    public tasks_id: number = -1;
    public days_of_week: number[] = [];
    public days_of_month: number[] = [];
    public trigger_date: string = "";
    public trigger_time: string = "";
    public interval_minutes: number = 0;
    public is_repeatable: boolean = false;

    constructor(id?: number) {
        this.id = id || -1;
        this.data = {} as RepeatSchemeType;
        if (this.id !== -1) {
            this.getData();
        }
    }

    public static async findRepeatScheme(id: number): Promise<RepeatScheme> {
        const repeatScheme = new RepeatScheme();
        repeatScheme.id = id;
        await repeatScheme.getData();
        return repeatScheme;
    }

    public static getRepeatSchemeWithParams(data: RepeatSchemeType): RepeatScheme {
        const repeatScheme = new RepeatScheme();
        repeatScheme.setProperties(data);
        return repeatScheme;
    }

    public setProperties(data: RepeatSchemeType): void {
        this.id = data.id;
        this.days_of_week = data.days_of_week || [];
        this.days_of_month = data.days_of_month || [];
        this.trigger_time = data.trigger_time || "";
        this.interval_minutes = data.interval_minutes || 0;
        this.tasks_id = data.tasks_id || -1;
        this.is_repeatable = data.is_repeatable || false;
        this.repeat_type = data.repeat_type || "";
    }

    public async getData(): Promise<void> {
        this.data = await this.handler.findUnique({
            where: {
                id: this.id,
            },
        });
        if (this.data === null) {
            return;
        }
        this.setProperties(this.data);
    }

    private attributesToData(): RepeatSchemeType {
        this.data = {
            id: this.id,
            days_of_week: this.days_of_week,
            days_of_month: this.days_of_month,
            trigger_time: this.trigger_time,
            trigger_date: this.trigger_date,
            interval_minutes: this.interval_minutes,
            tasks_id: this.tasks_id,
            is_repeatable: this.is_repeatable,
            repeat_type: this.repeat_type,
        };
        return this.data;
    }

    public async save(): Promise<void> {
        const data = this.systemPropertiesRemover(this.attributesToData());
        if (this.id === 0) {
            this.data = await this.handler.create({
                data,
            });
        } else {
            this.data = await this.handler.update({
                where: {
                    id: this.id,
                },
                data,
            });
        }
        this.setProperties(this.data);
    }

    public async delete(): Promise<void> {
        await this.handler.delete({
            where: {
                id: this.id,
            },
        });
    }

    public async update(data: RepeatSchemeProperties): Promise<void> {
        this.data = await this.handler.update({
            where: {
                id: this.id,
            },
            data,
        });
        this.setProperties(this.data);
    }

    public static async getRepeatSchemesByTaskId(
        taskId: number
    ): Promise<RepeatScheme | null> {
        const repeatScheme = await prisma.repeatScheme.findFirst({
            where: {
                tasks_id: taskId,
            },
        });
        if (repeatScheme === null) {
            return null;
        }
        return RepeatScheme.getRepeatSchemeWithParams(repeatScheme);
    }

    public systemPropertiesRemover(
        data: RepeatSchemeType | null
    ): RepeatSchemeProperties {
        if (!data) return {} as RepeatSchemeProperties;
        const { id, ...rest } = data;
        return rest as RepeatSchemeProperties;
    }

    public static fromSelectedTaskOptions(options: SelectedTaskOptions): RepeatScheme {
        const repeatScheme = new RepeatScheme();
        repeatScheme.trigger_time = options.time || "";
        repeatScheme.trigger_date = options.date || "";
        if (options.repeat) {
            repeatScheme.is_repeatable = true;
            repeatScheme.repeat_type = options.repeat_cycle || "";
            if (options.repeat_cycle === "weekly") {
                repeatScheme.days_of_week = this.stringArrayToNumberArray(
                    options.checked_days || []
                );
            } else if (options.repeat_cycle === "monthly") {
                repeatScheme.days_of_month = this.stringArrayToNumberArray(
                    options.checked_days || []
                );
            } else if (options.repeat_cycle === "interval") {
                repeatScheme.interval_minutes = Number(options.time);
            }
        }
        return repeatScheme;
    }

    private static stringArrayToNumberArray(array: string[]): number[] {
        return array.map((item) => Number(item));
    }

    public async getNextTrigger(): Promise<Date> {
        if (!this.is_repeatable) {
            return this.calculateOneTimeTriggerDate();
        } else {
            if (this.repeat_type === "weekly") {
                return this.calculateWeeklyTriggerDate();
            } else if (this.repeat_type === "monthly") {
                return this.calculateMonthlyTriggerDate();
            } else if (this.repeat_type === "yearly") {
                return this.calculateYearlyTriggerDate();
            } else if (this.repeat_type === "daily") {
                return this.calculateDailyTriggerDate();
            } else {
                return new Date();
            }
        }
    }

    public async calculateOneTimeTriggerDate(): Promise<Date> {
        const date = new Date(this.trigger_date);
        const time = this.trigger_time.split(":");
        date.setHours(Number(time[0]));
        date.setMinutes(Number(time[1]));
        return date;
    }

    public async calculateWeeklyTriggerDate(): Promise<Date> {
        const dates = this.days_of_week.map((days) =>
            TimeFunctions.next_day_of_week(days, this.trigger_time)
        );
        const minDate = dates.reduce((min, current) => {
            return current < min ? current : min;
        }, dates[0]);
        return minDate;
    }

    public async calculateMonthlyTriggerDate(): Promise<Date> {
        const dates = this.days_of_month.map((days) =>
            TimeFunctions.next_day_of_month(days, this.trigger_time)
        );
        const minDate = dates.reduce((min, current) => {
            return current < min ? current : min;
        }, dates[0]);
        return minDate;
    }

    public async calculateYearlyTriggerDate(): Promise<Date> {
        const [_, month, day] = this.trigger_date.split("-");
        return TimeFunctions.next_Date(Number(month), Number(day), this.trigger_time);
    }

    public async calculateDailyTriggerDate(): Promise<Date> {
        return TimeFunctions.next_Date_by_time(this.trigger_time);
    }
}
