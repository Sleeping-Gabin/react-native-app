import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, TextInput, TouchableHighlight, View } from "react-native";
import { useAppTheme } from "../components/AppThemeProvider";
import BookItem from "../components/BookItem";
import BottomSheet from "../components/BottomSheet";
import SansSerifText from "../components/SansSerifText";
import SheetLabel from "../components/SheetLabel";
import Book from "../database/Book";
import { closeSheet, useAppDispatch } from "../store";
import { AppTheme } from "../styles/themes";

const REST_API_KEY = process.env.EXPO_PUBLIC_REST_API_KEY;

const targetList = [
  { name: "전체", value: null },
  { name: "제목", value: "title" },
  { name: "ISBN", value: "isbn" },
  { name: "출판사", value: "publisher" },
  { name: "인명", value: "person" },
]

interface SearchParams {
  query: string;
  page: number;
  target: string | null;
}

export default function SearchScreen() {
  const [bookList, setBookList] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [targetIdx, setTargetIdx] = useState(0);
  const [isEnd, setEnd] = useState(true);
  const [resultNum, setResultNum] = useState(0);

  const paramRef = useRef<SearchParams>({
    query: "",
    page: 1,
    target: null,
  });

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const getBookList = async (page: number) => {
    let params = paramRef.current;
    params.page = page;
    if (page === 1) {
      params.query = query;
      params.target = targetList[targetIdx].value;
    }

    if (params.query === "") {
      setBookList([]);
      setEnd(true);
      setResultNum(0);
      return;
    };

    let url = "https://dapi.kakao.com/v3/search/book";
    url += `?query=${params.query}`
    url += `&page=${params.page}`;
    url += params.target ? `&target=${params.target}` : "";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `KakaoAK ${REST_API_KEY}`
        }
      });
      const data = await response.json();

      const newBookList = page > 1 ? [...bookList] : [];
      for (let book of data.documents) {
        if (!book.title || !book.authors || !book.publisher || !book.thumbnail || !book.datetime) continue;

        newBookList.push(new Book({
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          thumbnail: book.thumbnail,
          datetime: book.datetime,
        }));
      }

      setBookList(newBookList);
      setEnd(data.meta.is_end);
      setResultNum(data.meta.total_count);

      paramRef.current = params;
    }
    catch (error) {
      console.error(error);
    }
  }

  const renderBookItem = ({item}: {item: Book}) => (
    <BookItem
      book={item}
      imageWidth={90}
      onPress={() => 
      navigation.navigate("ReviewWrite", {
        mode: "write",
        book: item
      })
      }
    />
  );

  const ResultHeader = () => (
    <View style={styles.header}>
      <SansSerifText>검색 결과: {resultNum}건</SansSerifText>
    </View>
  );

  const MoreButton = () => (
    <TouchableHighlight
      style={styles.button}
      onPress={() => getBookList(paramRef.current.page+1)}
      underlayColor={theme.lightGray}
    >
      <SansSerifText>더보기</SansSerifText>
    </TouchableHighlight>
  );

  return(
    <View style={styles.container}>
      <BottomSheet 
        name="target"
        data={
          targetList.map(target => <SansSerifText>{target.name}</SansSerifText>)
        }
        setIdx={setTargetIdx}
      />
      <View style={styles.searchBar}>
        <SheetLabel
          name="target"
          style={styles.label}
        >
          <SansSerifText>
            {targetList[targetIdx].name}
          </SansSerifText>
        </SheetLabel>

        <TextInput
          style={styles.searchInput}
          placeholder="책 검색"
          placeholderTextColor={theme.darkGray}
          value={query}
          onChangeText={(text) => setQuery(text)}
          onSubmitEditing={() => getBookList(1)}
          onPress={() => dispatch(closeSheet())}
        />
      </View>

      <FlatList
        data={bookList}
        contentContainerStyle={styles.listContainer}
        renderItem={renderBookItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={ResultHeader}
        ListFooterComponent={() => !isEnd && <MoreButton />}
      />
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  label: {
    flex: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  searchInput: {
    flex: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: theme.primary,
    fontFamily: "Pretendard-Regular",
    color: theme.text
  },
  header: {
    alignItems: "flex-end",
    padding: 5,
    borderBottomWidth: 1,
    borderColor: theme.gray
  },
  button: {
    width: "25%",
    padding: 5,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
    alignSelf: "center",
    alignItems: "center",
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