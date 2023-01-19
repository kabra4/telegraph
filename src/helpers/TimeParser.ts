// helpful class for parsing time strings
//

export default class TimeParser {
  // the function to parse the time string
  // takes the time string
  public parse(time: string): Date {
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
  public calculateSecondsFromString(time: string): number {
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
  public calculateClosestDateTime(
    date: string,
    time: string[],
    year_matters: boolean
  ): Date {
    // split the date string by the dash
    const dateSplit = date.split("-");
    // get the year
    const year = parseInt(dateSplit[0]);
    // get the month
    const month = parseInt(dateSplit[1]);
    // get the day
    const day = parseInt(dateSplit[2]);
    // get the current date
    const currentDate = new Date();
    // if the year matters
    if (year_matters) {
      // if the year is in the past
      if (year < currentDate.getFullYear()) {
        // return the current date
        return currentDate;
      }
      // if the year is in the future
      else if (year > currentDate.getFullYear()) {
        // return the date
        return new Date(year, month - 1, day);
      }
    }
    // if the month is in the past
    if (month < currentDate.getMonth() + 1) {
      // return the current date
      return currentDate;
    }
    // if the month is in the future
    else if (month > currentDate.getMonth() + 1) {
      // return the date
      return new Date(year, month - 1, day);
    }
    // if the day is in the past
    if (day < currentDate.getDate()) {
      // return the current date
      return currentDate;
    }
    // if the day is in the future
    else if (day > currentDate.getDate()) {
      // return the date
      return new Date(year, month - 1, day);
    }
    // if the time is empty
    if (time.length === 0) {
      // return the current date
      return currentDate;
    }
    // if the time is not empty
    else {
      // get the closest time
      const closestTime = this.getClosestTime(time);
      // if the closest time is in the past
      if (closestTime < currentDate) {
        // return the current date
        return currentDate;
      }
      // if the closest time is in the future
      else {
        // return the date
        return new Date(
          year,
          month - 1,
          day,
          closestTime.getHours(),
          closestTime.getMinutes(),
          closestTime.getSeconds()
        );
      }
    }
  }

  // the function to get the closest time
  // takes the time as a list of strings: \d{2}:\d{2}
  public getClosestTime(time: string[]): Date {
    // get the current time
    const currentTime = new Date();
    // get the current hour
    const currentHour = currentTime.getHours();
    // get the current minute
    const currentMinute = currentTime.getMinutes();
    // get the current second
    const currentSecond = currentTime.getSeconds();
    // get the closest time
    let closestTime = new Date();
    // set the closest time to the current time
    closestTime.setHours(currentHour, currentMinute, currentSecond);
    // get the closest time difference
    let closestTimeDifference = Number.MAX_SAFE_INTEGER;
    // for each time
    for (let i = 0; i < time.length; i++) {
      // get the time
      const timeSplit = time[i].split(":");
      // get the hour
      const hour = parseInt(timeSplit[0]);
      // get the minute
      const minute = parseInt(timeSplit[1]);
      // get the second
      const second = parseInt(timeSplit[2]);
      // get the time difference
      const timeDifference = this.getTimeDifference(
        currentHour,
        currentMinute,
        currentSecond,
        hour,
        minute,
        second
      );
      // if the time difference is less than the closest time difference
      if (timeDifference < closestTimeDifference) {
        // set the closest time difference
        closestTimeDifference = timeDifference;
        // set the closest time
        closestTime.setHours(hour, minute, second);
      }
    }
    // return the closest time
    return closestTime;
  }

  // the function to get the time difference
  // takes the current hour, current minute, current second, hour, minute, second
  public getTimeDifference(
    currentHour: number,
    currentMinute: number,
    currentSecond: number,
    hour: number,
    minute: number,
    second: number
  ): number {
    // get the current time in seconds
    const currentTime =
      currentHour * 60 * 60 + currentMinute * 60 + currentSecond;
    // get the time in seconds
    const time = hour * 60 * 60 + minute * 60 + second;
    // if the time is in the past
    if (time < currentTime) {
      // return the difference
      return currentTime - time;
    }
    // if the time is in the future
    else {
      // return the difference
      return time - currentTime;
    }
  }
}
