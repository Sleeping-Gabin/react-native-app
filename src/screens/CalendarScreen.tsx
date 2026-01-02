import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAppTheme } from "../components/AppThemeProvider";
import Calendar from "../components/calendar/Calendar";
import { getWeekHeight } from "../components/calendar/utils";
import ReviewItem from "../components/ReviewItem";
import { getDatabase } from "../database/database";
import Review, { ReviewRow } from "../database/Review";
import { changeSelected, useAppDispatch, useAppSelector } from "../store";
import { AppTheme } from "../styles/themes";

export default function CalendarScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [dateSet, setDateSet] = useState<Set<string>>(new Set());
  const [reviewMap, setReviewMap] = useState<Map<string, Review[]>>(new Map());

  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const selectedDayjs = dayjs(selectedDate);
  const firstDate = selectedDayjs.set("date", 1);
  const month = selectedDayjs.month();

  const getDateSet = async () => {
    const newSet = new Set<string>();
    
    try {
      const db = await getDatabase();
      
      for await (const row of db.getEachAsync<{write_date: string}>(
        "SELECT DISTINCT write_date FROM review;"
      )) {
        newSet.add(row.write_date);
      }
    }
    catch(err) {
      console.error(err);
    }

    setDateSet(newSet);
  }

  const getReviewMap = async () => {    
    const newMap = new Map<string, Review[]>();
    
    try {
      const db = await getDatabase();
      
      for (let date of dateSet) {
        const reviewList: Review[] = [];
  
        for await (const row of db.getEachAsync<ReviewRow>(
          "SELECT * FROM review WHERE write_date = ?;", [date]
        )) {
          reviewList.push(new Review(row));
        }
  
        newMap.set(date, reviewList);
      }
    }
    catch(err) {
      console.error(err);
    }

    setReviewMap(newMap);
  }

  useEffect(() => {
    getDateSet();
  }, []);

  useEffect(() => {
    getReviewMap();
  }, [dateSet]);
 
  const listRef = useAnimatedRef<Animated.FlatList>();
  const scrollOffset = useSharedValue(0);
  const startoffset = useSharedValue(0);
  const startY = useSharedValue(0);

  const maxHeight = useSharedValue(0);
  const minHeight = getWeekHeight(1);
  
  const [weekView, setWeekView] = useState(false);

  const isMin = useSharedValue(false);
  const isMax = useSharedValue(true);
  const calendarHeight = useSharedValue(0);

  useEffect(() => {
    maxHeight.value = getWeekHeight(selectedDate);
    if (!weekView)
      calendarHeight.value = getWeekHeight(selectedDate);
  }, [month]);

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollOffset.value = e.contentOffset.y;
  });

  const updateValue = (y: number) => {
    if (!isMin.value && calendarHeight.value === minHeight) {
      startY.value = y;
      startoffset.value = scrollOffset.value;
      isMin.value = true;
    }
    else if (!isMax.value && calendarHeight.value === maxHeight.value) {
      startY.value = y;
      startoffset.value = scrollOffset.value;
      isMax.value = true;
    } 
    else if (calendarHeight.value < maxHeight.value && calendarHeight.value > minHeight) {
      isMin.value = false;
      isMax.value = false;
    }
  }

  const dragPrev = () => {
    const prevMonthDate = 
      weekView ? selectedDayjs.subtract(1, "week") 
      : firstDate.subtract(1, "month");
    dispatch(changeSelected(prevMonthDate.format("YYYY-MM-DD")));
  }

  const dragNext = () => {
    const nextMonthDate = 
      weekView ? selectedDayjs.add(1, "week") 
      : firstDate.add(1, "month");
    dispatch(changeSelected(nextMonthDate.format("YYYY-MM-DD")));
  }

  const drag = Gesture.Pan()
    .onStart(() => {
      startoffset.value = scrollOffset.value;
      startY.value = 0;
    })
    .onUpdate(e => {
      if (Math.abs(e.translationX) < Math.abs(e.translationY)) {
        updateValue(e.translationY);
        
        const move = e.translationY - startY.value;
        if (isMin.value && ((move < 0) || (move > 0 && scrollOffset.value > 0))) {
          scheduleOnRN(() => {
            listRef.current?.scrollToOffset({
              offset:  Math.max(0, startoffset.value - move),
              animated: false,
            })
          });
        } 
        else {
          const height = move > 0 ? maxHeight.value : minHeight;
          calendarHeight.value = withTiming(height, {duration: 300});
        }
      }
    })
    .onEnd(e => {
      updateValue(e.translationY);
      
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        if (e.translationX > 0) {
          dragPrev();
        }
        else if (e.translationX < 0) {
          dragNext();
        }
      }
    })
    .runOnJS(true);
  
  useAnimatedReaction(
    () => calendarHeight.value === minHeight,
    (cur, prev) => {
      if (cur !== prev) {
        scheduleOnRN(setWeekView, cur);
      }
    },
    [calendarHeight]
  );
  
  return (
    <GestureDetector gesture={drag}>
    <View style={styles.container}>
      <Calendar 
        markedDateSet={dateSet}
        style={styles.calendar}
        height={calendarHeight}
        weekView={weekView}
      />

      <Animated.FlatList
        ref={listRef}
        data={reviewMap.get(selectedDate)}
        renderItem={({item}) => (
          <ReviewItem 
            review={item} 
            onPress={() => {
              navigation.navigate("ReviewDetail", {
                reviewId: item.id!
              })
            }}
          />
        )}
        keyExtractor={item => item.id!.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={[styles.list]}
        contentContainerStyle={styles.listContainer}
        onScroll={scrollHandler}
        scrollEnabled={false}
      />
    </View>
    </GestureDetector>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1
  },
  calendar: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContainer: {    
    paddingHorizontal: 15,
    paddingVertical: 0
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: theme.lightGray,
  },
});