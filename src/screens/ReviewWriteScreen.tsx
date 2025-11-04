import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, TextInput, ToastAndroid, View } from "react-native";
import { useAppTheme } from "../components/AppThemeProvider";
import BookItem from "../components/BookItem";
import BottomSheet from "../components/BottomSheet";
import Info from "../components/Info";
import SansSerifText from "../components/SansSerifText";
import SheetLabel from "../components/SheetLabel";
import StarRate from "../components/StarRate";
import Book, { BookRow } from "../database/Book";
import { getDatabase } from "../database/database";
import Review, { BookTypes, Emotions, ReviewRow } from "../database/Review";
import { RootStackParamList } from "../navigations/types";
import { unpressSave, useAppDispatch, useAppSelector } from "../store";
import { AppTheme } from "../styles/themes";

type ReviewWriteScreenProps = NativeStackScreenProps<RootStackParamList, "ReviewWrite">;

export default function ReviewWriteScreen({route}: ReviewWriteScreenProps) {
  const {mode, book: bookParam, reviewId} = route.params;
  
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }
  
  const [book, setBook] = useState(bookParam);
  const [date, setDate] = useState(getTodayString());
  const [typeIdx, setTypeIdx] = useState(0);
  const [emotionIdx, setEmotionIdx] = useState(0);
  const [starIdx, setStarIdx] = useState(0);
  const [reviewTxt, setReviewTxt] = useState("");

  const [isKeyboard, setKeyboard] = useState(false);
  const pressSave = useAppSelector(state => state.button.pressSave);

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const addReview = async () => {
    if (reviewTxt.length <= 0) {
      ToastAndroid.show("내용이 입력되지 않았습니다.", ToastAndroid.SHORT);
      dispatch(unpressSave());
      return;
    }
    else if (book === undefined) {
      return
    }

    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(async () => {
      const insertReview = await db.runAsync(`
        INSERT INTO review(star_rate, text, type, emotion, write_date)
        VALUES (?, ?, ?, ?, date('now', 'localtime'));
      `, [5-starIdx, reviewTxt, BookTypes[typeIdx].id, Emotions[emotionIdx].id]);

      await db.runAsync(`
        INSERT INTO book(review_id, title, authors, publisher, thumbnail, year)
        VALUES (?, ?, ?, ?, ?, ?);
      `, [insertReview.lastInsertRowId, book.title, book.authors.join(","), book.publisher, book.thumbnail, book.year]);
    })
    .catch(err => console.error(err));

    dispatch(unpressSave());
    navigation.reset({
      routes: [{name: "Tab"}]
    });
  }

  const modifyReview = async () => {
    if (reviewTxt.length <= 0) {
      ToastAndroid.show("내용이 입력되지 않았습니다.", ToastAndroid.SHORT);
      dispatch(unpressSave());
      return;
    }
    else if (reviewId === undefined) {
      return;
    }
    
    const db = await getDatabase();

    await db.runAsync(`
      UPDATE review
      SET type = ?,
          emotion = ?,
          star_rate = ?,
          text = ?
      WHERE id = ?;
    `, [BookTypes[typeIdx].id, Emotions[emotionIdx].id, 5-starIdx, reviewTxt, reviewId])
    .catch(err => console.error(err));

    dispatch(unpressSave());
    navigation.reset({
      routes: [{name: "Tab"}]
    });
  }

  const getReview = async () => {
    const db = await getDatabase();

    const row = await db.getFirstAsync<ReviewRow>(
      "SELECT * FROM review WHERE id = ?",
      [reviewId!]
    )
    .catch(err => console.error(err));

    if (row) {
      let newReview = new Review(row);

      setDate(newReview.getDateString());
      setTypeIdx(BookTypes.findIndex(type => type.id===newReview.type.id));
      setEmotionIdx(Emotions.findIndex(emotion => emotion.id===newReview.emotion.id));
      setStarIdx(5-newReview.starRate);
      setReviewTxt(newReview.text);
    }
  }

  const getBook = async () => {
    const db = await getDatabase();

    const row = await db.getFirstAsync<BookRow>(
      "SELECT * FROM book WHERE review_id = ?",
      [reviewId!]
    )
    .catch(err => console.error(err));

    if (row) {
      setBook(new Book(row));
    }
  }

  useEffect(() => {
    const keyboardShow = Keyboard.addListener("keyboardDidShow", () => setKeyboard(true));

    const keyboardHide = Keyboard.addListener("keyboardDidHide", () => setKeyboard(false));

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    }
  }, []);

  useEffect(() => {
    if (mode === "modify") {
      getReview();
      getBook();
    }
  }, []);

  useEffect(() => {
    if (pressSave) {
      if (mode === "write")
        addReview();
      else {
        modifyReview();
      }
    }
  }, [pressSave]);

  const bookTypeData = BookTypes.map(type => 
    <SansSerifText>
      <MaterialDesignIcons name={type.icon} color={theme.text}/> {type.name}
    </SansSerifText>
  );

  const emotionData = Emotions.map(emotion => 
    <SansSerifText>
      <MaterialDesignIcons name={emotion.icon} color={theme.text} /> {emotion.name}
    </SansSerifText>
  );

  const starData = Array.from({length: 5}, ((_, idx) => 
    <StarRate starRate={5-idx} size={16} />
  ));

  return (
    <View style={styles.container}>
      { !isKeyboard && book && <BookItem book={book} imageWidth={90} /> }
      { !isKeyboard && <View style={styles.separator}/> }

      <View style={styles.infoContainer}>
        <Info label="날짜">
          <SansSerifText style={styles.date}>
            {date}
          </SansSerifText>
        </Info>
        
        <BottomSheet  
          data={bookTypeData} 
          name="bookType"
          setIdx={setTypeIdx}
        />
        <Info label="읽은 방식">
          <SheetLabel
            name="bookType"
            style={{flex: 1}}
          >
            {bookTypeData[typeIdx]}
          </SheetLabel>
        </Info>

        <BottomSheet  
          data={emotionData} 
          name="emotion"
          setIdx={setEmotionIdx}
        />
        <Info label="기분">
          <SheetLabel
            name="emotion"
            style={{flex: 1}}
          >
            {emotionData[emotionIdx]}
          </SheetLabel>
        </Info>

        <BottomSheet
          data={starData} 
          name="star"
          setIdx={setStarIdx}
        />
        <Info label="별점">
          <SheetLabel
            name="star"
            style={{flex: 1}}
          >
            {starData[starIdx]}
          </SheetLabel>
        </Info>
      </View>
      
      <TextInput
        style={styles.text}
        placeholder="책을 읽고 어떤 생각이 들었나요?"
        placeholderTextColor={theme.text}
        multiline
        value={reviewTxt}
        onChangeText={(text) => setReviewTxt(text)}
      />
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10
  },
  separator: {
    height: 1,
    marginVertical: 10,
    backgroundColor: theme.lightGray
  },
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 5,
    paddingHorizontal: 15,
    marginBottom: 10
  },
  date: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  text: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.lightGray,
    fontFamily: "MaruBuri-Regular",
    textAlignVertical: "top",
    color: theme.text,
    // textAlign: "justify",
    lineHeight: 22
  }
});