// helpful class for parsing time strings
import { LocaleService } from "../helpers/LocaleService";
const ls = LocaleService.Instance;

export default class TimeFunctions {
    private static timelabels: { [key: string]: string[] } = {
        minute: [
            "minute",
            "min",
            "m",
            "minutes",
            "mins", // english
            "minutlar",
            "minut",
            "daqiqa", // uzbek
            "мин",
            "минут",
            "минуты",
            "минута",
            "минуту",
            "минуты",
            "минутам",
            "минутами",
            "минутах", // russian
        ],
        hour: [
            "hour",
            "h",
            "hours",
            "hrs", // english
            "soat",
            "soatlar", // uzbek
            "час",
            "часа",
            "часов",
            "часу",
            "часом",
            "часе", // russian
        ],
        day: [
            "day",
            "d",
            "days", // english
            "kun",
            "kunlar", // uzbek
            "день",
            "дня",
            "дней",
            "дню",
            "днем",
            "дне", // russian
        ],
        week: [
            "week",
            "w",
            "weeks", // english
            "hafta",
            "haftalar", // uzbek
            "неделя",
            "недели",
            "недель",
            "неделю",
            "неделей",
            "неделе", // russian
        ],
        month: [
            "month",
            "months",
            "mon", // english
            "oy",
            "oylar", // uzbek
            "месяц",
            "месяца",
            "месяцев",
            "месяцу",
            "месяцем",
            "месяце", // russian
        ],
    };

    public static getTomorrow(daysPlus = 1, resetHours = false): Date {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + daysPlus);
        if (resetHours) {
            tomorrow.setHours(0, 0, 0, 0);
        }
        return tomorrow;
    }

    private static timelabelFromUnit(unit: string): string {
        // loop through the timelabels
        for (const key in this.timelabels) {
            // if the unit is in the timelabels
            if (this.timelabels[key].includes(unit)) {
                // return the key
                return key;
            }
        }
        // if the unit is not in the timelabels
        return "";
    }

    /**
     * @description checks if the time string is valid
     * @param time string (hh:mm:ss)
     * @returns boolean
     */
    public static isValidTime(time: string): boolean {
        // if the time is empty
        if (time === "") {
            return false;
        }

        const reg =
            /^((0?[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])(,\s*(0?[0-9]|1[0-9]|2[0-3])[:\.]{1}[0-5][0-9])*$/;
        return reg.test(time);
    }

    /**
     * @description checks if the date string is valid
     * @param date string (yyyy-mm-dd) or (yy/mm/dd)
     * @returns boolean
     */
    public static isValidDate(date: string): boolean {
        // if the date is empty
        if (date === "") {
            return false;
        }

        const reg = /^(?:19|20)?\d\d[-./](0[1-9]|1[0-2])[-./](0[1-9]|[12][0-9]|3[01])$/;
        if (!reg.test(date)) {
            return false;
        }
        try {
            const d = new Date(date);
            return d instanceof Date && !isNaN(d.getTime());
        } catch (e) {
            return false;
        }
    }

    /**
     * @description checks if the date string is in the future
     * @param dateString string (yyyy-mm-dd)
     * @returns boolean
     */
    public static isDateInFuture(dateString: string): boolean {
        if (!this.isValidDate(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        const now = new Date(new Date().setHours(0, 0, 0, 0));
        return date > now;
    }

    // the function to parse the time string
    // takes the time string
    public static parse(time: string): Date {
        // if the time is empty
        if (time === "") {
            // return the current time
            return new Date();
        }
        // if the time is not empty
        else {
            // split the time string by the colon
            const timeSplit = time.split(":");
            // get the hour
            const hour = parseInt(timeSplit[0]);
            // get the minute
            const minute = parseInt(timeSplit[1]);
            // get the second
            const second = parseInt(timeSplit[2]);
            // get the current date
            const date = new Date();
            // set the date to the parsed time
            date.setHours(hour, minute, second);
            // return the date
            return date;
        }
    }
    /**
     * @param time: string   "\d+ (minutes|hours|days|weeks|months)"
     * @description takes the time string and returns the number of seconds
     * @returns number (seconds)
     */
    public static calculateSecondsFromString(time: string): number {
        // split the time string by the spaces
        const timeSplit = time.split(" ");
        // get the number
        const number = parseInt(timeSplit[0]);
        // get the unit
        const unit = timeSplit[1];

        const unitFromLabel = this.timelabelFromUnit(unit);

        if (unitFromLabel === "") {
            return 0;
        }

        // if the unit is minutes/minute/min
        if (unitFromLabel === "minute") {
            // return the number of seconds
            return number * 60;
        } else if (unitFromLabel === "hour") {
            // if the unit is hours/hour/h
            // return the number of seconds
            return number * 60 * 60;
        } else if (unitFromLabel === "day") {
            // if the unit is days/day/d
            // return the number of seconds
            return number * 60 * 60 * 24;
        } else if (unitFromLabel === "week") {
            // if the unit is weeks/week/w
            // return the number of seconds
            return number * 60 * 60 * 24 * 7;
        } else if (unitFromLabel === "month") {
            // if the unit is months/month/m
            // return the number of seconds
            return number * 60 * 60 * 24 * 7 * 4;
        } else {
            // if the unit is not recognized
            // return 0
            return 0;
        }
    }

    /**
     * @param month: number 0-11
     * @param day: number 1-31
     * @param time: string "HH:MM"
     * @description returns the next timestamp
     * @returns Date
     * @example
     * const nextTimestamp = TimeFunctions.next_timestamp(3, 21, "00:00");
     */
    public static next_Date(month: number, day: number, time: string): Date {
        const now = new Date();
        const [hour, minute] = this.hourAndMinuteFromTimeStr(time);

        let nextDate = new Date(now.getFullYear(), month, day, hour, minute, 0, 0);

        if (nextDate < now) {
            if (month === 11) {
                // If the target month is December, increment the year.
                nextDate = new Date(
                    now.getFullYear() + 1,
                    month,
                    day,
                    hour,
                    minute,
                    0,
                    0
                );
            } else {
                // If the target month is not December, increment the month.
                nextDate = new Date(
                    now.getFullYear(),
                    month + 1,
                    day,
                    hour,
                    minute,
                    0,
                    0
                );
            }
        }

        return nextDate;
    }

    public static yearMonthDayFromDateString(date: string): [number, number, number] {
        if (!this.isValidDate(date)) {
            return [0, 0, 0];
        }
        if (date.includes("-")) {
            return date.split("-").map(Number) as [number, number, number];
        } else if (date.includes(".")) {
            return date.split(".").map(Number) as [number, number, number];
        } else if (date.includes("/")) {
            return date.split("/").map(Number) as [number, number, number];
        } else {
            return [0, 0, 0];
        }
    }

    public static hourAndMinuteFromTimeStr(time: string): [number, number] {
        if (!this.isValidTime(time)) {
            return [0, 0];
        }
        if (time.includes(":")) {
            return time.split(":").map(Number) as [number, number];
        } else if (time.includes(".")) {
            return time.split(".").map(Number) as [number, number];
        } else if (time.includes(",")) {
            return time.split(",").map(Number) as [number, number];
        } else {
            return [0, 0];
        }
    }

    /**
     * @param day: number 1-31
     * @param time: string "HH:MM"
     */
    public static next_day_of_month(day: number, time: string): Date {
        const [hour, minute] = this.hourAndMinuteFromTimeStr(time);
        const now = new Date();
        let targetDate = new Date(now);

        while (true) {
            targetDate.setHours(hour, minute, 0, 0);

            const daysInMonth = new Date(
                targetDate.getFullYear(),
                targetDate.getMonth() + 1,
                0
            ).getDate();

            if (day <= daysInMonth) {
                targetDate.setDate(day);
                if (targetDate > now) {
                    break;
                }
            }

            targetDate.setDate(1);
            targetDate.setMonth(targetDate.getMonth() + 1);
        }

        return targetDate;
    }

    /**
     * @param day: number 0-6 (0 is Monday)
     * @param time: string "HH:MM"
     */
    public static next_day_of_week(
        day: number, // day of week 0-6 (0 is Monday)
        time: string // "HH:MM"
    ): Date {
        const now = new Date();
        const [hour, minute] = this.hourAndMinuteFromTimeStr(time);

        // Calculate the current day of the week (0 is Monday, 6 is Sunday)
        const currentDayOfWeek = (now.getDay() + 6) % 7;
        const daysUntilNextDay = (day - currentDayOfWeek + 7) % 7;

        // Create the next date based on the day of the week
        let nextDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + daysUntilNextDay,
            hour,
            minute,
            0,
            0
        );

        // If the specified time has already passed today, add 7 days
        if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 7);
        }

        return nextDate;
    }

    /**
     * @param time: string - "HH:MM"
     * @description returns the next timestamp
     * @returns Date
     */
    public static next_Date_by_time(
        time: string // "HH:MM"
    ): Date {
        const now = new Date();
        const [hour, minute] = this.hourAndMinuteFromTimeStr(time);

        // Create the next date based on the current day and given time
        let nextDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0
        );

        // If the specified time has already passed today, add 1 day
        if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        return nextDate;
    }

    public static dateMinusSeconds(date: Date, seconds: number): Date {
        const newDate = new Date(date);
        newDate.setSeconds(date.getSeconds() - seconds);
        return newDate;
    }

    public static daysInMonth(month: number, year: number): number {
        return new Date(year, month + 1, 0).getDate();
    }

    public static formatDate(date: Date, language = "ru"): string {
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");

        ls.setLocale(language);
        const monthString = ls.__("calendar.months_short." + monthIndex);

        return `${day} ${monthString} ${year}, ${hours}:${minutes}`;
    }

    public static nowWithZeroSeconds(): Date {
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    }
}
