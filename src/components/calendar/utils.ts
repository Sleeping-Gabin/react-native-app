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

  const firstDate = date.startOf("month");
  const endDate = date.endOf("month");

  return endDate.week() - firstDate.week() + 1;
}

export function getWeekIndex(date: dayjs.Dayjs | string) {
  if (typeof date === "string") {
    date = dayjs(date);
  }

  const firstDate = date.startOf("month");
  return date.week() - firstDate.week();
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