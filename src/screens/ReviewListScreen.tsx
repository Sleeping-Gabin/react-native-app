import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { useAppTheme } from "../components/AppThemeProvider";
import ReviewItem from "../components/ReviewItem";
import { getDatabase } from "../database/database";
import Review, { ReviewRow } from "../database/Review";
import { AppTheme } from "../styles/themes";

export default function ReviewListScreen() {
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [query, setQuery] = useState("");

  const navigation = useNavigation();

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const getReviews = async () => {
    const newList: Review[] = [];
    
    try {
      const db = await getDatabase();
      for await (const row of db.getEachAsync<ReviewRow>(
        "SELECT * FROM review ORDER BY write_date DESC, id DESC;"
      )) {
        newList.push(new Review(row));
      }
    }
    catch (err) {
      console.error(err);
    }

    setReviewList(newList);
  }

  const filteringReviews = async () => {
    if (query === "") {
      getReviews();
      return;
    }

    const newList: Review[] = [];

    try {
      const db = await getDatabase();
  
      for await (const row of db.getEachAsync<ReviewRow>(`
        SELECT review.* FROM review
        JOIN book ON review.id = book.review_id
        WHERE (book.title LIKE ?) OR (review.text LIKE ?)
        ORDER BY write_date DESC, id DESC;
      `, [`%${query}%`, `%${query}%`]
      )) {
        newList.push(new Review(row));
      }
    }
    catch (err) {
      console.error(err);
    }

    setReviewList(newList);
  }

  useEffect(() => {
    getReviews();
  }, []);

  const renderReviewItem = ({item}: {item: Review}) => (
    <ReviewItem 
      review={item} 
      onPress={() => 
        navigation.navigate("ReviewDetail", {
          reviewId: item.id!
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="기록 검색"
        placeholderTextColor={theme.darkGray}
        value={query}
        onChangeText={(text) => setQuery(text)}
        onSubmitEditing={() => filteringReviews()}
      />

      <FlatList
        data={reviewList}
        contentContainerStyle={styles.listContainer}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderReviewItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    alignSelf: "center",
    width: "50%",
    marginVertical: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 8,
    color: theme.text,
    fontFamily: "Pretendard-Regular"
  },
  filterContainer: {
    flexWrap: "wrap"
  },
  listContainer: {    
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: theme.lightGray,
  }
});