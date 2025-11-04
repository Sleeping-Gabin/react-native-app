import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAppTheme } from "../components/AppThemeProvider";
import BookItem from "../components/BookItem";
import DeleteModal from "../components/DeleteModal";
import SansSerifText from "../components/SansSerifText";
import SerifText from "../components/SerifText";
import StarRate from "../components/StarRate";
import Book, { BookRow } from "../database/Book";
import { getDatabase } from "../database/database";
import Review, { ReviewRow } from "../database/Review";
import { RootStackParamList } from "../navigations/types";
import { AppTheme } from "../styles/themes";

type ReviewDetailScreenProps = NativeStackScreenProps<RootStackParamList, "ReviewDetail">;

export default function ReviewDetailScreen({route}: ReviewDetailScreenProps) {
  const reviewId = route.params.reviewId;

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [review, setReview] = useState<Review>();
  const [book, setBook] = useState<Book>();

  const getReview = async () => {
    const db = await getDatabase();

    const row = await db.getFirstAsync<ReviewRow>(
      "SELECT * FROM review WHERE id = ?",
      [reviewId]
    )
    .catch(err => console.error(err));

    if (row) {
      setReview(new Review(row));
    }
  }

  const getBook = async () => {
    const db = await getDatabase();

    const row = await db.getFirstAsync<BookRow>(
      "SELECT * FROM book WHERE review_id = ?",
      [reviewId]
    )
    .catch(err => console.error(err));

    if (row) {
      setBook(new Book(row));
    }
  }

  useEffect(() => {
    getReview();
    getBook();
  }, []);

  return (
    <ScrollView style={styles.container}>
    {
      review?.id &&
      <DeleteModal reviewId={review.id}/>
    }
    {
      review &&
      <View style={styles.infoContainer}>
        <View style={styles.infos}>
          <StarRate starRate={review.starRate} size={15} />
          <SansSerifText>
            <MaterialDesignIcons name={review.type.icon} color={theme.text} /> 
            {" " + review.type.name}
          </SansSerifText> 
          <SansSerifText>
            <MaterialDesignIcons name={review.emotion.icon} color={theme.text} /> 
            {" " + review.emotion.name}
          </SansSerifText>
        </View>
        <SansSerifText>
          {review.getDateString()}
        </SansSerifText>
      </View>
    }

    {
      book &&
      <BookItem
        book={book}
        imageWidth={99}
        style={styles.book}
      />
    }

    {
      review &&
      <SerifText style={styles.text} selectable>
        {review.text}
      </SerifText>
    }
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  infos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  book: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: theme.lightGray,
  },
  text: {
    lineHeight: 22,
  }
});