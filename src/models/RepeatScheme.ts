import { prisma } from "../helpers/prismaClient";
import { RepeatScheme as RepeatSchemeType } from "@prisma/client";
import { UserSelectedOptions, RepeatSchemeProperties } from "./types";
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
    public trigger_time: string[] = [];
    public custom_time: string[] = [];
    public interval_seconds: number = 0;
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
        this.days_of_week = data.days_of_week;
        this.days_of_month = data.days_of_month;
        this.trigger_time = data.trigger_time;
        this.interval_seconds = data.interval_seconds || 0;
        this.tasks_id = Number(data.tasks_id) || -1;
        this.is_repeatable = data.is_repeatable || false;
        this.repeat_type = data.repeat_type || "";
        this.custom_time = data.custom_time;
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
            interval_seconds: this.interval_seconds,
            tasks_id: BigInt(this.tasks_id),
            is_repeatable: this.is_repeatable,
            repeat_type: this.repeat_type,
            custom_time: this.custom_time,
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

    public paramsToData(): RepeatSchemeType {
        const data = {
            id: this.id,
            days_of_week: this.days_of_week,
            days_of_month: this.days_of_month,
            trigger_time: this.trigger_time,
            trigger_date: this.trigger_date,
            interval_seconds: this.interval_seconds,
            tasks_id: BigInt(this.tasks_id),
            is_repeatable: this.is_repeatable,
            repeat_type: this.repeat_type,
            custom_time: this.custom_time,
        };
        this.data = { ...this.data, ...data };
        return data;
    }

    public systemPropertiesRemover(
        data: RepeatSchemeType | null
    ): RepeatSchemeProperties {
        if (!data) return {} as RepeatSchemeProperties;
        const { id, tasks_id, ...rest } = data;
        return rest as RepeatSchemeProperties;
    }

    public static fromSelectedTaskOptions(options: UserSelectedOptions): RepeatScheme {
        const repeatScheme = new RepeatScheme();
        options.time_list ||= [];
        const hours_minutes = options.time_list.map((s) =>
            TimeFunctions.hourAndMinuteFromTimeStr(s)
        );
        repeatScheme.trigger_time = hours_minutes.map((n) => {
            const h = n[0] < 10 ? `0${n[0]}` : `${n[0]}`;
            const m = n[1] < 10 ? `0${n[1]}` : `${n[1]}`;
            return `${h}:${m}`;
        });
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
                repeatScheme.interval_seconds = Number(options.interval_seconds);
            }
        }
        return repeatScheme;
    }

    private static stringArrayToNumberArray(array: string[]): number[] {
        return array.map((item) => Number(item));
    }

    public async getNextTrigger(): Promise<Date> {
        let r: Date;
        if (!this.is_repeatable) {
            r = await this.calculateOneTimeTriggerDate();
        } else if (this.repeat_type === "weekly") {
            r = await this.calculateWeeklyTriggerDate();
        } else if (this.repeat_type === "monthly") {
            r = await this.calculateMonthlyTriggerDate();
        } else if (this.repeat_type === "yearly") {
            r = await this.calculateYearlyTriggerDate();
        } else if (this.repeat_type === "daily") {
            r = await this.calculateDailyTriggerDate();
        } else if (this.repeat_type === "interval") {
            r = await this.calculateIntervalTriggerDate();
        } else {
            r = new Date();
        }
        return TimeFunctions.withZeroSeconds(r);
    }

    public async calculateIntervalTriggerDate(): Promise<Date> {
        const date = new Date();
        date.setSeconds(date.getSeconds() + this.interval_seconds);
        return date;
    }

    public async calculateOneTimeTriggerDate(): Promise<Date> {
        const date = new Date(this.trigger_date);
        const time = TimeFunctions.hourAndMinuteFromTimeStr(this.trigger_time[0]);
        date.setHours(time[0]);
        date.setMinutes(time[1]);
        return date;
    }

    public async calculateWeeklyTriggerDate(): Promise<Date> {
        const dates = this.days_of_week.map((days) =>
            TimeFunctions.nextDayOfWeek(days, this.trigger_time)
        );
        const minDate = dates.reduce((min, current) => {
            return current < min ? current : min;
        }, dates[0]);

        return minDate;
    }

    public async calculateMonthlyTriggerDate(): Promise<Date> {
        let minDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 31 * 1000);

        for (const day of this.days_of_month) {
            const date = TimeFunctions.nextDayOfMonth(day, this.trigger_time);

            if (date < minDate) {
                minDate = date;
            }
        }

        return minDate;
    }

    public async calculateYearlyTriggerDate(): Promise<Date> {
        const [_, month, day] = TimeFunctions.yearMonthDayFromDateString(
            this.trigger_date
        );
        return TimeFunctions.nextDate(Number(month) - 1, Number(day), this.trigger_time);
    }

    public async calculateDailyTriggerDate(): Promise<Date> {
        return TimeFunctions.nextDateByTime(this.trigger_time);
    }
}
