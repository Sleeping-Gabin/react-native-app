import MaterialDesignIcons, { MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableHighlight, View, ViewStyle } from "react-native";
import Book, { BookRow } from "../database/Book";
import { getDatabase } from "../database/database";
import Review from "../database/Review";
import { AppTheme } from "../styles/themes";
import { useAppTheme } from "./AppThemeProvider";
import SansSerifText from "./SansSerifText";
import SerifText from "./SerifText";

export interface ReviewItemProps {
  review: Review;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function ReviewItem(props: ReviewItemProps) {
  const {review, style: itemStyle, onPress} = props;

  const [book, setBook] = useState<Book>();
  const theme = useAppTheme();

  const getBook = async () => {
    const db = await getDatabase();

    const row = await db.getFirstAsync<BookRow>(
      "SELECT * FROM book WHERE review_id = ?",
      [review.id!]
    )
    .catch(err => console.error(err));

    if (row) {
      setBook(new Book(row));
    }
  }

  useEffect(() => {
    getBook();
  }, []);

  const styles = createStyles(theme);

  return (
    <TouchableHighlight
      style={[styles.item, itemStyle]}
      underlayColor={theme.lightGray}
      onPress={onPress}
    >
      <View>
        <View style={styles.content}>
        {
          book &&
          <Image
            source={{uri: book?.thumbnail}}
            style={styles.image}
          />
        }
          <View style={styles.textContainer}>
            <SerifText
              numberOfLines={1}
              type="SemiBold"
              style={styles.title}
            >
              {book?.title}
            </SerifText>
            <SerifText
              numberOfLines={3}
              style={styles.text}
            >
              {review.text}
            </SerifText>
          </View>
        </View>
        <View style={styles.infos}>
          <SansSerifText style={styles.infoText}>
            <InfoIcon name={review.type.icon} /> | <InfoIcon name="star" color={theme.secondary} />{review.starRate} · <InfoIcon name={review.emotion.icon} />
          </SansSerifText>
          <SansSerifText style={styles.infoText}>
              {review.getDateString()}
          </SansSerifText>
        </View>
      </View>
    </TouchableHighlight>
  )
}

interface InfoIconProps {
  name: MaterialDesignIconsIconName;
  color?: string;
}

function InfoIcon({name, color}: InfoIconProps) {
  const theme = useAppTheme();

  return (
    <MaterialDesignIcons 
      name={name} 
      style={{
        fontSize: 14,
        color: color ? color : theme.darkGray
      }}
    />
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  item: {
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  content: {
    marginBottom: 5,
    flexDirection: "row",
  },
  image: {
    width: 78,
    height: 78/3*4,
    objectFit: "contain",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    marginBottom: 10,
    fontSize: 16,
  },
  text: {
    lineHeight: 22
  },
  infos: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  infoText: {
    fontSize: 14,
    color: theme.darkGray
  }
});