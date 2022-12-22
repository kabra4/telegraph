import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { CallbackQuery, Message, Update } from "typegram";
// import Calendar from "@enigmaoffline/calendarjs";

// import dotenv from "dotenv";
import { LocaleService } from "../helpers/LocaleService";
import TgUser from "../models/TgUser";

export default class CalendarMaker {
  // the bot
  //   private bot: Telegraf<Context<Update>>;.
  private static _weekdays = {
    en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  };

  // the constructor of the callback query controller
  // takes the bot
  constructor() {}

  public static async makeCalendar(
    locale_: string = "en",
    year_: number = 0,
    month_: number = 100
    // checked_dates?: string[],
  ): Promise<Markup.Markup<InlineKeyboardMarkup>> {
    const now = new Date();
    const year = year_ !== 0 ? year_ : now.getFullYear();
    const month = month_ !== 100 ? month_ : now.getMonth() + 1;
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
          const data = this.cbText("DATE", y, m, d);
          //   const checked = checked_dates?.includes(data);
          const day = d.startsWith("0") ? d.slice(1) : d;
          //   const text = checked ? `✅ ${day}` : day;
          return Markup.button.callback(day, data);
        })
      );
    });

    // add navigation buttons
    const prevMonth = this.cbText(
      "PREV",
      year,
      month.toString().padStart(2, "0"),
      "00"
    );
    const today_button = this.cbText(
      "TODAY",
      now.getFullYear(),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getDate()
    );
    const nextMonth = this.cbText(
      "NEXT",
      year,
      month.toString().padStart(2, "0"),
      "00"
    );
    keyboard.push([
      Markup.button.callback("<", prevMonth),
      Markup.button.callback("Today", today_button),
      Markup.button.callback(">", nextMonth),
    ]);

    return Markup.inlineKeyboard(keyboard);
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
    day: number | string
  ): string {
    return `calendar|${prefix}|${year}-${month}-${day}`;
  }

  // function to create calendar grid of dates for a given month
  public static getCalendarGrid(year: number, month: number): string[][] {
    const grid: any[] = [];
    // first day of the week is Monday
    const firstDay = new Date(year, month - 1, 1).getDay() - 1;
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

  private static daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }
}
