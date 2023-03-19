// helpful class for parsing time strings
//

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
   * @returns number (seconds)
   * @example
   * const nextTimestamp = TimeFunctions.next_timestamp(3, 21, "00:00");
   */
  public static next_timestamp(
    month: number,
    day: number,
    time: string
  ): number {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);

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

    return nextDate.getTime();
  }

  /**
   * @param day: number 1-31
   * @param time: string "HH:MM"
   */
  public static next_day_of_month_timestamp(day: number, time: string): number {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);

    let nextDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      day,
      hour,
      minute,
      0,
      0
    );

    if (nextDate < now) {
      const nextMonth = now.getMonth() + 1;
      const nextYear = now.getFullYear() + (nextMonth > 11 ? 1 : 0);
      const finalMonth = nextMonth > 11 ? 0 : nextMonth;

      nextDate = new Date(nextYear, finalMonth, day, hour, minute, 0, 0);
    }

    return nextDate.getTime();
  }

  /**
   * @param day: number 0-6 (0 is Monday)
   * @param time: string "HH:MM"
   */
  public static next_day_of_week_timestamp(
    day: number, // day of week 0-6 (0 is Monday)
    time: string // "HH:MM"
  ): number {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);

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

    return nextDate.getTime();
  }

  /**
   * @param time: string - "HH:MM"
   * @description returns the next timestamp
   * @returns number (seconds)
   */
  public static next_timestamp_by_time(
    time: string // "HH:MM"
  ): number {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);

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

    return nextDate.getTime();
  }
}
