import { getDatabase } from '@/src/database/database';
import { ReviewRow } from '@/src/database/Review';
import dayjs from 'dayjs';
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useAppSelector } from "../../store";
import CalendarHeader from "./CalendarHeader";
import Day from "./Day";
import { CALENDAR_GAP, DAY_HEIGHT, getWeekHeight, getWeekIndex } from "./utils";

dayjs.extend(weekOfYear);

interface CalendarProps {
  markedDateSet: Set<string>;
  style?: ViewStyle;
  height?: SharedValue<number>;
  weekView: boolean;
}

export default function Calendar(props: CalendarProps) {
  const {markedDateSet, style} = props;
  const {height, weekView} = props;

  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const selectedDayjs = dayjs(selectedDate);
  const year = selectedDayjs.year();
  const month = selectedDayjs.month() + 1;
  const week = getWeekIndex(selectedDate);

  const [thumbnailMap, setThumbnailMap] = useState<Map<string, string>>(new Map());

  const monthDates = useMemo(() => {
    const firstDate = selectedDayjs.startOf("month");
    const startDay = firstDate.day();
    const dateNum = firstDate.daysInMonth();

    const prevMonth = firstDate.subtract(1, 'month');
    const nextMonth = firstDate.add(1, 'month');

    const dates: { 
      date: dayjs.Dayjs; 
      active: boolean
    }[] = [];

    for (let i=startDay-1; i>=0; i--) {
      dates.push({
        date: prevMonth.date(prevMonth.daysInMonth() - i),
        active: false,
      });
    }

    for (let i=1; i<=dateNum; i++) {
      dates.push({
        date: firstDate.date(i),
        active: true,
      });
    }

    const remainNum = 7 - dates.length % 7;
    for (let i=1; i<=remainNum; i++) {
      dates.push({
        date: nextMonth.date(i),
        active: false,
      });
    }

    return dates;
  }, [year, month]);

  const getThumbnailMap = async () => {
    const db = await getDatabase();

    const newMap = new Map<string, string>();

    for (let date of markedDateSet) {
      const reviewRow = await db.getFirstAsync<ReviewRow>(
        "SELECT id FROM review WHERE write_date = ?;",
        [date]
      )
      .catch(err => console.error(err));

      if (reviewRow) {
        const row = await db.getFirstAsync<{thumbnail: string}>(
          "SELECT thumbnail FROM book WHERE review_id = ?;",
          [reviewRow.id]
        )
        .catch(err => console.error(err));

        if (row) {
          newMap.set(date, row.thumbnail);
        }
      }
    }

    setThumbnailMap(newMap);
  }

  useEffect(() => {
    getThumbnailMap();
  }, [markedDateSet]);

  const renderWeek = (idx: number) => {
    const dates = monthDates.slice(7*idx, 7*(idx+1));
    return (
      <View key={idx} style={styles.week}>
        {dates.map((item) => (
          <Day
            key={item.date.format("YYYY-MM-DD")}
            date={item.date}
            active={item.active}
            marked={markedDateSet.has(item.date.format("YYYY-MM-DD"))}
            thumbnail={thumbnailMap.get(item.date.format("YYYY-MM-DD"))}
          />
        ))}
      </View>
    )
  }
  
  const maxHeight = getWeekHeight(selectedDate);
  const minHeight = getWeekHeight(1);
  
  const aniContainerStyle = useAnimatedStyle(() => {
    if (height === undefined) return {}
    return {
      height: height.value,
    }
  });
  
  const aniCalendarStyle = useAnimatedStyle(() => {
    if (height === undefined) return {}
    return {
      transform: [{
        translateY: interpolate(
          height.value,
          [minHeight, maxHeight],
          [-(week * (DAY_HEIGHT + CALENDAR_GAP)), 0]
        )
      }],
    }
  });
  
  return (
    <View style={style}>
      <CalendarHeader 
        weekView={weekView}
      />
      <Animated.View style={[styles.container, aniContainerStyle]}> 
        <Animated.View style={[styles.calendar, aniCalendarStyle]}>
          { Array.from({length: monthDates.length/7}, (_, idx) => renderWeek(idx)) }
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  calendar: {
    gap: CALENDAR_GAP,
  },
  week: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});