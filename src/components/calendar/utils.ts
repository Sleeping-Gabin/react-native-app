import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export const DAY_WIDTH = 36;
export const DAY_HEIGHT = 48;
export const CALENDAR_GAP = 10;

export function getWeekNum(date: dayjs.Dayjs | string) {
  if (typeof date === "string") {
    date = dayjs(date);
  }

  const firstDay = date.startOf("month").day();
  const endDate = date.endOf("month");

  return Math.ceil((endDate.date() + firstDay) / 7);
}

export function getWeekIndex(date: dayjs.Dayjs | string) {
  if (typeof date === "string") {
    date = dayjs(date);
  }

  const firstDay = date.startOf("month").day();
  return Math.floor((date.date() + firstDay - 1) / 7);
}

export function getWeekHeight(param: dayjs.Dayjs | string | number) {
  let weekNum = 0;
  if (typeof param === "number") {
    weekNum = param;
  }
  else {
    weekNum = getWeekNum(param);
  }
  
  return weekNum * DAY_HEIGHT + (weekNum-1) * CALENDAR_GAP;
}