import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import {
    InlineKeyboardButton,
    InlineKeyboardMarkup,
} from "telegraf/typings/core/types/typegram";
import { CallbackQuery, Message, Update } from "typegram";
// import Calendar from "@enigmaoffline/calendarjs";

// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import { lstat } from "fs";
import { inlineKeyboard } from "telegraf/typings/markup";

const ls = LocaleService.Instance;

export default class CalendarMaker {
    // the bot
    //   private bot: Telegraf<Context<Update>>;.
    private static _weekdays = {
        en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
    };

    private static _monthNames = {
        en: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        ru: [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ],
        uz: [
            "Yanvar",
            "Fevral",
            "Mart",
            "Aprel",
            "May",
            "Iyun",
            "Iyul",
            "Avgust",
            "Sentabr",
            "Oktabr",
            "Noyabr",
            "Dekabr",
        ],
    };

    // the constructor of the callback query controller
    // takes the bot
    constructor() {}

    public static async makeCalendar(
        locale_: string = "en",
        year_: number = 0,
        month_: number = Number.MAX_VALUE
        // checked_dates?: string[],
    ): Promise<Markup.Markup<InlineKeyboardMarkup>> {
        const now = new Date();
        const year = year_ !== 0 ? year_ : now.getFullYear();
        const month = month_ !== Number.MAX_VALUE ? month_ : now.getMonth() + 1;
        const dataIgnore = this.cbText("IGNORE", year, month, 0);
        const keyboard = [];
        // get month name
        const monthName = new Date(year, month - 1).toLocaleString(locale_, {
            month: "long",
        });

        // put month name in the first row
        keyboard.push([Markup.button.callback(monthName, dataIgnore)]);
        const weekDays =
            locale_ === "en"
                ? this._weekdays.en
                : locale_ === "ru"
                ? this._weekdays.ru
                : this._weekdays.uz;
        // put weekdays in the second row
        keyboard.push(
            weekDays.map((day) => {
                return Markup.button.callback(day, dataIgnore);
            })
        );

        // create calendar
        let calendar = this.getCalendarGrid(year, month);

        calendar.forEach((week) => {
            if (this.isArrayEmpty(week)) return;
            keyboard.push(
                week.map((date) => {
                    if (!date) {
                        return Markup.button.callback(" ", dataIgnore);
                    }
                    const m = date.slice(3, 5);
                    const d = date.slice(0, 2);
                    const y = date.slice(6, 10);
                    const data = this.cbText("DATE", y, m, d, locale_);
                    //   const checked = checked_dates?.includes(data);
                    const day = d.startsWith("0") ? d.slice(1) : d;
                    //   const text = checked ? `✅ ${day}` : day;
                    return Markup.button.callback(day, data);
                })
            );
        });

        // add navigation buttons
        let prevMonthCallback = "";
        let prevMonthText = "";

        // if calendarTime - 1 month is less than now: prevMonthCallback's callback data is IGNORE
        if (new Date(year, month - 1) < now) {
            prevMonthCallback = "IGNORE";
            prevMonthText = " ";
        } else {
            prevMonthCallback = this.cbText(
                "PREVmonth",
                year,
                (month - 1).toString().padStart(2, "0"),
                "00",
                locale_
            );
            prevMonthText = "<-";
        }
        const today_button = this.cbText(
            "TODAY",
            now.getFullYear(),
            (now.getMonth() + 1).toString().padStart(2, "0"),
            now.getDate(),
            locale_
        );
        const nextMonth = this.cbText(
            "NEXTmonth",
            year,
            (month + 1).toString().padStart(2, "0"),
            "00",
            locale_
        );
        ls.setLocale(locale_);
        keyboard.push([
            Markup.button.callback(prevMonthText, prevMonthCallback),
            Markup.button.callback(ls.__("days.today"), today_button),
            Markup.button.callback("->", nextMonth),
        ]);

        return Markup.inlineKeyboard(keyboard);
    }

    /**
     * @describe function to create 4x3 grid of months gets the year as a parameter
     * @returns a 4x3 grid of months type of Promise<Markup.Markup<InlineKeyboardMarkup>>
     */
    public static async makeMonthsGrid(
        locale_: string = "en",
        year: number = new Date().getFullYear(),
        isYearMatter: boolean = false
    ): Promise<Markup.Markup<InlineKeyboardMarkup>> {
        console.log("makeMonthsGrid", locale_, year, isYearMatter);
        const now = new Date();
        const currentMonthName = now.toLocaleString(locale_, {
            month: "long",
        });
        const keyboard = [];

        // put year in the first row if isYearMatter is true
        if (isYearMatter) {
            keyboard.push([Markup.button.callback(year.toString(), "IGNORE")]);
        }
        const monthNames =
            locale_ === "en"
                ? this._monthNames.en
                : locale_ === "ru"
                ? this._monthNames.ru
                : this._monthNames.uz;
        // create months
        let months = await this.getMonthGrid(year);

        months.forEach((quarter) => {
            if (this.isArrayEmpty(quarter)) return;
            keyboard.push(
                quarter.map((day) => {
                    if (!day) {
                        return Markup.button.callback(" ", "IGNORE");
                    }
                    const callback_text = this.cbText("MONTH", year, day, "01");

                    return Markup.button.callback(
                        monthNames[Number(day) - 1],
                        callback_text
                    );
                })
            );
        });

        // add navigation buttons
        const navigationButtons = [];
        // puts fast select button
        if (isYearMatter) {
            // 3 buttons [prev year, today, next year]
            let prevYearCallback = "";
            let prevYearText = "";
            if (year - 1 < now.getFullYear()) {
                prevYearCallback = "IGNORE";
                prevYearText = " ";
            } else {
                prevYearCallback = this.cbText(
                    "PREVyear",
                    year - 1,
                    "01",
                    "01"
                );
                prevYearText = "<-";
            }
            const today_button = this.cbText(
                "TODAY",
                now.getFullYear(),
                (now.getMonth() + 1).toString().padStart(2, "0"),
                now.getDate()
            );
            const nextYear = this.cbText("NEXTyear", year + 1, "01", "01");
            ls.setLocale(locale_);
            navigationButtons.push(
                Markup.button.callback(prevYearText, prevYearCallback),
                Markup.button.callback(ls.__("days.today"), today_button),
                Markup.button.callback("->", nextYear)
            );
        } else {
            // 2 buttons [this month, today]
            const thisMonth = this.cbText(
                "MONTH",
                now.getFullYear(),
                (now.getMonth() + 1).toString().padStart(2, "0"),
                "01"
            );
            const today_button = this.cbText(
                "TODAY",
                now.getFullYear(),
                (now.getMonth() + 1).toString().padStart(2, "0"),
                "01"
            );
            navigationButtons.push(
                Markup.button.callback(currentMonthName, thisMonth),
                Markup.button.callback("Today", today_button)
            );
        }

        keyboard.push(navigationButtons);

        return Markup.inlineKeyboard(keyboard);
    }

    // function to create 4x3 grid of years
    // gets the year as a parameter
    private static async getMonthGrid(year: number): Promise<string[][]> {
        const grid: any[] = [];
        let month = 1;
        for (let i = 0; i < 4; i++) {
            grid[i] = [];
            for (let j = 0; j < 3; j++) {
                grid[i][j] = month.toString().padStart(2, "0");
                month++;
            }
        }
        return grid;
    }

    private static isArrayEmpty(arr: any[]): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) return false;
        }
        return true;
    }

    private static cbText(
        prefix: string,
        year: number | string,
        month: number | string,
        day: number | string,
        locale_: string = "en"
    ): string {
        return `calendar|${prefix}|${year}-${month}-${day}|${locale_}`;
    }

    // function to create calendar grid of dates for a given month
    public static getCalendarGrid(year: number, month: number): string[][] {
        const grid: any[] = [];
        // first day of the week is Monday
        let firstDay = new Date(year, month - 1, 1).getDay() - 1;
        if (firstDay < 0) firstDay = 6;
        // console.log("firstDay", firstDay);
        const daysInMonth = this.daysInMonth(month, year);
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week: any[] = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    week.push("");
                } else if (day > daysInMonth) {
                    week.push("");
                } else {
                    week.push(
                        day.toString().padStart(2, "0") +
                            "-" +
                            month.toString().padStart(2, "0") +
                            "-" +
                            year
                    );
                    day++;
                }
            }
            grid.push(week);
        }
        return grid;
    }

    // function to create weekdays row
    public static async weekdaysMarkup(
        locale_: string = "en",
        checked_dates: string[] = []
    ): Promise<Markup.Markup<InlineKeyboardMarkup>> {
        let keyboard: any[][] = [[], [], [], []];
        const weekdays =
            locale_ === "en"
                ? this._weekdays.en
                : locale_ === "ru"
                ? this._weekdays.ru
                : this._weekdays.uz;

        for (let i = 0; i < weekdays.length; i++) {
            const checked = checked_dates.includes(i.toString());
            const text = checked ? `✅ ${weekdays[i]}` : weekdays[i];
            const callback_text = `calendarWeekdays|${i}`;

            // pattern is [[Mon, Tue],[Wed, Thu,Fri],[Sat, Sun],[Next]]
            if (i < 2) {
                keyboard[0].push(Markup.button.callback(text, callback_text));
            } else if (i < 5) {
                keyboard[1].push(Markup.button.callback(text, callback_text));
            } else {
                keyboard[2].push(Markup.button.callback(text, callback_text));
            }
        }

        if (checked_dates.length > 0) {
            ls.setLocale(locale_);
            keyboard[3].push(
                // add Next button
                Markup.button.callback(
                    ls.__("buttons.next"),
                    `calendarWeekdays|FINISH`
                )
            );
        }
        return Markup.inlineKeyboard(keyboard);
    }

    private static daysInMonth(month: number, year: number) {
        return new Date(year, month, 0).getDate();
    }

    public static async multiselectCalendar(
        locale_: string = "en",
        checked_dates: string[] = []
    ) {
        const grid = this.get31DayGrid();
        let keyboard: any[] = [];

        for (let i = 0; i < grid.length; i++) {
            const week = grid[i];
            keyboard.push(
                week.map((day) => {
                    if (checked_dates.includes(day.toString())) {
                        const text = `✅ ${day}`;
                        const callback_text = `calendarMultiselect|${day}`;
                        return Markup.button.callback(text, callback_text);
                    } else {
                        const text = day.toString();
                        const callback_text = `calendarMultiselect|${day}`;
                        return Markup.button.callback(text, callback_text);
                    }
                })
            );
        }

        if (checked_dates.length > 0) {
            keyboard.push([
                Markup.button.callback(
                    ls.__("buttons.next"),
                    `calendarMultiselect|FINISH`
                ),
            ]);
        }

        return Markup.inlineKeyboard(keyboard);
    }

    private static get31DayGrid(): number[][] {
        const grid: any[] = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week: any[] = [];
            for (let j = 0; j < 7; j++) {
                if (day > 31) {
                    break;
                } else {
                    week.push(day);
                    day++;
                }
            }
            grid.push(week);
        }
        return grid;
    }
}
