##  소개
책을 읽고 독서 기록을 남기는 앱  
<br>

### 사용 기술
![react native](https://img.shields.io/badge/react_native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![typescript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![sqlite](https://img.shields.io/badge/sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![expo](https://img.shields.io/badge/expo-ffffff?style=for-the-badge&logo=expo&logoColor=1C2024)  
- redux toolkit
- react navigation
- gesture handler + reanimated  

(React Native Community CLI 기반으로 시작하였고, 이후 Expo 환경으로 마이그레이션되었습니다.)  
<br>

### 외부 API
- Kakao API : 책 검색  
<br>

### 프로젝트 기간
- 2025.09.17 ~ 2025.09.24 : 기획
- 2025.09.25 ~ 2025.10.24 : 개발
- 2025.10.28 ~ 2025.11.04 : Expo로 마이그레이션
<br><br>

## 페이지
| 스플래시 | 독서 기록 목록 | 독서 기록 상세 | 책 검색 |
|:----------:|:----------:|:----------:|:----------:|
|![스플래시](https://github.com/user-attachments/assets/55467122-1a0a-4ef4-9282-b9312d990edf) |![독서 기록 목록](https://github.com/user-attachments/assets/cf8cecd6-e740-4104-8622-14eec7cee91b) |![독서 기록 상세](https://github.com/user-attachments/assets/c39d51ce-7bcb-457c-a977-5240c0cc1a92) |![책 검색](https://github.com/user-attachments/assets/c49bc4f3-a71a-4e58-91ae-ac0f409bd57b) |
| 독서 기록 작성 | 달력 | | |
|![독서 기록 작성](https://github.com/user-attachments/assets/a86bef51-06da-4701-9541-52b3fc56b5de) |![달력](https://github.com/user-attachments/assets/af34cfd2-5690-4ec9-b982-cfb77b9917c7) | | |

<br><br>

## 기능
### 책 검색
검색 조건을 지정해 책을 검색한다.  
더보기 버튼을 눌러 검색 결과를 10개씩 더 가져온다.  

<details>
<summary>코드 보기</summary>

```tsx
// src/screen/SearchScreen.tsx

export default function SearchScreen() {
  //...

  const getBookList = async (page: number) => {
    // ...

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

  const MoreButton = () => (
    <TouchableHighlight
      onPress={() => getBookList(paramRef.current.page+1)}
    >
      <SansSerifText>더보기</SansSerifText>
    </TouchableHighlight>
  );

  return (
    <View>
      <View>
        {/* ... */}
        <TextInput
          onSubmitEditing={() => getBookList(1)}
        />
      </View>
      <FlatList
        data={bookList}
        ListFooterComponent={() => !isEnd && <MoreButton />}
      />
    </View>
  )
}
```
</details>

<div>
	<img src="https://github.com/user-attachments/assets/c7dcd63c-84b8-4550-8e94-ed269a80a0ba" width="200"/>
</div>
<br>

### 독서 기록 필터링
검색어와 일치하는 내용이 포함된 기록만 필터링하여 보여준다.  

<details>
<summary>코드 보기</summary>

```tsx
// src/screen/ReviewListScreen.tsx

export default function ReviewListScreen() {
  // ...

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

  return (...)
}
```
</details>

<div>
	<img src="https://github.com/user-attachments/assets/e0a8212f-e6c3-4cbb-a7a0-3626e5793455" width="200"/>
</div>
<br>

### 독서 기록 작성 / 수정
저장 버튼 터치 시 독서 기록을 작성하거나 수정한다.  
기분, 별점, 읽은 방식을 선택할 수 있다.  

<details>
<summary>코드 보기</summary>

```tsx
// src/screen/ReviewWreteScreen.tsx

type ReviewWriteScreenProps = NativeStackScreenProps<RootStackParamList, "ReviewWrite">;

export default function ReviewWriteScreen({route}: ReviewWriteScreenProps) {  
  const {mode, book: bookParam, reviewId} = route.params;
  const pressSave = useAppSelector(state => state.button.pressSave);

  useEffect(() => {
    if (pressSave) {
      if (mode === "write")
        addReview();
      else {
        modifyReview();
      }
    }
  }, [pressSave]);

  const addReview = async () => {
    // ...

    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(async () => {...}
    .catch(err => console.error(err));

    dispatch(unpressSave());
    navigation.reset({
      routes: [{name: "Tab"}]
    });
  }

  return (
    {/* ... */}
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
    {/* ... */}
  )
}
```

```tsx
// src/components/BottomSheet.tsx

export default function BottomSheet(props: BottomSheetProps) {
  // ...

  const isOpen = useAppSelector(state => state.sheet.openName === name);
  const y = useSharedValue(100);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: `${y.value}%`,
    }]
  }));

  useAnimatedReaction(
    () => isOpen,
    (open) => {
      if (open) {
        y.value = withTiming(0, { duration: 300 });
      }
    },
    [isOpen]
  );

  const closeAnimatioin = () => {
    const close = () => dispatch(closeSheet());
    y.value = withTiming(100, {duration: 200}, (finished) => {
      if (finished) 
        scheduleOnRN(close);
    });
  }

  return (
    <Modal
      visible={isOpen}
      onRequestClose={() => closeAnimatioin()}
    >
    <Pressable onPress={closeAnimatioin} >
      <Animated.View style={[styles.container, animatedStyle]}>
        <FlatList
          // ...
        />
      </Animated.View>
    </Pressable>
    </Modal>
  )
}
```
</details>

|추가 정보 선택|내용 작성|
|:-----:|:-----:|
|<img src="https://github.com/user-attachments/assets/b4370efe-0c5c-4fc0-a139-55bbf57a4388" width="200"/> |<img src="https://github.com/user-attachments/assets/0edf691d-54e8-467e-9c54-746bd35825ee" width="200"/> |
<br>

### 독서 기록 삭제
삭제 버튼 터치 시 삭제 모달창을 띄운다.  
한번 더 삭제를 터치 해 독서 기록을 삭제 한다.  

<details>
<summary>코드 보기</summary>

```tsx
// src/navigation/RootNavigation.tsx

export default function RootNavigation() {
  const dispatch = useAppDispatch();
  
  return (
    <Stack.Navigator
      // ...
    >
      <Stack.Screen
        name="ReviewDetail"
        component={ReviewDetailScreen}
        options={({navigation, route}) => ({
          title: "",
          headerRight: () => (
            <View>
              <HeaderBtn {/*...*/}/>
              <HeaderBtn
                name="삭제"
                onPress={() => dispatch(pressDelete())}
              />
            </View>
          )
        })}
      />
      {/* ... */}
    </Stack.Navigator>
  )
}
```

```tsx
// src/components/DeleteModal.tsx

export default function DeleteModal({reviewId}: {reviewId: number}) {
  // ...

  const pressDelete = useAppSelector(state => state.button.pressDelete);

  const deleteReview = async () => {...}

  return (
    <Modal
      visible={pressDelete}
      transparent={true}
      onRequestClose={() => dispatch(unpressDelete())}
    >
      <Pressable 
        style={styles.background}
        onPress={() => dispatch(unpressDelete())}
      >
        <View>
          <SansSerifText>
            현재 독서 기록을 삭제합니다. 해당 작업은 취소할 수 없습니다.
          </SansSerifText>

          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => dispatch(unpressDelete())}
            >
              <SansSerifText>취소</SansSerifText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={deleteReview}
            >
              <SansSerifText>삭제</SansSerifText>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}
```
</details>

<div>
	<img src="https://github.com/user-attachments/assets/4a4eda5d-bbfe-4734-b4ea-9702a8702b5d" width="200"/>
</div>
<br>

### 월간 달력 / 주간 달력 전환
화면을 위아래로 슬라이드 해 월간 / 주간 달력을 전환할 수 있다.  
날짜별 작성한 독서 기록을 보여준다.  

<details>
<summary>코드 보기</summary>

```tsx
// src/screen/CalendarScreen.tsx

export default function CalendarScreen() {
  // ...

  const calendarHeight = useSharedValue(0);

  const updateValue = (y: number) => {
    // startPoint, startOffset, isMin, isMax 업데이트
  }

  const drag = Gesture.Pan()
    .onStart(() => {
      startoffset.value = scrollOffset.value;
      startPoint.value = 0;
    })
    .onUpdate(e => {
      updateValue(e.translationY);

      const move = e.translationY - startPoint.value;

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
    })
    .onEnd(e => {
      updateValue(e.translationY);
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
    <View>
      <Calendar 
        height={calendarHeight}
        // ...
      />

      <Animated.FlatList
        // ...
      />
    </View>
    </GestureDetector>
  )
}
```

```tsx
// src/components/calendar/Calendar.tsx

export default function Calendar(props: CalendarProps) {
  // ...
  
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
    <View>
      <CalendarHeader />
      <Animated.View style={[styles.container, aniContainerStyle]}> 
        <Animated.View style={[styles.calendar, aniCalendarStyle]}>
          { Array.from({length: monthDates.length/7}, (_, idx) => renderWeek(idx)) }
        </Animated.View>
      </Animated.View>
    </View>
  )
}
```
</details>

|월간 달력|주간 달력|
|:-----:|:-----:|
|<img src="https://github.com/user-attachments/assets/51495b8e-b7a4-4e1e-8512-fcd49ba4b55b" width="200"/> |<img src="https://github.com/user-attachments/assets/6a2b5f00-8b46-4625-897e-33ab9de92a4a" width="200"/> |  
<br>