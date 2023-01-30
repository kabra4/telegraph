// helpful class for parsing time strings
//

export default class TimeParser {
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

  // the function to calculate seconds from string
  // takes the time string: \d+ (minutes|hours|days|weeks|months)
  public static calculateSecondsFromString(time: string): number {
    // split the time string by the spaces
    const timeSplit = time.split(" ");
    // get the number
    const number = parseInt(timeSplit[0]);
    // get the unit
    const unit = timeSplit[1];
    // if the unit is minutes/minute/min
    if (unit === "minutes" || unit === "minute" || unit === "min") {
      // return the number of seconds
      return number * 60;
    }
    // if the unit is hours/hour
    else if (unit === "hours" || unit === "hour" || unit === "h") {
      // return the number of seconds
      return number * 60 * 60;
    }
    // if the unit is days/day
    else if (unit === "days" || unit === "day" || unit === "d") {
      // return the number of seconds
      return number * 60 * 60 * 24;
    }
    // if the unit is weeks/week
    else if (unit === "weeks" || unit === "week" || unit === "w") {
      // return the number of seconds
      return number * 60 * 60 * 24 * 7;
    }
    // if the unit is months/month
    else if (unit === "months" || unit === "month" || unit === "m") {
      // return the number of seconds
      return number * 60 * 60 * 24 * 7 * 30;
    }
    // if the unit is not recognized
    else {
      // return 0
      return 0;
    }
  }

  // the function to calculate the closest future datetime
  // takes date: string, time: list, and year_matters boolean
  // takes the date as a string: \d{4}-\d{2}-\d{2}
  // takes the time as a list of strings: \d{2}:\d{2}
  // if the year matters, then the year will be taken into account else it will be ignored
}
