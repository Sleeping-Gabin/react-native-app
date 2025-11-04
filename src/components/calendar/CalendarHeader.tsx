import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import dayjs from "dayjs";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { changeSelected, useAppDispatch, useAppSelector } from "../../store";
import { AppTheme } from "../../styles/themes";
import { useAppTheme } from "../AppThemeProvider";
import SansSerifText from "../SansSerifText";
import { getWeekIndex } from "./utils";

interface CalendarHeaderProps {
  weekView: boolean;
}

export default function CalendarHeader(props: CalendarHeaderProps) {
  const {weekView} = props;

  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const selectedDayjs = dayjs(selectedDate);
  const dispatch = useAppDispatch();

  const firstDate = selectedDayjs.set("date", 1);
  const year = firstDate.year();
  const month = firstDate.month() + 1;
  const week = getWeekIndex(selectedDate) + 1;
  const dayList = ["일", "월", "화", "수", "목", "금", "토"];

  const theme = useAppTheme();
  const styles = createHeaderStyles(theme);

  const handlePressPrev = () => {
    const prevMonthDate = 
      weekView ? selectedDayjs.subtract(1, "week") 
      : firstDate.subtract(1, "month");
    dispatch(changeSelected(prevMonthDate.format("YYYY-MM-DD")));
  }

  const handlePressNext = () => {
    const nextMonthDate = 
      weekView ? selectedDayjs.add(1, "week") 
      : firstDate.add(1, "month");
    dispatch(changeSelected(nextMonthDate.format("YYYY-MM-DD")));
  }

  return(
    <View>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.arrow}
          onPress={handlePressPrev}
        >
          <MaterialDesignIcons name="menu-left" size={24} color={theme.text} />
        </TouchableOpacity>

        <SansSerifText style={styles.title}>
          {year}년 {month}월{weekView && ` ${week}주`}
        </SansSerifText>

        <TouchableOpacity 
          style={styles.arrow}
          onPress={handlePressNext}
        >
          <MaterialDesignIcons name="menu-right" size={24} color={theme.text}/>
        </TouchableOpacity>
      </View>

      <View style={styles.dayContainer}>
        {dayList.map(day => 
          <SansSerifText key={day} style={styles.day}>
            {day}
          </SansSerifText>
        )}
      </View>
    </View>
  )
}

const createHeaderStyles = (theme: AppTheme) => StyleSheet.create({  
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  arrow: {
    flex: 1,
    alignItems: "center",
    padding: 10
  },
  title: {
    flex: 8,
    textAlign: "center",
    color: theme.primary
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  day: {
    color: theme.darkGray
  }
});