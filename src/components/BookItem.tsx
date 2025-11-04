import { GestureResponderEvent, Image, StyleSheet, TouchableHighlight, View, ViewStyle } from "react-native";
import Book from "../database/Book";
import { useAppTheme } from "./AppThemeProvider";
import SerifText from "./SerifText";

interface BookItemProps {
  book: Book;
  imageWidth: number;
  style?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function BookItem(props: BookItemProps) {
  const {book, imageWidth, style: itemStyle, onPress} = props;

  const theme = useAppTheme();

  return (
    <TouchableHighlight
      underlayColor={theme.lightGray}
      onPress={onPress}
    >
      <View style={[styles.item, itemStyle]}>
        <Image
          source={{uri: book.thumbnail}}
          style={[styles.image, {
            width: imageWidth
          }]}
        />
        <View style={styles.textContainer}>
          <SerifText 
            type="SemiBold" 
            style={styles.title}
          >
            {book.title}
          </SerifText>
          <SerifText>{book.authors.join(", ")}</SerifText>
          <SerifText>{book.publisher} · {book.year}</SerifText>
        </View>
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  image: {
    aspectRatio: 3 / 4,
    objectFit: "contain",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10
  },
  title: {
    marginBottom: 5,
    fontSize: 16,
  }
})