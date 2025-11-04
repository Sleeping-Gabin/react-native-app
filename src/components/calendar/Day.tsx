import dayjs from "dayjs";
import { memo } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { changeSelected, useAppDispatch, useAppSelector } from "../../store";
import { AppTheme } from "../../styles/themes";
import { useAppTheme } from "../AppThemeProvider";
import SansSerifText from "../SansSerifText";
import { DAY_HEIGHT, DAY_WIDTH } from "./utils";

interface DayProps {
  date: dayjs.Dayjs;
  active: boolean;
  marked: boolean;
  thumbnail: string | undefined;
}

const Day = memo((props: DayProps) => {
  const {date, active, marked, thumbnail} = props;

  const selected = useAppSelector(state => state.calendar.selectedDate === date.format("YYYY-MM-DD"));
  const dispatch = useAppDispatch();
  
  const theme = useAppTheme();
  const styles = createDayStyles(theme);
  
  const handleDayPress = () => {
    dispatch(changeSelected(date.format("YYYY-MM-DD")));
  }
  
  const DateText = () => (
    <SansSerifText
      style={[
        styles.text,
        !active && styles.inactiveText
      ]}
    >
      {date.date()}
    </SansSerifText>
  );

  const renderMarkedDay = () => (
    <ImageBackground
      style={[styles.day, styles.markedDay, !active && styles.markedInactiveDay]}
      source={{uri: thumbnail}}
    >
      {
        selected &&
        <View style={[styles.day, styles.selectedDay, styles.selectedMarkedDay]}>
          <DateText />
        </View>
      }
    </ImageBackground>
  );

  const renderNormalDay = () => (
    <View 
      style={[
        styles.day,
        selected && styles.selectedDay
      ]}
    >
      <DateText />
    </View>
  );

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleDayPress}
    >
    { (marked && thumbnail) ? renderMarkedDay() : renderNormalDay() }
    </TouchableOpacity>
  )
}, (prev, next) => (
  prev.date.isSame(next.date) &&
  prev.active === next.active &&
  prev.marked === next.marked &&
  prev.thumbnail === next.thumbnail
));

const createDayStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  day: {
    width: DAY_WIDTH,
    height: DAY_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDay: {
    borderRadius: 6,
    backgroundColor: theme.primaryContainer
  },
  markedDay: {
    borderRadius: 6,
    overflow: "hidden",
  },
  selectedMarkedDay: {
    opacity: 0.7,
  },
  markedInactiveDay: {
    opacity: 0.6
  },
  text: {
    textAlign: "center",
    color: theme.text
  },
  inactiveText: {
    color: theme.primaryContainer
  },
});

export default Day;